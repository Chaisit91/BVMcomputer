import { prisma } from '../../lib/prisma'

const include = { benchmarks: true, product: { include: { videoLinks: true } } } as const

// DB stores cores/threads as separate atomic Ints (1NF) — the API keeps the
// combined "16/32" string admin-web already expects, split/joined right here.
function splitCoresThreads(coresThreads: string) {
  const [cores, threads] = coresThreads.split('/').map((n) => Number(n.trim()))
  return { cores, threads }
}

function shape(row: any) {
  if (!row) return row
  const { product, benchmarks, cores, threads, ...own } = row
  return {
    ...own,
    id: own.productId,
    coresThreads: `${cores}/${threads}`,
    benchmarks: benchmarks.map(({ id, name, score, unit }: any) => ({ id, name, score, unit })),
    videoLinks: product.videoLinks.map((v: any) => v.url),
  }
}

export const cpuRepository = {
  findMany: async () => (await prisma.cpu.findMany({ include })).map(shape),

  findById: async (productId: string) => shape(await prisma.cpu.findUnique({ where: { productId }, include })),

  create: async (data: any) => {
    const { benchmarks, videoLinks, coresThreads, ...own } = data
    const created = await prisma.cpu.create({
      data: {
        ...own,
        ...splitCoresThreads(coresThreads),
        product: { create: { category: 'cpu' } },
        benchmarks: { create: benchmarks ?? [] },
      },
    })
    if (videoLinks?.length) {
      await prisma.productVideoLink.createMany({
        data: videoLinks.map((url: string) => ({ productId: created.productId, url })),
      })
    }
    return cpuRepository.findById(created.productId)
  },

  update: async (productId: string, data: any) => {
    const { benchmarks, videoLinks, coresThreads, ...own } = data
    await prisma.cpu.update({
      where: { productId },
      data: { ...own, ...(coresThreads ? splitCoresThreads(coresThreads) : {}) },
    })

    if (benchmarks) {
      await prisma.cpuBenchmark.deleteMany({ where: { cpuId: productId } })
      if (benchmarks.length) {
        await prisma.cpuBenchmark.createMany({
          data: benchmarks.map((b: any) => ({ cpuId: productId, name: b.name, score: b.score, unit: b.unit })),
        })
      }
    }

    if (videoLinks) {
      await prisma.productVideoLink.deleteMany({ where: { productId } })
      if (videoLinks.length) {
        await prisma.productVideoLink.createMany({ data: videoLinks.map((url: string) => ({ productId, url })) })
      }
    }

    return cpuRepository.findById(productId)
  },

  // delete the shared Product anchor (cascades to Cpu, benchmarks, and video links) —
  // deleting the Cpu row alone would orphan the Product and its video link rows.
  remove: (productId: string) => prisma.product.delete({ where: { id: productId } }),
}

import { Product, ProductVideoLink, CpuBenchmark, assertValidProductPricing } from './cpu.model'
import { deriveDisplayStatus } from '../../lib/stockStatus'

const include = { cpu: { include: { benchmarks: true } }, videoLinks: true } as const

const PRODUCT_FIELDS = [
  'sku',
  'name',
  'brand',
  'sellingPrice',
  'costPrice',
  'promoPrice',
  'stock',
  'status',
  'publishImmediately',
  'description',
]
const CPU_FIELDS = [
  'series',
  'processorLine',
  'socket',
  'processorNumber',
  'cores',
  'threads',
  'baseFrequencyGhz',
  'maxTurboFrequencyGhz',
  'l2CacheMb',
  'l3CacheMb',
  'graphics',
  'tdpWatts',
  'maxTdpWatts',
  'warrantyMonths',
]

function split(body: Record<string, unknown>) {
  const product: any = {}
  const cpu: any = {}
  for (const [key, value] of Object.entries(body)) {
    if (CPU_FIELDS.includes(key)) cpu[key] = value
    else if (PRODUCT_FIELDS.includes(key)) product[key] = value
  }
  return { product, cpu }
}

function shape(row: any) {
  if (!row) return row
  const { cpu, videoLinks, ...own } = row
  return {
    ...own,
    ...cpu,
    status: deriveDisplayStatus(own.status, own.stock),
    benchmarks: cpu.benchmarks.map(({ id, name, score, unit }: any) => ({ id, name, score, unit })),
    videoLinks: videoLinks.map((v: any) => v.url),
  }
}

export const cpuRepository = {
  findMany: async () => (await Product.findMany({ where: { category: 'cpu' }, include })).map(shape),

  findById: async (id: string) => shape(await Product.findUnique({ where: { id }, include })),

  create: async (data: any) => {
    const { benchmarks, videoLinks, ...body } = data
    const { product, cpu } = split(body)
    assertValidProductPricing(product)
    const created = await Product.create({
      data: {
        ...product,
        category: 'cpu',
        cpu: { create: { ...cpu, benchmarks: { create: benchmarks ?? [] } } },
      },
    })
    if (videoLinks?.length) {
      await ProductVideoLink.createMany({
        data: videoLinks.map((url: string) => ({ productId: created.id, url })),
      })
    }
    return cpuRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { benchmarks, videoLinks, ...body } = data
    const { product, cpu } = split(body)
    assertValidProductPricing(product)

    await Product.update({
      where: { id },
      data: { ...product, ...(Object.keys(cpu).length ? { cpu: { update: cpu } } : {}) },
    })

    if (benchmarks) {
      await CpuBenchmark.deleteMany({ where: { cpuId: id } })
      if (benchmarks.length) {
        await CpuBenchmark.createMany({
          data: benchmarks.map((b: any) => ({ cpuId: id, name: b.name, score: b.score, unit: b.unit })),
        })
      }
    }

    if (videoLinks) {
      await ProductVideoLink.deleteMany({ where: { productId: id } })
      if (videoLinks.length) {
        await ProductVideoLink.createMany({ data: videoLinks.map((url: string) => ({ productId: id, url })) })
      }
    }

    return cpuRepository.findById(id)
  },

  // Product is the root — deleting it cascades to Cpu, benchmarks, and video links.
  remove: (id: string) => Product.delete({ where: { id } }),
}

import { prisma } from './prisma'
import { deriveDisplayStatus } from './stockStatus'
import { assertValidProductPricing } from '../schemas/product.schema'
import type { CatalogCategory, PartCategory, Prisma } from '../../generated/prisma'

// Fields that always live on Product itself, regardless of category.
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
] as const

function splitBody(body: Record<string, unknown>, subtypeFields: readonly string[]) {
  const product: any = {}
  const subtype: any = {}
  for (const [key, value] of Object.entries(body)) {
    if (subtypeFields.includes(key)) subtype[key] = value
    else if ((PRODUCT_FIELDS as readonly string[]).includes(key)) product[key] = value
  }
  return { product, subtype }
}

// Prisma can't express "SpecField.category must equal Product.category" as a
// cross-table constraint, so this checks it explicitly before writing — the
// one place a mismatched category (a GPU field saved onto a RAM product)
// could otherwise slip in unnoticed.
async function assertCategoryMatch(tx: Prisma.TransactionClient, productId: string, expected: PartCategory) {
  const product = await tx.product.findUniqueOrThrow({ where: { id: productId }, select: { category: true } })
  if (product.category !== expected) {
    throw new Error(`Category mismatch: product ${productId} is "${product.category}", expected "${expected}"`)
  }
}

async function upsertSpecValues(
  tx: Prisma.TransactionClient,
  category: PartCategory,
  productId: string,
  specs: Record<string, unknown> | undefined,
) {
  if (!specs) return
  await assertCategoryMatch(tx, productId, category)
  for (const [key, value] of Object.entries(specs)) {
    const field = await tx.specField.upsert({
      where: { category_key: { category, key } },
      update: {},
      create: { category, key, label: key },
    })
    await tx.productSpecValue.upsert({
      where: { productId_fieldId: { productId, fieldId: field.id } },
      update: { value: String(value) },
      create: { productId, fieldId: field.id, value: String(value) },
    })
  }
}

async function replaceExtraSpecs(
  tx: Prisma.TransactionClient,
  productId: string,
  extraSpecs: { name: string; detail: string }[] | undefined,
) {
  if (!extraSpecs) return
  await tx.extraSpec.deleteMany({ where: { productId } })
  if (extraSpecs.length) {
    await tx.extraSpec.createMany({ data: extraSpecs.map((s) => ({ productId, name: s.name, detail: s.detail })) })
  }
}

async function replaceVideoLinks(tx: Prisma.TransactionClient, productId: string, videoLinks: string[] | undefined) {
  if (!videoLinks) return
  await tx.productVideoLink.deleteMany({ where: { productId } })
  if (videoLinks.length) {
    await tx.productVideoLink.createMany({ data: videoLinks.map((url) => ({ productId, url })) })
  }
}

function shape(row: any, subtypeAccessor?: string) {
  if (!row) return row
  const { specValues, extraSpecs, videoLinks, ...rest } = row
  const subtype = subtypeAccessor ? rest[subtypeAccessor] : undefined
  const own = { ...rest }
  if (subtypeAccessor) delete own[subtypeAccessor]

  return {
    ...own,
    ...(subtype ?? {}),
    status: deriveDisplayStatus(own.status, own.stock),
    specs: Object.fromEntries(specValues.map((v: any) => [v.field.key, v.value])),
    extraSpecs: extraSpecs.map((e: any) => ({ id: e.id, name: e.name, detail: e.detail })),
    videoLinks: videoLinks.map((v: any) => v.url),
  }
}

interface CategoryRepositoryOptions {
  catalogCategory: CatalogCategory
  partCategory: PartCategory
  // undefined for categories with no genuinely category-specific columns left
  // (motherboard, storage) — they're pure Product rows + EAV specs.
  subtypeAccessor?: string
  subtypeFields?: readonly string[]
}

// ponytail: bodies/rows typed `any` past the split — the category tables are
// structurally identical here (Product + optional 1-1 subtype + EAV) but not
// nominally the same Prisma type, and a full mapped type buys little on what's
// already a passthrough scaffold (see admin.service.ts's own ponytail note on
// swapping in real Zod schemas before production traffic).
export function createCategoryRepository({
  catalogCategory,
  partCategory,
  subtypeAccessor,
  subtypeFields = [],
}: CategoryRepositoryOptions) {
  const include = {
    specValues: { include: { field: true } },
    extraSpecs: true,
    videoLinks: true,
    ...(subtypeAccessor ? { [subtypeAccessor]: true } : {}),
  }

  const repository = {
    findMany: async () => {
      const rows = await prisma.product.findMany({ where: { category: catalogCategory }, include })
      return rows.map((row) => shape(row, subtypeAccessor))
    },

    findById: async (id: string) => shape(await prisma.product.findUnique({ where: { id }, include }), subtypeAccessor),

    create: async (data: any) => {
      const { specs, extraSpecs, videoLinks, ...body } = data
      const { product, subtype } = splitBody(body, subtypeFields)
      assertValidProductPricing(product)

      const created = await prisma.$transaction(async (tx) => {
        const row = await tx.product.create({
          data: {
            ...product,
            category: catalogCategory,
            ...(subtypeAccessor ? { [subtypeAccessor]: { create: subtype } } : {}),
          },
        })
        await upsertSpecValues(tx, partCategory, row.id, specs)
        await replaceExtraSpecs(tx, row.id, extraSpecs)
        await replaceVideoLinks(tx, row.id, videoLinks)
        return row
      })

      return repository.findById(created.id)
    },

    update: async (id: string, data: any) => {
      const { specs, extraSpecs, videoLinks, ...body } = data
      const { product, subtype } = splitBody(body, subtypeFields)
      assertValidProductPricing(product)

      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id },
          data: {
            ...product,
            ...(subtypeAccessor && Object.keys(subtype).length ? { [subtypeAccessor]: { update: subtype } } : {}),
          },
        })
        await upsertSpecValues(tx, partCategory, id, specs)
        await replaceExtraSpecs(tx, id, extraSpecs)
        await replaceVideoLinks(tx, id, videoLinks)
      })

      return repository.findById(id)
    },

    // Product is the root now — every child (subtype row, spec values, extra
    // specs, video links, images) cascades off it, so this is the only
    // deletion path that can't leave orphans.
    remove: (id: string) => prisma.product.delete({ where: { id } }),
  }

  return repository
}

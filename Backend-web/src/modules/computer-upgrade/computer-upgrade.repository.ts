import { prisma } from '../../lib/prisma'

const include = {
  customer: { select: { id: true, fullName: true } },
  items: {
    include: {
      newProduct: { select: { id: true, name: true, sku: true } },
      verifiedBy: { select: { firstName: true, lastName: true } },
    },
  },
} as const

function shapeItem(item: any) {
  const { newProduct, verifiedBy, ...own } = item
  return {
    ...own,
    newProductName: newProduct?.name ?? null,
    newProductSku: newProduct?.sku ?? null,
    verifiedByName: verifiedBy ? `${verifiedBy.firstName} ${verifiedBy.lastName}` : null,
  }
}

function shape(row: any) {
  if (!row) return row
  const { customer, items, ...own } = row
  return {
    ...own,
    customerName: customer?.fullName ?? own.customerNameSnapshot,
    items: items.map(shapeItem),
  }
}

// Item fields the main "save" form is allowed to touch — oldItemPhotoUrl and
// the verified* fields are managed by their own dedicated endpoints
// (photo upload, verify) so a routine edit can never silently wipe them.
const EDITABLE_ITEM_FIELDS = ['slot', 'oldItemDescription', 'newProductId', 'newProductPrice', 'aiRecommendation']

function pickEditableItemFields(item: Record<string, unknown>): any {
  const picked: Record<string, unknown> = {}
  for (const key of EDITABLE_ITEM_FIELDS) {
    if (key in item) picked[key] = item[key]
  }
  // The form always submits all 8 slots even when a slot's "new product"
  // was never chosen — '' isn't a valid Product id, so it must become null
  // (no upgrade decided for this slot yet) rather than hit the FK constraint.
  if (picked.newProductId === '') picked.newProductId = null
  return picked
}

export const computerUpgradeRepository = {
  findMany: async () =>
    (await prisma.computerUpgrade.findMany({ include, orderBy: { createdAt: 'desc' } })).map(shape),

  findById: async (id: string) => shape(await prisma.computerUpgrade.findUnique({ where: { id }, include })),

  create: async (data: any) => {
    const { items, ...rest } = data
    const created = await prisma.computerUpgrade.create({
      data: {
        ...rest,
        items: { create: (items ?? []).map((item: any) => pickEditableItemFields(item)) },
      },
    })
    return computerUpgradeRepository.findById(created.id)
  },

  update: async (id: string, data: any) => {
    const { items, ...rest } = data
    if (Object.keys(rest).length) {
      await prisma.computerUpgrade.update({ where: { id }, data: rest })
    }

    // Upsert per slot (not delete-all-recreate like sibling bundle modules) —
    // items here carry real state beyond the form (photo, verification) that
    // a blanket replace would destroy every time an unrelated field is saved.
    if (items) {
      for (const item of items) {
        const fields = pickEditableItemFields(item)
        await prisma.computerUpgradeItem.upsert({
          where: { upgradeId_slot: { upgradeId: id, slot: item.slot } },
          create: { upgradeId: id, ...fields },
          update: fields,
        })
      }
    }

    return computerUpgradeRepository.findById(id)
  },

  remove: (id: string) => prisma.computerUpgrade.delete({ where: { id } }),

  setItemPhoto: async (upgradeId: string, slot: string, photoUrl: string) => {
    await prisma.computerUpgradeItem.upsert({
      where: { upgradeId_slot: { upgradeId, slot: slot as any } },
      create: { upgradeId, slot: slot as any, oldItemPhotoUrl: photoUrl },
      update: { oldItemPhotoUrl: photoUrl },
    })
    return computerUpgradeRepository.findById(upgradeId)
  },

  verifyItem: async (upgradeId: string, slot: string, adminId: string) => {
    await prisma.computerUpgradeItem.upsert({
      where: { upgradeId_slot: { upgradeId, slot: slot as any } },
      create: { upgradeId, slot: slot as any, verifiedByAdmin: true, verifiedAt: new Date(), verifiedById: adminId },
      update: { verifiedByAdmin: true, verifiedAt: new Date(), verifiedById: adminId },
    })
    return computerUpgradeRepository.findById(upgradeId)
  },
}

import { prisma } from '../../lib/prisma'

export const productImageRepository = {
  list: (productId: string) => prisma.productImage.findMany({ where: { productId }, orderBy: { sortOrder: 'asc' } }),

  add: async (productId: string, file: { url: string; fileName: string }) => {
    const count = await prisma.productImage.count({ where: { productId } })
    return prisma.productImage.create({
      data: { productId, url: file.url, altText: file.fileName, sortOrder: count, isPrimary: count === 0 },
    })
  },

  // scoped to productId so a request can't delete another product's image by guessing an id
  remove: (productId: string, id: string) => prisma.productImage.deleteMany({ where: { id, productId } }),
}

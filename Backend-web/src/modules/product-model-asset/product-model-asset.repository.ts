import { prisma } from '../../lib/prisma'

export const productModelAssetRepository = {
  list: (productId: string) =>
    prisma.productModelAsset.findMany({ where: { productId }, orderBy: { createdAt: 'asc' } }),

  add: (productId: string, file: { url: string; fileName: string; contentType: string; fileSizeBytes: number }) =>
    prisma.productModelAsset.create({ data: { productId, ...file } }),

  // scoped to productId so a request can't delete another product's asset by guessing an id
  remove: (productId: string, id: string) => prisma.productModelAsset.deleteMany({ where: { id, productId } }),
}

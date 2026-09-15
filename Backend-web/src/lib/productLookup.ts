import { prisma } from './prisma'

// name now lives on Product itself for every category, so one query covers all of them.
export async function getProductName(productId: string): Promise<string> {
  return (await prisma.product.findUnique({ where: { id: productId }, select: { name: true } }))?.name ?? ''
}

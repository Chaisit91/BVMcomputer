import { prisma } from './prisma'
import type { PartCategory } from '../../generated/prisma'

// Each slot's productId points at a different table depending on category,
// so there's no single Prisma relation to follow — look it up by hand.
export async function getProductName(category: PartCategory, productId: string): Promise<string> {
  switch (category) {
    case 'cpu':
      return (await prisma.cpu.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'gpu':
      return (await prisma.gpu.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'motherboard':
      return (await prisma.motherboard.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'ram':
      return (await prisma.ram.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'storage':
      return (await prisma.storage.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'case':
      return (await prisma.case.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'psu':
      return (await prisma.psu.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
    case 'cooling':
      return (await prisma.cooling.findUnique({ where: { productId }, select: { name: true } }))?.name ?? ''
  }
}

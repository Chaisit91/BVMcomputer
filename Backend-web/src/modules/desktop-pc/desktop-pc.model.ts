import { prisma } from '../../lib/prisma'
import type {
  DesktopPcComponent as DesktopPcComponentRecord,
  DesktopPcHighlight as DesktopPcHighlightRecord,
} from '../../../generated/prisma'

export { Product, type ProductRecord, assertValidProductPricing } from '../product/product.model'
export const DesktopPcComponent = prisma.desktopPcComponent
export const DesktopPcHighlight = prisma.desktopPcHighlight
export type { DesktopPcComponentRecord, DesktopPcHighlightRecord }

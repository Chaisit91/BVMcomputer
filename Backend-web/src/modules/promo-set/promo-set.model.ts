import { prisma } from '../../lib/prisma'
import type {
  PromoSetComponent as PromoSetComponentRecord,
  PromoSetExtraPart as PromoSetExtraPartRecord,
  PromoSetHighlight as PromoSetHighlightRecord,
  PromoSetVideoLink as PromoSetVideoLinkRecord,
} from '../../../generated/prisma'

export { Product, type ProductRecord, assertValidProductPricing } from '../product/product.model'
export const PromoSetComponent = prisma.promoSetComponent
export const PromoSetExtraPart = prisma.promoSetExtraPart
export const PromoSetHighlight = prisma.promoSetHighlight
export const PromoSetVideoLink = prisma.promoSetVideoLink
export type { PromoSetComponentRecord, PromoSetExtraPartRecord, PromoSetHighlightRecord, PromoSetVideoLinkRecord }

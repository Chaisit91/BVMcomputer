import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { PromoSetFormValues } from '../schemas/promoSet.schema'
import type { PromoSet, PromoSetExtraPart } from '../types/promoSet'

// Backend Product fields serialize as Decimal -> string over JSON, and
// `promoPrice` is nullable (null = no active promo). Coerce to numbers here
// and derive the display-safe promoPrice + promoEnabled toggle once.
function fromApi(raw: any): PromoSet {
  const promoEnabled = toPromoEnabled(raw.promoPrice)
  const regularPrice = Number(raw.sellingPrice)
  return {
    ...raw,
    regularPrice,
    promoEnabled,
    promoPrice: promoEnabled ? Number(raw.promoPrice) : regularPrice,
  }
}

export function getPromoSets(): Promise<PromoSet[]> {
  return api.get<any[]>('/promo-sets').then((res) => res.data.map(fromApi))
}

export function getPromoSetDetail(id: string): Promise<PromoSet | null> {
  return api
    .get<any>(`/promo-sets/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

type PromoSetSubmitValues = PromoSetFormValues & {
  highlights: string[]
  videoLinks: string[]
  extraParts: PromoSetExtraPart[]
}

function toApiBody(data: PromoSetSubmitValues) {
  const { regularPrice, promoEnabled, promoPrice, status, ...rest } = data
  // low_stock/out_of_stock are derived server-side from stock count, never a
  // real stored value — omit `status` entirely when it's one of those so the
  // stored value (active/etc) is left untouched, same as Desktop PC.
  const isDerivedStatus = status === 'low_stock' || status === 'out_of_stock'
  return {
    ...rest,
    // PromoSet.code doubles as the underlying Product's `sku` — the frontend
    // has no separate sku field for promo sets, and code is already a
    // required, unique identifier, so it satisfies Product.sku's constraint.
    sku: rest.code,
    sellingPrice: regularPrice,
    promoPrice: toPromoPriceField(promoEnabled, promoPrice),
    ...(isDerivedStatus ? {} : { status }),
  }
}

export function savePromoSet(id: string, data: PromoSetSubmitValues): Promise<void> {
  return api.put(`/promo-sets/${id}`, toApiBody(data)).then(() => undefined)
}

export function createPromoSet(data: PromoSetSubmitValues): Promise<{ id: string }> {
  return api.post<{ id: string }>('/promo-sets', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deletePromoSet(id: string): Promise<void> {
  return api.delete(`/promo-sets/${id}`).then(() => undefined)
}

import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { RamFormValues } from '../schemas/ram.schema'
import type { ExtraSpec, Ram } from '../types/ram'

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Ram {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getRams(): Promise<Ram[]> {
  return api.get<Ram[]>('/rams').then((res) => res.data.map(fromApi))
}

export function getRamDetail(id: string): Promise<Ram | null> {
  return api
    .get<Ram>(`/rams/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveRam(
  id: string,
  data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return api.put(`/rams/${id}`, toApiBody(data)).then(() => undefined)
}

export function createRam(
  data: RamFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return api.post<Ram>('/rams', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteRam(id: string): Promise<void> {
  return api.delete(`/rams/${id}`).then(() => undefined)
}

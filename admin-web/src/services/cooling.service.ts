import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { CoolingFormValues } from '../schemas/cooling.schema'
import type { Cooling, ExtraSpec } from '../types/cooling'

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Cooling {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getCoolers(): Promise<Cooling[]> {
  return api.get<Cooling[]>('/coolings').then((res) => res.data.map(fromApi))
}

export function getCoolingDetail(id: string): Promise<Cooling | null> {
  return api
    .get<Cooling>(`/coolings/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveCooling(
  id: string,
  data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return api.put(`/coolings/${id}`, toApiBody(data)).then(() => undefined)
}

export function createCooling(
  data: CoolingFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return api.post<Cooling>('/coolings', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCooling(id: string): Promise<void> {
  return api.delete(`/coolings/${id}`).then(() => undefined)
}

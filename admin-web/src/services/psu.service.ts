import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { PsuFormValues } from '../schemas/psu.schema'
import type { ExtraSpec, Psu } from '../types/psu'

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Psu {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getPsus(): Promise<Psu[]> {
  return api.get<Psu[]>('/psus').then((res) => res.data.map(fromApi))
}

export function getPsuDetail(id: string): Promise<Psu | null> {
  return api
    .get<Psu>(`/psus/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function savePsu(
  id: string,
  data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return api.put(`/psus/${id}`, toApiBody(data)).then(() => undefined)
}

export function createPsu(
  data: PsuFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return api.post<Psu>('/psus', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deletePsu(id: string): Promise<void> {
  return api.delete(`/psus/${id}`).then(() => undefined)
}

import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { StorageFormValues } from '../schemas/storage.schema'
import type { ExtraSpec, Storage } from '../types/storage'

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Storage {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getStorages(): Promise<Storage[]> {
  return api.get<Storage[]>('/storages').then((res) => res.data.map(fromApi))
}

export function getStorageDetail(id: string): Promise<Storage | null> {
  return api
    .get<Storage>(`/storages/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveStorage(
  id: string,
  data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return api.put(`/storages/${id}`, toApiBody(data)).then(() => undefined)
}

export function createStorage(
  data: StorageFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return api.post<Storage>('/storages', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteStorage(id: string): Promise<void> {
  return api.delete(`/storages/${id}`).then(() => undefined)
}

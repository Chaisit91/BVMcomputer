import { api } from '../lib/api'
import type { DesktopPcFormValues } from '../schemas/desktopPc.schema'
import type { DesktopPc } from '../types/desktopPc'

// Backend returns Product's real field name `sellingPrice` — the rest of the
// admin-web UI calls it `price`, so translate at the service boundary only.
function fromApi(raw: any): DesktopPc {
  return { ...raw, price: Number(raw.sellingPrice) }
}

export function getDesktopPcs(): Promise<DesktopPc[]> {
  return api.get<any[]>('/desktop-pcs').then((res) => res.data.map(fromApi))
}

export function getDesktopPcDetail(id: string): Promise<DesktopPc | null> {
  return api
    .get<any>(`/desktop-pcs/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

function toApiBody(data: DesktopPcFormValues & { highlights: string[] }) {
  const { price, components, os, warranty, status, ...rest } = data
  // low_stock/out_of_stock are derived server-side from stock count, never a
  // real stored value — sending them back would try to write an invalid
  // ProductStatus. Omit `status` entirely so the stored value (active/etc)
  // is left untouched; the backend re-derives the display status on read.
  const isDerivedStatus = status === 'low_stock' || status === 'out_of_stock'
  return { ...rest, sellingPrice: price, os, warranty, components, ...(isDerivedStatus ? {} : { status }) }
}

export function saveDesktopPc(id: string, data: DesktopPcFormValues & { highlights: string[] }): Promise<void> {
  return api.put(`/desktop-pcs/${id}`, toApiBody(data)).then(() => undefined)
}

export function createDesktopPc(data: DesktopPcFormValues & { highlights: string[] }): Promise<{ id: string }> {
  return api.post<{ id: string }>('/desktop-pcs', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteDesktopPc(id: string): Promise<void> {
  return api.delete(`/desktop-pcs/${id}`).then(() => undefined)
}

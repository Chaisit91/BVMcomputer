import { api } from '../lib/api'
import type { ComputerUpgradeFormValues } from '../schemas/computerUpgrade.schema'
import type { ComponentSlot } from '../types/componentSlots'
import type { ComputerUpgrade } from '../types/computerUpgrade'

// Backend Decimal fields (`items[].newProductPrice`) serialize as strings —
// coerce to numbers here so arithmetic/sorting/toLocaleString work.
function fromApi(raw: any): ComputerUpgrade {
  return {
    ...raw,
    items: (raw.items ?? []).map((item: any) => ({
      ...item,
      newProductPrice: item.newProductPrice == null ? null : Number(item.newProductPrice),
    })),
  }
}

export function getComputerUpgrades(): Promise<ComputerUpgrade[]> {
  return api.get<any[]>('/computer-upgrades').then((res) => res.data.map(fromApi))
}

export function getComputerUpgradeDetail(id: string): Promise<ComputerUpgrade | null> {
  return api
    .get<any>(`/computer-upgrades/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

function toApiBody(data: ComputerUpgradeFormValues) {
  const { customer, ...rest } = data
  return { ...rest, customerNameSnapshot: customer }
}

export function saveComputerUpgrade(id: string, data: ComputerUpgradeFormValues): Promise<void> {
  return api.put(`/computer-upgrades/${id}`, toApiBody(data)).then(() => undefined)
}

export function createComputerUpgrade(data: ComputerUpgradeFormValues): Promise<{ id: string }> {
  return api.post<{ id: string }>('/computer-upgrades', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteComputerUpgrade(id: string): Promise<void> {
  return api.delete(`/computer-upgrades/${id}`).then(() => undefined)
}

export function uploadOldItemPhoto(id: string, slot: ComponentSlot, file: File): Promise<ComputerUpgrade> {
  const formData = new FormData()
  formData.append('photo', file)
  return api.post<any>(`/computer-upgrades/${id}/items/${slot}/photo`, formData).then((res) => fromApi(res.data))
}

export function verifyOldItem(id: string, slot: ComponentSlot): Promise<ComputerUpgrade> {
  return api.post<any>(`/computer-upgrades/${id}/items/${slot}/verify`).then((res) => fromApi(res.data))
}

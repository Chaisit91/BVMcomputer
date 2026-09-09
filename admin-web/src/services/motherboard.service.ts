import { api } from '../lib/api'
import type { MotherboardFormValues } from '../schemas/motherboard.schema'
import type { Motherboard } from '../types/motherboard'

// Prisma's Decimal fields (sellingPrice/costPrice) serialize to JSON as
// strings, not numbers — coerce here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Motherboard {
  return { ...row, sellingPrice: Number(row.sellingPrice), costPrice: Number(row.costPrice) }
}

export function getMotherboards(): Promise<Motherboard[]> {
  return api.get<Motherboard[]>('/motherboards').then((res) => res.data.map(fromApi))
}

export function getMotherboardDetail(id: string): Promise<Motherboard | null> {
  return api
    .get<Motherboard>(`/motherboards/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveMotherboard(id: string, data: MotherboardFormValues): Promise<void> {
  return api.put(`/motherboards/${id}`, data).then(() => undefined)
}

export function createMotherboard(data: MotherboardFormValues): Promise<{ id: string }> {
  return api.post<Motherboard>('/motherboards', data).then((res) => ({ id: res.data.id }))
}

export function deleteMotherboard(id: string): Promise<void> {
  return api.delete(`/motherboards/${id}`).then(() => undefined)
}

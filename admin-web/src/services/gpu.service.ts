import { api } from '../lib/api'
import type { GpuFormValues } from '../schemas/gpu.schema'
import type { Gpu } from '../types/gpu'

// Prisma's Decimal fields (sellingPrice) serialize to JSON as strings, not
// numbers — coerce here so arithmetic/sorting/toLocaleString downstream isn't
// silently operating on strings.
function fromApi(row: any): Gpu {
  return { ...row, sellingPrice: Number(row.sellingPrice) }
}

export function getGpus(): Promise<Gpu[]> {
  return api.get<Gpu[]>('/gpus').then((res) => res.data.map(fromApi))
}

export function getGpuDetail(id: string): Promise<Gpu | null> {
  return api
    .get<Gpu>(`/gpus/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveGpu(id: string, data: GpuFormValues): Promise<void> {
  return api.put(`/gpus/${id}`, data).then(() => undefined)
}

export function createGpu(data: GpuFormValues): Promise<{ id: string }> {
  return api.post<Gpu>('/gpus', data).then((res) => ({ id: res.data.id }))
}

export function deleteGpu(id: string): Promise<void> {
  return api.delete(`/gpus/${id}`).then(() => undefined)
}

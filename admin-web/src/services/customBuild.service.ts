import { api } from '../lib/api'
import type { CustomBuildCreateFormValues, CustomBuildEditFormValues } from '../schemas/customBuild.schema'
import type { CustomBuild, CustomBuildPrices } from '../types/customBuild'

// Backend Decimal fields (`prices.<slot>`, `total`) serialize as strings over
// JSON — coerce to numbers here so arithmetic/sorting/toLocaleString work.
function fromApi(raw: any): CustomBuild {
  const prices = Object.fromEntries(
    Object.entries(raw.prices ?? {}).map(([slot, price]) => [slot, Number(price)]),
  ) as CustomBuildPrices
  return {
    ...raw,
    customer: raw.customerNameSnapshot,
    prices,
    total: Number(raw.total),
  }
}

export function getCustomBuilds(): Promise<CustomBuild[]> {
  return api.get<any[]>('/custom-builds').then((res) => res.data.map(fromApi))
}

export function getCustomBuildDetail(id: string): Promise<CustomBuild | null> {
  return api
    .get<any>(`/custom-builds/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

// ponytail: CustomBuild.orderNo is required + unique with no backend default
// (see Backend-web/prisma/schema.prisma) and there's no admin field for it —
// generate a unique-enough number client-side. Swap for a server-side
// sequence if collisions ever matter at real volume.
function generateOrderNo(): string {
  return `ORD-${Date.now()}`
}

export function saveCustomBuild(id: string, data: CustomBuildEditFormValues): Promise<void> {
  return api.put(`/custom-builds/${id}`, data).then(() => undefined)
}

export function createCustomBuild(data: CustomBuildCreateFormValues): Promise<{ id: string }> {
  const { customer, ...rest } = data
  const body = { ...rest, customerNameSnapshot: customer, orderNo: generateOrderNo() }
  return api.post<{ id: string }>('/custom-builds', body).then((res) => ({ id: res.data.id }))
}

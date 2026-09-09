import { api } from '../lib/api'
import { toPromoEnabled, toPromoPriceField } from '../lib/promoPrice'
import type { CaseFormValues } from '../schemas/case.schema'
import type { Case, ExtraSpec } from '../types/case'

// Prisma's Decimal fields (sellingPrice/promoPrice) serialize to JSON as
// strings, not numbers — coerce them here so arithmetic/sorting/toLocaleString
// downstream isn't silently operating on strings.
function fromApi(row: any): Case {
  const promoPrice = row.promoPrice == null ? null : Number(row.promoPrice)
  return { ...row, sellingPrice: Number(row.sellingPrice), promoEnabled: toPromoEnabled(promoPrice), promoPrice: promoPrice ?? 0 }
}

function toApiBody(data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] }) {
  const { promoEnabled, promoPrice, ...rest } = data
  return { ...rest, promoPrice: toPromoPriceField(promoEnabled, promoPrice) }
}

export function getCases(): Promise<Case[]> {
  return api.get<Case[]>('/cases').then((res) => res.data.map(fromApi))
}

export function getCaseDetail(id: string): Promise<Case | null> {
  return api
    .get<Case>(`/cases/${id}`)
    .then((res) => fromApi(res.data))
    .catch(() => null)
}

export function saveCase(
  id: string,
  data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<void> {
  return api.put(`/cases/${id}`, toApiBody(data)).then(() => undefined)
}

export function createCase(
  data: CaseFormValues & { videoLinks: string[]; extraSpecs: ExtraSpec[] },
): Promise<{ id: string }> {
  return api.post<Case>('/cases', toApiBody(data)).then((res) => ({ id: res.data.id }))
}

export function deleteCase(id: string): Promise<void> {
  return api.delete(`/cases/${id}`).then(() => undefined)
}

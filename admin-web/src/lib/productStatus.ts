// low_stock/out_of_stock are never stored — the backend derives them from
// `stock` at read time whenever the persisted status is "active" (see
// Backend-web/src/lib/stockStatus.ts's deriveDisplayStatus). A form can only
// ever submit one of the 4 real ProductStatus values, so when populating an
// edit form from a fetched row, map either derived label back to "active".
const DERIVED_STATUSES = new Set(['low_stock', 'out_of_stock'])

export function toEditableStatus<T extends string>(status: T): T {
  return (DERIVED_STATUSES.has(status) ? 'active' : status) as T
}

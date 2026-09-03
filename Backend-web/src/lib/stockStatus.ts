const LOW_STOCK_THRESHOLD = 5

// in_stock/low_stock/out_of_stock aren't stored — they're always derivable
// from `stock`, so storing them risked drifting out of sync with the real
// count. Only the states an admin actually decides (ProductStatus) persist;
// this only ever kicks in when that stored state is "active".
export function deriveDisplayStatus(status: string, stock: number): string {
  if (status !== 'active') return status
  if (stock <= 0) return 'out_of_stock'
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock'
  return status
}

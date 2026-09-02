const LOW_STOCK_THRESHOLD = 5

// low_stock/out_of_stock aren't stored — they're always derivable from `stock`,
// so storing them risked drifting out of sync with the real count. Only the
// state an admin actually decides (discontinued/closed) is persisted.
export function deriveStockStatus<T extends string>(stored: T, stock: number): T | 'low_stock' | 'out_of_stock' {
  if (stored !== 'selling') return stored
  if (stock <= 0) return 'out_of_stock'
  if (stock <= LOW_STOCK_THRESHOLD) return 'low_stock'
  return stored
}

// A write can only ever set the real, independent state — low_stock/out_of_stock
// sent by a stale client just collapse back to "selling" (computed on the next read).
export function normalizeStoredStatus<T extends string>(incoming: string | undefined, discontinuedValue: T): T | 'selling' {
  return incoming === discontinuedValue ? discontinuedValue : 'selling'
}

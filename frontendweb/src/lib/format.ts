/** Format a number as Thai Baht, e.g. 24900 -> "฿24,900". */
export function formatTHB(amount: number): string {
  return amount.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });
}

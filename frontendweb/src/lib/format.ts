/** Format a number as Thai Baht, e.g. 24900 -> "฿24,900". */
export function formatTHB(amount: number): string {
  return amount.toLocaleString('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  });
}

/**
 * Two-letter avatar initials from a name or email, e.g. "Nattapon" -> "Na",
 * "admin@gmail.com" -> "Ad" (uses the part before "@").
 */
export function getInitials(value: string): string {
  const namePart = value.split('@')[0]?.trim() ?? '';
  if (!namePart) return '';
  const first = namePart[0]?.toUpperCase() ?? '';
  const second = namePart[1]?.toLowerCase() ?? '';
  return `${first}${second}`;
}

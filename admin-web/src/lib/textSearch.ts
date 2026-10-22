// Strips whitespace from both the query and each field before comparing, so
// "rtx4070" (no spaces) still matches a product named "RTX 4070 Ti SUPER" —
// typing doesn't have to reproduce the exact spacing of the real name.
function normalize(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '')
}

export function matchesSearchText(query: string, ...fields: Array<string | null | undefined>): boolean {
  const normalizedQuery = normalize(query.trim())
  if (!normalizedQuery) return true
  return fields.some((field) => field && normalize(field).includes(normalizedQuery))
}

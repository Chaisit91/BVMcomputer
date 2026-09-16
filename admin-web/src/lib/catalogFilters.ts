export function facetValues<T>(items: T[], getValue: (item: T) => string | null | undefined): string[] {
  return Array.from(
    new Set(
      items
        .map(getValue)
        .map((value) => value?.trim() ?? '')
        .filter(Boolean),
    ),
  ).sort((left, right) => left.localeCompare(right, undefined, { numeric: true, sensitivity: 'base' }))
}

export function matchesFacet(value: string | null | undefined, selected: Set<string>): boolean {
  return selected.size === 0 || selected.has(value?.trim() ?? '')
}

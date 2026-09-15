import type { Cpu } from '../types/cpu'

export const UNKNOWN_CPU_VALUE = 'ไม่ระบุ'
export const LEGACY_CPU_SERIES = [
  '12th Gen',
  '14th Gen',
  'CORE ULTRA',
  '5000 Series',
  '7000 Series',
  '7000 WX-Series',
  '8000 Series',
  '9000 Series',
] as const
export type CpuFacet = 'brand' | 'series' | 'processorLine' | 'socket'
const text = (value: unknown) => String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ')
const key = (value: unknown) => text(value).toLocaleLowerCase()

export function cpuFacetValue(cpu: Cpu, field: CpuFacet): string {
  let value = text(cpu[field])
  if (field === 'series') {
    const name = text(cpu.name)
    const normalizedStored = LEGACY_CPU_SERIES.find(series => key(series) === key(value))
    const ryzenModel = name.match(/\bRyzen\s+[3579]\s+([5-9]\d{3})/i)?.[1]
    const intelModel = name.match(/\bCore\s+i[3579][ -]?(\d{4,5})\b/i)?.[1]

    if (/\bCore\s+Ultra\b/i.test(name)) value = 'CORE ULTRA'
    else if (/\bThreadripper(?:\s+PRO)?\s+7\d{3}WX\b/i.test(name)) value = '7000 WX-Series'
    else if (ryzenModel) value = `${ryzenModel[0]}000 Series`
    else if (intelModel?.startsWith('12')) value = '12th Gen'
    else if (intelModel?.startsWith('14')) value = '14th Gen'
    else value = normalizedStored ?? ''
  }
  if (field === 'processorLine' && !value) {
    // Imported records may omit processorLine. Only use an explicit family
    // written in the product name; unknown names stay unspecified.
    const name = text(cpu.name)
    value = name.match(/\b(?:Ryzen\s+)?Threadripper(?:\s+PRO)?\b/i)?.[0]
      ?? name.match(/\bCore\s+Ultra\s+[3579]\b/i)?.[0]
      ?? name.match(/\bCore\s+i[3579]\b/i)?.[0]
      ?? name.match(/\bRyzen\s+[3579]\b/i)?.[0]
      ?? ''
  }
  if (field === 'socket') {
    value = value.replace(/^LGA\s*(\d+)$/i, 'LGA $1')
  }
  return value || UNKNOWN_CPU_VALUE
}

export function cpuFacetOptions(cpus: Cpu[], field: CpuFacet): string[] {
  const values = new Map<string, string>()
  for (const cpu of cpus) {
    const value = cpuFacetValue(cpu, field)
    if (!values.has(key(value))) values.set(key(value), value)
  }
  return [...values.values()].sort((a, b) => a.localeCompare(b, 'en', { numeric: true, sensitivity: 'base' }))
}

export function matchesCpuFacet(cpu: Cpu, field: CpuFacet, selected: Set<string>): boolean {
  if (!selected.size) return true
  const value = key(cpuFacetValue(cpu, field))
  return [...selected].some(option => key(option) === value)
}

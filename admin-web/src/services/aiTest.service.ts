import { api } from '../lib/api'

export const partTypes = ['cpu', 'motherboard', 'gpu', 'ram', 'cooler', 'case', 'psu', 'storage'] as const
export type PartType = (typeof partTypes)[number]
export type Selection = Partial<Record<PartType, string>>

export interface CatalogPart {
  opendb_id: string
  name: string
  manufacturer: string
  rank_score?: number
}

export interface SearchResult {
  type: PartType
  count: number
  offset: number
  has_more: boolean
  items: CatalogPart[]
}

export interface CompatibilityResult {
  selected: Partial<Record<PartType, CatalogPart>>
  constraints: { cpu_socket?: string; recommended_psu_watts?: number; note?: string }
  compatible_counts: Partial<Record<PartType, number>>
  unknown_counts: Partial<Record<PartType, number>>
  validation: {
    status: 'compatible' | 'incompatible' | 'unknown'
    checks: Array<{ rule?: string; status: string; reason: string }>
    quality: { score: number; label: string; selected_parts: number; total_part_types: number; note: string }
    limitations: string[]
  }
  recommendations: Partial<Record<PartType, CatalogPart[]>>
}

export const aiTestService = {
  health: () => api.get('/ai/health').then((response) => response.data),
  search: (type: PartType, query: string, selection: Selection, offset = 0) =>
    api.get<SearchResult>('/ai/search', {
      params: { ...selection, type, q: query || undefined, limit: 30, offset },
    }).then((response) => response.data),
  recommend: (selection: Selection) =>
    api.get<CompatibilityResult>('/ai/recommend', {
      params: { ...selection, limit: 10 },
    }).then((response) => response.data),
}

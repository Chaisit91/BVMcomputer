export type PromoSetStatus = 'selling' | 'out_of_stock' | 'closed'

export interface PromoSetComponents {
  cpu: string
  motherboard: string
  gpu: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
}

export interface PromoSetExtraPart {
  id: string
  name: string
  value: string
}

export interface PromoSet {
  id: string
  code: string
  name: string
  status: PromoSetStatus
  specSummary: string
  regularPrice: number
  promoPrice: number
  stock: number
  components: PromoSetComponents
  extraParts: PromoSetExtraPart[]
  description: string
  highlights: string[]
  videoLinks: string[]
  notes: string
}

export interface PromoSetSummary {
  total: number
  selling: number
  outOfStock: number
  closed: number
}

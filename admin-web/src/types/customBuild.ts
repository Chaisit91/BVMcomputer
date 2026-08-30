export type BuildStatus = 'pending' | 'in_progress' | 'done' | 'cancelled'

export interface CustomBuildOrder {
  id: string
  orderNo: string
  customer: string
  date: string
  cpu: string
  gpu: string
  motherboard: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
  total: number
  status: BuildStatus
}

export interface CustomBuildSummary {
  total: number
  pending: number
  done: number
  cancelled: number
}

export interface CustomBuildComponents {
  cpu: string
  gpu: string
  motherboard: string
  ram: string
  storage: string
  psu: string
  case: string
  cooling: string
}

export interface CustomBuildPrices {
  cpu: number
  gpu: number
  motherboard: number
  ram: number
  storage: number
  psu: number
  case: number
  cooling: number
}

export interface CustomBuildDetail {
  id: string
  orderNo: string
  customer: string
  status: BuildStatus
  components: CustomBuildComponents
  prices: CustomBuildPrices
  notes: string
}

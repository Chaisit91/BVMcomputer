export interface StatCardData {
  id: string
  label: string
  value: string
  change: number
  changeLabel: string
  icon: 'box' | 'wallet' | 'cart' | 'alert'
}

export interface CategoryStat {
  id: string
  name: string
  count: number
  percent: number
  icon: 'cpu' | 'gpu' | 'motherboard' | 'ram' | 'storage' | 'psu' | 'case' | 'cooling'
}

export interface MiniStat {
  id: string
  name: string
  count: number
  unit: string
  icon: 'package' | 'cpu'
}

export interface SalesTrendPoint {
  label: string
  value: number
}

export type OrderStatus = 'success' | 'shipping' | 'pending'

export interface RecentOrder {
  id: string
  code: string
  customer: string
  item: string
  total: number
  status: OrderStatus
  date: string
}

export interface LowStockItem {
  id: string
  name: string
  remaining: number
  urgent: boolean
}

export type StockStatus = 'in_stock' | 'low_stock'

export interface TopProduct {
  id: string
  rank: number
  name: string
  category: string
  sold: number
  revenue: number
  stockStatus: StockStatus
}

export interface DashboardData {
  stats: StatCardData[]
  categories: CategoryStat[]
  miniStats: MiniStat[]
  weeklyTrend: SalesTrendPoint[]
  recentOrders: RecentOrder[]
  lowStock: LowStockItem[]
  monthlyTrend: SalesTrendPoint[]
  topProducts: TopProduct[]
}

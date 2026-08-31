export type CustomerStatus = 'active' | 'inactive' | 'suspended'

export interface OrderItem {
  name: string
  quantity: number
  price: number
}

export interface CustomerOrder {
  id: string
  orderCode: string
  orderedAt: string
  totalAmount: number
  status: string
  items: OrderItem[]
}

export interface Customer {
  id: string
  customerCode: string
  fullName: string
  username: string
  email: string
  phone: string
  registeredAt: string
  lastActiveAt: string
  status: CustomerStatus
  shippingAddress: string
  note: string
  recentOrders: CustomerOrder[]
}

export interface CustomerSummary {
  totalUsers: number
  activeCount: number
  inactiveCount: number
  suspendedCount: number
}

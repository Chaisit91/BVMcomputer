export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'
export type OrderStatus = 'pending' | 'preparing' | 'shipping' | 'completed' | 'cancelled'

export interface OrderLineItem {
  name: string
  category: string
  quantity: number
  unitPrice: number
}

export interface Order {
  id: string
  orderCode: string
  orderedAt: string
  customerName: string
  customerPhone: string
  shippingAddress: string
  postalCode: string
  province: string
  district: string
  subdistrict: string
  paymentMethod: string
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  trackingNumber: string
  shippingNote: string
  paymentSlipFilename: string
  paymentSlipUploadedAt: string
  items: OrderLineItem[]
}

export interface OrderSummary {
  pendingCount: number
  preparingCount: number
  shippingCount: number
  completedCount: number
  cancelledCount: number
  unpaidCount: number
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple'

// Fulfillment state only — payment state lives in paymentStatusMeta below.
export const orderStatusMeta: Record<OrderStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  pending: { label: 'รอดำเนินการ', variant: 'warning', dot: 'bg-amber-500' },
  preparing: { label: 'กำลังเตรียมสินค้า', variant: 'warning', dot: 'bg-orange-500' },
  shipping: { label: 'กำลังจัดส่ง', variant: 'purple', dot: 'bg-purple-500' },
  completed: { label: 'จัดส่งสำเร็จ', variant: 'success', dot: 'bg-emerald-500' },
  cancelled: { label: 'ยกเลิก', variant: 'danger', dot: 'bg-rose-500' },
}

export const paymentStatusMeta: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  pending: { label: 'รอชำระเงิน', variant: 'warning' },
  paid: { label: 'ชำระแล้ว', variant: 'success' },
  failed: { label: 'ชำระเงินไม่สำเร็จ', variant: 'danger' },
  refunded: { label: 'คืนเงินแล้ว', variant: 'info' },
}

export type PaymentStatus = 'paid' | 'unpaid'
export type OrderStatus = 'pending_payment' | 'paid' | 'preparing' | 'shipping' | 'completed' | 'cancelled'

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
  status: OrderStatus
  trackingNumber: string
  shippingNote: string
  paymentSlipFilename: string
  paymentSlipUploadedAt: string
  items: OrderLineItem[]
}

export interface OrderSummary {
  pendingPaymentCount: number
  paidCount: number
  preparingCount: number
  shippingCount: number
  completedCount: number
  cancelledCount: number
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'purple'

export const orderStatusMeta: Record<OrderStatus, { label: string; variant: BadgeVariant; dot: string }> = {
  pending_payment: { label: 'รอชำระเงิน', variant: 'warning', dot: 'bg-amber-500' },
  paid: { label: 'ชำระเงินแล้ว', variant: 'info', dot: 'bg-blue-500' },
  preparing: { label: 'กำลังเตรียมสินค้า', variant: 'warning', dot: 'bg-orange-500' },
  shipping: { label: 'กำลังจัดส่ง', variant: 'purple', dot: 'bg-purple-500' },
  completed: { label: 'จัดส่งสำเร็จ', variant: 'success', dot: 'bg-emerald-500' },
  cancelled: { label: 'ยกเลิก', variant: 'danger', dot: 'bg-rose-500' },
}

export const paymentStatusMeta: Record<PaymentStatus, { label: string; variant: BadgeVariant }> = {
  paid: { label: 'ชำระแล้ว', variant: 'success' },
  unpaid: { label: 'รอชำระ', variant: 'warning' },
}

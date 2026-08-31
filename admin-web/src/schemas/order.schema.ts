import { z } from 'zod'

export const orderFormSchema = z.object({
  customerName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  customerPhone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  shippingAddress: z.string().min(1, 'กรุณากรอกที่อยู่สำหรับการจัดส่ง'),
  postalCode: z.string().min(1, 'กรุณากรอกรหัสไปรษณีย์'),
  province: z.string().min(1, 'กรุณากรอกจังหวัด'),
  district: z.string().min(1, 'กรุณากรอกอำเภอ/เขต'),
  subdistrict: z.string().min(1, 'กรุณากรอกตำบล/แขวง'),
  paymentMethod: z.string().min(1, 'กรุณาเลือกช่องทางการชำระเงิน'),
  paymentStatus: z.enum(['paid', 'unpaid']),
  status: z.enum(['pending_payment', 'paid', 'preparing', 'shipping', 'completed', 'cancelled']),
  trackingNumber: z.string(),
  shippingNote: z.string(),
})

export type OrderFormValues = z.infer<typeof orderFormSchema>

import { z } from 'zod'

const fulfillmentRequiresPayment = ['preparing', 'shipping', 'completed']

export const orderFormSchema = z
  .object({
    customerName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
    customerPhone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
    shippingAddress: z.string().min(1, 'กรุณากรอกที่อยู่สำหรับการจัดส่ง'),
    postalCode: z.string().min(1, 'กรุณากรอกรหัสไปรษณีย์'),
    province: z.string().min(1, 'กรุณากรอกจังหวัด'),
    district: z.string().min(1, 'กรุณากรอกอำเภอ/เขต'),
    subdistrict: z.string().min(1, 'กรุณากรอกตำบล/แขวง'),
    paymentMethod: z.string().min(1, 'กรุณาเลือกช่องทางการชำระเงิน'),
    paymentStatus: z.enum(['pending', 'paid', 'failed', 'refunded']),
    orderStatus: z.enum(['pending', 'preparing', 'shipping', 'completed', 'cancelled']),
    trackingNumber: z.string(),
    shippingNote: z.string(),
  })
  .refine((data) => data.paymentStatus === 'paid' || !fulfillmentRequiresPayment.includes(data.orderStatus), {
    message: 'ตั้งสถานะนี้ไม่ได้เนื่องจากลูกค้ายังไม่ได้ชำระเงิน',
    path: ['orderStatus'],
  })

export type OrderFormValues = z.infer<typeof orderFormSchema>

import { z } from 'zod'

export const customerFormSchema = z.object({
  fullName: z.string().min(1, 'กรุณากรอกชื่อ-นามสกุล'),
  username: z.string().min(1, 'กรุณากรอก Username'),
  email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
  phone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
  status: z.enum(['active', 'inactive', 'suspended']),
  shippingAddress: z.string().min(1, 'กรุณากรอกที่อยู่สำหรับการจัดส่ง'),
  note: z.string(),
})

export type CustomerFormValues = z.infer<typeof customerFormSchema>

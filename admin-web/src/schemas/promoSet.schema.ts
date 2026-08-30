import { z } from 'zod'

const componentsSchema = z.object({
  cpu: z.string().min(1, 'กรุณากรอกซีพียู'),
  motherboard: z.string().min(1, 'กรุณากรอกเมนบอร์ด'),
  gpu: z.string().min(1, 'กรุณากรอกการ์ดจอ'),
  ram: z.string().min(1, 'กรุณากรอกหน่วยความจำ'),
  storage: z.string().min(1, 'กรุณากรอกอุปกรณ์จัดเก็บข้อมูล'),
  psu: z.string().min(1, 'กรุณากรอกแหล่งจ่ายไฟ'),
  case: z.string().min(1, 'กรุณากรอกเคส'),
  cooling: z.string().min(1, 'กรุณากรอกอุปกรณ์ระบายความร้อน'),
})

export const promoSetEditSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อเซ็ตโปรโมชั่น'),
  code: z.string().min(1, 'กรุณากรอกรหัสเซ็ต'),
  status: z.enum(['selling', 'out_of_stock', 'closed']),
  regularPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  promoPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  components: componentsSchema,
  description: z.string(),
  notes: z.string(),
})

export type PromoSetEditFormValues = z.infer<typeof promoSetEditSchema>

export const promoSetCreateSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อเซ็ตโปรโมชั่น'),
  category: z.string().min(1, 'กรุณาเลือกหมวดหมู่'),
  tier: z.string().min(1, 'กรุณาเลือกระดับเซ็ต'),
  publishNow: z.boolean(),
  cpu: z.string().min(1, 'กรุณากรอกซีพียู'),
  ram: z.string().min(1, 'กรุณากรอกหน่วยความจำ'),
  gpu: z.string(),
  motherboard: z.string(),
  storage: z.string(),
  case: z.string(),
  psu: z.string(),
  cooling: z.string(),
  monitor: z.string(),
  description: z.string(),
  regularPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  discountAmount: z.number().min(0, 'ส่วนลดต้องไม่ติดลบ'),
  promoEnabled: z.boolean(),
  promoPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  startDate: z.string(),
  endDate: z.string(),
  stock: z.number().min(0, 'กรุณากรอกจำนวนคงเหลือ'),
})

export type PromoSetCreateFormValues = z.infer<typeof promoSetCreateSchema>

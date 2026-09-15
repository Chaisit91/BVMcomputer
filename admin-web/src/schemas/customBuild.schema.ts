import { z } from 'zod'

const componentsSchema = z.object({
  cpu: z.string().min(1, 'กรุณากรอกซีพียู'),
  gpu: z.string().min(1, 'กรุณากรอกการ์ดจอ'),
  motherboard: z.string().min(1, 'กรุณากรอกเมนบอร์ด'),
  ram: z.string().min(1, 'กรุณากรอกแรม'),
  storage: z.string().min(1, 'กรุณากรอกฮาร์ดดิสก์/เอสเอสดี'),
  psu: z.string().min(1, 'กรุณากรอกพาวเวอร์ซัพพลาย'),
  case: z.string().min(1, 'กรุณากรอกเคส'),
  cooling: z.string().min(1, 'กรุณากรอกชุดระบายความร้อน'),
})

const pricesSchema = z.object({
  cpu: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  gpu: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  motherboard: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  ram: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  storage: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  psu: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  case: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  cooling: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
})

export const customBuildEditSchema = z.object({
  status: z.enum(['pending', 'in_progress', 'done', 'cancelled']),
  components: componentsSchema,
  prices: pricesSchema,
  notes: z.string(),
})

export type CustomBuildEditFormValues = z.infer<typeof customBuildEditSchema>

export const customBuildCreateSchema = z.object({
  customer: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
  status: z.enum(['pending', 'in_progress', 'done', 'cancelled']),
  components: componentsSchema,
  prices: pricesSchema,
  notes: z.string(),
})

export type CustomBuildCreateFormValues = z.infer<typeof customBuildCreateSchema>

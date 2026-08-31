import { z } from 'zod'

const specsSchema = z.object({
  continuousPower: z.string().min(1, 'กรุณาเลือกกำลังไฟ'),
  certification: z.string().min(1, 'กรุณาเลือกมาตรฐาน'),
  modularity: z.string().min(1, 'กรุณาเลือกการถอดสาย'),
  formFactor: z.string().min(1, 'กรุณาเลือกขนาด'),
  fanSize: z.string(),
  connectors: z.string(),
  protection: z.string(),
  warranty: z.string(),
})

export const psuFormSchema = z.object({
  sku: z.string(),
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  brand: z.string().min(1, 'กรุณาเลือกแบรนด์'),
  sellingPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  promoEnabled: z.boolean(),
  promoPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  status: z.enum(['active', 'inactive']),
  specs: specsSchema,
  description: z.string(),
})

export type PsuFormValues = z.infer<typeof psuFormSchema>

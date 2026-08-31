import { z } from 'zod'

const specsSchema = z.object({
  mbSupport: z.string().min(1, 'กรุณาเลือกขนาดเมนบอร์ดที่รองรับ'),
  caseType: z.string().min(1, 'กรุณาเลือกประเภทเคส'),
  sidePanel: z.string().min(1, 'กรุณาเลือกฝาข้าง'),
  dimensions: z.string(),
  weight: z.string(),
  driveBays: z.string(),
  fanSupport: z.string(),
  radiatorSupport: z.string(),
  ioPorts: z.string(),
  warranty: z.string(),
})

export const caseFormSchema = z.object({
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

export type CaseFormValues = z.infer<typeof caseFormSchema>

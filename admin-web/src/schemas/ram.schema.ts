import { z } from 'zod'

const specsSchema = z.object({
  memoryType: z.string().min(1, 'กรุณาเลือกประเภทแรม'),
  capacity: z.string().min(1, 'กรุณาเลือกความจุ'),
  speed: z.string().min(1, 'กรุณาเลือกความเร็วบัส'),
  voltage: z.string(),
  casLatency: z.string(),
  warranty: z.string(),
  heatSpreader: z.string(),
  rgbLighting: z.string(),
})

export const ramFormSchema = z
  .object({
    sku: z.string(),
    name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
    brand: z.string().min(1, 'กรุณาเลือกแบรนด์'),
    series: z.string().min(1, 'กรุณาเลือกรุ่น/ซีรีส์'),
    sellingPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    promoEnabled: z.boolean(),
    promoPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
    status: z.enum(['active', 'inactive']),
    specs: specsSchema,
    description: z.string(),
  })
  .refine((data) => !data.promoEnabled || data.promoPrice <= data.sellingPrice, {
    message: 'ราคาโปรโมชั่นต้องไม่มากกว่าราคาปกติ',
    path: ['promoPrice'],
  })

export type RamFormValues = z.infer<typeof ramFormSchema>

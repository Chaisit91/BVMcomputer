import { z } from 'zod'

const specsSchema = z.object({
  coolingType: z.string().min(1, 'กรุณาเลือกประเภทชุดระบาย'),
  socketSupport: z.string().min(1, 'กรุณากรอกซ็อกเก็ตที่รองรับ'),
  radiatorSize: z.string(),
  fanSize: z.string(),
  fanSpeed: z.string(),
  noiseLevel: z.string(),
  tdpRating: z.string(),
  rgb: z.string(),
  warranty: z.string(),
})

export const coolingFormSchema = z
  .object({
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
  .refine((data) => !data.promoEnabled || data.promoPrice <= data.sellingPrice, {
    message: 'ราคาโปรโมชั่นต้องไม่มากกว่าราคาปกติ',
    path: ['promoPrice'],
  })

export type CoolingFormValues = z.infer<typeof coolingFormSchema>

import { z } from 'zod'

const specsSchema = z.object({
  type: z.string().min(1, 'กรุณาเลือกประเภทการทำงาน'),
  capacity: z.string().min(1, 'กรุณากรอกความจุ'),
  interface: z.string().min(1, 'กรุณาเลือกอินเทอร์เฟส'),
  formFactor: z.string().min(1, 'กรุณาเลือกฟอร์มแฟกเตอร์'),
  sequentialRead: z.string(),
  sequentialWrite: z.string(),
  cacheMemory: z.string(),
  mtbf: z.string(),
  warranty: z.string().min(1, 'กรุณาเลือกระยะเวลารับประกัน'),
})

export const storageFormSchema = z.object({
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

export type StorageFormValues = z.infer<typeof storageFormSchema>

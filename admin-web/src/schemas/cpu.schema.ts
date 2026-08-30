import { z } from 'zod'

export const cpuFormSchema = z.object({
  sku: z.string().min(1, 'กรุณากรอกรหัสสินค้า'),
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  brand: z.enum(['AMD', 'Intel']),
  series: z.string().min(1, 'กรุณาเลือกซีรีส์'),
  processorNumber: z.string().min(1, 'กรุณากรอกรหัสประมวลผล'),
  socket: z.string().min(1, 'กรุณาเลือกประเภทซ็อกเก็ต'),
  coresThreads: z.string(),
  baseFrequency: z.string(),
  maxTurboFrequency: z.string(),
  l2Cache: z.string(),
  l3Cache: z.string(),
  graphics: z.string(),
  tdp: z.string(),
  maxTdp: z.string(),
  warranty: z.string(),
  sellingPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  costPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  discount: z.number().min(0, 'ส่วนลดต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  publishImmediately: z.boolean(),
  description: z.string(),
})

export type CpuFormValues = z.infer<typeof cpuFormSchema>

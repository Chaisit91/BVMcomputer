import { z } from 'zod'

const specsSchema = z.object({
  baseClock: z.string(),
  memoryClock: z.string(),
  hdmiPort: z.string(),
  displayPort: z.string(),
  openGl: z.string(),
  cudaCores: z.string(),
  powerConnector: z.string(),
  powerRequirement: z.string(),
  memoryInterface: z.string(),
  dimension: z.string(),
  boostClock: z.string(),
  warranty: z.string(),
  pcieInterface: z.string(),
})

export const gpuFormSchema = z.object({
  sku: z.string().min(1, 'กรุณากรอกรหัสสินค้า'),
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  brand: z.string().min(1, 'กรุณาเลือกแบรนด์'),
  series: z.string().min(1, 'กรุณาเลือก GPU Series'),
  model: z.string().min(1, 'กรุณาเลือก GPU Model'),
  chipsetModel: z.string().min(1, 'กรุณากรอกรุ่นชิปเซ็ต'),
  memorySize: z.string().min(1, 'กรุณาเลือกขนาดหน่วยความจำ'),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  status: z.enum(['available', 'preorder', 'discontinued']),
  specs: specsSchema,
  description: z.string(),
})

export type GpuFormValues = z.infer<typeof gpuFormSchema>

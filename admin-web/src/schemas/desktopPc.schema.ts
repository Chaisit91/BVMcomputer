import { z } from 'zod'

const specsSchema = z.object({
  cpu: z.string().min(1, 'กรุณากรอก CPU'),
  gpu: z.string().min(1, 'กรุณากรอก GPU'),
  mainboard: z.string().min(1, 'กรุณากรอก Mainboard'),
  ram: z.string().min(1, 'กรุณากรอก RAM'),
  storage: z.string().min(1, 'กรุณากรอก Storage'),
  psu: z.string().min(1, 'กรุณากรอก PSU'),
  case: z.string().min(1, 'กรุณากรอก Case'),
  cooling: z.string().min(1, 'กรุณากรอก Cooling'),
  os: z.string(),
  warranty: z.string(),
})

export const desktopPcFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  sku: z.string(),
  category: z.enum(['desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise']),
  status: z.enum(['selling', 'low_stock', 'out_of_stock', 'discontinued']),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  description: z.string(),
  specs: specsSchema,
})

export type DesktopPcFormValues = z.infer<typeof desktopPcFormSchema>

import { z } from 'zod'

const componentsSchema = z.object({
  cpu: z.string().min(1, 'กรุณาเลือก CPU'),
  gpu: z.string().min(1, 'กรุณาเลือก GPU'),
  motherboard: z.string().min(1, 'กรุณาเลือก Mainboard'),
  ram: z.string().min(1, 'กรุณาเลือก RAM'),
  storage: z.string().min(1, 'กรุณาเลือก Storage'),
  psu: z.string().min(1, 'กรุณาเลือก PSU'),
  case: z.string().min(1, 'กรุณาเลือก Case'),
  cooling: z.string().min(1, 'กรุณาเลือก Cooling'),
})

export const desktopPcFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
  sku: z.string(),
  specSummary: z.string().min(1, 'กรุณากรอกสเปกโดยย่อ'),
  category: z.enum(['desktop', 'mini_pc', 'all_in_one', 'ai_workstation', 'ai_enterprise']),
  status: z.enum(['active', 'inactive', 'preorder', 'discontinued', 'low_stock', 'out_of_stock']),
  price: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
  description: z.string(),
  os: z.string(),
  warranty: z.string(),
  components: componentsSchema,
})

export type DesktopPcFormValues = z.infer<typeof desktopPcFormSchema>

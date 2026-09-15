import { z } from 'zod'

const itemSchema = z.object({
  slot: z.enum(['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'psu', 'case', 'cooling']),
  oldItemDescription: z.string(),
  newProductId: z.string(),
  newProductPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
  aiRecommendation: z.string(),
})

export const computerUpgradeFormSchema = z.object({
  customer: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
  status: z.enum(['pending_review', 'in_progress', 'completed', 'cancelled']),
  notes: z.string(),
  items: z.array(itemSchema),
})

export type ComputerUpgradeFormValues = z.infer<typeof computerUpgradeFormSchema>

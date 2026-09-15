import { z } from 'zod'

const componentsSchema = z.object({
  cpu: z.string().min(1, 'กรุณาเลือก CPU'),
  motherboard: z.string().min(1, 'กรุณาเลือก Mainboard'),
  gpu: z.string().min(1, 'กรุณาเลือก GPU'),
  ram: z.string().min(1, 'กรุณาเลือก RAM'),
  storage: z.string().min(1, 'กรุณาเลือก Storage'),
  psu: z.string().min(1, 'กรุณาเลือก PSU'),
  case: z.string().min(1, 'กรุณาเลือก Case'),
  cooling: z.string().min(1, 'กรุณาเลือก Cooling'),
})

// One schema for both create and edit (mirrors desktopPc.schema.ts) — the old
// promoSetEditSchema/promoSetCreateSchema pair had different, inconsistent
// field sets and neither matched the real backend shape on its own.
export const promoSetFormSchema = z
  .object({
    name: z.string().min(1, 'กรุณากรอกชื่อเซ็ตโปรโมชั่น'),
    code: z.string().min(1, 'กรุณากรอกรหัสเซ็ต'),
    specSummary: z.string().min(1, 'กรุณากรอกสเปคย่อ'),
    status: z.enum(['active', 'inactive', 'preorder', 'discontinued', 'low_stock', 'out_of_stock']),
    regularPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    promoEnabled: z.boolean(),
    promoPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
    publishImmediately: z.boolean(),
    components: componentsSchema,
    description: z.string(),
    notes: z.string(),
  })
  .refine((data) => !data.promoEnabled || data.promoPrice <= data.regularPrice, {
    message: 'ราคาโปรโมชั่นต้องไม่มากกว่าราคาปกติ',
    path: ['promoPrice'],
  })

export type PromoSetFormValues = z.infer<typeof promoSetFormSchema>

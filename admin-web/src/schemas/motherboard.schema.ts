import { z } from 'zod'

const specsSchema = z.object({
  cpuSupport: z.string(),
  socket: z.string(),
  chipset: z.string(),
  mainboardSupport: z.string(),
  memorySlots: z.string(),
  memoryType: z.string(),
  maxMemory: z.string(),
  maxMemorySpeed: z.string(),
  formFactor: z.string(),
  m2Slots: z.string(),
  pcieSlots: z.string(),
  usbPorts: z.string(),
  audio: z.string(),
  lan: z.string(),
  wifi: z.string(),
  bluetooth: z.string(),
  warranty: z.string(),
})

export const motherboardFormSchema = z
  .object({
    sku: z.string(),
    name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
    brand: z.string().min(1, 'กรุณาเลือกแบรนด์'),
    sellingPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    costPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    discount: z.number().min(0, 'ส่วนลดต้องไม่ติดลบ'),
    stock: z.number().min(0, 'จำนวนต้องไม่ติดลบ'),
    publishImmediately: z.boolean(),
    specs: specsSchema,
    description: z.string(),
  })
  .refine((data) => data.discount <= data.sellingPrice, {
    message: 'ส่วนลดต้องไม่มากกว่าราคาขาย',
    path: ['discount'],
  })

export type MotherboardFormValues = z.infer<typeof motherboardFormSchema>

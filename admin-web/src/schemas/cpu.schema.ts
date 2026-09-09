import { z } from 'zod'

export const cpuFormSchema = z
  .object({
    sku: z.string(),
    name: z.string().min(1, 'กรุณากรอกชื่อสินค้า'),
    brand: z.enum(['AMD', 'Intel']),
    series: z.string().min(1, 'กรุณาเลือกซีรีส์'),
    processorLine: z.string().min(1, 'กรุณากรอกรุ่นสายผลิตภัณฑ์'),
    processorNumber: z.string().min(1, 'กรุณากรอกรหัสประมวลผล'),
    socket: z.string().min(1, 'กรุณาเลือกประเภทซ็อกเก็ต'),
    cores: z.number().int('จำนวนคอร์ต้องเป็นจำนวนเต็ม').min(1, 'จำนวนคอร์ต้องมากกว่า 0'),
    threads: z.number().int('จำนวนเธรดต้องเป็นจำนวนเต็ม').min(1, 'จำนวนเธรดต้องมากกว่า 0'),
    baseFrequencyGhz: z.number().min(0, 'ความถี่ต้องไม่ติดลบ'),
    maxTurboFrequencyGhz: z.number().min(0, 'ความถี่ต้องไม่ติดลบ'),
    l2CacheMb: z.number().int().min(0, 'ขนาดแคชต้องไม่ติดลบ'),
    l3CacheMb: z.number().int().min(0, 'ขนาดแคชต้องไม่ติดลบ'),
    graphics: z.string(),
    tdpWatts: z.number().int().min(0, 'TDP ต้องไม่ติดลบ'),
    maxTdpWatts: z.number().int().min(0, 'TDP ต้องไม่ติดลบ'),
    warrantyMonths: z.number().int().min(0, 'ระยะประกันต้องไม่ติดลบ'),
    sellingPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    costPrice: z.number().min(0, 'ราคาต้องไม่ติดลบ'),
    promoEnabled: z.boolean(),
    promoPrice: z.number().min(0, 'ราคาโปรโมชันต้องไม่ติดลบ'),
    stock: z.number().int('จำนวนต้องเป็นจำนวนเต็ม').min(0, 'จำนวนต้องไม่ติดลบ'),
    status: z.enum(['active', 'inactive', 'preorder', 'discontinued']),
    publishImmediately: z.boolean(),
    description: z.string(),
  })
  .refine((data) => !data.promoEnabled || data.promoPrice <= data.sellingPrice, {
    message: 'ราคาโปรโมชันต้องไม่มากกว่าราคาขาย',
    path: ['promoPrice'],
  })

export type CpuFormValues = z.infer<typeof cpuFormSchema>

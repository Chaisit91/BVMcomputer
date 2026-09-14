import { z } from 'zod'
import { ValidationError } from '../lib/errors'

// Every slot a real machine has — the customer must describe their whole
// current setup, not just the parts they want changed, so admin/AI always
// has the full picture instead of gaps marked "ไม่ทราบของเดิม".
const ALL_SLOTS = ['cpu', 'gpu', 'motherboard', 'ram', 'storage', 'case', 'psu', 'cooling'] as const

// Public submission (no admin session) — only fields a customer actually
// owns. oldItemDescription is required per item: the whole point of this
// endpoint is the customer filling in their own machine, not leaving gaps
// for an admin to chase down later.
const publicItemSchema = z.object({
  slot: z.enum(ALL_SLOTS),
  oldItemDescription: z.string().min(1, 'กรุณากรอกข้อมูลของเดิมของชิ้นนี้'),
  customerWantsUpgrade: z.boolean().optional().default(false),
})

const publicSubmissionSchema = z
  .object({
    customerName: z.string().min(1, 'กรุณากรอกชื่อลูกค้า'),
    customerPhone: z.string().min(1, 'กรุณากรอกเบอร์โทรศัพท์'),
    notes: z.string().optional().default(''),
    items: z.array(publicItemSchema).length(8, 'กรุณากรอกของเดิมให้ครบทั้ง 8 ชิ้นส่วนของเครื่อง'),
  })
  .refine((data) => new Set(data.items.map((item) => item.slot)).size === ALL_SLOTS.length, {
    message: 'กรุณากรอกของเดิมให้ครบทุกชิ้นส่วน ห้ามกรอกชิ้นส่วนซ้ำหรือขาดชิ้นส่วนใดไป',
    path: ['items'],
  })

export function assertValidComputerUpgradeSubmission(data: unknown) {
  const result = publicSubmissionSchema.safeParse(data)
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join('; '))
  }
  return result.data
}

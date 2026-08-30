import { z } from 'zod'

export const loginSchema = z.object({
  identifier: z.string().min(1, 'กรุณากรอกอีเมลหรือชื่อผู้ใช้'),
  password: z.string().min(1, 'กรุณากรอกรหัสผ่าน'),
  remember: z.boolean(),
})

export type LoginFormValues = z.infer<typeof loginSchema>

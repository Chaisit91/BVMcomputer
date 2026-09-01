import { z } from 'zod'

export const adminEditSchema = z
  .object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
    phone: z.string(),
    jobTitle: z.string(),
    role: z.enum(['super_admin', 'inventory_manager', 'sales_staff', 'content_moderator']),
    active: z.boolean(),
    password: z.string(),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })
  .refine((data) => data.password === '' || data.password.length >= 8, {
    message: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร',
    path: ['password'],
  })

export type AdminEditFormValues = z.infer<typeof adminEditSchema>

export const adminCreateSchema = z
  .object({
    firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
    lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
    email: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
    phone: z.string(),
    jobTitle: z.string(),
    role: z.string().min(1, 'กรุณาเลือกบทบาท'),
    active: z.boolean(),
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
    notes: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

export type AdminCreateFormValues = z.infer<typeof adminCreateSchema>

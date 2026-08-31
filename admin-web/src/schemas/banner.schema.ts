import { z } from 'zod'

export const bannerFormSchema = z.object({
  name: z.string().min(1, 'กรุณากรอกชื่อแบนเนอร์'),
  type: z.enum(['hero', 'promo', 'popup']),
  targetLink: z.string(),
  startDate: z.string().min(1, 'กรุณาระบุวันเริ่มต้น'),
  endDate: z.string(),
  active: z.boolean(),
})

export type BannerFormValues = z.infer<typeof bannerFormSchema>

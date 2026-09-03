import { z } from 'zod'
import { ValidationError } from '../lib/errors'

const bannerDatesSchema = z
  .object({
    startDate: z.coerce.date(),
    endDate: z.coerce.date(),
  })
  .partial()
  .refine((data) => !data.startDate || !data.endDate || data.endDate > data.startDate, {
    message: 'endDate must be after startDate',
    path: ['endDate'],
  })

export function assertValidBannerDates(data: Record<string, unknown>) {
  const { startDate, endDate } = data
  const result = bannerDatesSchema.safeParse({ startDate, endDate })
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join('; '))
  }
}

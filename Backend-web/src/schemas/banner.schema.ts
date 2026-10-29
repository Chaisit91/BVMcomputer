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

// Returns the coerced Date objects so callers can write those to Prisma
// instead of the raw input — a bare yyyy-mm-dd string (what <input
// type="date"> sends) passes this validation via z.coerce.date() but Prisma's
// DateTime column rejects it outright ("premature end of input, expected
// ISO-8601 DateTime"), so the parsed value has to be what actually gets saved.
export function assertValidBannerDates(data: Record<string, unknown>) {
  const { startDate, endDate } = data
  const result = bannerDatesSchema.safeParse({ startDate, endDate })
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join('; '))
  }
  return result.data
}

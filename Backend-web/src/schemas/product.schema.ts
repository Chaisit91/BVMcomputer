import { z } from 'zod'
import { ValidationError } from '../lib/errors'

// Mirrors the CHECK constraints in prisma/manual/constraints.sql — this catches
// the same mistakes earlier, with a readable message instead of a raw Postgres
// error, but the DB constraint stays as the real last line of defense.
const productPricingSchema = z
  .object({
    sellingPrice: z.number().nonnegative('sellingPrice must not be negative'),
    costPrice: z.number().nonnegative('costPrice must not be negative').nullish(),
    promoPrice: z.number().nonnegative('promoPrice must not be negative').nullish(),
    stock: z.number().int('stock must be a whole number').nonnegative('stock must not be negative'),
  })
  .partial()
  .refine((data) => data.promoPrice == null || data.sellingPrice == null || data.promoPrice <= data.sellingPrice, {
    message: 'promoPrice must not exceed sellingPrice',
    path: ['promoPrice'],
  })

export function assertValidProductPricing(data: Record<string, unknown>) {
  const { sellingPrice, costPrice, promoPrice, stock } = data
  const result = productPricingSchema.safeParse({ sellingPrice, costPrice, promoPrice, stock })
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join('; '))
  }
}

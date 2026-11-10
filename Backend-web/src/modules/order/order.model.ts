import { z } from 'zod'
import { prisma } from '../../lib/prisma'
import { ValidationError } from '../../lib/errors'
import type { Order as OrderRecord } from '../../../generated/prisma'

export const Order = prisma.order
export const OrderLineItem = prisma.orderLineItem
export type { OrderRecord }

const orderLineItemSchema = z.object({
  quantity: z.number().int('quantity must be a whole number').positive('quantity must be greater than 0'),
  unitPrice: z.number().nonnegative('unitPrice must not be negative'),
})

export function assertValidOrderItems(items: unknown) {
  if (!Array.isArray(items)) return
  for (const item of items) {
    const result = orderLineItemSchema.safeParse(item)
    if (!result.success) {
      throw new ValidationError(result.error.issues.map((issue) => issue.message).join('; '))
    }
  }
}

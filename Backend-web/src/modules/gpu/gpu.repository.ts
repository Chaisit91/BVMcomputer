import { prisma } from '../../lib/prisma'
import { createProductAnchoredRepository } from '../../lib/productAnchoredRepository'

export const gpuRepository = createProductAnchoredRepository('gpu', prisma.gpu)

import { prisma } from '../../lib/prisma'
import type { ProductVideoLink as ProductVideoLinkRecord, CpuBenchmark as CpuBenchmarkRecord } from '../../../generated/prisma'

export { Product, type ProductRecord, assertValidProductPricing } from '../product/product.model'
export const ProductVideoLink = prisma.productVideoLink
export const CpuBenchmark = prisma.cpuBenchmark
export type { ProductVideoLinkRecord, CpuBenchmarkRecord }

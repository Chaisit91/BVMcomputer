import { Router } from 'express'
import { z } from 'zod'
import { ValidationError } from '../../lib/errors'
import { aiService } from './ai.service'

export const aiRouter = Router()

const partTypes = ['cpu', 'motherboard', 'gpu', 'ram', 'cooler', 'case', 'psu', 'storage'] as const
const partTypeSchema = z.enum(partTypes)
const optionalPartIds = z.object(
  Object.fromEntries(partTypes.map((part) => [part, z.string().trim().max(200).optional()])),
).strict()

const upgradeRequestSchema = z.object({
  current_build: optionalPartIds.refine(
    (build) => Object.values(build).some(Boolean),
    'current_build must include at least one component ID',
  ),
  goal: z.enum(['gaming', 'creator', 'general']).default('gaming'),
  target: z.union([z.literal('auto'), partTypeSchema]).default('auto'),
  limit: z.coerce.number().int().min(1).max(20).default(5),
}).strict()

function parse<T>(schema: z.ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value)
  if (!result.success) {
    throw new ValidationError(result.error.issues.map((issue) => issue.message).join(', '))
  }
  return result.data
}

function toSearchParams(value: Record<string, unknown>) {
  const query = new URLSearchParams()
  for (const [key, item] of Object.entries(value)) {
    if (typeof item === 'string' && item) query.set(key, item)
    if (typeof item === 'number') query.set(key, String(item))
  }
  return query
}

aiRouter.get('/health', async (_req, res) => {
  res.json(await aiService.health())
})

aiRouter.get('/search', async (req, res) => {
  const query = parse(z.object({
    type: partTypeSchema,
    q: z.string().trim().max(200).optional(),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    offset: z.coerce.number().int().min(0).optional(),
    compact: z.enum(['true', 'false']).optional(),
    ...Object.fromEntries(partTypes.map((part) => [part, z.string().trim().max(200).optional()])),
  }).strict(), req.query)
  res.json(await aiService.search(toSearchParams(query)))
})

aiRouter.get('/recommend', async (req, res) => {
  const query = parse(z.object({
    cpu: z.string().trim().min(1).max(200),
    limit: z.coerce.number().int().min(1).max(100).optional(),
    ...Object.fromEntries(partTypes.filter((part) => part !== 'cpu').map((part) => [part, z.string().trim().max(200).optional()])),
  }).strict(), req.query)
  res.json(await aiService.recommend(toSearchParams(query)))
})

aiRouter.post('/upgrade-recommend', async (req, res) => {
  const data = parse(upgradeRequestSchema, req.body)
  res.json(await aiService.recommendUpgrade(data))
})

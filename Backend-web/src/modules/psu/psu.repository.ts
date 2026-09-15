import { createCategoryRepository } from '../../lib/categoryRepository'

export const psuRepository = createCategoryRepository({
  catalogCategory: 'psu',
  partCategory: 'psu',
  subtypeAccessor: 'psu',
  subtypeFields: ['displayCode'],
})

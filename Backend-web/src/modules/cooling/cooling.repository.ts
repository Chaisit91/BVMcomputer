import { createCategoryRepository } from '../../lib/categoryRepository'

export const coolingRepository = createCategoryRepository({
  catalogCategory: 'cooling',
  partCategory: 'cooling',
  subtypeAccessor: 'cooling',
  subtypeFields: ['displayCode'],
})

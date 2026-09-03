import { createCategoryRepository } from '../../lib/categoryRepository'

export const caseRepository = createCategoryRepository({
  catalogCategory: 'case',
  partCategory: 'case',
  subtypeAccessor: 'case',
  subtypeFields: ['displayCode'],
})

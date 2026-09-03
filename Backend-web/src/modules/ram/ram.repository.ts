import { createCategoryRepository } from '../../lib/categoryRepository'

export const ramRepository = createCategoryRepository({
  catalogCategory: 'ram',
  partCategory: 'ram',
  subtypeAccessor: 'ram',
  subtypeFields: ['series'],
})

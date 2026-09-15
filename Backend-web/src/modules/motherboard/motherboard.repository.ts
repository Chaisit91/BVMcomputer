import { createCategoryRepository } from '../../lib/categoryRepository'

export const motherboardRepository = createCategoryRepository({
  catalogCategory: 'motherboard',
  partCategory: 'motherboard',
})

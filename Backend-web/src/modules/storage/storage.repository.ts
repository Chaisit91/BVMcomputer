import { createCategoryRepository } from '../../lib/categoryRepository'

export const storageRepository = createCategoryRepository({
  catalogCategory: 'storage',
  partCategory: 'storage',
})

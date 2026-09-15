import { createCategoryRepository } from '../../lib/categoryRepository'

export const gpuRepository = createCategoryRepository({
  catalogCategory: 'gpu',
  partCategory: 'gpu',
  subtypeAccessor: 'gpu',
  subtypeFields: ['series', 'model', 'chipsetModel', 'memorySize'],
})

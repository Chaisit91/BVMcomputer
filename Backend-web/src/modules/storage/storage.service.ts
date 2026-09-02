import { storageRepository } from './storage.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const storageService = {
  list: () => storageRepository.findMany(),
  getById: (id: string) => storageRepository.findById(id),
  create: (data: unknown) => storageRepository.create(data),
  update: (id: string, data: unknown) => storageRepository.update(id, data),
  remove: (id: string) => storageRepository.remove(id),
}

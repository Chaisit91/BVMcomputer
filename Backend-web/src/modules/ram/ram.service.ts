import { ramRepository } from './ram.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const ramService = {
  list: () => ramRepository.findMany(),
  getById: (id: string) => ramRepository.findById(id),
  create: (data: unknown) => ramRepository.create(data),
  update: (id: string, data: unknown) => ramRepository.update(id, data),
  remove: (id: string) => ramRepository.remove(id),
}

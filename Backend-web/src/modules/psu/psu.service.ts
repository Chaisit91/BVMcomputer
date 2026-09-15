import { psuRepository } from './psu.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const psuService = {
  list: () => psuRepository.findMany(),
  getById: (id: string) => psuRepository.findById(id),
  create: (data: unknown) => psuRepository.create(data),
  update: (id: string, data: unknown) => psuRepository.update(id, data),
  remove: (id: string) => psuRepository.remove(id),
}

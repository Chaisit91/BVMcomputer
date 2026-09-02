import { motherboardRepository } from './motherboard.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const motherboardService = {
  list: () => motherboardRepository.findMany(),
  getById: (id: string) => motherboardRepository.findById(id),
  create: (data: unknown) => motherboardRepository.create(data),
  update: (id: string, data: unknown) => motherboardRepository.update(id, data),
  remove: (id: string) => motherboardRepository.remove(id),
}

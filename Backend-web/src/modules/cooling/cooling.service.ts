import { coolingRepository } from './cooling.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const coolingService = {
  list: () => coolingRepository.findMany(),
  getById: (id: string) => coolingRepository.findById(id),
  create: (data: unknown) => coolingRepository.create(data),
  update: (id: string, data: unknown) => coolingRepository.update(id, data),
  remove: (id: string) => coolingRepository.remove(id),
}

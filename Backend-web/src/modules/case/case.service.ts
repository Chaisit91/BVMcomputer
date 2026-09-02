import { caseRepository } from './case.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const caseService = {
  list: () => caseRepository.findMany(),
  getById: (id: string) => caseRepository.findById(id),
  create: (data: unknown) => caseRepository.create(data),
  update: (id: string, data: unknown) => caseRepository.update(id, data),
  remove: (id: string) => caseRepository.remove(id),
}

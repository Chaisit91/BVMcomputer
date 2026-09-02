import { cpuRepository } from './cpu.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const cpuService = {
  list: () => cpuRepository.findMany(),
  getById: (id: string) => cpuRepository.findById(id),
  create: (data: unknown) => cpuRepository.create(data),
  update: (id: string, data: unknown) => cpuRepository.update(id, data),
  remove: (id: string) => cpuRepository.remove(id),
}

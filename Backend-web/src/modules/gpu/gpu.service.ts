import { gpuRepository } from './gpu.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const gpuService = {
  list: () => gpuRepository.findMany(),
  getById: (id: string) => gpuRepository.findById(id),
  create: (data: unknown) => gpuRepository.create(data),
  update: (id: string, data: unknown) => gpuRepository.update(id, data),
  remove: (id: string) => gpuRepository.remove(id),
}

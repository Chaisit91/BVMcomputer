import { customBuildRepository } from './custom-build.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const customBuildService = {
  list: () => customBuildRepository.findMany(),
  getById: (id: string) => customBuildRepository.findById(id),
  create: (data: unknown) => customBuildRepository.create(data),
  update: (id: string, data: unknown) => customBuildRepository.update(id, data),
  remove: (id: string) => customBuildRepository.remove(id),
}

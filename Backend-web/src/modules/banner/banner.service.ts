import { bannerRepository } from './banner.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const bannerService = {
  list: () => bannerRepository.findMany(),
  getById: (id: string) => bannerRepository.findById(id),
  create: (data: unknown) => bannerRepository.create(data),
  update: (id: string, data: unknown) => bannerRepository.update(id, data),
  remove: (id: string) => bannerRepository.remove(id),
}

import { desktopPcRepository } from './desktop-pc.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const desktopPcService = {
  list: () => desktopPcRepository.findMany(),
  getById: (id: string) => desktopPcRepository.findById(id),
  create: (data: unknown) => desktopPcRepository.create(data),
  update: (id: string, data: unknown) => desktopPcRepository.update(id, data),
  remove: (id: string) => desktopPcRepository.remove(id),
}

import { customerRepository } from './customer.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const customerService = {
  list: () => customerRepository.findMany(),
  getById: (id: string) => customerRepository.findById(id),
  create: (data: unknown) => customerRepository.create(data),
  update: (id: string, data: unknown) => customerRepository.update(id, data),
  remove: (id: string) => customerRepository.remove(id),
}

import { orderRepository } from './order.repository'

// ponytail: passes data straight through — swap in a Zod schema (mirroring
// admin-web/src/schemas/order.schema.ts) before this handles real traffic.
export const orderService = {
  list: () => orderRepository.findMany(),
  getById: (id: string) => orderRepository.findById(id),
  create: (data: unknown) => orderRepository.create(data),
  update: (id: string, data: unknown) => orderRepository.update(id, data),
  remove: (id: string) => orderRepository.remove(id),
}

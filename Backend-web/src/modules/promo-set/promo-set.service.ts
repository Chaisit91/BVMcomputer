import { promoSetRepository } from './promo-set.repository'

// ponytail: passes data straight through — swap in a Zod schema per module
// (mirroring admin-web/src/schemas) before this handles real traffic.
export const promoSetService = {
  list: () => promoSetRepository.findMany(),
  getById: (id: string) => promoSetRepository.findById(id),
  create: (data: unknown) => promoSetRepository.create(data),
  update: (id: string, data: unknown) => promoSetRepository.update(id, data),
  remove: (id: string) => promoSetRepository.remove(id),
}

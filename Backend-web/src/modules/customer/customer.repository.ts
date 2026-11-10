import { Customer } from './customer.model'

export const customerRepository = {
  findMany: () => Customer.findMany(),
  // Cheap existence check for public (no-auth) endpoints that take a raw
  // customerId from the URL — check this before doing any real work (like
  // uploading a file) with an attacker-supplied id that might not exist.
  exists: (id: string) => Customer.count({ where: { id } }).then((count) => count > 0),
  findById: (id: string) =>
    Customer.findUnique({
      where: { id },
      include: { orders: { orderBy: { createdAt: 'desc' }, take: 5, include: { items: true } } },
    }),
  // customerCode is required+unique with no DB default, and the admin-web
  // create form (manually registering a customer) never collects one —
  // generate it here rather than leaving account creation permanently broken.
  create: (data: any) => Customer.create({ data: { customerCode: `CUS-${Date.now()}`, ...data } }),
  update: (id: string, data: any) => Customer.update({ where: { id }, data }),
  remove: (id: string) => Customer.delete({ where: { id } }),
}

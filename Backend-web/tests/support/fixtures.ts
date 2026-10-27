import 'dotenv/config'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient, type AdminRole } from '../../generated/prisma'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

let counter = 0
// Unique per test run so parallel/repeated runs never collide on the
// email unique constraint.
function uniqueSuffix() {
  counter += 1
  return `${Date.now()}-${counter}`
}

// passwordHash is never checked — tests authenticate via a signed JWT
// (see jwt.ts), never the login form, so a real hash is pointless here.
export async function createFixtureAdmin(role: AdminRole, isTeamLead = false) {
  const suffix = uniqueSuffix()
  return prisma.adminAccount.create({
    data: {
      firstName: 'PW',
      lastName: `Fixture-${suffix}`,
      email: `pw-fixture-${suffix}@test.local`,
      phone: '0000000000',
      passwordHash: 'not-a-real-hash',
      role,
      isTeamLead,
    },
  })
}

export async function deleteFixtureAdmin(id: string) {
  // AdminAccount has no onDelete: Cascade from ChatMessage/Announcement (an
  // admin's past messages/announcements shouldn't vanish just because the
  // account is later removed in production) — clear those first as a safety
  // net, even though individual tests also clean up what they created directly.
  await prisma.announcement.deleteMany({ where: { authorId: id } })
  await prisma.chatMessage.updateMany({ where: { senderAdminId: id }, data: { senderAdminId: null } })
  await prisma.adminAccount.deleteMany({ where: { id } })
}

export async function createFixtureCustomer() {
  const suffix = uniqueSuffix()
  return prisma.customer.create({
    data: {
      customerCode: `PW-${suffix}`,
      fullName: `Playwright Fixture ${suffix}`,
      username: `pw-fixture-${suffix}`,
      email: `pw-customer-${suffix}@test.local`,
      phone: '0000000000',
    },
  })
}

export async function deleteFixtureCustomer(id: string) {
  // ChatConversation -> Customer has no onDelete: Cascade (Customer is the
  // parent on purpose — losing chat history shouldn't silently delete a
  // customer record elsewhere), so the conversation must go first; its own
  // ChatMessage rows cascade from that delete.
  await prisma.chatConversation.deleteMany({ where: { customerId: id } })
  await prisma.customer.deleteMany({ where: { id } })
}

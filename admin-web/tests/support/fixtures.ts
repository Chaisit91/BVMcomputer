import path from 'node:path'
import { fileURLToPath } from 'node:url'
import dotenv from 'dotenv'
import { PrismaPg } from '@prisma/adapter-pg'
// Reuses Backend-web's already-generated Prisma client instead of
// generating (or maintaining) a second copy of the same schema in this
// project — admin-web has no database of its own.
import { PrismaClient, type AdminRole } from '../../../Backend-web/generated/prisma/index.js'
import { hashPassword } from '../../../Backend-web/src/utils/password'

const dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.resolve(dirname, '../../../Backend-web/.env') })

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
export const prisma = new PrismaClient({ adapter })

let counter = 0
function uniqueSuffix() {
  counter += 1
  return `${Date.now()}-${counter}`
}

// passwordHash is never checked — these E2E tests log in by injecting a
// signed session cookie (see jwt.ts + login.ts), never the real login form,
// so fixture accounts never need a real, known password.
export async function createFixtureAdmin(role: AdminRole, isTeamLead = false) {
  const suffix = uniqueSuffix()
  return prisma.adminAccount.create({
    data: {
      firstName: 'PW',
      lastName: `Fixture-${suffix}`,
      email: `pw-fixture-${suffix}@test.local`,
      // Real admin accounts always have one; adminEditSchema requires it, so
      // omitting it here silently blocked every edit-form submit in tests.
      personalEmail: `pw-fixture-personal-${suffix}@test.local`,
      phone: '0000000000',
      passwordHash: 'not-a-real-hash',
      role,
      isTeamLead,
    },
  })
}

// Only the login test needs a real, known password — every other test logs
// in by injecting a signed session cookie (see jwt.ts + login.ts) and never
// touches the real login form, so createFixtureAdmin's fake hash is fine there.
export async function createFixtureAdminWithPassword(role: AdminRole, plainPassword: string) {
  const suffix = uniqueSuffix()
  return prisma.adminAccount.create({
    data: {
      firstName: 'PW',
      lastName: `Fixture-${suffix}`,
      email: `pw-fixture-${suffix}@test.local`,
      personalEmail: `pw-fixture-personal-${suffix}@test.local`,
      phone: '0000000000',
      passwordHash: await hashPassword(plainPassword),
      role,
    },
  })
}

export async function deleteFixtureAdmin(id: string) {
  // AdminAccount has no onDelete: Cascade from ChatMessage/Announcement (an
  // admin's past messages/announcements shouldn't vanish just because the
  // account is later removed in production) — tests need to clear those
  // first, or deleting the fixture admin hits a FK violation. Wrapped in one
  // transaction so all three statements run against the same connection —
  // issuing them as separate awaits intermittently raced the FK check
  // against a pooled connection that hadn't seen the prior delete yet.
  // Retried rather than a single $transaction([...]) — the batched array form
  // intermittently left the just-created announcement undeleted by the time
  // the admin delete statement ran (observed via direct re-query right after
  // the FK violation: the row was still there despite the preceding
  // announcement.deleteMany targeting the same authorId), so re-deleting and
  // retrying is the reliable fix regardless of the exact driver-level cause.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await prisma.announcement.deleteMany({ where: { authorId: id } })
    await prisma.chatMessage.updateMany({ where: { senderAdminId: id }, data: { senderAdminId: null } })
    try {
      await prisma.adminAccount.deleteMany({ where: { id } })
      return
    } catch (err: any) {
      if (err?.code !== 'P2003' || attempt === 2) throw err
    }
  }
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
  await prisma.chatConversation.deleteMany({ where: { customerId: id } })
  await prisma.customer.deleteMany({ where: { id } })
}

// Orders have no create UI (checkout isn't built by this project yet) — the
// edit-page test needs one to already exist, created directly like a real
// checkout would leave it.
export async function createFixtureOrder() {
  const suffix = uniqueSuffix()
  return prisma.order.create({
    data: {
      orderCode: `PW-ORDER-${suffix}`,
      customerName: 'Playwright Fixture Buyer',
      customerPhone: '0000000000',
      shippingAddress: '123 Fixture Rd.',
      postalCode: '10000',
      province: 'Bangkok',
      district: 'Fixture District',
      subdistrict: 'Fixture Subdistrict',
      paymentMethod: 'bank_transfer',
    },
  })
}

export async function deleteFixtureOrder(id: string) {
  await prisma.order.deleteMany({ where: { id } })
}

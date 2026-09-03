import 'dotenv/config'
import { PrismaClient } from '../generated/prisma'
import { hashPassword } from '../src/utils/password'

const prisma = new PrismaClient()

async function main() {
  const existingCount = await prisma.adminAccount.count()
  if (existingCount > 0) {
    console.log(`Skipping seed — ${existingCount} admin account(s) already exist.`)
    return
  }

  const email = process.env.SEED_ADMIN_EMAIL
  const password = process.env.SEED_ADMIN_PASSWORD
  const firstName = process.env.SEED_ADMIN_FIRST_NAME ?? 'Super'
  const lastName = process.env.SEED_ADMIN_LAST_NAME ?? 'Admin'

  if (!email || !password) {
    throw new Error('Set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env, then run this again.')
  }
  if (password.length < 8) {
    throw new Error('SEED_ADMIN_PASSWORD must be at least 8 characters.')
  }

  const passwordHash = await hashPassword(password)
  const admin = await prisma.adminAccount.create({
    data: { firstName, lastName, email, phone: '', passwordHash, role: 'super_admin' },
  })
  console.log(`Created first super_admin: ${admin.email} (id ${admin.id})`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())

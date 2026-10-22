import { Router } from 'express'
import { sendPasswordSetupEmail } from '../../utils/email'
import { hashPassword } from '../../utils/password'
import { createPasswordSetupToken, hashPasswordSetupToken } from '../../utils/passwordSetupToken'
import { adminRepository } from './admin.repository'

export const adminPasswordSetupRouter = Router()

// No auth — "forgot password" self-service.
// ponytail: reports whether the email matched an account (400 vs 200) rather
// than always answering generically — a deliberate choice for this internal,
// small-team admin panel, not a public user-facing signup. This does let
// someone probe which personal emails belong to admins here; fine at this
// scale, but don't carry this pattern over to a public-facing account system.
adminPasswordSetupRouter.post('/request', async (req, res) => {
  const { personalEmail } = req.body ?? {}

  if (typeof personalEmail !== 'string' || !personalEmail) {
    res.status(400).json({ message: 'กรุณากรอกอีเมล' })
    return
  }

  const account = await adminRepository.findByPersonalEmail(personalEmail)
  if (!account) {
    res.status(404).json({ message: 'ไม่มีอีเมลนี้อยู่ในระบบ' })
    return
  }

  const { rawToken, tokenHash, expiresAt } = createPasswordSetupToken()
  await adminRepository.update(account.id, { passwordSetupTokenHash: tokenHash, passwordSetupExpiresAt: expiresAt })
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173'
  void sendPasswordSetupEmail(personalEmail, `${frontendUrl}/set-password?token=${rawToken}`, account.firstName)

  res.json({ message: 'ส่งลิงก์สำหรับตั้งรหัสผ่านไปที่อีเมลนี้แล้ว กรุณาตรวจสอบกล่องข้อความ' })
})

// No auth — the whole point is letting a brand-new admin who has never
// logged in set their own password from the emailed link.
adminPasswordSetupRouter.post('/', async (req, res) => {
  const { token, newPassword } = req.body ?? {}

  if (typeof token !== 'string' || typeof newPassword !== 'string' || newPassword.length < 8) {
    res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' })
    return
  }

  const account = await adminRepository.findByPasswordSetupTokenHash(hashPasswordSetupToken(token))
  if (!account || !account.passwordSetupExpiresAt || account.passwordSetupExpiresAt < new Date()) {
    res.status(400).json({ message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบสูงสุด' })
    return
  }

  await adminRepository.update(account.id, {
    passwordHash: await hashPassword(newPassword),
    // One-time use: clear the token so the same link can't be replayed.
    passwordSetupTokenHash: null,
    passwordSetupExpiresAt: null,
  })

  res.status(204).send()
})

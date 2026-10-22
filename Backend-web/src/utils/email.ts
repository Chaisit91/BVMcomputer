import { Resend } from 'resend'

// Lazily constructed so a missing RESEND_API_KEY doesn't crash the whole
// server on boot — only the send call fails (and falls back to a console log
// below), which matters in dev before the key is configured.
function getClient() {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendPasswordSetupEmail(to: string, setupLink: string, recipientName: string) {
  const client = getClient()
  const from = process.env.EMAIL_FROM || 'onboarding@resend.dev'

  if (!client) {
    console.warn(`[email] RESEND_API_KEY not set — would have sent password setup link to ${to}: ${setupLink}`)
    return
  }

  const { error } = await client.emails.send({
    from,
    to,
    subject: 'ตั้งรหัสผ่านบัญชีผู้ดูแลระบบ BVMcomputer',
    html: `
      <p>สวัสดีคุณ ${recipientName},</p>
      <p>บัญชีผู้ดูแลระบบของคุณถูกสร้างขึ้นแล้ว กรุณากดลิงก์ด้านล่างเพื่อตั้งรหัสผ่านของคุณเอง (ลิงก์หมดอายุใน 24 ชั่วโมง):</p>
      <p><a href="${setupLink}">${setupLink}</a></p>
      <p>หากไม่ได้ร้องขอการสร้างบัญชีนี้ สามารถเพิกเฉยต่ออีเมลนี้ได้</p>
    `,
  })

  // Account creation already succeeded by the time this runs — a failed send
  // shouldn't fail the whole request, just get logged so someone can resend
  // the link manually.
  if (error) console.error('[email] failed to send password setup email:', error)
}

// ponytail: temporary stub so admin-web's login/dashboard can be click-tested
// in a real browser before Backend-web exists. Accepts any non-empty
// identifier/password. Delete this whole folder once the real backend ships.
import cookieParser from 'cookie-parser'
import cors from 'cors'
import express from 'express'

const PORT = 4000
const COOKIE_NAME = 'bvm_session'
const mockUser = { id: '1', name: 'นครกร มหาสงคราม', email: 'admin@bvm.local' }

const app = express()
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use(cookieParser())

app.post('/api/auth/login', (req, res) => {
  const { identifier, password } = req.body ?? {}
  if (!identifier || !password) {
    return res.status(400).json({ message: 'กรุณากรอกอีเมล/ชื่อผู้ใช้และรหัสผ่าน' })
  }
  res.cookie(COOKIE_NAME, 'mock-token', { httpOnly: true, sameSite: 'lax' })
  res.json({ user: mockUser })
})

app.get('/api/auth/me', (req, res) => {
  if (!req.cookies[COOKIE_NAME]) {
    return res.status(401).json({ message: 'ไม่ได้เข้าสู่ระบบ' })
  }
  res.json({ user: mockUser })
})

app.post('/api/auth/logout', (_req, res) => {
  res.clearCookie(COOKIE_NAME)
  res.status(204).end()
})

app.post('/api/auth/refresh', (req, res) => {
  if (!req.cookies[COOKIE_NAME]) {
    return res.status(401).json({ message: 'session หมดอายุ' })
  }
  res.cookie(COOKIE_NAME, 'mock-token', { httpOnly: true, sameSite: 'lax' })
  res.status(204).end()
})

app.listen(PORT, () => {
  console.log(`mock auth server listening on http://localhost:${PORT}`)
})

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FiMail, FiMonitor } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { requestPasswordReset } from '../../services/admin.service'
import loginBackground from '../../assets/login-background.png'

const forgotPasswordSchema = z.object({
  personalEmail: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

// Client-side only — the real abuse protection belongs server-side (rate
// limiting on the endpoint); this just stops accidental rapid re-clicks.
const RESEND_COOLDOWN_SECONDS = 30

export function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState('')
  const [sentTo, setSentTo] = useState('')
  const [resending, setResending] = useState(false)
  const [resendError, setResendError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { personalEmail: '' },
  })

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setInterval(() => setCooldown((s) => s - 1), 1000)
    return () => clearInterval(timer)
  }, [cooldown])

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const message = await requestPasswordReset(values.personalEmail)
      setSentMessage(message)
      setSentTo(values.personalEmail)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      setError('root', { message: serverMessage ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
    }
  }

  const onResend = async () => {
    setResendError('')
    setResending(true)
    try {
      const message = await requestPasswordReset(sentTo)
      setSentMessage(message)
      setCooldown(RESEND_COOLDOWN_SECONDS)
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      setResendError(serverMessage ?? 'ส่งอีกครั้งไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 animate-welcome-zoom bg-cover bg-center"
        style={{ backgroundImage: `url(${loginBackground})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070d]/93 via-[#05070d]/85 to-[#05070d]/96" />
      <div className="halftone-dots absolute inset-0 opacity-10" />

      <div className="relative z-10 flex w-full max-w-md flex-col items-center animate-fade-in">
        <div className="tech-grid relative w-full overflow-hidden rounded-3xl border border-white/15 bg-[#0b0e16] p-8 shadow-2xl shadow-black/80 ring-1 ring-white/5 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-transparent" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/40">
              <FiMonitor size={24} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">BVMcomputer</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">ลืมรหัสผ่าน</h1>
            <p className="mt-1.5 text-sm text-gray-400">กรอกอีเมลส่วนตัว (Gmail) ที่ผูกกับบัญชีของคุณ</p>
          </div>

          {sentMessage ? (
            <div className="animate-rise-in space-y-4 text-center">
              <p className="text-sm text-gray-300">{sentMessage}</p>
              <p className="text-xs text-gray-500">ไม่เห็นอีเมลเข้ามา? เช็คโฟลเดอร์สแปม/จดหมายขยะด้วย</p>
              <button
                type="button"
                disabled={resending || cooldown > 0}
                onClick={onResend}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 text-sm font-semibold text-gray-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/10 hover:shadow-lg active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {resending ? 'กำลังส่ง...' : cooldown > 0 ? `ส่งอีกครั้งใน ${cooldown} วินาที` : 'ส่งอีเมลอีกครั้ง'}
              </button>
              {resendError && (
                <p role="alert" className="animate-shake text-sm text-red-400">
                  {resendError}
                </p>
              )}
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="animate-rise-in" style={{ animationDelay: '80ms' }}>
                <TextField
                  tone="dark"
                  label="อีเมลส่วนตัว (Gmail)"
                  placeholder="your.name@gmail.com"
                  type="email"
                  icon={<FiMail />}
                  error={errors.personalEmail?.message}
                  {...register('personalEmail')}
                />
              </div>

              {errors.root && (
                <p role="alert" className="animate-shake text-center text-sm text-red-400">
                  {errors.root.message}
                </p>
              )}

              <div className="animate-rise-in" style={{ animationDelay: '150ms' }}>
                <Button type="submit" loading={isSubmitting}>
                  ส่งลิงก์ตั้งรหัสผ่านใหม่
                </Button>
              </div>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="link-underline font-medium text-rose-400 hover:text-rose-300">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>

        <p className="mt-6 text-xs text-gray-400/80">BVMcomputer v1.0 | สงวนลิขสิทธิ์ 2024</p>
      </div>
    </div>
  )
}

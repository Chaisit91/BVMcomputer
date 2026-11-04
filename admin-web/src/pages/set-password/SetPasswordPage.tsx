import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMonitor } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { setPasswordWithToken } from '../../services/admin.service'
import loginBackground from '../../assets/login-background.png'

const setPasswordSchema = z
  .object({
    password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'รหัสผ่านไม่ตรงกัน',
    path: ['confirmPassword'],
  })

type SetPasswordFormValues = z.infer<typeof setPasswordSchema>

export function SetPasswordPage() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [showPassword, setShowPassword] = useState(false)
  const [done, setDone] = useState(false)

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SetPasswordFormValues>({
    resolver: zodResolver(setPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: SetPasswordFormValues) => {
    try {
      await setPasswordWithToken(token, values.password)
      setDone(true)
    } catch {
      setError('root', { message: 'ลิงก์ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาติดต่อผู้ดูแลระบบสูงสุด' })
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
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">ตั้งรหัสผ่านบัญชีของคุณ</h1>
            <p className="mt-1.5 text-sm text-gray-400">ตั้งรหัสผ่านใหม่สำหรับเข้าสู่ระบบผู้ดูแล</p>
          </div>

          {!token ? (
            <p role="alert" className="animate-shake text-center text-sm text-red-400">
              ลิงก์ไม่ถูกต้อง กรุณาใช้ลิงก์จากอีเมลที่ได้รับ
            </p>
          ) : done ? (
            <div className="flex animate-rise-in flex-col items-center gap-3 text-center">
              <FiCheckCircle size={32} className="animate-rise-in text-emerald-400" />
              <p className="text-sm text-gray-300">ตั้งรหัสผ่านสำเร็จแล้ว ใช้รหัสผ่านใหม่นี้เข้าสู่ระบบได้เลย</p>
              <Link to="/login" className="link-underline text-sm font-medium text-rose-400 hover:text-rose-300">
                ไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="animate-rise-in" style={{ animationDelay: '80ms' }}>
                <TextField
                  tone="dark"
                  label="รหัสผ่านใหม่"
                  placeholder="กรอกรหัสผ่านใหม่"
                  type={showPassword ? 'text' : 'password'}
                  icon={<FiLock />}
                  error={errors.password?.message}
                  rightElement={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="text-gray-500 transition-transform hover:text-gray-300 active:scale-90"
                      aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  }
                  {...register('password')}
                />
              </div>

              <div className="animate-rise-in" style={{ animationDelay: '150ms' }}>
                <TextField
                  tone="dark"
                  label="ยืนยันรหัสผ่านใหม่"
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                  type={showPassword ? 'text' : 'password'}
                  icon={<FiLock />}
                  error={errors.confirmPassword?.message}
                  {...register('confirmPassword')}
                />
              </div>

              {errors.root && (
                <p role="alert" className="animate-shake text-center text-sm text-red-400">
                  {errors.root.message}
                </p>
              )}

              <div className="animate-rise-in" style={{ animationDelay: '220ms' }}>
                <Button type="submit" loading={isSubmitting}>
                  ตั้งรหัสผ่าน
                </Button>
              </div>
            </form>
          )}
        </div>

        <p className="mt-6 text-xs text-gray-400/80">BVMcomputer v1.0 | สงวนลิขสิทธิ์ 2024</p>
      </div>
    </div>
  )
}

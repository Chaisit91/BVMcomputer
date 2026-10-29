import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiEye, FiEyeOff, FiMonitor } from 'react-icons/fi'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { Checkbox } from '../../components/ui/Checkbox'
import { loginSchema, type LoginFormValues } from '../../schemas/auth.schema'
import { login } from '../../services/auth.service'
import { setUser } from '../../store/authSlice'
import { useAppDispatch } from '../../store/hooks'
import loginBackground from '../../assets/login-background.png'

// How long the post-login slide-cover plays before actually navigating —
// timed to land just after the panel has fully covered the screen and the
// welcome text has faded in (see the slide-cover/welcome-content-in
// durations+delay in tailwind.config.js), so the route swap happens while
// the viewport is solid-covered instead of mid-motion.
const WELCOME_DURATION_MS = 1500

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [welcoming, setWelcoming] = useState(false)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: '', password: '', remember: false },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { user } = await login(values)
      dispatch(setUser(user))
      setWelcoming(true)
      setTimeout(() => navigate('/dashboard', { replace: true }), WELCOME_DURATION_MS)
    } catch {
      setError('root', { message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง' })
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

      {welcoming && (
        <div className="fixed inset-0 z-20 animate-slide-cover bg-gradient-to-b from-[#141b2c] via-[#0a0e17] to-[#1a0a10]">
          <div className="flex h-full flex-col items-center justify-center gap-4 opacity-0 animate-welcome-content-in">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-xl shadow-rose-500/50">
              <FiMonitor size={32} />
            </span>
            <p className="text-lg font-semibold text-white">ยินดีต้อนรับกลับมา</p>
            <p className="text-sm text-gray-400">กำลังเข้าสู่ระบบจัดการหลังบ้าน...</p>
          </div>
        </div>
      )}

      <div className="relative z-10 flex w-full max-w-md flex-col items-center animate-fade-in">
        <div className="tech-grid relative w-full overflow-hidden rounded-3xl border border-white/15 bg-[#0b0e16] p-8 shadow-2xl shadow-black/80 ring-1 ring-white/5 sm:p-10">
          {/* Thin glowing top edge — the one "tech" accent line, kept to the
              brand rose instead of introducing a second accent color. */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose-400/70 to-transparent" />

          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-lg shadow-rose-500/40">
              <FiMonitor size={24} />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">BVMcomputer</span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white">เข้าสู่ระบบ</h1>
            <p className="mt-1.5 text-sm text-gray-400">ระบบจัดการหลังบ้าน</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              tone="dark"
              label="อีเมลหรือชื่อผู้ใช้"
              placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
              icon={<FiUser />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <TextField
              tone="dark"
              label="รหัสผ่าน"
              placeholder="กรอกรหัสผ่าน"
              type={showPassword ? 'text' : 'password'}
              icon={<FiLock />}
              error={errors.password?.message}
              rightElement={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-gray-500 hover:text-gray-300"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <Checkbox label="จดจำการเข้าสู่ระบบ" {...register('remember')} />
              <Link to="/forgot-password" className="text-sm text-rose-400 hover:text-rose-300 hover:underline">
                ลืมรหัสผ่าน?
              </Link>
            </div>

            {errors.root && (
              <p role="alert" className="text-center text-sm text-red-400">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" loading={isSubmitting}>
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>

        <p className="mt-6 text-xs text-gray-400/80">BVMcomputer v1.0 | สงวนลิขสิทธิ์ 2024</p>
      </div>
    </div>
  )
}

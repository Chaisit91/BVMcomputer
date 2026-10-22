import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiCheckCircle, FiEye, FiEyeOff, FiLock, FiMonitor } from 'react-icons/fi'
import { Link, useSearchParams } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { setPasswordWithToken } from '../../services/admin.service'

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="w-full rounded-3xl bg-white p-8 shadow-xl shadow-gray-200/60">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white">
              <FiMonitor size={24} />
            </div>
            <span className="text-lg font-bold text-gray-900">BVMcomputer</span>
            <h1 className="mt-4 text-xl font-bold text-gray-900">ตั้งรหัสผ่านบัญชีของคุณ</h1>
            <p className="mt-1 text-sm text-gray-400">ตั้งรหัสผ่านใหม่สำหรับเข้าสู่ระบบผู้ดูแล</p>
          </div>

          {!token ? (
            <p role="alert" className="text-center text-sm text-red-500">
              ลิงก์ไม่ถูกต้อง กรุณาใช้ลิงก์จากอีเมลที่ได้รับ
            </p>
          ) : done ? (
            <div className="flex flex-col items-center gap-3 text-center">
              <FiCheckCircle size={32} className="text-emerald-500" />
              <p className="text-sm text-gray-600">ตั้งรหัสผ่านสำเร็จแล้ว ใช้รหัสผ่านใหม่นี้เข้าสู่ระบบได้เลย</p>
              <Link to="/login" className="text-sm font-medium text-rose-500 hover:underline">
                ไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
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
                    className="text-gray-400 hover:text-gray-600"
                    aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                }
                {...register('password')}
              />

              <TextField
                label="ยืนยันรหัสผ่านใหม่"
                placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                type={showPassword ? 'text' : 'password'}
                icon={<FiLock />}
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {errors.root && (
                <p role="alert" className="text-center text-sm text-red-500">
                  {errors.root.message}
                </p>
              )}

              <Button type="submit" loading={isSubmitting}>
                ตั้งรหัสผ่าน
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

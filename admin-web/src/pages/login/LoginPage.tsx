import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { FiUser, FiLock, FiEye, FiEyeOff, FiMonitor } from 'react-icons/fi'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { Checkbox } from '../../components/ui/Checkbox'
import { loginSchema, type LoginFormValues } from '../../schemas/auth.schema'
import { login } from '../../services/auth.service'
import { setUser } from '../../store/authSlice'
import { useAppDispatch } from '../../store/hooks'

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
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
      navigate('/dashboard', { replace: true })
    } catch {
      setError('root', { message: 'เข้าสู่ระบบไม่สำเร็จ กรุณาตรวจสอบข้อมูลอีกครั้ง' })
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
            <h1 className="mt-4 text-xl font-bold text-gray-900">เข้าสู่ระบบ</h1>
            <p className="mt-1 text-sm text-gray-400">ระบบจัดการหลังบ้าน</p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <TextField
              label="อีเมลหรือชื่อผู้ใช้"
              placeholder="กรอกอีเมลหรือชื่อผู้ใช้"
              icon={<FiUser />}
              error={errors.identifier?.message}
              {...register('identifier')}
            />

            <TextField
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
                  className="text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              }
              {...register('password')}
            />

            <div className="flex items-center justify-between">
              <Checkbox label="จดจำการเข้าสู่ระบบ" {...register('remember')} />
              <a href="#" className="text-sm text-rose-500 hover:underline">
                ลืมรหัสผ่าน?
              </a>
            </div>

            {errors.root && (
              <p role="alert" className="text-center text-sm text-red-500">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" loading={isSubmitting}>
              เข้าสู่ระบบ
            </Button>
          </form>
        </div>

        <p className="mt-6 text-xs text-gray-400">BVMcomputer v1.0 | สงวนลิขสิทธิ์ 2024</p>
      </div>
    </div>
  )
}

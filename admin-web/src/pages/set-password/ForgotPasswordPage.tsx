import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FiMail, FiMonitor } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { requestPasswordReset } from '../../services/admin.service'

const forgotPasswordSchema = z.object({
  personalEmail: z.string().min(1, 'กรุณากรอกอีเมล').email('รูปแบบอีเมลไม่ถูกต้อง'),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [sentMessage, setSentMessage] = useState('')

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { personalEmail: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const message = await requestPasswordReset(values.personalEmail)
      setSentMessage(message)
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      setError('root', { message: serverMessage ?? 'เกิดข้อผิดพลาด กรุณาลองใหม่' })
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
            <h1 className="mt-4 text-xl font-bold text-gray-900">ลืมรหัสผ่าน</h1>
            <p className="mt-1 text-sm text-gray-400">กรอกอีเมลส่วนตัว (Gmail) ที่ผูกกับบัญชีของคุณ</p>
          </div>

          {sentMessage ? (
            <p className="text-center text-sm text-gray-600">{sentMessage}</p>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
              <TextField
                label="อีเมลส่วนตัว (Gmail)"
                placeholder="your.name@gmail.com"
                type="email"
                icon={<FiMail />}
                error={errors.personalEmail?.message}
                {...register('personalEmail')}
              />

              {errors.root && (
                <p role="alert" className="text-center text-sm text-red-500">
                  {errors.root.message}
                </p>
              )}

              <Button type="submit" loading={isSubmitting}>
                ส่งลิงก์ตั้งรหัสผ่านใหม่
              </Button>
            </form>
          )}

          <p className="mt-6 text-center text-sm">
            <Link to="/login" className="font-medium text-rose-500 hover:underline">
              กลับไปหน้าเข้าสู่ระบบ
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

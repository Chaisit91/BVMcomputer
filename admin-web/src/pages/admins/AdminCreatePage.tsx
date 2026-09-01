import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiShield, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { adminCreateSchema, type AdminCreateFormValues } from '../../schemas/admin.schema'
import { createAdmin } from '../../services/admin.service'
import { adminRoleMeta, type AdminRole } from '../../types/admin'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const roleOptions = (Object.keys(adminRoleMeta) as AdminRole[]).map((value) => ({
  value,
  label: adminRoleMeta[value].label,
}))

export function AdminCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminCreateFormValues>({
    resolver: zodResolver(adminCreateSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      jobTitle: '',
      role: '',
      active: true,
      password: '',
      confirmPassword: '',
      notes: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createAdmin(values)
    navigate('/admins')
  })

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">เพิ่มผู้ดูแลใหม่ (Add New Admin)</h1>
        <p className="text-sm text-gray-400">เพิ่มบัญชีผู้ดูแลระบบใหม่เข้าสู่ระบบควบคุม BVMcomputer</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6 rounded-2xl border border-gray-100 bg-white p-6">
        <div>
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiUser className="text-rose-500" />
            รูปโปรไฟล์
          </h2>
          <div className="flex items-center gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-gray-300">
              <FiUser size={22} />
            </span>
            <div>
              <p className="text-sm font-medium text-gray-800">อัปโหลดรูปโปรไฟล์</p>
              <p className="text-xs text-gray-400">ไม่บังคับ • JPG/PNG • ขนาดไม่เกิน 2MB</p>
              <button type="button" className="mt-1 text-sm font-medium text-rose-500 hover:underline">
                อัปโหลดรูป
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiUser className="text-rose-500" />
            ข้อมูลส่วนตัว
          </h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  ชื่อ <span className="text-rose-500">*</span>
                </label>
                <input type="text" placeholder="กรอกชื่อ" className={inputClass} {...register('firstName')} />
                {errors.firstName && <p className="mt-1 text-xs text-red-500">{errors.firstName.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input type="text" placeholder="กรอกนามสกุล" className={inputClass} {...register('lastName')} />
                {errors.lastName && <p className="mt-1 text-xs text-red-500">{errors.lastName.message}</p>}
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                อีเมลสำหรับเข้าสู่ระบบ <span className="text-rose-500">*</span>
              </label>
              <input type="email" placeholder="example@bvm.com" className={inputClass} {...register('email')} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">เบอร์โทรศัพท์</label>
                <input type="text" placeholder="0XX-XXX-XXXX" className={inputClass} {...register('phone')} />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">ตำแหน่งงาน</label>
                <input type="text" placeholder="เช่น ผู้จัดการคลังสินค้า" className={inputClass} {...register('jobTitle')} />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiShield className="text-rose-500" />
            ตั้งรหัสผ่าน
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                รหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <input type="password" className={inputClass} {...register('password')} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                ยืนยันรหัสผ่าน <span className="text-rose-500">*</span>
              </label>
              <input type="password" className={inputClass} {...register('confirmPassword')} />
              {errors.confirmPassword && <p className="mt-1 text-xs text-red-500">{errors.confirmPassword.message}</p>}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiShield className="text-rose-500" />
            บทบาทและการเข้าถึง
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                บทบาทผู้ดูแล <span className="text-rose-500">*</span>
              </label>
              <select className={inputClass} {...register('role')}>
                <option value="">เลือกบทบาท</option>
                {roleOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.role && <p className="mt-1 text-xs text-red-500">{errors.role.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะเริ่มต้น</label>
              <select className={inputClass} {...register('active', { setValueAs: (value) => value === 'true' })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiShield className="text-rose-500" />
            หมายเหตุ
          </h2>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุภายใน</label>
          <textarea
            rows={3}
            placeholder="บันทึกข้อมูลเพิ่มเติม เช่น เหตุผลในการเพิ่มผู้ดูแลคนนี้..."
            className={inputClass}
            {...register('notes')}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 border-t border-gray-100 pt-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'สร้างบัญชีผู้ดูแล'}
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-semibold text-rose-500 hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            เพิ่มและส่งคำเชิญ
          </button>
          <button
            type="button"
            onClick={() => navigate('/admins')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
        </div>
      </form>
    </main>
  )
}

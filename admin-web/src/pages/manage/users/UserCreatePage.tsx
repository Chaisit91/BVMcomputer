import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPackage, FiSettings, FiUser } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { customerFormSchema, type CustomerFormValues } from '../../../schemas/customer.schema'
import { createCustomer } from '../../../services/customer.service'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const statusOptions = [
  { value: 'active', label: 'Active (ใช้งานปกติ)' },
  { value: 'inactive', label: 'Inactive (ไม่ได้ใช้งาน)' },
  { value: 'suspended', label: 'Suspended (ถูกระงับ)' },
]

export function UserCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      fullName: '',
      username: '',
      email: '',
      phone: '',
      status: 'active',
      shippingAddress: '',
      note: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createCustomer(values)
    navigate('/manage/users')
  })

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">เพิ่มผู้ใช้งานใหม่ (Add New User)</h1>
        <p className="text-sm text-gray-400">กรอกข้อมูลลูกค้าหรือสมาชิกใหม่เพื่อลงทะเบียนบัญชีเข้าสู่ระบบ BVMcomputer</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiUser className="text-rose-500" />
                ข้อมูลส่วนตัว (Personal Info)
              </h2>
              <div className="mb-5 flex items-center gap-4">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-gray-200 text-xs text-gray-300">
                  ยังไม่มีรูป
                </span>
                <div>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    อัปโหลดรูปโปรไฟล์
                  </button>
                  <p className="mt-1 text-xs text-gray-400">แนะนำรูปขนาดสี่เหลี่ยมจัตุรัส JPG, PNG ไม่เกิน 2MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder="เช่น สมชาย รักดี" className={inputClass} {...register('fullName')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder="เช่น somchai_r" className={inputClass} {...register('username')} />
                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input type="email" placeholder="เช่น somchai@email.com" className={inputClass} {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" placeholder="เช่น 081-234-5678" className={inputClass} {...register('phone')} />
                  {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiSettings className="text-rose-500" />
                ข้อมูลบัญชี (Account &amp; Shipping)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะบัญชี</label>
                  <select className={inputClass} {...register('status')}>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">วันที่สมัครสมาชิก</label>
                  <input type="text" disabled className={inputClass} value="จะถูกบันทึกอัตโนมัติเมื่อสร้างบัญชี" readOnly />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">เข้าใช้งานล่าสุด</label>
                  <input type="text" disabled className={inputClass} value="ยังไม่มีการเข้าใช้งาน" readOnly />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ที่อยู่สำหรับการจัดส่ง <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="กรอกที่อยู่สำหรับจัดส่งสินค้าของลูกค้ารายนี้..."
                    className={inputClass}
                    {...register('shippingAddress')}
                  />
                  {errors.shippingAddress && <p className="mt-1 text-xs text-red-500">{errors.shippingAddress.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุ</label>
                  <textarea
                    rows={3}
                    placeholder="เพิ่มหมายเหตุเพื่อบันทึกประวัติเพิ่มเติมเกี่ยวกับลูกค้ารายนี้..."
                    className={inputClass}
                    {...register('note')}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiPackage className="text-rose-500" />
            ประวัติการสั่งซื้อล่าสุด (Recent Orders)
          </h2>
          <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีประวัติการสั่งซื้อสำหรับผู้ใช้ใหม่</p>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/manage/users')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มผู้ใช้งานใหม่'}
          </button>
        </div>
      </form>
    </main>
  )
}

import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPackage, FiSettings, FiUser, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { customerFormSchema, type CustomerFormValues } from '../../../schemas/customer.schema'
import { getCustomerDetail, saveCustomer } from '../../../services/customer.service'
import type { Customer, CustomerOrder } from '../../../types/customer'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const statusOptions = [
  { value: 'active', label: 'Active (ใช้งานปกติ)' },
  { value: 'inactive', label: 'Inactive (ไม่ได้ใช้งาน)' },
  { value: 'suspended', label: 'Suspended (ถูกระงับ)' },
]

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function getOrderStatusVariant(label: string): 'success' | 'warning' | 'neutral' {
  if (label === 'จัดส่งสำเร็จแล้ว') return 'success'
  if (label === 'กำลังเตรียมสินค้า') return 'warning'
  return 'neutral'
}

function getItemsSummary(items: CustomerOrder['items']) {
  if (items.length === 0) return '-'
  const [first, ...rest] = items
  return rest.length === 0 ? first.name : `${first.name} และอีก ${rest.length} รายการ`
}

export function UserEditPage() {
  const { userId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Customer | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<CustomerOrder | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getCustomerDetail(userId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        reset({
          fullName: result.fullName,
          username: result.username,
          email: result.email,
          phone: result.phone,
          status: result.status,
          shippingAddress: result.shippingAddress,
          note: result.note,
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [userId, reset])

  const onSubmit = handleSubmit(async (values) => {
    await saveCustomer(userId, values)
    navigate('/manage/users')
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบผู้ใช้ที่ต้องการ</p>
        <Link to="/manage/users" className="text-rose-500 hover:underline">
          กลับไปหน้ารายการ
        </Link>
      </div>
    )
  }

  if (status === 'error' || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">แก้ไขข้อมูลผู้ใช้ (Edit User)</h1>
        <p className="text-sm text-gray-400">แก้ไขข้อมูลลูกค้าหรือสมาชิก และตรวจสอบสถานะบัญชีการใช้งานในระบบอย่างละเอียด</p>
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
                <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-rose-500 text-lg font-semibold text-white">
                  {getInitials(detail.fullName)}
                </span>
                <div>
                  <button
                    type="button"
                    className="rounded-xl border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                  >
                    เปลี่ยนรูปโปรไฟล์
                  </button>
                  <p className="mt-1 text-xs text-gray-400">แนะนำรูปขนาดสี่เหลี่ยมจัตุรัส JPG, PNG ไม่เกิน 2MB</p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสลูกค้า</label>
                  <input type="text" disabled className={inputClass} value={detail.customerCode} readOnly />
                  <p className="mt-1 text-xs text-gray-400">รหัสลูกค้าถูกกำหนดโดยระบบ ไม่สามารถแก้ไขได้</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ชื่อ-นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('fullName')} />
                  {errors.fullName && <p className="mt-1 text-xs text-red-500">{errors.fullName.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Username <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('username')} />
                  {errors.username && <p className="mt-1 text-xs text-red-500">{errors.username.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input type="email" className={inputClass} {...register('email')} />
                  {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('phone')} />
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
                  <input type="text" disabled className={inputClass} value={detail.registeredAt} readOnly />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">เข้าใช้งานล่าสุด</label>
                  <input type="text" disabled className={inputClass} value={detail.lastActiveAt} readOnly />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ที่อยู่สำหรับการจัดส่ง <span className="text-rose-500">*</span>
                  </label>
                  <textarea rows={3} className={inputClass} {...register('shippingAddress')} />
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
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FiPackage className="text-rose-500" />
              ประวัติการสั่งซื้อล่าสุด (Recent Orders)
            </h2>
            <button type="button" className="text-sm font-medium text-rose-500 hover:underline">
              ดูคำสั่งซื้อทั้งหมด →
            </button>
          </div>
          {detail.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">ยังไม่มีประวัติการสั่งซื้อ</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">รหัสคำสั่งซื้อ</th>
                    <th className="pb-3 pr-4 font-medium">วันที่สั่งซื้อ</th>
                    <th className="pb-3 pr-4 font-medium">ชื่อสินค้า</th>
                    <th className="pb-3 pr-4 font-medium">ยอดรวมสุทธิ</th>
                    <th className="pb-3 pr-4 font-medium">สถานะคำสั่งซื้อ</th>
                    <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detail.recentOrders.map((order) => (
                    <tr key={order.id} className="whitespace-nowrap">
                      <td className="py-3 pr-4 font-medium text-rose-500">{order.orderCode}</td>
                      <td className="py-3 pr-4 text-gray-600">{order.orderedAt}</td>
                      <td className="max-w-xs truncate py-3 pr-4 text-gray-600">{getItemsSummary(order.items)}</td>
                      <td className="py-3 pr-4 font-medium text-gray-800">{order.totalAmount.toLocaleString()}</td>
                      <td className="py-3 pr-4">
                        <Badge variant={getOrderStatusVariant(order.status)}>{order.status}</Badge>
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          ดูรายละเอียด
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
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
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>

      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setSelectedOrder(null)}
        >
          <div onClick={(event) => event.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold text-gray-900">{selectedOrder.orderCode}</h2>
                <p className="text-xs text-gray-400">{selectedOrder.orderedAt}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600"
                aria-label="ปิด"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="mb-4">
              <Badge variant={getOrderStatusVariant(selectedOrder.status)}>{selectedOrder.status}</Badge>
            </div>

            <div className="overflow-hidden rounded-xl border border-gray-100">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50 text-xs text-gray-400">
                    <th className="px-3 py-2 font-medium">สินค้า</th>
                    <th className="px-3 py-2 text-right font-medium">จำนวน</th>
                    <th className="px-3 py-2 text-right font-medium">ราคา</th>
                    <th className="px-3 py-2 text-right font-medium">รวม</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {selectedOrder.items.map((item, index) => (
                    <tr key={`${selectedOrder.id}-${index}`}>
                      <td className="px-3 py-2 text-gray-800">{item.name}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{item.quantity}</td>
                      <td className="px-3 py-2 text-right text-gray-600">{item.price.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right font-medium text-gray-800">
                        {(item.quantity * item.price).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <span className="text-sm font-medium text-gray-600">ยอดรวมสุทธิ</span>
              <span className="text-base font-bold text-gray-900">{selectedOrder.totalAmount.toLocaleString()} ฿</span>
            </div>

            <button
              type="button"
              onClick={() => setSelectedOrder(null)}
              className="mt-5 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ปิด
            </button>
          </div>
        </div>
      )}
    </main>
  )
}

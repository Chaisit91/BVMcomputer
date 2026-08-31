import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiCheck, FiCreditCard, FiDownload, FiEye, FiImage, FiShoppingBag, FiTrash2, FiUser } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { orderFormSchema, type OrderFormValues } from '../../../schemas/order.schema'
import { getOrderDetail, saveOrder } from '../../../services/order.service'
import { orderStatusMeta, paymentStatusMeta, type Order, type OrderLineItem, type OrderStatus, type PaymentStatus } from '../../../types/order'

function getItemsTotal(items: OrderLineItem[]) {
  return items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
}

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const paymentMethodOptions = [
  { value: 'โอนเงิน', label: 'โอนเงินผ่านบัญชีธนาคาร (Bank Transfer)' },
  { value: 'บัตรเครดิต', label: 'บัตรเครดิต/เดบิต (Credit/Debit Card)' },
  { value: 'พร้อมเพย์', label: 'พร้อมเพย์ (PromptPay)' },
]

const paymentStatusOptions = (Object.keys(paymentStatusMeta) as PaymentStatus[]).map((value) => ({
  value,
  label: paymentStatusMeta[value].label,
}))

const orderStatusOptions = (Object.keys(orderStatusMeta) as OrderStatus[]).map((value) => ({
  value,
  label: orderStatusMeta[value].label,
}))

export function OrderEditPage() {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Order | null>(null)
  const [items, setItems] = useState<OrderLineItem[]>([])

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getOrderDetail(orderId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        setItems(result.items)
        reset({
          customerName: result.customerName,
          customerPhone: result.customerPhone,
          shippingAddress: result.shippingAddress,
          postalCode: result.postalCode,
          province: result.province,
          district: result.district,
          subdistrict: result.subdistrict,
          paymentMethod: result.paymentMethod,
          paymentStatus: result.paymentStatus,
          status: result.status,
          trackingNumber: result.trackingNumber,
          shippingNote: result.shippingNote,
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [orderId, reset])

  const paymentStatus = watch('paymentStatus')

  const onSubmit = handleSubmit(async (values) => {
    await saveOrder(orderId, { ...values, items })
    navigate('/manage/orders')
  })

  const updateQuantity = (index: number, quantity: number) => {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item)))
  }

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบคำสั่งซื้อที่ต้องการ</p>
        <Link to="/manage/orders" className="text-rose-500 hover:underline">
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
        <h1 className="text-xl font-bold text-gray-900">แก้ไขคำสั่งซื้อ</h1>
        <p className="text-sm text-gray-400">
          Order ID: <span className="font-medium text-rose-500">{detail.orderCode}</span> • อัปเดตข้อมูลลูกค้าและสถานะการจัดส่ง
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiUser className="text-rose-500" />
                ข้อมูลลูกค้า (Customer Info)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ชื่อ - นามสกุล <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('customerName')} />
                  {errors.customerName && <p className="mt-1 text-xs text-red-500">{errors.customerName.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('customerPhone')} />
                  {errors.customerPhone && <p className="mt-1 text-xs text-red-500">{errors.customerPhone.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ที่อยู่สำหรับการจัดส่ง <span className="text-rose-500">*</span>
                  </label>
                  <textarea rows={2} className={inputClass} {...register('shippingAddress')} />
                  {errors.shippingAddress && <p className="mt-1 text-xs text-red-500">{errors.shippingAddress.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      รหัสไปรษณีย์ <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" className={inputClass} {...register('postalCode')} />
                    {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      จังหวัด <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" className={inputClass} {...register('province')} />
                    {errors.province && <p className="mt-1 text-xs text-red-500">{errors.province.message}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      อำเภอ / เขต <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" className={inputClass} {...register('district')} />
                    {errors.district && <p className="mt-1 text-xs text-red-500">{errors.district.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      ตำบล / แขวง <span className="text-rose-500">*</span>
                    </label>
                    <input type="text" className={inputClass} {...register('subdistrict')} />
                    {errors.subdistrict && <p className="mt-1 text-xs text-red-500">{errors.subdistrict.message}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiCreditCard className="text-rose-500" />
                ข้อมูลการชำระเงินและสถานะ (Payment &amp; Shipping)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ช่องทางการชำระเงิน <span className="text-rose-500">*</span>
                  </label>
                  <select className={inputClass} {...register('paymentMethod')}>
                    {paymentMethodOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      สถานะชำระเงิน <span className="text-rose-500">*</span>
                    </label>
                    <select className={inputClass} {...register('paymentStatus')}>
                      {paymentStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      สถานะคำสั่งซื้อ <span className="text-rose-500">*</span>
                    </label>
                    <select className={inputClass} {...register('status')}>
                      {orderStatusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    {errors.status && <p className="mt-1 text-xs text-red-500">{errors.status.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">เลขพัสดุ (Tracking Number)</label>
                  <input type="text" placeholder="-" className={inputClass} {...register('trackingNumber')} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุสำหรับการจัดส่ง</label>
                  <textarea rows={3} className={inputClass} {...register('shippingNote')} />
                </div>

                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <FiImage className="text-rose-500" />
                    หลักฐานการชำระเงิน (Payment Proof)
                  </h3>
                  {detail.paymentSlipFilename ? (
                    <>
                      <div className="flex h-32 flex-col items-center justify-center gap-1 rounded-xl border border-gray-200 bg-gray-50 text-gray-400">
                        <FiImage size={22} />
                        <span className="text-sm font-medium text-gray-600">สลิปการโอนเงิน</span>
                        <span className="text-xs">{detail.paymentSlipFilename}</span>
                      </div>
                      <p className="mt-1.5 text-xs text-gray-400">อัปโหลดเมื่อ {detail.paymentSlipUploadedAt}</p>
                      <div className="mt-3 grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          <FiEye size={14} />
                          ดูสลิป
                        </button>
                        <button
                          type="button"
                          className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          <FiDownload size={14} />
                          ดาวน์โหลด
                        </button>
                        <button
                          type="button"
                          onClick={() => setValue('paymentStatus', 'paid')}
                          disabled={paymentStatus === 'paid'}
                          className="flex items-center justify-center gap-1.5 rounded-xl bg-rose-500 py-2 text-xs font-medium text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FiCheck size={14} />
                          {paymentStatus === 'paid' ? 'ยืนยันแล้ว' : 'ยืนยันการชำระเงิน'}
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="rounded-xl border border-dashed border-gray-200 py-6 text-center text-xs text-gray-400">
                      ลูกค้ายังไม่ได้แนบหลักฐานการชำระเงิน
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="mb-4 flex items-start justify-between gap-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
              <FiShoppingBag className="text-rose-500" />
              รายการสินค้าที่สั่งซื้อ (Ordered Items)
            </h2>
            <p className="text-xs text-gray-400">แก้ไขได้เฉพาะจำนวนหรือลบรายการ — สินค้าและราคาถูกล็อกไว้ตามข้อมูล ณ วันที่สั่งซื้อ</p>
          </div>
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">ไม่มีรายการสินค้าในคำสั่งซื้อนี้</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="whitespace-nowrap text-xs text-gray-400">
                    <th className="pb-3 pr-4 font-medium">ลำดับ</th>
                    <th className="pb-3 pr-4 font-medium">สินค้า</th>
                    <th className="pb-3 pr-4 text-right font-medium">จำนวน</th>
                    <th className="pb-3 pr-4 text-right font-medium">ราคาต่อหน่วย</th>
                    <th className="pb-3 pr-4 text-right font-medium">รวม (฿)</th>
                    <th className="pb-3 pr-4" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {items.map((item, index) => (
                    <tr key={`${item.name}-${index}`}>
                      <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-gray-800">{item.name}</p>
                        <p className="text-xs text-gray-400">{item.category}</p>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <input
                          type="number"
                          min={1}
                          value={item.quantity}
                          onChange={(event) => updateQuantity(index, Number(event.target.value))}
                          className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1 text-right text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                        />
                      </td>
                      <td className="py-3 pr-4 text-right text-gray-600">{item.unitPrice.toLocaleString()}</td>
                      <td className="py-3 pr-4 text-right font-medium text-gray-800">
                        {(item.quantity * item.unitPrice).toLocaleString()}
                      </td>
                      <td className="py-3 pr-4">
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-500"
                          aria-label="ลบรายการนี้"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="mt-4 flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
            <span className="text-sm font-medium text-gray-600">ยอดรวมทั้งหมด (Grand Total):</span>
            <span className="text-lg font-bold text-rose-500">{getItemsTotal(items).toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/manage/orders')}
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
    </main>
  )
}

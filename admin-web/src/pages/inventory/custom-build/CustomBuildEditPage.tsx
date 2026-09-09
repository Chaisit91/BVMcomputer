import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { ProductPicker } from '../../../components/ui/ProductPicker'
import { customBuildEditSchema, type CustomBuildEditFormValues } from '../../../schemas/customBuild.schema'
import { getCustomBuildDetail, saveCustomBuild } from '../../../services/customBuild.service'
import { COMPONENT_SLOTS, COMPONENT_SLOT_LABELS, COMPONENT_SLOT_TO_API_CATEGORY } from '../../../types/componentSlots'
import type { BuildStatus, CustomBuild } from '../../../types/customBuild'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const statusOptions: { value: BuildStatus; label: string }[] = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'done', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

const statusBadgeVariant: Record<BuildStatus, 'success' | 'warning' | 'info' | 'danger'> = {
  done: 'success',
  pending: 'warning',
  in_progress: 'info',
  cancelled: 'danger',
}

export function CustomBuildEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { orderId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<CustomBuild | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CustomBuildEditFormValues>({
    resolver: zodResolver(customBuildEditSchema),
  })

  useEffect(() => {
    let cancelled = false

    getCustomBuildDetail(orderId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        reset({
          status: result.status,
          components: result.componentIds,
          prices: result.prices,
          notes: result.notes,
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

  const watchedPrices = watch('prices')
  const total = watchedPrices
    ? Object.values(watchedPrices).reduce((sum: number, price) => sum + (Number(price) || 0), 0)
    : 0

  const onSubmit = async (values: CustomBuildEditFormValues) => {
    await saveCustomBuild(orderId, values)
    navigate('/inventory/custom-build')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบข้อมูลสเปคที่ต้องการดู</p>
        <Link to="/inventory/custom-build" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูรายละเอียดสเปคเครื่อง' : 'แก้ไขรายละเอียดสเปคเครื่อง'
  const inputClass =
    'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
              <Badge variant={statusBadgeVariant[detail.status]}>
                {statusOptions.find((option) => option.value === detail.status)?.label}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              ออเดอร์: <span className="font-medium text-gray-700">{detail.orderNo}</span>
              {'   '}
              ลูกค้า: <span className="font-medium text-gray-700">{detail.customer}</span>
            </p>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">สถานะ:</label>
              <select
                disabled={readOnly}
                {...register('status')}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              onClick={() => navigate('/inventory/custom-build')}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FiX size={16} />
              {readOnly ? 'ปิด' : 'ยกเลิก'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 xl:col-span-2">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">
              {readOnly ? 'ข้อมูลอุปกรณ์สเปคคอมพิวเตอร์' : 'ปรับปรุงข้อมูลอุปกรณ์สเปคคอมพิวเตอร์ (เลือกจากสินค้าจริงในคลัง)'}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {COMPONENT_SLOTS.map((slot) => (
                <div key={slot}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{COMPONENT_SLOT_LABELS[slot]}</label>
                  <ProductPicker
                    category={COMPONENT_SLOT_TO_API_CATEGORY[slot]}
                    value={watch(`components.${slot}`)}
                    onChange={(productId) => setValue(`components.${slot}`, productId)}
                    disabled={readOnly}
                    className={inputClass}
                  />
                  {errors.components?.[slot] && (
                    <p className="mt-1 text-xs text-red-500">{errors.components[slot]?.message}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุเพิ่มเติม</label>
              <textarea disabled={readOnly} rows={3} className={inputClass} {...register('notes')} />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">
              {readOnly ? 'ราคาอุปกรณ์รายชิ้น' : 'แก้ไขราคาอุปกรณ์รายชิ้น'}
            </h2>
            <div className="space-y-3">
              {COMPONENT_SLOTS.map((slot) => (
                <div key={slot} className="flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-600">{COMPONENT_SLOT_LABELS[slot]}</p>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs text-gray-400">฿</span>
                    <input
                      type="number"
                      disabled={readOnly}
                      className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm text-gray-900 outline-none focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
                      {...register(`prices.${slot}`, { valueAsNumber: true })}
                    />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
              <p className="text-sm font-medium text-gray-600">ราคารวมคำนวณใหม่</p>
              <p className="text-xl font-bold text-rose-500">฿{total.toLocaleString()}</p>
            </div>
          </section>
        </div>
      </form>
    </main>
  )
}

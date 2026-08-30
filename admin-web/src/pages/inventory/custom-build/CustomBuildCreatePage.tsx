import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { customBuildCreateSchema, type CustomBuildCreateFormValues } from '../../../schemas/customBuild.schema'
import { createCustomBuildOrder } from '../../../services/customBuild.service'
import type { BuildStatus, CustomBuildComponents } from '../../../types/customBuild'

const componentFields: { key: keyof CustomBuildComponents; label: string; shortLabel: string }[] = [
  { key: 'cpu', label: 'ซีพียู (CPU)', shortLabel: 'ซีพียู' },
  { key: 'gpu', label: 'การ์ดจอ (GPU)', shortLabel: 'การ์ดจอ' },
  { key: 'motherboard', label: 'เมนบอร์ด (Motherboard)', shortLabel: 'เมนบอร์ด' },
  { key: 'ram', label: 'แรม (RAM)', shortLabel: 'แรม' },
  { key: 'storage', label: 'ฮาร์ดดิสก์/เอสเอสดี (Storage)', shortLabel: 'ฮาร์ดดิสก์/เอสเอสดี' },
  { key: 'psu', label: 'พาวเวอร์ซัพพลาย (Power Supply)', shortLabel: 'พาวเวอร์ซัพพลาย' },
  { key: 'case', label: 'เคส (Case)', shortLabel: 'เคส' },
  { key: 'cooling', label: 'ชุดระบายความร้อน (Cooler)', shortLabel: 'ชุดระบายความร้อน' },
]

const statusOptions: { value: BuildStatus; label: string }[] = [
  { value: 'pending', label: 'รอดำเนินการ' },
  { value: 'in_progress', label: 'กำลังดำเนินการ' },
  { value: 'done', label: 'เสร็จสิ้น' },
  { value: 'cancelled', label: 'ยกเลิก' },
]

const emptyComponents: CustomBuildComponents = {
  cpu: '',
  gpu: '',
  motherboard: '',
  ram: '',
  storage: '',
  psu: '',
  case: '',
  cooling: '',
}

export function CustomBuildCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CustomBuildCreateFormValues>({
    resolver: zodResolver(customBuildCreateSchema),
    defaultValues: {
      customer: '',
      status: 'pending',
      components: emptyComponents,
      prices: { cpu: 0, gpu: 0, motherboard: 0, ram: 0, storage: 0, psu: 0, case: 0, cooling: 0 },
      notes: '',
    },
  })

  const watchedPrices = watch('prices')
  const total = watchedPrices
    ? Object.values(watchedPrices).reduce((sum: number, price) => sum + (Number(price) || 0), 0)
    : 0

  const onSubmit = async (values: CustomBuildCreateFormValues) => {
    await createCustomBuildOrder(values)
    navigate('/inventory/custom-build')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มสเปคใหม่</h1>
            <div className="mt-2 max-w-xs">
              <input
                type="text"
                placeholder="ชื่อลูกค้า"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                {...register('customer')}
              />
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">สถานะ:</label>
              <select
                {...register('status')}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 outline-none focus:border-rose-400"
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
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FiSave size={16} />
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-gray-100 bg-white p-5 xl:col-span-2">
            <h2 className="mb-4 border-b border-gray-100 pb-3 text-sm font-semibold text-gray-800">
              ข้อมูลอุปกรณ์สเปคคอมพิวเตอร์
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {componentFields.map((field) => (
                <div key={field.key}>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                  <input
                    type="text"
                    placeholder={`กรอก${field.shortLabel}`}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                    {...register(`components.${field.key}`)}
                  />
                  {errors.components?.[field.key] && (
                    <p className="mt-1 text-xs text-red-500">{errors.components[field.key]?.message}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุเพิ่มเติม</label>
              <textarea
                rows={3}
                placeholder="รายละเอียดเพิ่มเติมจากลูกค้า (ถ้ามี)"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
                {...register('notes')}
              />
            </div>
          </section>

          <section className="rounded-2xl border border-gray-100 bg-white p-5">
            <h2 className="mb-4 text-sm font-semibold text-gray-800">ราคาอุปกรณ์รายชิ้น</h2>
            <div className="space-y-3">
              {componentFields.map((field) => (
                <div key={field.key} className="flex items-center justify-between gap-3">
                  <p className="min-w-0 flex-1 truncate text-sm text-gray-600">
                    {field.shortLabel}
                    {watch(`components.${field.key}`) && (
                      <span className="text-gray-800">: {watch(`components.${field.key}`)}</span>
                    )}
                  </p>
                  <div className="flex shrink-0 items-center gap-1">
                    <span className="text-xs text-gray-400">฿</span>
                    <input
                      type="number"
                      className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-right text-sm text-gray-900 outline-none focus:border-rose-400"
                      {...register(`prices.${field.key}`, { valueAsNumber: true })}
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

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { desktopPcFormSchema, type DesktopPcFormValues } from '../../../schemas/desktopPc.schema'
import { createDesktopPc } from '../../../services/desktopPc.service'
import type { DesktopPcCategory, DesktopPcSpecs } from '../../../types/desktopPc'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const specFields: { key: keyof DesktopPcSpecs; label: string }[] = [
  { key: 'cpu', label: 'CPU' },
  { key: 'gpu', label: 'GPU' },
  { key: 'mainboard', label: 'Mainboard' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'psu', label: 'PSU' },
  { key: 'case', label: 'Case' },
  { key: 'cooling', label: 'Cooling' },
  { key: 'os', label: 'OS' },
  { key: 'warranty', label: 'Warranty' },
]

const categoryOptions: { value: DesktopPcCategory; label: string }[] = [
  { value: 'desktop', label: 'เดสก์ท็อป พีซี' },
  { value: 'mini_pc', label: 'มินิพีซี' },
  { value: 'all_in_one', label: 'ออลอินวัน' },
  { value: 'ai_workstation', label: 'คอมพิวเตอร์ AI' },
  { value: 'ai_enterprise', label: 'คอมพิวเตอร์ AI สำหรับองค์กร' },
]

export function DesktopPcCreatePage() {
  const navigate = useNavigate()
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DesktopPcFormValues>({
    resolver: zodResolver(desktopPcFormSchema),
    defaultValues: {
      name: '',
      sku: '',
      category: 'desktop',
      status: 'selling',
      price: 0,
      stock: 0,
      description: '',
      specs: {
        cpu: '',
        gpu: '',
        mainboard: '',
        ram: '',
        storage: '',
        psu: '',
        case: '',
        cooling: '',
        os: '',
        warranty: '',
      },
    },
  })

  const addHighlight = () => {
    const value = highlightInput.trim()
    if (value && !highlights.includes(value)) {
      setHighlights((prev) => [...prev, value])
    }
    setHighlightInput('')
  }

  const onSubmit = async (values: DesktopPcFormValues) => {
    await createDesktopPc({ ...values, highlights })
    navigate('/inventory/desktop-pc')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/desktop-pc')}
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทั่วไป</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า *</label>
                  <input
                    type="text"
                    placeholder="เช่น Gaming Desktop G8"
                    className={inputClass}
                    {...register('name')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU *</label>
                    <input type="text" placeholder="เช่น GDT-G8-2026" className={inputClass} {...register('sku')} />
                    {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">หมวดหมู่ *</label>
                    <select className={inputClass} {...register('category')}>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคา (฿) *</label>
                    <input type="number" className={inputClass} {...register('price', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนสต็อก *</label>
                    <input type="number" className={inputClass} {...register('stock', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</h2>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">คำอธิบายสินค้า</label>
              <textarea
                rows={4}
                placeholder="เขียนคำอธิบายสินค้า จุดเด่น การใช้งานที่เหมาะสม..."
                className={inputClass}
                {...register('description')}
              />

              <p className="mb-2 mt-4 text-sm font-medium text-gray-700">จุดเด่นสินค้า</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {highlights.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setHighlights((prev) => prev.filter((t) => t !== tag))}
                      className="text-rose-400 hover:text-rose-600"
                    >
                      <FiX size={12} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={highlightInput}
                  onChange={(event) => setHighlightInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      addHighlight()
                    }
                  }}
                  placeholder="พิมพ์จุดเด่นแล้วกด Enter"
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={addHighlight}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FiPlus size={14} /> เพิ่มแท็ก
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทางเทคนิค (Specifications)</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {specFields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                    <input type="text" className={inputClass} {...register(`specs.${field.key}`)} />
                    {errors.specs?.[field.key] && (
                      <p className="mt-1 text-xs text-red-500">{errors.specs[field.key]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพสินค้า</h2>
              <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                <FiPlus size={20} />
                <span>อัปโหลดภาพสินค้า</span>
                <span>PNG, JPG (แนะนำ 1200x800px)</span>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">สถานะสินค้า</h2>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ</label>
              <select className={inputClass} {...register('status')}>
                <option value="selling">กำลังขาย</option>
                <option value="low_stock">สต็อกน้อย</option>
                <option value="out_of_stock">หมดสต็อก</option>
                <option value="discontinued">เลิกขาย</option>
              </select>
            </section>
          </div>
        </div>
      </form>
    </main>
  )
}

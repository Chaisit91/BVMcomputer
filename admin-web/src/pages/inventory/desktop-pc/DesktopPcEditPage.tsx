import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { desktopPcFormSchema, type DesktopPcFormValues } from '../../../schemas/desktopPc.schema'
import { deleteDesktopPc, getDesktopPcDetail, saveDesktopPc } from '../../../services/desktopPc.service'
import type { DesktopPc, DesktopPcCategory, DesktopPcSpecs, DesktopPcStatus } from '../../../types/desktopPc'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

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

const statusOptions: { value: DesktopPcStatus; label: string }[] = [
  { value: 'selling', label: 'กำลังขาย' },
  { value: 'low_stock', label: 'สต็อกน้อย' },
  { value: 'out_of_stock', label: 'หมดสต็อก' },
  { value: 'discontinued', label: 'เลิกขาย' },
]

const categoryBadgeVariant: Record<DesktopPcCategory, 'success' | 'info' | 'danger' | 'warning' | 'neutral'> = {
  desktop: 'success',
  mini_pc: 'neutral',
  all_in_one: 'info',
  ai_workstation: 'danger',
  ai_enterprise: 'warning',
}

export function DesktopPcEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { productId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<DesktopPc | null>(null)
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DesktopPcFormValues>({
    resolver: zodResolver(desktopPcFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getDesktopPcDetail(productId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        setHighlights(result.highlights)
        reset({
          name: result.name,
          sku: result.sku,
          category: result.category,
          status: result.status,
          price: result.price,
          stock: result.stock,
          description: result.description,
          specs: result.specs,
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [productId, reset])

  const price = watch('price') || 0
  const stock = watch('stock') || 0
  const category = watch('category')
  const sku = watch('sku')

  const addHighlight = () => {
    const value = highlightInput.trim()
    if (value && !highlights.includes(value)) {
      setHighlights((prev) => [...prev, value])
    }
    setHighlightInput('')
  }

  const onSubmit = async (values: DesktopPcFormValues) => {
    await saveDesktopPc(productId, { ...values, highlights })
    navigate('/inventory/desktop-pc')
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบสินค้านี้?')) return
    await deleteDesktopPc(productId)
    navigate('/inventory/desktop-pc')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบสินค้าที่ต้องการ</p>
        <Link to="/inventory/desktop-pc" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูสินค้า' : 'แก้ไขสินค้า'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <Badge variant={categoryBadgeVariant[category]}>
              {categoryOptions.find((option) => option.value === category)?.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/desktop-pc')}
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
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทั่วไป</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า</label>
                  <input type="text" disabled={readOnly} className={inputClass} {...register('name')} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">SKU</label>
                    <input type="text" disabled={readOnly} className={inputClass} {...register('sku')} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">หมวดหมู่</label>
                    <select disabled={readOnly} className={inputClass} {...register('category')}>
                      {categoryOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคา (฿)</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      className={inputClass}
                      {...register('price', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนสต็อก</label>
                    <input
                      type="number"
                      disabled={readOnly}
                      className={inputClass}
                      {...register('stock', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ</label>
                    <select disabled={readOnly} className={inputClass} {...register('status')}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</h2>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">คำอธิบายสินค้า</label>
              <textarea rows={4} disabled={readOnly} className={inputClass} {...register('description')} />

              <p className="mb-2 mt-4 text-sm font-medium text-gray-700">จุดเด่นสินค้า</p>
              <div className="mb-3 flex flex-wrap gap-2">
                {highlights.map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-600"
                  >
                    {tag}
                    {!readOnly && (
                      <button
                        type="button"
                        onClick={() => setHighlights((prev) => prev.filter((t) => t !== tag))}
                        className="text-rose-400 hover:text-rose-600"
                      >
                        <FiX size={12} />
                      </button>
                    )}
                  </span>
                ))}
                {highlights.length === 0 && <span className="text-xs text-gray-400">ยังไม่มีจุดเด่น</span>}
              </div>
              {!readOnly && (
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
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทางเทคนิค (Specifications)</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {specFields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label}</label>
                    <input
                      type="text"
                      disabled={readOnly}
                      className={inputClass}
                      {...register(`specs.${field.key}`)}
                    />
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
              <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                ยังไม่มีรูปภาพ
              </div>
              {!readOnly && (
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50"
                >
                  + เพิ่มภาพ
                </button>
              )}
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">สรุปข้อมูลในระบบ</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ราคาจำหน่าย</span>
                  <span className="text-xl font-bold text-rose-500">฿{price.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                  <span className="text-gray-500">สถานะสต็อก</span>
                  <span className="flex items-center gap-1.5 font-medium text-gray-800">
                    <span className={`h-1.5 w-1.5 rounded-full ${stock > 0 ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                    คงเหลือ {stock} เครื่อง
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">หมวดหมู่</span>
                  <span className="font-medium text-gray-800">
                    {categoryOptions.find((option) => option.value === category)?.label}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">SKU</span>
                  <span className="font-medium text-gray-800">{sku}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">อัพเดทล่าสุด</span>
                  <span className="font-medium text-gray-800">{detail.updatedAt}</span>
                </div>
              </div>

              {!readOnly && (
                <>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-4 w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
                  >
                    บันทึกการเปลี่ยนแปลง
                  </button>
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <FiTrash2 size={14} /> ลบสินค้า
                  </button>
                </>
              )}
            </section>
          </div>
        </div>
      </form>
    </main>
  )
}

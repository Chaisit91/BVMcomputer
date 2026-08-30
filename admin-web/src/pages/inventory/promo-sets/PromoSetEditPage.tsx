import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ExtraPartsEditor } from '../../../components/inventory/ExtraPartsEditor'
import { Badge } from '../../../components/ui/Badge'
import { promoSetEditSchema, type PromoSetEditFormValues } from '../../../schemas/promoSet.schema'
import { deletePromoSet, getPromoSetDetail, savePromoSet } from '../../../services/promoSet.service'
import type { PromoSet, PromoSetComponents, PromoSetExtraPart, PromoSetStatus } from '../../../types/promoSet'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const componentFields: { key: keyof PromoSetComponents; label: string }[] = [
  { key: 'cpu', label: 'ซีพียู (CPU)' },
  { key: 'motherboard', label: 'เมนบอร์ด (Motherboard)' },
  { key: 'gpu', label: 'การ์ดจอ (Graphic Card)' },
  { key: 'ram', label: 'หน่วยความจำ (RAM)' },
  { key: 'storage', label: 'อุปกรณ์จัดเก็บข้อมูล (Storage)' },
  { key: 'psu', label: 'แหล่งจ่ายไฟ (Power Supply)' },
  { key: 'case', label: 'เคส (Case)' },
  { key: 'cooling', label: 'อุปกรณ์ระบายความร้อน (Cooling)' },
]

const statusOptions: { value: PromoSetStatus; label: string }[] = [
  { value: 'selling', label: 'กำลังขาย' },
  { value: 'out_of_stock', label: 'หมดสต็อก' },
  { value: 'closed', label: 'ปิดการขาย' },
]

const statusBadgeVariant: Record<PromoSetStatus, 'success' | 'warning' | 'danger'> = {
  selling: 'success',
  out_of_stock: 'warning',
  closed: 'danger',
}

export function PromoSetEditPage() {
  const { setId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<PromoSet | null>(null)
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState('')
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [videoInput, setVideoInput] = useState('')
  const [extraParts, setExtraParts] = useState<PromoSetExtraPart[]>([])

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PromoSetEditFormValues>({
    resolver: zodResolver(promoSetEditSchema),
  })

  useEffect(() => {
    let cancelled = false

    getPromoSetDetail(setId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        setHighlights(result.highlights)
        setVideoLinks(result.videoLinks)
        setExtraParts(result.extraParts)
        reset({
          name: result.name,
          code: result.code,
          status: result.status,
          regularPrice: result.regularPrice,
          promoPrice: result.promoPrice,
          stock: result.stock,
          components: result.components,
          description: result.description,
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
  }, [setId, reset])

  const regularPrice = watch('regularPrice') || 0
  const promoPrice = watch('promoPrice') || 0
  const stock = watch('stock') || 0
  const discountAmount = Math.max(regularPrice - promoPrice, 0)
  const discountPercent = regularPrice > 0 ? (discountAmount / regularPrice) * 100 : 0

  const addHighlight = () => {
    const value = highlightInput.trim()
    if (value && !highlights.includes(value)) {
      setHighlights((prev) => [...prev, value])
    }
    setHighlightInput('')
  }

  const addVideoLink = () => {
    const value = videoInput.trim()
    if (value) setVideoLinks((prev) => [...prev, value])
    setVideoInput('')
  }

  const onSubmit = async (values: PromoSetEditFormValues) => {
    await savePromoSet(setId, { ...values, highlights, videoLinks, extraParts })
    navigate('/inventory/promo-sets')
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบเซ็ตนี้?')) return
    await deletePromoSet(setId)
    navigate('/inventory/promo-sets')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบเซ็ตโปรโมชั่นที่ต้องการแก้ไข</p>
        <Link to="/inventory/promo-sets" className="text-rose-500 hover:underline">
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
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">แก้ไขเซ็ตโปรโมชั่น</h1>
            <Badge variant={statusBadgeVariant[detail.status]}>
              {statusOptions.find((option) => option.value === detail.status)?.label}
            </Badge>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/promo-sets')}
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
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทั่วไป</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อเซ็ตโปรโมชั่น *</label>
                  <input type="text" className={inputClass} {...register('name')} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสเซ็ต *</label>
                    <input type="text" className={inputClass} {...register('code')} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ *</label>
                    <select className={inputClass} {...register('status')}>
                      {statusOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาปกติ (฿) *</label>
                    <input
                      type="number"
                      className={inputClass}
                      {...register('regularPrice', { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาโปรโมชั่น (฿) *</label>
                    <input type="number" className={inputClass} {...register('promoPrice', { valueAsNumber: true })} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคงเหลือ *</label>
                    <input type="number" className={inputClass} {...register('stock', { valueAsNumber: true })} />
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสเปคอุปกรณ์</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {componentFields.map((field) => (
                  <div key={field.key}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{field.label} *</label>
                    <input type="text" className={inputClass} {...register(`components.${field.key}`)} />
                    {errors.components?.[field.key] && (
                      <p className="mt-1 text-xs text-red-500">{errors.components[field.key]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm font-medium text-gray-700">อุปกรณ์เสริมอื่นๆ</p>
              <ExtraPartsEditor parts={extraParts} onChange={setExtraParts} />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</h2>
              <textarea rows={4} className={inputClass} {...register('description')} />

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
                  <FiPlus size={14} /> เพิ่มจุดเด่น
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">วิดีโอรีวิวประกอบ</h2>
              <div className="space-y-2">
                {videoLinks.map((link) => (
                  <div
                    key={link}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
                  >
                    <span className="flex-1 truncate text-sm text-gray-600">{link}</span>
                    <button
                      type="button"
                      onClick={() => setVideoLinks((prev) => prev.filter((l) => l !== link))}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      <FiX size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={videoInput}
                  onChange={(event) => setVideoInput(event.target.value)}
                  placeholder="วางลิงก์ YouTube เช่น https://youtube.com/watch?v=..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FiPlus size={14} /> เพิ่มวิดีโอ
                </button>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ของแถมและเงื่อนไขเพิ่มเติม</h2>
              <textarea
                rows={2}
                placeholder="เช่น เสื้อ iHAVECPU Sticker, ร่มเดินทาง, USB WiFi D-Link N150"
                className={inputClass}
                {...register('notes')}
              />
            </section>
          </div>

          <div className="space-y-6">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพประกอบเซ็ตโปรโมชั่น</h2>
              <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                ยังไม่มีรูปภาพ
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                + เพิ่มรูป
              </button>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">สรุปข้อมูลราคาและส่วนลด</h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">ราคาปกติ</span>
                  <span className="text-gray-400 line-through">฿{regularPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">ราคาโปรโมชั่น</span>
                  <span className="text-xl font-bold text-rose-500">฿{promoPrice.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between border-t border-gray-50 pt-2">
                  <span className="text-gray-500">ส่วนลด</span>
                  <span className="font-medium text-emerald-500">
                    {discountPercent.toFixed(1)}% (฿{discountAmount.toLocaleString()})
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">คงเหลือสินค้า</span>
                  <span className="font-medium text-gray-800">{stock} เครื่อง</span>
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                เผยแพร่การเปลี่ยนแปลง
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <FiTrash2 size={14} /> ลบเซ็ต
              </button>
            </section>
          </div>
        </div>
      </form>
    </main>
  )
}

import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ExtraPartsEditor } from '../../../components/inventory/ExtraPartsEditor'
import { ProductPicker } from '../../../components/ui/ProductPicker'
import { Toggle } from '../../../components/ui/Toggle'
import { promoSetFormSchema, type PromoSetFormValues } from '../../../schemas/promoSet.schema'
import { createPromoSet } from '../../../services/promoSet.service'
import { COMPONENT_SLOTS, COMPONENT_SLOT_LABELS, COMPONENT_SLOT_TO_API_CATEGORY } from '../../../types/componentSlots'
import type { PromoSetExtraPart } from '../../../types/promoSet'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const statusOptions = [
  { value: 'active', label: 'กำลังขาย' },
  { value: 'inactive', label: 'ปิดการขาย' },
  { value: 'preorder', label: 'พรีออเดอร์' },
  { value: 'discontinued', label: 'เลิกขาย' },
] as const

export function PromoSetCreatePage() {
  const navigate = useNavigate()
  const [highlights, setHighlights] = useState<string[]>([])
  const [highlightInput, setHighlightInput] = useState('')
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [videoInput, setVideoInput] = useState('')
  const [extraParts, setExtraParts] = useState<PromoSetExtraPart[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromoSetFormValues>({
    resolver: zodResolver(promoSetFormSchema),
    defaultValues: {
      name: '',
      code: '',
      specSummary: '',
      status: 'active',
      regularPrice: 0,
      promoEnabled: false,
      promoPrice: 0,
      stock: 0,
      publishImmediately: true,
      components: {
        cpu: '',
        motherboard: '',
        gpu: '',
        ram: '',
        storage: '',
        psu: '',
        case: '',
        cooling: '',
      },
      description: '',
      notes: '',
    },
  })

  const promoEnabled = watch('promoEnabled')
  const publishImmediately = watch('publishImmediately')
  const regularPrice = watch('regularPrice') || 0
  const promoPrice = watch('promoPrice') || 0

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

  const onSubmit = async (values: PromoSetFormValues) => {
    await createPromoSet({ ...values, highlights, videoLinks, extraParts })
    navigate('/inventory/promo-sets')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">เพิ่มเซ็ตคอมพิวเตอร์ใหม่</h1>
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกเซ็ต'}
            </button>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="space-y-6 xl:col-span-2">
            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลเบื้องต้น</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อเซ็ตโปรโมชั่น *</label>
                  <input
                    type="text"
                    placeholder="เช่น เซ็ต Gaming Pro RTX 4070 Set"
                    className={inputClass}
                    {...register('name')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสเซ็ต *</label>
                    <input type="text" placeholder="เช่น AUG26-D5-001" className={inputClass} {...register('code')} />
                    {errors.code && <p className="mt-1 text-xs text-red-500">{errors.code.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">สเปคย่อ *</label>
                    <input
                      type="text"
                      placeholder="เช่น i5-14400F + RTX 5070"
                      className={inputClass}
                      {...register('specSummary')}
                    />
                    {errors.specSummary && <p className="mt-1 text-xs text-red-500">{errors.specSummary.message}</p>}
                  </div>
                </div>
                <Toggle
                  checked={publishImmediately}
                  onChange={(value) => setValue('publishImmediately', value)}
                  label="เปิดใช้งานทันทีหลังบันทึก"
                />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">ส่วนประกอบ (เลือกจากสินค้าจริงในคลัง)</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {COMPONENT_SLOTS.map((slot) => (
                  <div key={slot}>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">{COMPONENT_SLOT_LABELS[slot]}</label>
                    <ProductPicker
                      category={COMPONENT_SLOT_TO_API_CATEGORY[slot]}
                      value={watch(`components.${slot}`)}
                      onChange={(productId) => setValue(`components.${slot}`, productId)}
                      className={inputClass}
                    />
                    {errors.components?.[slot] && (
                      <p className="mt-1 text-xs text-red-500">{errors.components[slot]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm font-medium text-gray-700">อุปกรณ์เสริมอื่นๆ</p>
              <ExtraPartsEditor parts={extraParts} onChange={setExtraParts} />
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</h2>
              <textarea
                rows={4}
                placeholder="เขียนคำอธิบายเกี่ยวกับเซ็ต จุดเด่น การใช้งานที่เหมาะสม..."
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
                  placeholder="วางลิงก์ URL วิดีโอเพิ่มเติม เช่น https://youtube.com/watch?v=..."
                  className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
                />
                <button
                  type="button"
                  onClick={addVideoLink}
                  className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
                >
                  <FiPlus size={14} /> เพิ่มลิงก์วิดีโอ
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
              <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                <FiPlus size={20} />
                <span>อัปโหลดภาพหลักคอมพิวเตอร์</span>
                <span>PNG, JPG (แนะนำ 1200x800px)</span>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">สถานะและราคา</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ</label>
                  <select className={inputClass} {...register('status')}>
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs text-gray-400">สต็อกน้อย/หมดสต็อก คำนวณอัตโนมัติจากจำนวนสต็อก ไม่ต้องตั้งเอง</p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาเต็ม (฿) *</label>
                  <input type="number" className={inputClass} {...register('regularPrice', { valueAsNumber: true })} />
                </div>

                <Toggle
                  checked={promoEnabled}
                  onChange={(value) => setValue('promoEnabled', value)}
                  label="เปิดใช้ราคาโปรโมชั่น"
                />

                {promoEnabled && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาโปรโมชั่น (฿) *</label>
                    <input type="number" className={inputClass} {...register('promoPrice', { valueAsNumber: true })} />
                    {errors.promoPrice && <p className="mt-1 text-xs text-red-500">{errors.promoPrice.message}</p>}
                  </div>
                )}

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคงเหลือ (ชิ้น) *</label>
                  <input type="number" className={inputClass} {...register('stock', { valueAsNumber: true })} />
                </div>

                <div className="rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">ราคาขายจริง</span>
                    <span className="font-bold text-rose-500">
                      ฿{(promoEnabled ? promoPrice : regularPrice).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </form>
    </main>
  )
}

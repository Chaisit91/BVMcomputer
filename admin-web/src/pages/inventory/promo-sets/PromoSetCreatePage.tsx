import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiPlus, FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ExtraPartsEditor } from '../../../components/inventory/ExtraPartsEditor'
import { Badge } from '../../../components/ui/Badge'
import { Toggle } from '../../../components/ui/Toggle'
import { promoSetCreateSchema, type PromoSetCreateFormValues } from '../../../schemas/promoSet.schema'
import { createPromoSet } from '../../../services/promoSet.service'
import type { PromoSetExtraPart } from '../../../types/promoSet'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const categoryOptions = ['Gaming', 'Workstation', 'Office', 'Streaming']
const tierOptions = ['Entry', 'Mid-Range', 'High-End', 'Enthusiast']

const partFields: {
  key: 'cpu' | 'gpu' | 'ram' | 'motherboard' | 'storage' | 'case' | 'psu' | 'cooling' | 'monitor'
  label: string
  required?: boolean
}[] = [
  { key: 'cpu', label: 'ชิป (CPU)', required: true },
  { key: 'gpu', label: 'การ์ดจอ (Graphic Card)' },
  { key: 'ram', label: 'หน่วยความจำ (RAM)', required: true },
  { key: 'motherboard', label: 'เมนบอร์ด (Motherboard)' },
  { key: 'storage', label: 'ที่เก็บข้อมูล (SSD/Storage)' },
  { key: 'case', label: 'เคสคอมพิวเตอร์ (Case)' },
  { key: 'psu', label: 'แหล่งจ่ายไฟ (PSU)' },
  { key: 'cooling', label: 'ชุดระบายความร้อน (Cooling)' },
  { key: 'monitor', label: 'จอแสดงผล (Monitor) - ไม่บังคับ' },
]

export function PromoSetCreatePage() {
  const navigate = useNavigate()
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [videoInput, setVideoInput] = useState('')
  const [extraParts, setExtraParts] = useState<PromoSetExtraPart[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PromoSetCreateFormValues>({
    resolver: zodResolver(promoSetCreateSchema),
    defaultValues: {
      name: '',
      category: '',
      tier: '',
      publishNow: true,
      cpu: '',
      gpu: '',
      ram: '',
      motherboard: '',
      storage: '',
      case: '',
      psu: '',
      cooling: '',
      monitor: '',
      description: '',
      regularPrice: 0,
      discountAmount: 0,
      promoEnabled: true,
      promoPrice: 0,
      startDate: '',
      endDate: '',
      stock: 0,
    },
  })

  const publishNow = watch('publishNow')
  const promoEnabled = watch('promoEnabled')
  const regularPrice = watch('regularPrice') || 0
  const discountAmount = watch('discountAmount') || 0
  const promoPrice = watch('promoPrice') || 0

  const addVideoLink = () => {
    const value = videoInput.trim()
    if (value) setVideoLinks((prev) => [...prev, value])
    setVideoInput('')
  }

  const submitAs = async (values: PromoSetCreateFormValues, publish: boolean) => {
    await createPromoSet({ ...values, publishNow: publish, videoLinks, extraParts })
    navigate('/inventory/promo-sets')
  }

  const onPublish = handleSubmit((values) => submitAs(values, values.publishNow))
  const onSaveDraft = handleSubmit((values) => submitAs(values, false))

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={onPublish} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900">เพิ่มเซ็ตคอมพิวเตอร์ใหม่</h1>
            <Badge variant="neutral">ร่าง (Draft)</Badge>
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
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">หมวดหมู่ (Category) *</label>
                    <select className={inputClass} {...register('category')}>
                      <option value="">เลือกหมวดหมู่ เช่น Gaming, Workstation</option>
                      {categoryOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ระดับเซ็ต (Tier) *</label>
                    <select className={inputClass} {...register('tier')}>
                      <option value="">เลือกระดับสินค้า</option>
                      {tierOptions.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                    {errors.tier && <p className="mt-1 text-xs text-red-500">{errors.tier.message}</p>}
                  </div>
                </div>
                <Toggle
                  checked={publishNow}
                  onChange={(value) => setValue('publishNow', value)}
                  label="เปิดใช้งานทันทีหลังบันทึก"
                />
                <p className="text-xs text-gray-400">ถ้าปิดจะบันทึกเป็นร่าง (Draft) ก่อน</p>
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">รายการชิ้นส่วนในเซ็ต</h2>
              <div className="space-y-3">
                {partFields.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <span className="w-40 shrink-0 text-sm text-gray-600">
                      {field.label} {field.required && <span className="text-rose-500">*</span>}
                    </span>
                    <input
                      type="text"
                      placeholder="ค้นหาหรือเลือก..."
                      className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
                      {...register(field.key)}
                    />
                  </div>
                ))}
              </div>
              <div className="mt-3">
                <ExtraPartsEditor parts={extraParts} onChange={setExtraParts} />
              </div>
            </section>

            <section className="rounded-2xl border border-gray-100 bg-white p-5">
              <h2 className="mb-4 text-sm font-semibold text-gray-800">บทความรายละเอียดสินค้าประกอบเพิ่มเติม</h2>
              <textarea
                rows={4}
                placeholder="เขียนคำอธิบายเกี่ยวกับเซ็ต จุดเด่น การใช้งานที่เหมาะสม..."
                className={inputClass}
                {...register('description')}
              />
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
              <h2 className="mb-4 text-sm font-semibold text-gray-800">สรุปข้อมูลราคาและส่วนลด</h2>
              <div className="space-y-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาเต็ม (฿) *</label>
                  <input type="number" className={inputClass} {...register('regularPrice', { valueAsNumber: true })} />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ส่วนลด (฿)</label>
                  <input
                    type="number"
                    className={inputClass}
                    {...register('discountAmount', { valueAsNumber: true })}
                  />
                  {errors.discountAmount && <p className="mt-1 text-xs text-red-500">{errors.discountAmount.message}</p>}
                </div>

                <Toggle
                  checked={promoEnabled}
                  onChange={(value) => setValue('promoEnabled', value)}
                  label="เปิดใช้ราคาโปรโมชั่น"
                />

                {promoEnabled && (
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาโปรโมชั่น (฿) *</label>
                    <input
                      type="number"
                      className={inputClass}
                      {...register('promoPrice', { valueAsNumber: true })}
                    />
                    {errors.promoPrice && <p className="mt-1 text-xs text-red-500">{errors.promoPrice.message}</p>}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">วันเริ่มต้น</label>
                    <input type="date" className={inputClass} {...register('startDate')} />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">วันสิ้นสุด</label>
                    <input type="date" className={inputClass} {...register('endDate')} />
                  </div>
                </div>
                <p className="text-xs text-gray-400">ถ้าไม่ระบุจะถือว่าไม่มีกำหนดสิ้นสุด</p>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคงเหลือ (ชิ้น) *</label>
                  <input type="number" className={inputClass} {...register('stock', { valueAsNumber: true })} />
                  {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
                </div>

                <div className="rounded-xl bg-gray-50 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">ราคาขายจริง</span>
                    <span className="font-bold text-rose-500">
                      ฿{(promoEnabled ? promoPrice : Math.max(regularPrice - discountAmount, 0)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-4 w-full rounded-xl bg-rose-500 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:opacity-60"
              >
                เผยแพร่ทันทีเมื่อบันทึก
              </button>
              <button
                type="button"
                onClick={onSaveDraft}
                disabled={isSubmitting}
                className="mt-2 w-full rounded-xl border border-gray-200 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
              >
                บันทึกเป็นแบบร่างไว้
              </button>
            </section>
          </div>
        </div>
      </form>
    </main>
  )
}

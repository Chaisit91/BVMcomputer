import { useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Toggle } from '../../ui/Toggle'
import type { CpuFormValues } from '../../../schemas/cpu.schema'
import type { CpuBenchmark } from '../../../types/cpu'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['AMD', 'Intel'] as const
const socketOptions = ['AM4', 'AM5', 'sTR5', 'LGA 1700', 'LGA 1851']
const warrantyOptions = ['1 Year', '2 Years', '3 Years', '5 Years']

interface CpuFormFieldsProps {
  mode: 'create' | 'edit'
  readOnly?: boolean
  register: UseFormRegister<CpuFormValues>
  errors: FieldErrors<CpuFormValues>
  watch: UseFormWatch<CpuFormValues>
  setValue: UseFormSetValue<CpuFormValues>
  benchmarks: CpuBenchmark[]
  onBenchmarksChange: (benchmarks: CpuBenchmark[]) => void
  videoLinks: string[]
  onVideoLinksChange: (links: string[]) => void
}

export function CpuFormFields({
  mode,
  readOnly = false,
  register,
  errors,
  watch,
  setValue,
  benchmarks,
  onBenchmarksChange,
  videoLinks,
  onVideoLinksChange,
}: CpuFormFieldsProps) {
  const stock = watch('stock') || 0
  const publishImmediately = watch('publishImmediately')

  const addBenchmark = () => {
    onBenchmarksChange([...benchmarks, { id: crypto.randomUUID(), name: '', score: '', unit: '' }])
  }

  const updateBenchmark = (id: string, field: keyof CpuBenchmark, value: string) => {
    onBenchmarksChange(benchmarks.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const removeBenchmark = (id: string) => {
    onBenchmarksChange(benchmarks.filter((item) => item.id !== id))
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพสินค้า</h2>
          <div className="flex h-40 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
            {readOnly ? (
              <span>ยังไม่มีรูปภาพ</span>
            ) : (
              <>
                <FiPlus size={20} />
                <span>อัปโหลดรูปสินค้า</span>
                <span>รองรับ JPG, PNG ขนาดไม่เกิน 5MB</span>
              </>
            )}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ราคาสินค้าและสต็อก</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาขาย (Selling Price)</label>
                <input
                  type="number"
                  disabled={readOnly}
                  className={inputClass}
                  {...register('sellingPrice', { valueAsNumber: true })}
                />
                {errors.sellingPrice && <p className="mt-1 text-xs text-red-500">{errors.sellingPrice.message}</p>}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาทุน (Cost Price)</label>
                <input type="number" disabled={readOnly} className={inputClass} {...register('costPrice', { valueAsNumber: true })} />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ส่วนลด (Discount)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('discount', { valueAsNumber: true })} />
              {errors.discount && <p className="mt-1 text-xs text-red-500">{errors.discount.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                {mode === 'create' ? 'จำนวนเริ่มต้นในคลัง' : 'จำนวนคงเหลือในคลัง'}
              </label>
              <div className="flex items-center gap-2">
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setValue('stock', Math.max(stock - 1, 0))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    −
                  </button>
                )}
                <input
                  type="number"
                  disabled={readOnly}
                  className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-sm text-gray-900 outline-none focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
                  {...register('stock', { valueAsNumber: true })}
                />
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => setValue('stock', stock + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    +
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
              <div>
                <p className="text-sm font-medium text-gray-700">สถานะเผยแพร่ทันที</p>
                <p className="text-xs text-gray-400">เปิดพร้อมสำหรับขายทันที</p>
              </div>
              <Toggle checked={publishImmediately} onChange={(value) => !readOnly && setValue('publishImmediately', value)} />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลสเปคทางเทคนิค (Specifications)</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แบรนด์ (Brand)</label>
              <select disabled={readOnly} className={inputClass} {...register('brand')}>
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ซีรีส์ (Series)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น Ryzen 7000, Core i7"
                className={inputClass}
                {...register('series')}
              />
              {errors.series && <p className="mt-1 text-xs text-red-500">{errors.series.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสประมวลผล (Processor Number)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น Ryzen 7 7800X3D"
                className={inputClass}
                {...register('processorNumber')}
              />
              {errors.processorNumber && (
                <p className="mt-1 text-xs text-red-500">{errors.processorNumber.message}</p>
              )}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ประเภทซ็อกเก็ต (Socket Type)</label>
              <select disabled={readOnly} className={inputClass} {...register('socket')}>
                {socketOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคอร์/เธรด (Cores/Threads)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น 8 Cores / 16 Threads"
                className={inputClass}
                {...register('coresThreads')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความถี่พื้นฐาน (Base Frequency)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 4.2 GHz" className={inputClass} {...register('baseFrequency')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">
                ความถี่เทอร์โบสูงสุด (Max Turbo Frequency)
              </label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น 5.0 GHz"
                className={inputClass}
                {...register('maxTurboFrequency')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แคช L2 (L2 Cache)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 8 MB" className={inputClass} {...register('l2Cache')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แคช L3 (L3 Cache)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 96 MB" className={inputClass} {...register('l3Cache')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">โมเดลกราฟิกในตัว (Graphics Models)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น AMD Radeon Graphics หรือ N/A"
                className={inputClass}
                {...register('graphics')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">อัตราการปล่อยความร้อน (Default TDP)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 120W" className={inputClass} {...register('tdp')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">TDP สูงสุด (Max TDP)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 162W" className={inputClass} {...register('maxTdp')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">การรับประกัน (Warranty)</label>
              <select disabled={readOnly} className={inputClass} {...register('warranty')}>
                {warrantyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">ผลเทสและรีวิวอุปกรณ์ (Test Results &amp; Reviews)</h2>
          <p className="mb-4 text-xs text-gray-400">ใช้ประกอบหน้าเปรียบเทียบสินค้าในระบบเปรียบเทียบสเปค</p>

          <p className="mb-2 text-sm font-medium text-gray-700">ข้อมูลผลทดสอบเบนช์มาร์ค (Benchmarks)</p>
          {readOnly && benchmarks.length === 0 && <p className="mb-2 text-xs text-gray-400">ไม่มีผลทดสอบเบนช์มาร์ค</p>}
          <div className="space-y-2">
            {benchmarks.map((item) => (
              <div key={item.id} className="flex items-center gap-2">
                <input
                  type="text"
                  disabled={readOnly}
                  value={item.name}
                  onChange={(event) => updateBenchmark(item.id, 'name', event.target.value)}
                  placeholder="ชื่อการทดสอบ เช่น Cinebench R23"
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
                />
                <input
                  type="text"
                  disabled={readOnly}
                  value={item.score}
                  onChange={(event) => updateBenchmark(item.id, 'score', event.target.value)}
                  placeholder="คะแนน"
                  className="w-24 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
                />
                <input
                  type="text"
                  disabled={readOnly}
                  value={item.unit}
                  onChange={(event) => updateBenchmark(item.id, 'unit', event.target.value)}
                  placeholder="หน่วย"
                  className="w-20 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 disabled:cursor-default disabled:text-gray-500"
                />
                {!readOnly && (
                  <>
                    <FiEdit2 className="shrink-0 text-gray-300" size={14} />
                    <button
                      type="button"
                      onClick={() => removeBenchmark(item.id)}
                      className="shrink-0 text-gray-400 hover:text-rose-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
          {!readOnly && (
            <button
              type="button"
              onClick={addBenchmark}
              className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              <FiPlus size={14} /> เพิ่มผลเทส
            </button>
          )}

          <p className="mb-2 mt-5 text-sm font-medium text-gray-700">ลิงก์วิดีโอรีวิว (Review Video Links)</p>
          {videoLinks.length === 0 && (
            <p className="mb-2 text-xs text-gray-400">ยังไม่ได้เพิ่มวิดีโอประกอบสินค้าในหน้านี้</p>
          )}
          <div className="space-y-2">
            {videoLinks.map((link) => (
              <div key={link} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                <span className="flex-1 truncate text-sm text-gray-600">{link}</span>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => onVideoLinksChange(videoLinks.filter((l) => l !== link))}
                    className="text-gray-400 hover:text-rose-500"
                  >
                    <FiTrash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
          {!readOnly && <VideoLinkInput onAdd={(link) => onVideoLinksChange([...videoLinks, link])} />}

          <p className="mb-2 mt-5 text-sm font-medium text-gray-700">
            เนื้อหาแนะนำสินค้าเพิ่มเติม (Additional Content Description)
          </p>
          <textarea
            rows={4}
            disabled={readOnly}
            placeholder="เขียนรายละเอียดเกี่ยวกับการทดสอบด้านเทคนิค หรือข้อมูลความสามารถของสินค้าเพิ่มเติม..."
            className={inputClass}
            {...register('description')}
          />
        </section>
      </div>
    </div>
  )
}

function VideoLinkInput({ onAdd }: { onAdd: (link: string) => void }) {
  const [value, setValue] = useState('')

  const handleAdd = () => {
    const trimmed = value.trim()
    if (trimmed) {
      onAdd(trimmed)
      setValue('')
    }
  }

  return (
    <div className="mt-2 flex gap-2">
      <input
        type="text"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="วาง URL รีวิวจาก YouTube หรือไฟล์วิดีโอ เช่น https://youtube.com/watch?v=..."
        className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
      />
      <button
        type="button"
        onClick={handleAdd}
        className="flex items-center gap-1 rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
      >
        <FiPlus size={14} /> เพิ่มวิดีโอ
      </button>
    </div>
  )
}

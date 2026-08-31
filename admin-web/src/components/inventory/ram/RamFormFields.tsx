import { useState } from 'react'
import { FiPlus, FiTrash2 } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Toggle } from '../../ui/Toggle'
import type { RamFormValues } from '../../../schemas/ram.schema'
import type { ExtraSpec } from '../../../types/ram'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['ADATA', 'APACER', 'CORSAIR', 'HIKSEMI', 'KINGSTON', 'LEXAR', 'KINGBANK', 'COLORFIRE']
const seriesOptions = [
  'VENGEANCE RGB', 'VENGEANCE LPX', 'TRIDENT Z', 'FURY BEAST', 'PANTHER RGB', 'THOR', 'SHARP', 'XPG LANCER BLADE', 'MEOW',
]
const memoryTypeOptions = ['DDR5', 'DDR4']
const capacityOptions = ['32GB (16GBx2)', '16GB (8GBx2)', '16GB (16GBx1)', '8GB (8GBx1)']
const speedOptions = ['6400MHz', '6000MHz', '5600MHz', '3200MHz']
const warrantyOptions = ['Lifetime', '3 Years', '5 Years']
const yesNoOptions = ['มี', 'ไม่มี']
const statusOptions: { value: RamFormValues['status']; label: string }[] = [
  { value: 'active', label: 'พร้อมจำหน่ายปกติ (Active)' },
  { value: 'inactive', label: 'ปิดการขาย (Inactive)' },
]

interface RamFormFieldsProps {
  readOnly?: boolean
  register: UseFormRegister<RamFormValues>
  errors: FieldErrors<RamFormValues>
  watch: UseFormWatch<RamFormValues>
  setValue: UseFormSetValue<RamFormValues>
  videoLinks: string[]
  onVideoLinksChange: (links: string[]) => void
  extraSpecs: ExtraSpec[]
  onExtraSpecsChange: (specs: ExtraSpec[]) => void
  showSku?: boolean
}

export function RamFormFields({
  readOnly = false,
  register,
  errors,
  watch,
  setValue,
  videoLinks,
  onVideoLinksChange,
  extraSpecs,
  onExtraSpecsChange,
  showSku = true,
}: RamFormFieldsProps) {
  const [videoInput, setVideoInput] = useState('')
  const [showExtraSpecForm, setShowExtraSpecForm] = useState(false)
  const [extraSpecName, setExtraSpecName] = useState('')
  const [extraSpecDetail, setExtraSpecDetail] = useState('')
  const promoEnabled = watch('promoEnabled')

  const addVideoLink = () => {
    const value = videoInput.trim()
    if (value) onVideoLinksChange([...videoLinks, value])
    setVideoInput('')
  }

  const addExtraSpec = () => {
    const name = extraSpecName.trim()
    const detail = extraSpecDetail.trim()
    if (!name || !detail) return
    onExtraSpecsChange([...extraSpecs, { id: crypto.randomUUID(), name, detail }])
    setExtraSpecName('')
    setExtraSpecDetail('')
    setShowExtraSpecForm(false)
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพสินค้า</h2>
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
            {readOnly ? 'ยังไม่มีรูปภาพ' : 'อัปโหลดรูปสินค้า'}
          </div>
          {!readOnly && (
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              + เพิ่มรูป
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลราคาและสถานะ</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น CORSAIR VENGEANCE RGB DDR5..."
                className={inputClass}
                {...register('name')}
              />
              {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
            </div>
            {showSku && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสสินค้า / SKU</label>
                <input type="text" disabled className={inputClass} {...register('sku')} />
                <p className="mt-1 text-xs text-gray-400">รหัสสินค้าถูกกำหนดโดยระบบ ไม่สามารถแก้ไขได้</p>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาขาย (Selling Price)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('sellingPrice', { valueAsNumber: true })} />
              {errors.sellingPrice && <p className="mt-1 text-xs text-red-500">{errors.sellingPrice.message}</p>}
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">ราคาโปรโมชั่น (Promo Price)</label>
              <Toggle checked={promoEnabled} onChange={(value) => !readOnly && setValue('promoEnabled', value)} />
            </div>
            <input
              type="number"
              disabled={readOnly || !promoEnabled}
              placeholder={promoEnabled ? '' : 'ยังไม่เปิดใช้ราคาพิเศษ'}
              className={inputClass}
              {...register('promoPrice', { valueAsNumber: true })}
            />
            {errors.promoPrice && <p className="text-xs text-red-500">{errors.promoPrice.message}</p>}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคงเหลือในคลัง (Stock)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('stock', { valueAsNumber: true })} />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะผลิตภัณฑ์ (Status)</label>
              <select disabled={readOnly} className={inputClass} {...register('status')}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6 xl:col-span-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-800">ข้อมูลสเปคทางเทคนิค (Specifications)</h2>
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-500">Desktop Memory</span>
          </div>
          <p className="mb-4 text-xs text-gray-400">กรุณากรอกข้อมูลด้านล่างให้ครบถ้วนเพื่อกำหนดคุณสมบัติเบื้องต้นและสเปคจำเพาะให้ครบถ้วน</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แบรนด์ (Brand)</label>
              <select disabled={readOnly} className={inputClass} {...register('brand')}>
                <option value="">เลือกแบรนด์</option>
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">รุ่น/ซีรีส์ (Memory Series)</label>
              <select disabled={readOnly} className={inputClass} {...register('series')}>
                <option value="">เลือกซีรีส์</option>
                {seriesOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.series && <p className="mt-1 text-xs text-red-500">{errors.series.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ประเภทแรม (Memory Type)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.memoryType')}>
                <option value="">เลือกประเภท</option>
                {memoryTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความจุ (Capacity)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.capacity')}>
                <option value="">เลือกความจุ</option>
                {capacityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความเร็วบัส (Speed)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.speed')}>
                <option value="">เลือกความเร็ว</option>
                {speedOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แรงดันไฟ (Voltage)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 1.35V หรือ 1.25V" className={inputClass} {...register('specs.voltage')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ค่าความหน่วง (CAS Latency)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น CL30-36-36-76" className={inputClass} {...register('specs.casLatency')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ระยะเวลารับประกัน (Warranty)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.warranty')}>
                <option value="">เลือกการรับประกัน</option>
                {warrantyOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">วัสดุระบายความร้อน (Heat Spreader)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.heatSpreader')}>
                <option value="">เลือก มี/ไม่มี</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ไฟส่องสว่าง (RGB Lighting)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.rgbLighting')}>
                <option value="">เลือก มี/ไม่มี</option>
                {yesNoOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {extraSpecs.length > 0 && (
            <div className="mt-4 space-y-2">
              {extraSpecs.map((spec) => (
                <div key={spec.id} className="flex items-start gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-700">{spec.name}</p>
                    <p className="text-sm text-gray-500">{spec.detail}</p>
                  </div>
                  {!readOnly && (
                    <button
                      type="button"
                      onClick={() => onExtraSpecsChange(extraSpecs.filter((s) => s.id !== spec.id))}
                      className="text-gray-400 hover:text-rose-500"
                    >
                      <FiTrash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readOnly && showExtraSpecForm && (
            <div className="mt-4 space-y-2 rounded-xl border border-gray-200 bg-gray-50 p-3">
              <input
                type="text"
                value={extraSpecName}
                onChange={(event) => setExtraSpecName(event.target.value)}
                placeholder="ชื่อหัวข้อสเปค เช่น ขนาดของแผงระบายความร้อน"
                className={inputClass}
              />
              <input
                type="text"
                value={extraSpecDetail}
                onChange={(event) => setExtraSpecDetail(event.target.value)}
                placeholder="รายละเอียด"
                className={inputClass}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowExtraSpecForm(false)}
                  className="rounded-lg px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={addExtraSpec}
                  className="rounded-lg bg-rose-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-rose-600"
                >
                  เพิ่ม
                </button>
              </div>
            </div>
          )}

          {!readOnly && !showExtraSpecForm && (
            <button
              type="button"
              onClick={() => setShowExtraSpecForm(true)}
              className="mt-4 flex items-center gap-1 text-sm text-rose-500 hover:underline"
            >
              <FiPlus size={14} /> เพิ่มหัวข้อสเปคเพิ่มเติม
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">รายละเอียดคอนเทนต์สินค้าเพิ่มเติม (Extended Content)</h2>
          <p className="mb-4 text-xs text-gray-400">เพิ่มรูปภาพ วิดีโอ หรือคำอธิบายเพิ่มเติมเพื่อสร้างความน่าเชื่อถือให้กับสินค้านี้</p>

          <p className="mb-2 text-sm font-medium text-gray-700">ลิงก์วิดีโอรีวิวแนะนำสินค้าเพิ่มเติม</p>
          {videoLinks.length === 0 && <p className="mb-2 text-xs text-gray-400">ยังไม่มีรายการวิดีโอเพิ่มเติมในตอนนี้</p>}
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
          {!readOnly && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={videoInput}
                onChange={(event) => setVideoInput(event.target.value)}
                placeholder="ใส่ URL วิดีโอ YouTube หรือลิงก์อื่นๆ..."
                className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400"
              />
              <button
                type="button"
                onClick={addVideoLink}
                className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                เพิ่มวิดีโอ
              </button>
            </div>
          )}

          <p className="mb-2 mt-5 text-sm font-medium text-gray-700">คำอธิบายรายละเอียดแบบปรับแต่งเพิ่มเติม (HTML Description)</p>
          <textarea
            rows={4}
            disabled={readOnly}
            placeholder="เขียนรายละเอียดสินค้าเพิ่มเติมเกี่ยวกับ จุดเด่น หรือข้อมูลเพิ่มเติมเชิงลึกเกี่ยวกับสินค้านี้..."
            className={inputClass}
            {...register('description')}
          />
        </section>
      </div>
    </div>
  )
}

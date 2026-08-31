import { useState } from 'react'
import { FiBold, FiItalic, FiList, FiPlus, FiTrash2, FiUnderline } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Toggle } from '../../ui/Toggle'
import type { CaseFormValues } from '../../../schemas/case.schema'
import type { ExtraSpec } from '../../../types/case'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['LIAN LI', 'NZXT', 'CORSAIR', 'MONTECH', 'HYTE', 'ASUS', 'DEEPCOOL', 'THERMALTAKE']
const mbSupportOptions = ['E-ATX, ATX, Micro-ATX', 'ATX, Micro-ATX, Mini-ITX', 'E-ATX, ATX, Micro-ATX, Mini-ITX', 'Mini-ITX']
const caseTypeOptions = ['Mid Tower', 'Full Tower', 'Mini Tower', 'Open Frame']
const sidePanelOptions = ['Tempered Glass', 'Mesh Panel', 'Solid Panel']
const warrantyOptions = ['1 Year', '2 Years', '3 Years']
const statusOptions: { value: CaseFormValues['status']; label: string }[] = [
  { value: 'active', label: 'พร้อมจำหน่ายปกติ (Active)' },
  { value: 'inactive', label: 'ปิดการขาย (Inactive)' },
]

interface CaseFormFieldsProps {
  readOnly?: boolean
  register: UseFormRegister<CaseFormValues>
  errors: FieldErrors<CaseFormValues>
  watch: UseFormWatch<CaseFormValues>
  setValue: UseFormSetValue<CaseFormValues>
  videoLinks: string[]
  onVideoLinksChange: (links: string[]) => void
  extraSpecs: ExtraSpec[]
  onExtraSpecsChange: (specs: ExtraSpec[]) => void
  showSku?: boolean
}

export function CaseFormFields({
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
}: CaseFormFieldsProps) {
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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพสินค้าหลัก</h2>
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
            {readOnly ? 'ยังไม่มีรูปภาพ' : 'ยังไม่ได้เลือกรูปหลัก'}
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-300"
              />
            ))}
            {!readOnly && (
              <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
                <FiPlus size={16} />
              </div>
            )}
          </div>
          {!readOnly && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="rounded-xl border border-gray-200 py-2 text-sm text-gray-500 hover:bg-gray-50"
              >
                เปลี่ยนรูปภาพ
              </button>
              <button
                type="button"
                className="rounded-xl bg-rose-50 py-2 text-sm font-medium text-rose-500 hover:bg-rose-100"
              >
                เลือกรูปภาพ...
              </button>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลการขายและสต๊อก</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="ระบุชื่อรุ่น หรือ แบรนด์เคส เช่น NZXT H9..."
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาปกติ (Selling Price)</label>
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
              placeholder={promoEnabled ? '' : 'ระบุราคาพิเศษเฉพาะช่วงโปร...'}
              className={inputClass}
              {...register('promoPrice', { valueAsNumber: true })}
            />

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
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-500">Computer Case</span>
          </div>
          <p className="mb-4 text-xs text-gray-400">
            ข้อมูลสเปคจะถูกนำไปใช้ในระบบตัวกรองการจัดสเปคคอมพิวเตอร์และระบบค้นหาหน้าเว็บอร์ดหลัก กรุณากรอกให้ละเอียด
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แบรนด์ (Brand)</label>
              <select disabled={readOnly} className={inputClass} {...register('brand')}>
                <option value="">เลือกแบรนด์สินค้า...</option>
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ขนาดเมนบอร์ด (MB Support)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.mbSupport')}>
                <option value="">เลือกขนาดบอร์ดที่รองรับ...</option>
                {mbSupportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.mbSupport && <p className="mt-1 text-xs text-red-500">{errors.specs.mbSupport.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ประเภทเคส (Case Type)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.caseType')}>
                <option value="">เลือกประเภทเคส...</option>
                {caseTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.caseType && <p className="mt-1 text-xs text-red-500">{errors.specs.caseType.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ฝาข้าง (Side Panel)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.sidePanel')}>
                <option value="">เลือกประเภทฝาข้าง...</option>
                {sidePanelOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.sidePanel && <p className="mt-1 text-xs text-red-500">{errors.specs.sidePanel.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ขนาดสินค้า (Dimensions)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น กว้าง x ยาว x สูง (มม.)" className={inputClass} {...register('specs.dimensions')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">น้ำหนัก (Weight)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 8.5 กิโลกรัม" className={inputClass} {...register('specs.weight')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ช่องใส่ไดรฟ์ (Drive Bays)</label>
              <input type="text" disabled={readOnly} placeholder='เช่น 2× 3.5" HDD / 4× 2.5" SSD' className={inputClass} {...register('specs.driveBays')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">การสนับสนุนพัดลม (Fan Support)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น ด้านหน้า 3 พัดลม / ด้านหลัง 1 พัดลม" className={inputClass} {...register('specs.fanSupport')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">การสนับสนุนหม้อน้ำ (Radiator Support)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น รองรับสูงสุด 360 มม. ด้านบน" className={inputClass} {...register('specs.radiatorSupport')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">พอร์ตเชื่อมต่อ (I/O Ports)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น USB Type-C, USB 3.0" className={inputClass} {...register('specs.ioPorts')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ระยะเวลาการรับประกัน (Warranty)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.warranty')}>
                <option value="">เลือกระยะเวลารับประกัน...</option>
                {warrantyOptions.map((option) => (
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
                placeholder="ชื่อหัวข้อสเปค เช่น สี Colorway"
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
              className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-dashed border-rose-200 py-2.5 text-sm text-rose-500 hover:bg-rose-50"
            >
              <FiPlus size={14} /> เพิ่มหัวข้อสเปคพิเศษ
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">รายละเอียดคอนเทนต์สินค้าเพิ่มเติม (Extended Content)</h2>
          <p className="mb-4 text-xs text-gray-400">เพิ่มรูปภาพ วิดีโอ หรือคำอธิบายเพิ่มเติมเพื่อสร้างความน่าเชื่อถือให้กับสินค้านี้</p>

          <p className="mb-2 text-sm font-medium text-gray-700">แกลเลอรี่รูปภาพประกอบสินค้าเพิ่มเติม (Product Gallery)</p>
          <div className="mb-5 grid grid-cols-4 gap-2 sm:w-2/3">
            {[0, 1, 2].map((slot) => (
              <div
                key={slot}
                className="flex aspect-square items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-300"
              />
            ))}
            {!readOnly && (
              <div className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-200 text-gray-300">
                <FiPlus size={16} />
              </div>
            )}
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700">ลิงก์วิดีโอรีวิวและแนะนำสินค้าเพิ่มเติม (Review Videos)</p>
          {videoLinks.length === 0 && <p className="mb-2 text-xs text-gray-400">ยังไม่มีลิงก์วิดีโอรีวิวผลิตภัณฑ์</p>}
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
                placeholder="ใส่ URL วิดีโอ YouTube ที่ต้องการเชื่อมโยง..."
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

          <p className="mb-2 mt-5 text-sm font-medium text-gray-700">คำอธิบายรายละเอียดคุณสมบัติสินค้า (Product Description)</p>
          {!readOnly && (
            <div className="mb-2 flex items-center gap-1 rounded-t-xl border border-b-0 border-gray-200 bg-gray-50 px-2 py-1.5 text-gray-400">
              <span className="rounded p-1 hover:bg-gray-100 hover:text-gray-600">
                <FiBold size={14} />
              </span>
              <span className="rounded p-1 hover:bg-gray-100 hover:text-gray-600">
                <FiItalic size={14} />
              </span>
              <span className="rounded p-1 hover:bg-gray-100 hover:text-gray-600">
                <FiUnderline size={14} />
              </span>
              <span className="rounded p-1 hover:bg-gray-100 hover:text-gray-600">
                <FiList size={14} />
              </span>
            </div>
          )}
          <textarea
            rows={5}
            disabled={readOnly}
            placeholder="เขียนข้อมูลแนะนำและอธิบายจุดเด่นของเคสคอมพิวเตอร์ของคุณที่นี่..."
            className={`${inputClass} ${readOnly ? '' : 'rounded-t-none'}`}
            {...register('description')}
          />
        </section>
      </div>
    </div>
  )
}

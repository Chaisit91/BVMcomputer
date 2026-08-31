import { useState } from 'react'
import { FiBold, FiItalic, FiList, FiPlus, FiTrash2, FiUnderline } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Toggle } from '../../ui/Toggle'
import type { StorageFormValues } from '../../../schemas/storage.schema'
import type { ExtraSpec } from '../../../types/storage'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['SAMSUNG', 'WD', 'KINGSTON', 'SEAGATE', 'CRUCIAL', 'SANDISK', 'TOSHIBA']
const typeOptions = ['SSD M.2 NVMe', 'SSD SATA 2.5 inch', 'HDD Internal 3.5 inch', 'HDD Internal 2.5 inch']
const interfaceOptions = ['PCIe Gen 4.0 x4', 'PCIe Gen 3.0 x4', 'SATA III', 'PCIe Gen 5.0 x4']
const formFactorOptions = ['M.2 2280', '2.5 inch', '3.5 inch']
const warrantyOptions = ['2 Years', '3 Years', '5 Years', 'Limited Lifetime']
const statusOptions: { value: StorageFormValues['status']; label: string }[] = [
  { value: 'active', label: 'พร้อมจำหน่ายปกติ (Active)' },
  { value: 'inactive', label: 'ปิดการขาย (Inactive)' },
]

interface StorageFormFieldsProps {
  readOnly?: boolean
  register: UseFormRegister<StorageFormValues>
  errors: FieldErrors<StorageFormValues>
  watch: UseFormWatch<StorageFormValues>
  setValue: UseFormSetValue<StorageFormValues>
  videoLinks: string[]
  onVideoLinksChange: (links: string[]) => void
  extraSpecs: ExtraSpec[]
  onExtraSpecsChange: (specs: ExtraSpec[]) => void
  showSku?: boolean
}

export function StorageFormFields({
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
}: StorageFormFieldsProps) {
  const [videoInput, setVideoInput] = useState('')
  const [showExtraSpecForm, setShowExtraSpecForm] = useState(false)
  const [extraSpecName, setExtraSpecName] = useState('')
  const [extraSpecDetail, setExtraSpecDetail] = useState('')
  const promoEnabled = watch('promoEnabled')
  const specType = watch('specs.type')

  const typeBadge = specType?.startsWith('SSD')
    ? 'Solid State Drive'
    : specType?.startsWith('HDD')
      ? 'Hard Disk Drive'
      : 'Solid State Drive / Hard Disk'

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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปสินค้าหลัก</h2>
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
            {readOnly ? 'ยังไม่มีรูปภาพ' : 'อัปโหลดรูปสินค้าหลัก'}
          </div>
          {!readOnly && (
            <button
              type="button"
              className="mt-3 w-full rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 hover:bg-gray-50"
            >
              + เพิ่มรูปภาพ
            </button>
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
                placeholder="เช่น SAMSUNG 990 PRO M.2 NVMe..."
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะสินค้า (Status)</label>
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
            <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-500">{typeBadge}</span>
          </div>
          <p className="mb-4 text-xs text-gray-400">กรุณากรอกข้อมูลด้านล่างให้ครบถ้วนเพื่อกำหนดคุณสมบัติเบื้องต้นและสเปคจำเพาะให้ครบถ้วน</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แบรนด์ (Brand)</label>
              <select disabled={readOnly} className={inputClass} {...register('brand')}>
                <option value="">เลือกแบรนด์ เช่น SAMSUNG, WD, SEAGATE</option>
                {brandOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.brand && <p className="mt-1 text-xs text-red-500">{errors.brand.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ประเภทการทำงาน (Type)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.type')}>
                <option value="">เลือกประเภทอุปกรณ์</option>
                {typeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.type && <p className="mt-1 text-xs text-red-500">{errors.specs.type.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความจุ (Capacity)</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="เช่น 500 GB, 1 TB, 2 TB, 4 TB"
                className={inputClass}
                {...register('specs.capacity')}
              />
              {errors.specs?.capacity && <p className="mt-1 text-xs text-red-500">{errors.specs.capacity.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">อินเทอร์เฟส (Interface)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.interface')}>
                <option value="">เลือกอินเตอร์เฟส</option>
                {interfaceOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.interface && <p className="mt-1 text-xs text-red-500">{errors.specs.interface.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ฟอร์มแฟกเตอร์ (Form Factor)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.formFactor')}>
                <option value="">เลือกฟอร์มแฟกเตอร์</option>
                {formFactorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.specs?.formFactor && <p className="mt-1 text-xs text-red-500">{errors.specs.formFactor.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความเร็วการอ่านสูงสุด (Sequential Read)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 7,400 MB/s" className={inputClass} {...register('specs.sequentialRead')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความเร็วการเขียนสูงสุด (Sequential Write)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 6,900 MB/s" className={inputClass} {...register('specs.sequentialWrite')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">หน่วยความจำแคช (Cache Memory)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 2GB LPDDR4 หรือ N/A" className={inputClass} {...register('specs.cacheMemory')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">อายุการใช้งานเฉลี่ย (MTBF)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 1.5 Million Hours" className={inputClass} {...register('specs.mtbf')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ระยะเวลารับประกัน (Warranty)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.warranty')}>
                <option value="">เลือกระยะเวลา</option>
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
                placeholder="ชื่อหัวข้อสเปค เช่น น้ำหนักสินค้า"
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

          <p className="mb-2 text-sm font-medium text-gray-700">แกลเลอรี่รูปภาพประกอบสินค้าเพิ่มเติม (Product Gallery)</p>
          <div className="mb-5 grid grid-cols-4 gap-2 sm:w-2/3">
            {[0, 1, 2, 3].map((slot) => (
              <div
                key={slot}
                className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-gray-300"
              >
                {!readOnly && <FiPlus size={16} />}
              </div>
            ))}
          </div>

          <p className="mb-2 text-sm font-medium text-gray-700">ลิงก์วิดีโอรีวิวและแนะนำสินค้าเพิ่มเติม</p>
          {videoLinks.length === 0 && <p className="mb-2 text-xs text-gray-400">ยังไม่มีลิงก์วิดีโอเพิ่มเติมในตอนนี้</p>}
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

          <p className="mb-2 mt-5 text-sm font-medium text-gray-700">คำอธิบายรายละเอียดสินค้า (Product Description)</p>
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
            rows={4}
            disabled={readOnly}
            placeholder="กรอกรายละเอียดสินค้า จุดเด่น หรือข้อมูลเพิ่มเติมเชิงลึกเกี่ยวกับสินค้านี้..."
            className={`${inputClass} ${readOnly ? '' : 'rounded-t-none'}`}
            {...register('description')}
          />
        </section>
      </div>
    </div>
  )
}

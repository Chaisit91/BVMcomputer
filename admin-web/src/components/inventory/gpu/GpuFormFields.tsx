import { FiPlus } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister } from 'react-hook-form'
import type { GpuFormValues } from '../../../schemas/gpu.schema'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['ASUS', 'GIGABYTE', 'MSI', 'SAPPHIRE', 'POWERCOLOR', 'GALAX', 'ZOTAC', 'EVGA', 'PALIT', 'INNO3D']
const seriesOptions = [
  'NVIDIA GeForce RTX 40 Series',
  'NVIDIA GeForce RTX 30 Series',
  'AMD Radeon RX 7000 Series',
  'AMD Radeon RX 6000 Series',
]
const modelOptions = [
  'RTX 4090', 'RTX 4080', 'RTX 4070 Ti Super', 'RTX 4070 Ti', 'RTX 4070', 'RTX 4060 Ti', 'RTX 4060', 'RTX 3060',
  'RX 7900 XTX', 'RX 7900 XT', 'RX 7800 XT', 'RX 7600',
]
const memorySizeOptions = ['24GB', '16GB', '12GB', '8GB']
const memoryInterfaceOptions = ['384-bit', '256-bit', '192-bit', '128-bit']
const powerRequirementOptions = ['850W', '750W', '650W', '550W']
const statusOptions: { value: GpuFormValues['status']; label: string }[] = [
  { value: 'available', label: 'พร้อมจำหน่าย' },
  { value: 'preorder', label: 'ของหมดสั่งจอง' },
  { value: 'discontinued', label: 'เลิกจำหน่าย' },
]

interface GpuFormFieldsProps {
  readOnly?: boolean
  register: UseFormRegister<GpuFormValues>
  errors: FieldErrors<GpuFormValues>
  showSku?: boolean
}

export function GpuFormFields({ readOnly = false, register, errors, showSku = true }: GpuFormFieldsProps) {
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลทั่วไป (General Info)</h2>
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder="กรอกชื่อสินค้าการ์ดจอ เช่น ASUS ROG Strix RTX 4070..."
              className={inputClass}
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            {showSku && (
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสสินค้า (Product ID/SKU)</label>
                <input type="text" disabled className={inputClass} {...register('sku')} />
                <p className="mt-1 text-xs text-gray-400">กำหนดโดยระบบ แก้ไขไม่ได้</p>
              </div>
            )}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคา (Price ฿)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('price', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">จำนวนคงเหลือ (Stock)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('stock', { valueAsNumber: true })} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ (Status)</label>
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
        <h2 className="mb-4 text-sm font-semibold text-gray-800">สเปคการ์ดจอ (GPU Specifications)</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Brand</label>
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Base Clock</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 2295 MHz" className={inputClass} {...register('specs.baseClock')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">GPU Series</label>
            <select disabled={readOnly} className={inputClass} {...register('series')}>
              <option value="">เลือก GPU Series</option>
              {seriesOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.series && <p className="mt-1 text-xs text-red-500">{errors.series.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Memory Clock</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 21 Gbps" className={inputClass} {...register('specs.memoryClock')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">GPU Model</label>
            <select disabled={readOnly} className={inputClass} {...register('model')}>
              <option value="">เลือก GPU Model</option>
              {modelOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.model && <p className="mt-1 text-xs text-red-500">{errors.model.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">HDMI Port</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 1 x HDMI 2.1b" className={inputClass} {...register('specs.hdmiPort')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Memory Size</label>
            <select disabled={readOnly} className={inputClass} {...register('memorySize')}>
              <option value="">เลือกขนาดหน่วยความจำ</option>
              {memorySizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {errors.memorySize && <p className="mt-1 text-xs text-red-500">{errors.memorySize.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Display Port</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder='เช่น 3x DisplayPort" (2.1b)'
              className={inputClass}
              {...register('specs.displayPort')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">OpenGL</label>
            <input type="text" disabled={readOnly} placeholder="เช่น OpenGL 4.6" className={inputClass} {...register('specs.openGl')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Power Connector</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 1 x 16-pin" className={inputClass} {...register('specs.powerConnector')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">CUDA Cores</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder="กรอกจำนวน CUDA Cores"
              className={inputClass}
              {...register('specs.cudaCores')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Power Requirement</label>
            <select disabled={readOnly} className={inputClass} {...register('specs.powerRequirement')}>
              <option value="">เลือกพลังงานที่ต้องการ</option>
              {powerRequirementOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Memory Interface</label>
            <select disabled={readOnly} className={inputClass} {...register('specs.memoryInterface')}>
              <option value="">เลือก Memory Interface</option>
              {memoryInterfaceOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Dimension</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder="เช่น 330.5 x 140 x 60 mm"
              className={inputClass}
              {...register('specs.dimension')}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Boost Clock</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 2452 MHz" className={inputClass} {...register('specs.boostClock')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Warranty</label>
            <input type="text" disabled={readOnly} placeholder="เช่น 3 ปี" className={inputClass} {...register('specs.warranty')} />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">รุ่นชิปเซ็ต (Chipset Model)</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder="เช่น NVIDIA RTX 4070 Ti"
              className={inputClass}
              {...register('chipsetModel')}
            />
            {errors.chipsetModel && <p className="mt-1 text-xs text-red-500">{errors.chipsetModel.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">Interface (PCIe)</label>
            <input
              type="text"
              disabled={readOnly}
              placeholder="เช่น PCIe 4.0 x16"
              className={inputClass}
              {...register('specs.pcieInterface')}
            />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">รูปภาพสินค้า (Product Images)</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="flex aspect-square items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400"
            >
              รูปภาพ
            </div>
          ))}
          {!readOnly && (
            <button
              type="button"
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-rose-200 text-xs text-rose-400 hover:bg-rose-50"
            >
              <FiPlus size={18} />
              เพิ่มรูปภาพ
            </button>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดเพิ่มเติม (Additional Details)</h2>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">คำอธิบาย (Description)</label>
        <textarea
          rows={4}
          disabled={readOnly}
          placeholder="กรอกจุดเด่น รายละเอียดการประกอบสินค้า หรือข้อมูลความสามารถเพิ่มเติม..."
          className={inputClass}
          {...register('description')}
        />
      </section>
    </div>
  )
}

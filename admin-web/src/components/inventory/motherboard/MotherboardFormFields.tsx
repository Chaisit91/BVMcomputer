import { FiPlus } from 'react-icons/fi'
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form'
import { Toggle } from '../../ui/Toggle'
import type { MotherboardFormValues } from '../../../schemas/motherboard.schema'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const brandOptions = ['ASROCK', 'ASUS', 'COLORFUL', 'GIGABYTE', 'MSI', 'COLORFIRE']
const cpuSupportOptions = [
  '12th Gen Intel Core', '13th Gen Intel Core', '14th Gen Intel Core', 'Intel Core Ultra',
  'AMD Ryzen 3000 Series', 'AMD Ryzen 3000G Series', 'AMD Ryzen 4000 Series', 'AMD Ryzen 4000G Series',
  'AMD Ryzen 5000 Series', 'AMD Ryzen 5000G Series', 'AMD Ryzen 7000 Series', 'AMD Ryzen 8000 Series', 'AMD Ryzen 9000 Series',
]
const socketOptions = ['AM4', 'AM5', 'LGA 1700', 'LGA 1851']
const chipsetOptions = [
  'Intel H610', 'AMD A520', 'Intel Z790', 'Intel B760', 'AMD B650', 'AMD X870',
  'Intel Z890', 'Intel B860', 'AMD B850', 'Intel H810', 'AMD A620A', 'AMD B840',
]
const mainboardSupportOptions = ['ATX', 'Micro-ATX', 'Mini-ITX']
const memorySlotsOptions = ['2x DIMM', '4x DIMM']
const memoryTypeOptions = ['DDR5', 'DDR4']
const maxMemoryOptions = ['64GB', '96GB', '128GB', '192GB', '256GB']
const formFactorOptions = ['ATX', 'Mini-ITX', 'Micro-ATX']
const warrantyOptions = ['1 ปี', '2 ปี', '3 ปี', 'ตลอดอายุการใช้งาน']

interface MotherboardFormFieldsProps {
  mode: 'create' | 'edit'
  readOnly?: boolean
  register: UseFormRegister<MotherboardFormValues>
  errors: FieldErrors<MotherboardFormValues>
  watch: UseFormWatch<MotherboardFormValues>
  setValue: UseFormSetValue<MotherboardFormValues>
}

export function MotherboardFormFields({ mode, readOnly = false, register, errors, watch, setValue }: MotherboardFormFieldsProps) {
  const stock = watch('stock') || 0
  const publishImmediately = watch('publishImmediately')

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
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ราคาสินค้าและสต็อก</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาขาย (Selling Price)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('sellingPrice', { valueAsNumber: true })} />
              {errors.sellingPrice && <p className="mt-1 text-xs text-red-500">{errors.sellingPrice.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ราคาทุน (Cost Price)</label>
              <input type="number" disabled={readOnly} className={inputClass} {...register('costPrice', { valueAsNumber: true })} />
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
              {readOnly ? (
                <span className="text-sm font-medium text-gray-800">{stock}</span>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setValue('stock', Math.max(stock - 1, 0))}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    className="w-16 rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 text-center text-sm text-gray-900 outline-none focus:border-rose-400"
                    {...register('stock', { valueAsNumber: true })}
                  />
                  <button
                    type="button"
                    onClick={() => setValue('stock', stock + 1)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50"
                  >
                    +
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-gray-50 pt-4">
              <div>
                <p className="text-sm font-medium text-gray-700">สถานะเผยแพร่ทันที</p>
                <p className="text-xs text-gray-400">เปิดพร้อมสำหรับขายทันที</p>
              </div>
              <Toggle
                checked={publishImmediately}
                onChange={(value) => !readOnly && setValue('publishImmediately', value)}
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-6 xl:col-span-2">
        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">ข้อมูลสเปคทางเทคนิค (Specifications)</h2>
          <p className="mb-4 text-xs text-gray-400">กรอกข้อมูลเบื้องต้นของเมนบอร์ด กรุณากรอกให้ครบถ้วน</p>
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
              <label className="mb-1.5 block text-sm font-medium text-gray-700">CPU Support</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.cpuSupport')}>
                <option value="">เลือก CPU รองรับ</option>
                {cpuSupportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ซ็อกเก็ต (CPU Socket)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.socket')}>
                <option value="">เลือกซ็อกเก็ต</option>
                {socketOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชิปเซ็ต (Chipset)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.chipset')}>
                <option value="">เลือกชิปเซ็ต</option>
                {chipsetOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Mainboard Support</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.mainboardSupport')}>
                <option value="">เลือกขนาดเมนบอร์ด</option>
                {mainboardSupportOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ช่องเสียบ (Memory Slots)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.memorySlots')}>
                <option value="">เลือกจำนวนช่อง</option>
                {memorySlotsOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ประเภทแรม (Memory Type)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.memoryType')}>
                <option value="">เลือกประเภทแรม</option>
                {memoryTypeOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">แรมสูงสุด (Max Memory)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.maxMemory')}>
                <option value="">เลือกแรมสูงสุด</option>
                {maxMemoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ฟอร์มแฟคเตอร์ (Form Factor)</label>
              <select disabled={readOnly} className={inputClass} {...register('specs.formFactor')}>
                <option value="">เลือก Form Factor</option>
                {formFactorOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ความเร็วแรมสูงสุด (Max Memory Speed)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น DDR5-6400MHz" className={inputClass} {...register('specs.maxMemorySpeed')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สล็อต M.2</label>
              <input type="text" disabled={readOnly} placeholder="จำนวน M.2 slot เช่น 2" className={inputClass} {...register('specs.m2Slots')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สล็อต PCIe x16</label>
              <input type="text" disabled={readOnly} placeholder="จำนวน PCIe x16 slot เช่น 1" className={inputClass} {...register('specs.pcieSlots')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ช่องต่อ USB</label>
              <input
                type="text"
                disabled={readOnly}
                placeholder="ระบุช่อง USB เช่น USB 3.2 Gen 2 Type-C"
                className={inputClass}
                {...register('specs.usbPorts')}
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชิปเสียง (Audio)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น Realtek ALC4080" className={inputClass} {...register('specs.audio')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">การเชื่อมต่อเครือข่าย (LAN)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 2.5GbE" className={inputClass} {...register('specs.lan')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">เครือข่ายไร้สาย (WiFi)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น WiFi 6E หรือ ไม่มี" className={inputClass} {...register('specs.wifi')} />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">บลูทูธ (Bluetooth)</label>
              <input type="text" disabled={readOnly} placeholder="เช่น 5.3 หรือ ไม่มี" className={inputClass} {...register('specs.bluetooth')} />
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
          {!readOnly && (
            <button
              type="button"
              className="mt-4 flex items-center gap-1 text-sm text-rose-500 hover:underline"
            >
              <FiPlus size={14} /> เพิ่มข้อมูลสเปค
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</h2>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">รายละเอียดสินค้า (Description)</label>
          <textarea
            rows={4}
            disabled={readOnly}
            placeholder="กรอกจุดเด่น รายละเอียดการใช้งาน หรือข้อมูลเพิ่มเติมของเมนบอร์ด..."
            className={inputClass}
            {...register('description')}
          />
        </section>
      </div>
    </div>
  )
}

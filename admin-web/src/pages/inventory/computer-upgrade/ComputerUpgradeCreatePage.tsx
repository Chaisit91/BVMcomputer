import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { ProductPicker } from '../../../components/ui/ProductPicker'
import {
  computerUpgradeFormSchema,
  type ComputerUpgradeFormValues,
} from '../../../schemas/computerUpgrade.schema'
import { createComputerUpgrade } from '../../../services/computerUpgrade.service'
import { COMPONENT_SLOTS, COMPONENT_SLOT_LABELS, COMPONENT_SLOT_TO_API_CATEGORY } from '../../../types/componentSlots'
import { computerUpgradeStatusMeta, type ComputerUpgradeStatus } from '../../../types/computerUpgrade'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const statusOptions = (Object.keys(computerUpgradeStatusMeta) as ComputerUpgradeStatus[]).map((value) => ({
  value,
  label: computerUpgradeStatusMeta[value].label,
}))

export function ComputerUpgradeCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ComputerUpgradeFormValues>({
    resolver: zodResolver(computerUpgradeFormSchema),
    defaultValues: {
      customer: '',
      status: 'pending_review',
      notes: '',
      items: COMPONENT_SLOTS.map((slot) => ({
        slot,
        oldItemDescription: '',
        newProductId: '',
        newProductPrice: 0,
        aiRecommendation: '',
      })),
    },
  })

  const items = watch('items')

  const onSubmit = async (values: ComputerUpgradeFormValues) => {
    await createComputerUpgrade(values)
    navigate('/inventory/computer-upgrade', { state: { toast: { type: 'success', message: 'เพิ่มรายการอัพเกรดสำเร็จ' } } })
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มรายการอัพเกรดคอมพิวเตอร์</h1>
            <p className="mt-1 text-sm text-gray-400">
              สร้างรายการเปล่าให้ลูกค้าได้เลย เผื่อกรณีหน้าบ้านขัดข้องหรือแอดมินรับเรื่องเอง
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/computer-upgrade')}
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
            </button>
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อลูกค้า *</label>
              <input type="text" className={inputClass} {...register('customer')} />
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ</label>
              <select className={inputClass} {...register('status')}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุ</label>
            <textarea rows={3} className={inputClass} {...register('notes')} />
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">รายการชิ้นส่วนที่จะอัพเกรด</h2>
          <p className="mb-4 text-xs text-gray-400">กรอกเฉพาะชิ้นที่เกี่ยวข้อง ไม่ต้องกรอกครบทุกช่อง</p>
          <div className="space-y-4">
            {COMPONENT_SLOTS.map((slot, index) => (
              <div key={slot} className="rounded-xl border border-gray-100 p-4">
                <p className="mb-3 text-sm font-semibold text-gray-800">{COMPONENT_SLOT_LABELS[slot]}</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">ของเดิมของลูกค้า</label>
                    <input
                      type="text"
                      placeholder="เช่น Intel Core i5-9400F (ลูกค้าแจ้งเอง)"
                      className={inputClass}
                      {...register(`items.${index}.oldItemDescription`)}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">อัพเกรดเป็น (สินค้าในคลัง)</label>
                    <ProductPicker
                      category={COMPONENT_SLOT_TO_API_CATEGORY[slot]}
                      value={items[index]?.newProductId ?? ''}
                      onChange={(productId) => setValue(`items.${index}.newProductId`, productId)}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">ราคาที่เสนอลูกค้า (฿)</label>
                    <input
                      type="number"
                      className={inputClass}
                      {...register(`items.${index}.newProductPrice`, { valueAsNumber: true })}
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-gray-500">คำแนะนำจาก AI (ถ้ามี)</label>
                    <input type="text" className={inputClass} {...register(`items.${index}.aiRecommendation`)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </form>
    </main>
  )
}

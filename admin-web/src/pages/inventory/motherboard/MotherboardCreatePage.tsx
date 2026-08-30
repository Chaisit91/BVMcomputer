import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { MotherboardFormFields } from '../../../components/inventory/motherboard/MotherboardFormFields'
import { motherboardFormSchema, type MotherboardFormValues } from '../../../schemas/motherboard.schema'
import { createMotherboard } from '../../../services/motherboard.service'

export function MotherboardCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<MotherboardFormValues>({
    resolver: zodResolver(motherboardFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      sellingPrice: 0,
      costPrice: 0,
      discount: 0,
      stock: 0,
      publishImmediately: true,
      specs: {
        cpuSupport: '',
        socket: '',
        chipset: '',
        mainboardSupport: '',
        memorySlots: '',
        memoryType: '',
        maxMemory: '',
        maxMemorySpeed: '',
        formFactor: '',
        m2Slots: '',
        pcieSlots: '',
        usbPorts: '',
        audio: '',
        lan: '',
        wifi: '',
        bluetooth: '',
        warranty: '',
      },
      description: '',
    },
  })

  const onSubmit = async (values: MotherboardFormValues) => {
    await createMotherboard(values)
    navigate('/inventory/motherboard')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
            <p className="text-sm text-gray-400">กรอกข้อมูลของเมนบอร์ดที่เพิ่มในระบบคลังสินค้า</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/motherboard')}
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
            </button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
            <input
              type="text"
              placeholder="เช่น ASUS ROG STRIX B760-F GAMING WIFI"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสสินค้า (SKU)</label>
            <input
              type="text"
              placeholder="เช่น MB-009"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('sku')}
            />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
          </div>
        </div>

        <MotherboardFormFields mode="create" register={register} errors={errors} watch={watch} setValue={setValue} />
      </form>
    </main>
  )
}

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GpuFormFields } from '../../../components/inventory/gpu/GpuFormFields'
import { gpuFormSchema, type GpuFormValues } from '../../../schemas/gpu.schema'
import { createGpu } from '../../../services/gpu.service'

export function GpuCreatePage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GpuFormValues>({
    resolver: zodResolver(gpuFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      series: '',
      model: '',
      chipsetModel: '',
      memorySize: '',
      price: 0,
      stock: 0,
      status: 'available',
      specs: {
        baseClock: '',
        memoryClock: '',
        hdmiPort: '',
        displayPort: '',
        openGl: '',
        cudaCores: '',
        powerConnector: '',
        powerRequirement: '',
        memoryInterface: '',
        dimension: '',
        boostClock: '',
        warranty: '',
        pcieInterface: '',
      },
      description: '',
    },
  })

  const onSubmit = async (values: GpuFormValues) => {
    await createGpu(values)
    navigate('/inventory/gpu')
  }

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">เพิ่มการ์ดจอใหม่</h1>
          <p className="text-sm text-gray-400">กรอกข้อมูลสเปคสินค้าการ์ดจอใหม่เข้าสู่ระบบคลังสินค้า</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
        <GpuFormFields showSku={false} register={register} errors={errors} />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/gpu')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </main>
  )
}

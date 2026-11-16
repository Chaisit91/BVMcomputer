import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { GpuFormFields } from '../../../components/inventory/gpu/GpuFormFields'
import { gpuFormSchema, type GpuFormValues } from '../../../schemas/gpu.schema'
import { createGpu } from '../../../services/gpu.service'
import { uploadModelAssets } from '../../../services/productModelAsset.service'
import { uploadProductImages } from '../../../services/productImage.service'

export function GpuCreatePage() {
  const navigate = useNavigate()
  const [stagedImages, setStagedImages] = useState<File[]>([])
  const [stagedModelAssets, setStagedModelAssets] = useState<File[]>([])

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
      sellingPrice: 0,
      stock: 0,
      status: 'active',
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
    const created = await createGpu(values)
    if (stagedImages.length) await uploadProductImages(created.id, stagedImages)
    if (stagedModelAssets.length) await uploadModelAssets(created.id, stagedModelAssets)
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
        <GpuFormFields
          showSku={false}
          register={register}
          errors={errors}
          stagedImages={stagedImages}
          onStagedImagesChange={setStagedImages}
          stagedModelAssets={stagedModelAssets}
          onStagedModelAssetsChange={setStagedModelAssets}
        />

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/gpu')}
            className="btn-secondary"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'เพิ่มสินค้า'}
          </button>
        </div>
      </form>
    </main>
  )
}

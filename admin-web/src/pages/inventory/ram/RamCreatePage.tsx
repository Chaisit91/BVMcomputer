import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { RamFormFields } from '../../../components/inventory/ram/RamFormFields'
import { ramFormSchema, type RamFormValues } from '../../../schemas/ram.schema'
import { createRam } from '../../../services/ram.service'
import type { ExtraSpec } from '../../../types/ram'

export function RamCreatePage() {
  const navigate = useNavigate()
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [extraSpecs, setExtraSpecs] = useState<ExtraSpec[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<RamFormValues>({
    resolver: zodResolver(ramFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      series: '',
      sellingPrice: 0,
      promoEnabled: false,
      promoPrice: 0,
      stock: 0,
      status: 'active',
      specs: {
        memoryType: '',
        capacity: '',
        speed: '',
        voltage: '',
        casLatency: '',
        warranty: '',
        heatSpreader: '',
        rgbLighting: '',
      },
      description: '',
    },
  })

  const submitAs = async (values: RamFormValues, status: RamFormValues['status']) => {
    await createRam({ ...values, status, videoLinks, extraSpecs })
    navigate('/inventory/ram')
  }

  const onPublish = handleSubmit((values) => submitAs(values, values.status))
  const onSaveUnpublished = handleSubmit((values) => submitAs(values, 'inactive'))

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={onPublish} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มแรมใหม่ (Add New RAM)</h1>
            <p className="text-sm text-gray-400">กรอกข้อมูลเพื่อเพิ่มรายการแรมใหม่เข้าสู่ระบบคลังสินค้า</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/ram')}
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

        <RamFormFields
          showSku={false}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          videoLinks={videoLinks}
          onVideoLinksChange={setVideoLinks}
          extraSpecs={extraSpecs}
          onExtraSpecsChange={setExtraSpecs}
        />

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-6">
          <button
            type="button"
            onClick={() => navigate('/inventory/ram')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ยกเลิกการเพิ่มสินค้า
          </button>
          <button
            type="button"
            onClick={onSaveUnpublished}
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            บันทึกสินค้าไม่เผยแพร่
          </button>
        </div>
      </form>
    </main>
  )
}

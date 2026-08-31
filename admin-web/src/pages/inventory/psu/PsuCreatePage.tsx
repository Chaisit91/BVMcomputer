import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { PsuFormFields } from '../../../components/inventory/psu/PsuFormFields'
import { psuFormSchema, type PsuFormValues } from '../../../schemas/psu.schema'
import { createPsu } from '../../../services/psu.service'
import type { ExtraSpec } from '../../../types/psu'

export function PsuCreatePage() {
  const navigate = useNavigate()
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [extraSpecs, setExtraSpecs] = useState<ExtraSpec[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PsuFormValues>({
    resolver: zodResolver(psuFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: '',
      sellingPrice: 0,
      promoEnabled: false,
      promoPrice: 0,
      stock: 0,
      status: 'active',
      specs: {
        continuousPower: '',
        certification: '',
        modularity: '',
        formFactor: '',
        fanSize: '',
        connectors: '',
        protection: '',
        warranty: '',
      },
      description: '',
    },
  })

  const onSubmit = handleSubmit(async (values) => {
    await createPsu({ ...values, videoLinks, extraSpecs })
    navigate('/inventory/psu')
  })

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มพาวเวอร์ซัพพลายใหม่ (Add New Power Supply)</h1>
            <p className="text-sm text-gray-400">สร้างรายการสินค้าใหม่ในคลังระบบ BVMcomputer</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/psu')}
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
              {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
            </button>
          </div>
        </div>

        <PsuFormFields
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

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
          <p className="text-xs text-gray-400">* กรุณาตรวจสอบข้อมูลสเปคทางเทคนิคให้ถูกต้องเรียบร้อยก่อนกดปุ่มบันทึก</p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/psu')}
              className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              ยกเลิกการทำงาน
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              บันทึกสินค้าใหม่
            </button>
          </div>
        </div>
      </form>
    </main>
  )
}

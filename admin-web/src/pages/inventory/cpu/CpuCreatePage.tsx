import { useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { CpuFormFields } from '../../../components/inventory/cpu/CpuFormFields'
import { cpuFormSchema, type CpuFormValues } from '../../../schemas/cpu.schema'
import { createCpu } from '../../../services/cpu.service'
import type { CpuBenchmark } from '../../../types/cpu'

export function CpuCreatePage() {
  const navigate = useNavigate()
  const [benchmarks, setBenchmarks] = useState<CpuBenchmark[]>([])
  const [videoLinks, setVideoLinks] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CpuFormValues>({
    resolver: zodResolver(cpuFormSchema),
    defaultValues: {
      sku: '',
      name: '',
      brand: 'AMD',
      series: '',
      processorNumber: '',
      socket: 'AM5',
      coresThreads: '',
      baseFrequency: '',
      maxTurboFrequency: '',
      l2Cache: '',
      l3Cache: '',
      graphics: '',
      tdp: '',
      maxTdp: '',
      warranty: '3 Years',
      sellingPrice: 0,
      costPrice: 0,
      discount: 0,
      stock: 0,
      publishImmediately: true,
      description: '',
    },
  })

  const onSubmit = async (values: CpuFormValues) => {
    await createCpu({ ...values, benchmarks, videoLinks })
    navigate('/inventory/cpu')
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">เพิ่มสินค้าใหม่</h1>
            <p className="text-sm text-gray-400">กรอกข้อมูลสินค้าที่ต้องการเพิ่มเข้าสู่ระบบคลังสินค้าเดสก์ทอป</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/cpu')}
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
            <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสสินค้า (SKU) *</label>
            <input
              type="text"
              placeholder="เช่น CPU-AMD-006"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('sku')}
            />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name) *</label>
            <input
              type="text"
              placeholder="เช่น AMD Ryzen 5 5600X"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
        </div>

        <CpuFormFields
          mode="create"
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          benchmarks={benchmarks}
          onBenchmarksChange={setBenchmarks}
          videoLinks={videoLinks}
          onVideoLinksChange={setVideoLinks}
        />
      </form>
    </main>
  )
}

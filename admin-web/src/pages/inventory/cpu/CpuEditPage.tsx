import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CpuFormFields } from '../../../components/inventory/cpu/CpuFormFields'
import { cpuFormSchema, type CpuFormValues } from '../../../schemas/cpu.schema'
import { getCpuDetail, saveCpu } from '../../../services/cpu.service'
import type { Cpu, CpuBenchmark } from '../../../types/cpu'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

export function CpuEditPage() {
  const { cpuId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Cpu | null>(null)
  const [benchmarks, setBenchmarks] = useState<CpuBenchmark[]>([])
  const [videoLinks, setVideoLinks] = useState<string[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CpuFormValues>({
    resolver: zodResolver(cpuFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getCpuDetail(cpuId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        setBenchmarks(result.benchmarks)
        setVideoLinks(result.videoLinks)
        reset({
          sku: result.sku,
          name: result.name,
          brand: result.brand,
          series: result.series,
          processorNumber: result.processorNumber,
          socket: result.socket,
          coresThreads: result.coresThreads,
          baseFrequency: result.baseFrequency,
          maxTurboFrequency: result.maxTurboFrequency,
          l2Cache: result.l2Cache,
          l3Cache: result.l3Cache,
          graphics: result.graphics,
          tdp: result.tdp,
          maxTdp: result.maxTdp,
          warranty: result.warranty,
          sellingPrice: result.sellingPrice,
          costPrice: result.costPrice,
          discount: result.discount,
          stock: result.stock,
          publishImmediately: result.publishImmediately,
          description: result.description,
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [cpuId, reset])

  const onSubmit = async (values: CpuFormValues) => {
    await saveCpu(cpuId, { ...values, benchmarks, videoLinks })
    navigate('/inventory/cpu')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบสินค้าที่ต้องการแก้ไข</p>
        <Link to="/inventory/cpu" className="text-rose-500 hover:underline">
          กลับไปหน้ารายการ
        </Link>
      </div>
    )
  }

  if (status === 'error' || !detail) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">แก้ไขสินค้า</h1>
            <p className="text-sm text-gray-400">{detail.sku}</p>
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('sku')}
            />
            {errors.sku && <p className="mt-1 text-xs text-red-500">{errors.sku.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name) *</label>
            <input
              type="text"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
        </div>

        <CpuFormFields
          mode="edit"
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

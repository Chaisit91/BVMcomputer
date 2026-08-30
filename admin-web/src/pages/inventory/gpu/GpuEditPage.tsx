import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { GpuFormFields } from '../../../components/inventory/gpu/GpuFormFields'
import { Badge } from '../../../components/ui/Badge'
import { gpuFormSchema, type GpuFormValues } from '../../../schemas/gpu.schema'
import { deleteGpu, getGpuDetail, saveGpu } from '../../../services/gpu.service'
import type { Gpu, GpuStatus } from '../../../types/gpu'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const statusBadge: Record<GpuStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  available: { label: 'พร้อมจำหน่าย', variant: 'success' },
  preorder: { label: 'ของหมดสั่งจอง', variant: 'warning' },
  discontinued: { label: 'เลิกจำหน่าย', variant: 'danger' },
}

export function GpuEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { gpuId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Gpu | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<GpuFormValues>({
    resolver: zodResolver(gpuFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getGpuDetail(gpuId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        reset({
          sku: result.sku,
          name: result.name,
          brand: result.brand,
          series: result.series,
          model: result.model,
          chipsetModel: result.chipsetModel,
          memorySize: result.memorySize,
          price: result.price,
          stock: result.stock,
          status: result.status,
          specs: result.specs,
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
  }, [gpuId, reset])

  const onSubmit = async (values: GpuFormValues) => {
    await saveGpu(gpuId, values)
    navigate('/inventory/gpu')
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบการ์ดจอนี้?')) return
    await deleteGpu(gpuId)
    navigate('/inventory/gpu')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบการ์ดจอที่ต้องการ</p>
        <Link to="/inventory/gpu" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูการ์ดจอ' : 'แก้ไขการ์ดจอ'

  return (
    <main className="mx-auto max-w-4xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          <Badge variant={statusBadge[detail.status].variant}>{statusBadge[detail.status].label}</Badge>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate('/inventory/gpu')}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <FiX size={16} />
            {readOnly ? 'ปิด' : 'ยกเลิก'}
          </button>
          {!readOnly && (
            <>
              <button
                type="button"
                onClick={handleDelete}
                className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
              >
                <FiTrash2 size={16} />
                ลบ
              </button>
              <button
                type="submit"
                form="gpu-edit-form"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </>
          )}
        </div>
      </div>

      <form id="gpu-edit-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        <GpuFormFields readOnly={readOnly} register={register} errors={errors} />
      </form>
    </main>
  )
}

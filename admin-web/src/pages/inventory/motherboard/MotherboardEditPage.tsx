import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { MotherboardFormFields } from '../../../components/inventory/motherboard/MotherboardFormFields'
import { motherboardFormSchema, type MotherboardFormValues } from '../../../schemas/motherboard.schema'
import { deleteMotherboard, getMotherboardDetail, saveMotherboard } from '../../../services/motherboard.service'
import type { Motherboard } from '../../../types/motherboard'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

export function MotherboardEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { motherboardId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Motherboard | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MotherboardFormValues>({
    resolver: zodResolver(motherboardFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getMotherboardDetail(motherboardId)
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
          sellingPrice: result.sellingPrice,
          costPrice: result.costPrice,
          discount: result.discount,
          stock: result.stock,
          publishImmediately: result.publishImmediately,
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
  }, [motherboardId, reset])

  const onSubmit = async (values: MotherboardFormValues) => {
    await saveMotherboard(motherboardId, values)
    navigate('/inventory/motherboard')
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบเมนบอร์ดนี้?')) return
    await deleteMotherboard(motherboardId)
    navigate('/inventory/motherboard')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบเมนบอร์ดที่ต้องการ</p>
        <Link to="/inventory/motherboard" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูเมนบอร์ด' : 'แก้ไขเมนบอร์ด'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-400">{detail.sku}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/motherboard')}
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
                  disabled={isSubmitting}
                  className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FiSave size={16} />
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกสินค้า'}
                </button>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อสินค้า (Product Name)</label>
            <input
              type="text"
              disabled={readOnly}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500"
              {...register('name')}
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">รหัสสินค้า (SKU)</label>
            <input
              type="text"
              disabled
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 outline-none disabled:cursor-default"
              {...register('sku')}
            />
            <p className="mt-1 text-xs text-gray-400">รหัสสินค้าถูกกำหนดโดยระบบ ไม่สามารถแก้ไขได้</p>
          </div>
        </div>

        <MotherboardFormFields mode="edit" readOnly={readOnly} register={register} errors={errors} watch={watch} setValue={setValue} />
      </form>
    </main>
  )
}

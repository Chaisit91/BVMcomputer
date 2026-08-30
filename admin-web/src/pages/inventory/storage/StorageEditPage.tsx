import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiTrash2, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { StorageFormFields } from '../../../components/inventory/storage/StorageFormFields'
import { storageFormSchema, type StorageFormValues } from '../../../schemas/storage.schema'
import { deleteStorage, getStorageDetail, saveStorage } from '../../../services/storage.service'
import type { ExtraSpec, Storage } from '../../../types/storage'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

export function StorageEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { storageId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Storage | null>(null)
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [extraSpecs, setExtraSpecs] = useState<ExtraSpec[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<StorageFormValues>({
    resolver: zodResolver(storageFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getStorageDetail(storageId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        setVideoLinks(result.videoLinks)
        setExtraSpecs(result.extraSpecs)
        reset({
          sku: result.sku,
          name: result.name,
          brand: result.brand,
          sellingPrice: result.sellingPrice,
          promoEnabled: result.promoEnabled,
          promoPrice: result.promoPrice,
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
  }, [storageId, reset])

  const onSubmit = async (values: StorageFormValues) => {
    await saveStorage(storageId, { ...values, videoLinks, extraSpecs })
    navigate('/inventory/storage')
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบอุปกรณ์จัดเก็บข้อมูลนี้?')) return
    await deleteStorage(storageId)
    navigate('/inventory/storage')
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบอุปกรณ์จัดเก็บข้อมูลที่ต้องการ</p>
        <Link to="/inventory/storage" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูอุปกรณ์จัดเก็บข้อมูล (View Storage)' : 'แก้ไขข้อมูล อุปกรณ์จัดเก็บข้อมูล (Edit Storage)'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-400">
              {detail.sku} • {detail.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/storage')}
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
                  {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </>
            )}
          </div>
        </div>

        <StorageFormFields
          readOnly={readOnly}
          register={register}
          errors={errors}
          watch={watch}
          setValue={setValue}
          videoLinks={videoLinks}
          onVideoLinksChange={setVideoLinks}
          extraSpecs={extraSpecs}
          onExtraSpecsChange={setExtraSpecs}
        />
      </form>
    </main>
  )
}

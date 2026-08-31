import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiSave, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CoolingFormFields } from '../../../components/inventory/cooling/CoolingFormFields'
import { coolingFormSchema, type CoolingFormValues } from '../../../schemas/cooling.schema'
import { getCoolingDetail, saveCooling } from '../../../services/cooling.service'
import { useAppSelector } from '../../../store/hooks'
import type { Cooling, ExtraSpec } from '../../../types/cooling'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

export function CoolingEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { coolingId = '' } = useParams()
  const navigate = useNavigate()
  const currentUser = useAppSelector((state) => state.auth.user)
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Cooling | null>(null)
  const [videoLinks, setVideoLinks] = useState<string[]>([])
  const [extraSpecs, setExtraSpecs] = useState<ExtraSpec[]>([])

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CoolingFormValues>({
    resolver: zodResolver(coolingFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getCoolingDetail(coolingId)
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
  }, [coolingId, reset])

  const onSubmit = handleSubmit(async (values) => {
    await saveCooling(coolingId, { ...values, videoLinks, extraSpecs })
    navigate('/inventory/cooling')
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบชุดระบายความร้อนที่ต้องการ</p>
        <Link to="/inventory/cooling" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูชุดระบายความร้อน (View Cooling System)' : 'แก้ไขข้อมูล ชุดระบายความร้อน (Edit Cooling System)'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={onSubmit} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
            <p className="text-sm text-gray-400">
              รหัสระบบ: {detail.sku} • {detail.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/cooling')}
              className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <FiX size={16} />
              {readOnly ? 'ปิด' : 'ยกเลิก'}
            </button>
            {!readOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <FiSave size={16} />
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            )}
          </div>
        </div>

        <CoolingFormFields
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

        {!readOnly && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-6">
            <p className="text-xs text-gray-400">
              แก้ไขล่าสุดโดย {currentUser?.name ?? 'แอดมิน'} • อัปเดตเมื่อ {detail.updatedAt}
            </p>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate('/inventory/cooling')}
                className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                ยกเลิกการเปลี่ยนแปลง
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                บันทึกการเปลี่ยนแปลงทั้งหมด
              </button>
            </div>
          </div>
        )}
      </form>
    </main>
  )
}

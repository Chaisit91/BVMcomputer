import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FiImage, FiMonitor, FiSliders, FiTrash2, FiUpload } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Toggle } from '../../../components/ui/Toggle'
import { bannerFormSchema, type BannerFormValues } from '../../../schemas/banner.schema'
import { getBannerDetail, saveBanner } from '../../../services/banner.service'
import type { Banner } from '../../../types/banner'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100'

const typeOptions = [
  { value: 'hero', label: 'Hero Banner' },
  { value: 'promo', label: 'Banner โปรโมชั่น' },
  { value: 'popup', label: 'Popup โปรโมชั่น' },
]

export function BannerEditPage() {
  const { bannerId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<Banner | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BannerFormValues>({
    resolver: zodResolver(bannerFormSchema),
  })

  useEffect(() => {
    let cancelled = false

    getBannerDetail(bannerId)
      .then((result) => {
        if (cancelled) return
        if (!result) {
          setStatus('not_found')
          return
        }
        setDetail(result)
        reset({
          name: result.name,
          type: result.type,
          targetLink: result.targetLink,
          startDate: result.startDate,
          endDate: result.endDate,
          active: result.status === 'active',
        })
        setStatus('success')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [bannerId, reset])

  const name = watch('name')
  const active = watch('active')

  const onSubmit = handleSubmit(async (values) => {
    await saveBanner(bannerId, values)
    navigate('/manage/banners')
  })

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบแบนเนอร์ที่ต้องการ</p>
        <Link to="/manage/banners" className="text-rose-500 hover:underline">
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
      <div>
        <h1 className="text-xl font-bold text-gray-900">แก้ไขแบนเนอร์</h1>
        <p className="text-sm text-gray-400">แก้ไขข้อมูลแบนเนอร์โปรโมชั่น</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <div>
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiSliders className="text-rose-500" />
                ข้อมูลแบนเนอร์ (Banner Info)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ชื่อแบนเนอร์ <span className="text-rose-500">*</span>
                  </label>
                  <input type="text" className={inputClass} {...register('name')} />
                  {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    ประเภท <span className="text-rose-500">*</span>
                  </label>
                  <select className={inputClass} {...register('type')}>
                    {typeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">ลิงก์ปลายทาง</label>
                  <input type="text" placeholder="เช่น /promotion/summer" className={inputClass} {...register('targetLink')} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">
                      วันเริ่มต้น <span className="text-rose-500">*</span>
                    </label>
                    <input type="date" className={inputClass} {...register('startDate')} />
                    {errors.startDate && <p className="mt-1 text-xs text-red-500">{errors.startDate.message}</p>}
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700">วันสิ้นสุด</label>
                    <input type="date" className={inputClass} {...register('endDate')} />
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 text-sm font-medium text-gray-700">สถานะการแสดงผล</p>
                  <div className="flex items-center gap-3">
                    <Toggle checked={active} onChange={(value) => setValue('active', value)} />
                    <span className="text-sm text-gray-600">{active ? 'กำลังแสดง' : 'ปิดการแสดง'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:border-l lg:border-gray-100 lg:pl-8">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
                <FiImage className="text-rose-500" />
                รูปภาพแบนเนอร์ (Banner Image)
              </h2>
              <div className={`relative flex h-56 items-center justify-center overflow-hidden rounded-2xl ${detail.previewTone}`}>
                <span className="rounded-lg bg-black/60 px-4 py-2 text-sm font-semibold text-white">{detail.name}</span>
              </div>
              <p className="mt-2 text-xs text-gray-500">
                ชื่อไฟล์: <span className="font-medium text-gray-700">{detail.imageFilename}</span>
              </p>
              <p className="text-xs text-gray-500">
                ขนาด: {detail.imageDimensions} | รูปแบบ: {detail.imageFormat}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  <FiUpload size={14} />
                  เปลี่ยนรูปภาพ
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center gap-1.5 rounded-xl border border-rose-200 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50"
                >
                  <FiTrash2 size={14} />
                  ลบรูปภาพ
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6">
          <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiMonitor className="text-rose-500" />
            ตัวอย่างการแสดงผลบนหน้าแรก (Live Preview)
          </h2>
          <div className="flex h-40 items-center justify-center rounded-2xl bg-rose-500 px-6 text-center">
            <span className="text-xl font-bold uppercase tracking-wide text-white">{name || 'ชื่อแบนเนอร์'}</span>
          </div>
        </div>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate('/manage/banners')}
            className="rounded-xl border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            ยกเลิก
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-rose-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกการเปลี่ยนแปลง'}
          </button>
        </div>
      </form>
    </main>
  )
}

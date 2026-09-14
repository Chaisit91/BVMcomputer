import { useEffect, useRef, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useForm } from 'react-hook-form'
import { FiArrowRight, FiCheckCircle, FiMonitor, FiRefreshCw, FiSave, FiTrash2, FiUpload, FiX } from 'react-icons/fi'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ProductPicker } from '../../../components/ui/ProductPicker'
import { formatDateTime } from '../../../lib/formatDate'
import { computerUpgradeFormSchema, type ComputerUpgradeFormValues } from '../../../schemas/computerUpgrade.schema'
import {
  deleteComputerUpgrade,
  getComputerUpgradeDetail,
  saveComputerUpgrade,
  uploadOldItemPhoto,
  verifyOldItem,
} from '../../../services/computerUpgrade.service'
import { COMPONENT_SLOTS, COMPONENT_SLOT_LABELS, COMPONENT_SLOT_TO_API_CATEGORY, type ComponentSlot } from '../../../types/componentSlots'
import { computerUpgradeStatusMeta, type ComputerUpgrade, type ComputerUpgradeStatus } from '../../../types/computerUpgrade'

type LoadStatus = 'loading' | 'error' | 'not_found' | 'success'

const MAX_PHOTO_BYTES = 5 * 1024 * 1024

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 disabled:cursor-default disabled:text-gray-500'

const statusOptions = (Object.keys(computerUpgradeStatusMeta) as ComputerUpgradeStatus[]).map((value) => ({
  value,
  label: computerUpgradeStatusMeta[value].label,
}))

export function ComputerUpgradeEditPage({ readOnly = false }: { readOnly?: boolean }) {
  const { upgradeId = '' } = useParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [detail, setDetail] = useState<ComputerUpgrade | null>(null)
  const [uploadingSlot, setUploadingSlot] = useState<ComponentSlot | null>(null)
  const [uploadError, setUploadError] = useState('')
  const [verifyingSlot, setVerifyingSlot] = useState<ComponentSlot | null>(null)
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ComputerUpgradeFormValues>({
    resolver: zodResolver(computerUpgradeFormSchema),
  })

  const loadDetail = () =>
    getComputerUpgradeDetail(upgradeId).then((result) => {
      if (!result) {
        setStatus('not_found')
        return
      }
      setDetail(result)
      reset({
        customer: result.customerName,
        status: result.status,
        notes: result.notes,
        items: COMPONENT_SLOTS.map((slot) => {
          const existing = result.items.find((item) => item.slot === slot)
          return {
            slot,
            oldItemDescription: existing?.oldItemDescription ?? '',
            newProductId: existing?.newProductId ?? '',
            newProductPrice: existing?.newProductPrice ?? 0,
            aiRecommendation: existing?.aiRecommendation ?? '',
          }
        }),
      })
      setStatus('success')
    })

  useEffect(() => {
    let cancelled = false
    loadDetail().catch(() => {
      if (!cancelled) setStatus('error')
    })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [upgradeId])

  const items = watch('items')

  const onSubmit = async (values: ComputerUpgradeFormValues) => {
    await saveComputerUpgrade(upgradeId, values)
    navigate('/inventory/computer-upgrade', { state: { toast: { type: 'success', message: 'บันทึกการเปลี่ยนแปลงสำเร็จ' } } })
  }

  const handleDelete = async () => {
    if (!window.confirm('ยืนยันการลบรายการนี้?')) return
    await deleteComputerUpgrade(upgradeId)
    navigate('/inventory/computer-upgrade', { state: { toast: { type: 'success', message: 'ลบรายการสำเร็จ' } } })
  }

  const handlePhotoChange = async (slot: ComponentSlot, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    setUploadError('')
    if (!file.type.startsWith('image/')) {
      setUploadError('เลือกไฟล์รูปภาพเท่านั้น')
      return
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setUploadError('ไฟล์ต้องมีขนาดไม่เกิน 5MB')
      return
    }

    setUploadingSlot(slot)
    try {
      const updated = await uploadOldItemPhoto(upgradeId, slot, file)
      setDetail(updated)
    } catch (err) {
      const serverMessage = axios.isAxiosError(err) ? (err.response?.data as { message?: string })?.message : undefined
      setUploadError(serverMessage ?? 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่')
    } finally {
      setUploadingSlot(null)
    }
  }

  const handleVerify = async (slot: ComponentSlot) => {
    setVerifyingSlot(slot)
    try {
      const updated = await verifyOldItem(upgradeId, slot)
      setDetail(updated)
    } finally {
      setVerifyingSlot(null)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'not_found') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-sm text-gray-400">
        <p>ไม่พบรายการที่ต้องการ</p>
        <Link to="/inventory/computer-upgrade" className="text-rose-500 hover:underline">
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

  const pageTitle = readOnly ? 'ดูรายการอัพเกรด' : 'แก้ไขรายการอัพเกรด'

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{pageTitle}</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/inventory/computer-upgrade')}
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
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            )}
          </div>
        </div>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ข้อมูลลูกค้า</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">ชื่อลูกค้า</label>
              <input type="text" disabled={readOnly} className={inputClass} {...register('customer')} />
              {errors.customer && <p className="mt-1 text-xs text-red-500">{errors.customer.message}</p>}
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">สถานะ</label>
              <select disabled={readOnly} className={inputClass} {...register('status')}>
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label className="mb-1.5 block text-sm font-medium text-gray-700">หมายเหตุ</label>
            <textarea rows={3} disabled={readOnly} className={inputClass} {...register('notes')} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-gray-400">
            <p>สร้างเมื่อ {formatDateTime(detail.createdAt)}</p>
            <p>แก้ไขล่าสุด {formatDateTime(detail.updatedAt)}</p>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 flex items-center gap-2 text-sm font-semibold text-gray-800">
            <FiMonitor className="text-gray-400" />
            สรุปสเปกทั้งเครื่องหลังอัพเกรด
          </h2>
          <p className="mb-4 text-xs text-gray-400">
            รวมของเดิมที่ไม่เปลี่ยน + ของใหม่ที่อัพเกรดแล้ว เป็นสเปกจริงของเครื่องทั้งชุด — ใช้ส่งให้ AI ตรวจความเข้ากันได้ทั้งเครื่อง
          </p>
          <div className="grid grid-cols-1 gap-x-6 gap-y-2 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
            {COMPONENT_SLOTS.map((slot, index) => {
              const isUpgrading = Boolean(items?.[index]?.newProductId)
              const existing = detail.items.find((item) => item.slot === slot)
              const effectiveItem = isUpgrading
                ? (existing?.newProductName ?? 'กำลังเลือกสินค้าใหม่...')
                : items?.[index]?.oldItemDescription || 'ไม่ทราบของเดิม'
              return (
                <div key={slot} className="flex items-center gap-2 text-sm">
                  <span className="w-20 shrink-0 font-medium text-gray-500">{COMPONENT_SLOT_LABELS[slot]}</span>
                  <span className={`min-w-0 flex-1 truncate ${isUpgrading ? 'font-medium text-rose-600' : 'text-gray-700'}`}>
                    {effectiveItem}
                  </span>
                  {isUpgrading && (
                    <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                      <FiRefreshCw size={10} />
                      ของใหม่
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">รายการชิ้นส่วนที่อัพเกรด</h2>
          {uploadError && <p className="mb-3 text-xs text-red-500">{uploadError}</p>}
          <div className="space-y-4">
            {COMPONENT_SLOTS.map((slot, index) => {
              const existing = detail.items.find((item) => item.slot === slot)
              const isUpgrading = Boolean(items?.[index]?.newProductId)
              return (
                <div
                  key={slot}
                  className={`rounded-xl border p-4 ${isUpgrading ? 'border-rose-200 bg-rose-50/40' : 'border-gray-100'}`}
                >
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-gray-800">{COMPONENT_SLOT_LABELS[slot]}</p>
                      {isUpgrading ? (
                        <span className="flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                          <FiRefreshCw size={10} />
                          กำลังอัพเกรดชิ้นนี้
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-500">
                          ไม่มีการเปลี่ยนแปลง
                        </span>
                      )}
                    </div>
                    {existing?.verifiedByAdmin ? (
                      <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-600">
                        <FiCheckCircle size={12} />
                        ตรวจสอบแล้วโดย {existing.verifiedByName} · {formatDateTime(existing.verifiedAt)}
                      </span>
                    ) : (
                      !readOnly && (
                        <button
                          type="button"
                          onClick={() => handleVerify(slot)}
                          disabled={verifyingSlot === slot}
                          className="flex items-center gap-1 rounded-full border border-gray-200 px-2.5 py-1 text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-60"
                        >
                          <FiCheckCircle size={12} />
                          {verifyingSlot === slot ? 'กำลังยืนยัน...' : 'ยืนยันว่าตรวจสอบแล้ว'}
                        </button>
                      )
                    )}
                  </div>

                  <div className="mb-3 flex flex-wrap items-center gap-1.5 text-sm">
                    <span className="text-gray-600">
                      {items?.[index]?.oldItemDescription || <span className="italic text-gray-400">ยังไม่ระบุของเดิม</span>}
                    </span>
                    {isUpgrading && (
                      <>
                        <FiArrowRight className="text-gray-300" size={13} />
                        <span className="font-medium text-rose-600">
                          {existing?.newProductName ?? 'กำลังเลือกสินค้าใหม่...'}
                        </span>
                      </>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">ของเดิมของลูกค้า</label>
                      <input
                        type="text"
                        disabled={readOnly}
                        className={inputClass}
                        {...register(`items.${index}.oldItemDescription`)}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">รูปของเดิม</label>
                      <div className="flex items-center gap-3">
                        {existing?.oldItemPhotoUrl ? (
                          <img
                            src={existing.oldItemPhotoUrl}
                            alt={`ของเดิม ${COMPONENT_SLOT_LABELS[slot]}`}
                            className="h-14 w-14 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-50 text-xs text-gray-400">
                            ไม่มีรูป
                          </div>
                        )}
                        {!readOnly && (
                          <>
                            <input
                              ref={(el) => {
                                fileInputRefs.current[slot] = el
                              }}
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(event) => handlePhotoChange(slot, event)}
                            />
                            <button
                              type="button"
                              disabled={uploadingSlot === slot}
                              onClick={() => fileInputRefs.current[slot]?.click()}
                              className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-60"
                            >
                              <FiUpload size={12} />
                              {uploadingSlot === slot ? 'กำลังอัปโหลด...' : existing?.oldItemPhotoUrl ? 'เปลี่ยนรูป' : 'แนบรูป'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">อัพเกรดเป็น (สินค้าในคลัง)</label>
                      <ProductPicker
                        category={COMPONENT_SLOT_TO_API_CATEGORY[slot]}
                        value={items?.[index]?.newProductId ?? ''}
                        onChange={(productId) => setValue(`items.${index}.newProductId`, productId)}
                        disabled={readOnly}
                        className={inputClass}
                        selectedLabel={existing?.newProductName ?? undefined}
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-medium text-gray-500">ราคาที่เสนอลูกค้า (฿)</label>
                      <input
                        type="number"
                        disabled={readOnly}
                        className={inputClass}
                        {...register(`items.${index}.newProductPrice`, { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  <div className="mt-3">
                    <label className="mb-1 block text-xs font-medium text-gray-500">คำแนะนำจาก AI</label>
                    <input
                      type="text"
                      disabled={readOnly}
                      className={inputClass}
                      {...register(`items.${index}.aiRecommendation`)}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {!readOnly && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleDelete}
              className="flex items-center gap-2 rounded-xl border border-rose-200 px-5 py-2.5 text-sm font-medium text-rose-500 hover:bg-rose-50"
            >
              <FiTrash2 size={16} />
              ลบรายการนี้
            </button>
          </div>
        )}
      </form>
    </main>
  )
}

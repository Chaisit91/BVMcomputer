import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { Toggle } from '../../../components/ui/Toggle'
import { deleteBanner, getBannerSummary, getBanners, updateBannerActive } from '../../../services/banner.service'
import type { Banner, BannerStatus, BannerSummary, BannerType } from '../../../types/banner'

type LoadStatus = 'loading' | 'error' | 'success'
type TypeFilter = 'all' | BannerType

const typeTabs: { value: TypeFilter; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'hero', label: 'Hero Banner' },
  { value: 'promo', label: 'Banner โปรโมชั่น' },
  { value: 'popup', label: 'Popup โปรโมชั่น' },
]

const typeLabels: Record<BannerType, string> = {
  hero: 'Hero Banner',
  promo: 'Banner โปรโมชั่น',
  popup: 'Popup โปรโมชั่น',
}

const statusFilterOptions: { value: 'all' | BannerStatus; label: string }[] = [
  { value: 'all', label: 'สถานะทั้งหมด' },
  { value: 'active', label: 'กำลังแสดง' },
  { value: 'inactive', label: 'หยุดแสดง' },
  { value: 'expired', label: 'หมดอายุ' },
]

function formatDisplayDate(isoDate: string) {
  if (!isoDate) return '-'
  const [year, month, day] = isoDate.split('-')
  return `${day}/${month}/${year}`
}

export function BannerListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<BannerSummary | null>(null)
  const [banners, setBanners] = useState<Banner[]>([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | BannerStatus>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getBannerSummary(), getBanners()])
      .then(([summaryResult, bannersResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setBanners(bannersResult)
          setStatus('success')
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const toggleActive = async (banner: Banner) => {
    if (banner.status === 'expired') return
    const nextActive = banner.status !== 'active'
    await updateBannerActive(banner.id, nextActive)
    setBanners((prev) =>
      prev.map((item) => (item.id === banner.id ? { ...item, status: nextActive ? 'active' : 'inactive' } : item)),
    )
  }

  const handleDelete = async (banner: Banner) => {
    if (!window.confirm(`ยืนยันการลบแบนเนอร์ "${banner.name}"?`)) return
    await deleteBanner(banner.id)
    setBanners((prev) => prev.filter((item) => item.id !== banner.id))
  }

  const visibleBanners = useMemo(() => {
    const query = search.trim().toLowerCase()
    return banners.filter((banner) => {
      const matchesSearch =
        query === '' || banner.name.toLowerCase().includes(query) || banner.targetLink.toLowerCase().includes(query)
      const matchesType = typeFilter === 'all' || banner.type === typeFilter
      const matchesStatus = statusFilter === 'all' || banner.status === statusFilter
      return matchesSearch && matchesType && matchesStatus
    })
  }, [banners, search, typeFilter, statusFilter])

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'error' || !summary) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">จัดการโฆษณาและแบนเนอร์</h1>
          <p className="text-sm text-gray-400">จัดการภาพประชาสัมพันธ์ โปรโมชั่น และป็อปอัปแคมเปญที่แสดงบนหน้าแรกของระบบ</p>
        </div>
        <Link
          to="/manage/banners/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มแบนเนอร์ใหม่
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-6 border-b border-gray-100">
        {typeTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setTypeFilter(tab.value)}
            className={`border-b-2 pb-3 text-sm font-medium ${
              typeFilter === tab.value ? 'border-rose-500 text-rose-500' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            แบนเนอร์ทั้งหมด
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.totalCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            กำลังแสดง
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.activeCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-gray-400" />
            หยุดแสดง
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.inactiveCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-5">
          <p className="flex items-center gap-2 text-sm text-gray-500">
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            หมดอายุ
          </p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{summary.expiredCount}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาชื่อแบนเนอร์ หรือ ลิงก์ปลายทาง..."
            className="min-w-[260px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | BannerStatus)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {visibleBanners.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบแบนเนอร์ที่ค้นหา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-gray-400">
                  <th className="pb-3 pr-4 font-medium">ลำดับ</th>
                  <th className="pb-3 pr-4 font-medium">ภาพตัวอย่าง</th>
                  <th className="pb-3 pr-4 font-medium">ชื่อแบนเนอร์</th>
                  <th className="pb-3 pr-4 font-medium">ประเภท</th>
                  <th className="pb-3 pr-4 font-medium">ลิงก์ปลายทาง</th>
                  <th className="pb-3 pr-4 font-medium">วันเริ่มต้น</th>
                  <th className="pb-3 pr-4 font-medium">วันสิ้นสุด</th>
                  <th className="pb-3 pr-4 font-medium">สถานะ</th>
                  <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleBanners.map((banner, index) => (
                  <tr key={banner.id} className="whitespace-nowrap">
                    <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <div className={`h-10 w-16 rounded-lg ${banner.previewTone}`} />
                    </td>
                    <td className="py-3 pr-4 font-medium text-gray-800">{banner.name}</td>
                    <td className="py-3 pr-4 text-gray-600">{typeLabels[banner.type]}</td>
                    <td className="py-3 pr-4 text-blue-500">{banner.targetLink}</td>
                    <td className="py-3 pr-4 text-gray-600">{formatDisplayDate(banner.startDate)}</td>
                    <td className="py-3 pr-4 text-gray-600">{formatDisplayDate(banner.endDate)}</td>
                    <td className="py-3 pr-4">
                      {banner.status === 'expired' ? (
                        <Badge variant="neutral">หมดอายุ</Badge>
                      ) : (
                        <Toggle checked={banner.status === 'active'} onChange={() => toggleActive(banner)} />
                      )}
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/manage/banners/${banner.id}/edit`}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                          aria-label="แก้ไข"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDelete(banner)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-rose-500"
                          aria-label="ลบ"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          แสดง 1-{visibleBanners.length} จาก {banners.length} รายการ
        </p>
      </div>
    </main>
  )
}

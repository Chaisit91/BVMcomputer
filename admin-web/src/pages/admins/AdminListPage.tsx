import { useEffect, useMemo, useState } from 'react'
import { FiEdit2, FiPlus, FiRefreshCw, FiSlash } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { StatChip } from '../../components/ui/SummaryCard'
import { getAdminSummary, getAdmins, updateAdminStatus } from '../../services/admin.service'
import { adminRoleMeta, type AdminAccount, type AdminRole, type AdminStatus, type AdminSummary } from '../../types/admin'

type LoadStatus = 'loading' | 'error' | 'success'

const roleFilterOptions: { value: 'all' | AdminRole; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  ...(Object.keys(adminRoleMeta) as AdminRole[]).map((value) => ({ value, label: adminRoleMeta[value].label })),
]

const statusFilterOptions: { value: 'all' | AdminStatus; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function getInitials(firstName: string) {
  return firstName.slice(0, 2).toUpperCase()
}

export function AdminListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<AdminSummary | null>(null)
  const [admins, setAdmins] = useState<AdminAccount[]>([])
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | AdminRole>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | AdminStatus>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getAdminSummary(), getAdmins()])
      .then(([summaryResult, adminsResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setAdmins(adminsResult)
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

  const handleSuspend = async (admin: AdminAccount) => {
    const nextStatus: AdminStatus = admin.status === 'inactive' ? 'active' : 'inactive'
    const confirmMessage =
      nextStatus === 'inactive'
        ? `ยืนยันการระงับการใช้งานของ ${admin.firstName} ${admin.lastName}?`
        : `ยืนยันการเปิดใช้งานบัญชีของ ${admin.firstName} ${admin.lastName}?`
    if (!window.confirm(confirmMessage)) return
    await updateAdminStatus(admin.id, nextStatus)
    setAdmins((prev) => prev.map((item) => (item.id === admin.id ? { ...item, status: nextStatus } : item)))
  }

  const clearFilters = () => {
    setSearch('')
    setRoleFilter('all')
    setStatusFilter('all')
  }

  const visibleAdmins = useMemo(() => {
    const query = search.trim().toLowerCase()
    return admins.filter((admin) => {
      const fullName = `${admin.firstName} ${admin.lastName}`.toLowerCase()
      const matchesSearch = query === '' || fullName.includes(query) || admin.email.toLowerCase().includes(query)
      const matchesRole = roleFilter === 'all' || admin.role === roleFilter
      const matchesStatus = statusFilter === 'all' || admin.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [admins, search, roleFilter, statusFilter])

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
          <h1 className="text-xl font-bold text-gray-900">บัญชีผู้ดูแล (Admin Accounts)</h1>
          <p className="text-sm text-gray-400">จัดการบัญชีผู้ดูแลระบบทั้งหมดและสิทธิ์การเข้าใช้งานภายในระบบ BVMcomputer</p>
        </div>
        <Link
          to="/admins/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มผู้ดูแลใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatChip dotColor="bg-gray-400" label="ผู้ดูแลทั้งหมด" value={`${summary.totalCount} คน`} />
        <StatChip dotColor="bg-emerald-500" label="กำลังใช้งาน (Active)" value={`${summary.activeCount} คน`} />
        <StatChip dotColor="bg-rose-500" label="ระงับการใช้งาน (Inactive)" value={`${summary.inactiveCount} คน`} />
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-5 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="ค้นหาด้วยชื่อ หรือ อีเมล..."
            className="min-w-[240px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
          />
          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value as 'all' | AdminRole)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {roleFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                บทบาท: {option.label}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as 'all' | AdminStatus)}
            className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400"
          >
            {statusFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                สถานะ: {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={clearFilters}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            <FiRefreshCw size={14} />
            ล้างตัวกรอง
          </button>
        </div>

        {visibleAdmins.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบผู้ดูแลที่ค้นหา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-gray-400">
                  <th className="pb-3 pr-4 font-medium">ลำดับ</th>
                  <th className="pb-3 pr-4 font-medium">ชื่อ-นามสกุล</th>
                  <th className="pb-3 pr-4 font-medium">อีเมล</th>
                  <th className="pb-3 pr-4 font-medium">บทบาท</th>
                  <th className="pb-3 pr-4 font-medium">สถานะ</th>
                  <th className="pb-3 pr-4 font-medium">เข้าใช้งานล่าสุด</th>
                  <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleAdmins.map((admin, index) => (
                  <tr key={admin.id} className="whitespace-nowrap">
                    <td className="py-3 pr-4 text-gray-500">{index + 1}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                          {getInitials(admin.firstName)}
                        </span>
                        <Link to={`/admins/${admin.id}/edit`} className="font-medium text-gray-800 hover:text-rose-500">
                          {admin.firstName} {admin.lastName}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{admin.email}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${adminRoleMeta[admin.role].badgeClass}`}>
                        {adminRoleMeta[admin.role].label}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="flex items-center gap-1.5 text-gray-600">
                        <span className={`h-1.5 w-1.5 rounded-full ${admin.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                        {admin.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{admin.lastActiveAt}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/admins/${admin.id}/edit`}
                          className="rounded-lg border border-gray-200 p-1.5 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
                          aria-label="แก้ไข"
                        >
                          <FiEdit2 size={16} />
                        </Link>
                        {admin.role !== 'super_admin' && (
                          <button
                            type="button"
                            onClick={() => handleSuspend(admin)}
                            className="rounded-lg border border-amber-200 bg-amber-50 p-1.5 text-amber-500 hover:bg-amber-100"
                            aria-label={admin.status === 'inactive' ? 'เปิดใช้งาน' : 'ระงับการใช้งาน'}
                          >
                            <FiSlash size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p className="mt-4 text-xs text-gray-400">
          แสดง 1-{visibleAdmins.length} จาก {admins.length} รายการ
        </p>
      </div>
    </main>
  )
}

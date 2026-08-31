import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiPlus, FiUserCheck, FiUserMinus, FiUserX, FiUsers } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { Badge } from '../../../components/ui/Badge'
import { SummaryCard } from '../../../components/ui/SummaryCard'
import { getCustomers, getCustomerSummary, updateCustomerStatus } from '../../../services/customer.service'
import type { Customer, CustomerStatus, CustomerSummary } from '../../../types/customer'

type LoadStatus = 'loading' | 'error' | 'success'

const statusOptions: { value: 'all' | CustomerStatus; label: string }[] = [
  { value: 'all', label: 'ทั้งหมด' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
]

function getStatusBadge(status: CustomerStatus): { label: string; variant: 'success' | 'neutral' | 'danger' } {
  if (status === 'active') return { label: 'Active', variant: 'success' }
  if (status === 'suspended') return { label: 'Suspended', variant: 'danger' }
  return { label: 'Inactive', variant: 'neutral' }
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export function UserListPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [summary, setSummary] = useState<CustomerSummary | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CustomerStatus>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([getCustomerSummary(), getCustomers()])
      .then(([summaryResult, customersResult]) => {
        if (!cancelled) {
          setSummary(summaryResult)
          setCustomers(customersResult)
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

  const toggleSuspend = async (customer: Customer) => {
    const nextStatus: CustomerStatus = customer.status === 'suspended' ? 'active' : 'suspended'
    await updateCustomerStatus(customer.id, nextStatus)
    setCustomers((prev) => prev.map((item) => (item.id === customer.id ? { ...item, status: nextStatus } : item)))
  }

  const visibleCustomers = useMemo(() => {
    const query = search.trim().toLowerCase()
    return customers.filter((customer) => {
      const matchesSearch =
        query === '' ||
        customer.fullName.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query) ||
        customer.customerCode.toLowerCase().includes(query) ||
        customer.phone.includes(query)
      const matchesStatus = statusFilter === 'all' || customer.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [customers, search, statusFilter])

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
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-gray-900">จัดการผู้ใช้ (User Management)</h1>
        <Link
          to="/manage/users/new"
          className="flex items-center gap-2 rounded-xl bg-rose-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-rose-600"
        >
          <FiPlus size={16} />
          เพิ่มผู้ใช้งานใหม่
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="ผู้ใช้ทั้งหมด" value={`${summary.totalUsers.toLocaleString()} คน`} icon={<FiUsers />} tone="blue" />
        <SummaryCard label="Active" value={`${summary.activeCount.toLocaleString()} คน`} icon={<FiUserCheck />} tone="emerald" />
        <SummaryCard label="Inactive" value={`${summary.inactiveCount.toLocaleString()} คน`} icon={<FiUserMinus />} tone="gray" />
        <SummaryCard label="Suspended" value={`${summary.suspendedCount.toLocaleString()} คน`} icon={<FiUserX />} tone="rose" />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ค้นหาผู้ใช้ (ชื่อ, อีเมล, รหัสลูกค้า, เบอร์โทร)..."
          className="min-w-[260px] flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | CustomerStatus)}
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-rose-400"
        >
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              สถานะ: {option.label}
            </option>
          ))}
        </select>
        <select
          disabled
          className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-400 outline-none"
        >
          <option>ทุกช่วงเวลาสมัคร</option>
        </select>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">ข้อมูลลูกค้า / สมาชิกทั้งหมด</h2>
          <button type="button" className="flex items-center gap-1.5 text-sm font-medium text-rose-500 hover:underline">
            <FiDownload size={14} />
            ส่งออกรายงาน (Export CSV)
          </button>
        </div>
        {visibleCustomers.length === 0 ? (
          <p className="py-12 text-center text-sm text-gray-400">ไม่พบผู้ใช้ที่ค้นหา</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="whitespace-nowrap text-xs text-gray-400">
                  <th className="pb-3 pr-4 font-medium">รหัสลูกค้า</th>
                  <th className="pb-3 pr-4 font-medium">ชื่อ-นามสกุล</th>
                  <th className="pb-3 pr-4 font-medium">Username</th>
                  <th className="pb-3 pr-4 font-medium">Email</th>
                  <th className="pb-3 pr-4 font-medium">เบอร์โทรศัพท์</th>
                  <th className="pb-3 pr-4 font-medium">วันที่สมัครสมาชิก</th>
                  <th className="pb-3 pr-4 font-medium">เข้าใช้งานล่าสุด</th>
                  <th className="pb-3 pr-4 font-medium">สถานะ</th>
                  <th className="pb-3 pr-4 font-medium">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {visibleCustomers.map((customer) => (
                  <tr key={customer.id} className="whitespace-nowrap">
                    <td className="py-3 pr-4 text-gray-500">{customer.customerCode}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-500 text-xs font-semibold text-white">
                          {getInitials(customer.fullName)}
                        </span>
                        <Link
                          to={`/manage/users/${customer.id}/edit`}
                          className="font-medium text-gray-800 hover:text-rose-500"
                        >
                          {customer.fullName}
                        </Link>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-gray-600">{customer.username}</td>
                    <td className="py-3 pr-4 text-gray-600">{customer.email}</td>
                    <td className="py-3 pr-4 text-gray-600">{customer.phone}</td>
                    <td className="py-3 pr-4 text-gray-600">{customer.registeredAt}</td>
                    <td className="py-3 pr-4 text-gray-600">{customer.lastActiveAt}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={getStatusBadge(customer.status).variant}>{getStatusBadge(customer.status).label}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/manage/users/${customer.id}/edit`}
                          className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
                        >
                          แก้ไข
                        </Link>
                        <button
                          type="button"
                          onClick={() => toggleSuspend(customer)}
                          className={`rounded-lg px-3 py-1.5 text-xs font-medium ${
                            customer.status === 'suspended'
                              ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-500 hover:bg-rose-100'
                          }`}
                        >
                          {customer.status === 'suspended' ? 'ปลดระงับ' : 'ระงับ'}
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
          แสดง 1-{visibleCustomers.length} จาก {summary.totalUsers.toLocaleString()} รายการ
        </p>
      </div>
    </main>
  )
}

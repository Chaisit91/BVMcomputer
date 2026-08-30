import { useEffect, useState } from 'react'
import { StatCard } from '../../components/dashboard/StatCard'
import { CategoryCard } from '../../components/dashboard/CategoryCard'
import { MiniStatCard } from '../../components/dashboard/MiniStatCard'
import { MiniBarChart } from '../../components/dashboard/MiniBarChart'
import { RecentOrdersTable } from '../../components/dashboard/RecentOrdersTable'
import { LowStockList } from '../../components/dashboard/LowStockList'
import { TopProductsTable } from '../../components/dashboard/TopProductsTable'
import { getDashboardData } from '../../services/dashboard.service'
import type { DashboardData } from '../../types/dashboard'

type LoadStatus = 'loading' | 'error' | 'success'

export function DashboardPage() {
  const [status, setStatus] = useState<LoadStatus>('loading')
  const [data, setData] = useState<DashboardData | null>(null)
  const [reportRange, setReportRange] = useState<'monthly' | 'daily'>('monthly')

  useEffect(() => {
    let cancelled = false

    getDashboardData()
      .then((result) => {
        if (!cancelled) {
          setData(result)
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

  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-400">กำลังโหลดข้อมูล...</div>
    )
  }

  if (status === 'error' || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-rose-500">
        โหลดข้อมูลแดชบอร์ดไม่สำเร็จ กรุณาลองใหม่
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">สวัสดี, แอดมิน</h1>
          <p className="text-sm text-gray-400">ภาพรวมข้อมูลประจำวันที่ 24 ตุลาคม 2566</p>
        </div>
        <span className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm text-gray-600">
          24 ต.ค. 2023 - จันทร์
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.stats.map((stat) => (
          <StatCard key={stat.id} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">ภาพรวมหมวดหมู่สินค้า</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {data.categories.map((category) => (
              <CategoryCard key={category.id} {...category} />
            ))}
          </div>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {data.miniStats.map((mini) => (
              <MiniStatCard key={mini.id} {...mini} />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-1 text-sm font-semibold text-gray-800">วิเคราะห์ยอดขาย 7 วันล่าสุด</h2>
          <p className="mb-4 text-xs text-gray-400">ยอดขายเฉลี่ยต่อวัน ~85,000</p>
          <MiniBarChart data={data.weeklyTrend} />
        </section>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <section className="rounded-2xl border border-gray-100 bg-white p-5 xl:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">คำสั่งซื้อล่าสุด</h2>
          <RecentOrdersTable orders={data.recentOrders} />
        </section>

        <section className="rounded-2xl border border-gray-100 bg-white p-5">
          <h2 className="mb-4 text-sm font-semibold text-gray-800">สินค้าใกล้หมด / หมดสต็อก</h2>
          <LowStockList items={data.lowStock} />
        </section>
      </div>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-800">รายงานยอดขาย</h2>
          <div className="flex rounded-lg bg-gray-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setReportRange('monthly')}
              className={`rounded-md px-3 py-1.5 ${
                reportRange === 'monthly' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              รายเดือน
            </button>
            <button
              type="button"
              onClick={() => setReportRange('daily')}
              className={`rounded-md px-3 py-1.5 ${
                reportRange === 'daily' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-500'
              }`}
            >
              รายวัน
            </button>
          </div>
        </div>
        <MiniBarChart data={reportRange === 'monthly' ? data.monthlyTrend : data.weeklyTrend} height={200} />
        <div className="mt-4 flex flex-wrap gap-8 border-t border-gray-50 pt-4 text-sm">
          <div>
            <p className="text-xs text-gray-400">ยอดขายรวมทั้งหมด</p>
            <p className="font-semibold text-gray-800">11,970,000</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">เดือนที่ขายดีที่สุด</p>
            <p className="font-semibold text-gray-800">ตุลาคม</p>
          </div>
          <div>
            <p className="text-xs text-gray-400">เปลี่ยนแปลงจากเดือนก่อน</p>
            <p className="font-semibold text-emerald-500">+18.3%</p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-gray-800">สินค้าขายดีประจำเดือน</h2>
        <TopProductsTable products={data.topProducts} />
      </section>
    </main>
  )
}

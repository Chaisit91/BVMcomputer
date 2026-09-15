import type { ReactNode } from 'react'
import { FiAlertTriangle, FiBox, FiCreditCard, FiShoppingBag } from 'react-icons/fi'
import type { StatCardData } from '../../types/dashboard'

const icons: Record<StatCardData['icon'], ReactNode> = {
  box: <FiBox />,
  wallet: <FiCreditCard />,
  cart: <FiShoppingBag />,
  alert: <FiAlertTriangle />,
}

export function StatCard({ label, value, change, changeLabel, icon }: StatCardData) {
  const positive = change >= 0

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-500">
          {icons[icon]}
        </span>
      </div>
      <p className={`mt-3 text-xs font-medium ${positive ? 'text-emerald-500' : 'text-rose-500'}`}>
        {positive ? '↑' : '↓'} {Math.abs(change)}% {changeLabel}
      </p>
    </div>
  )
}

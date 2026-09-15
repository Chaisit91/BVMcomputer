import type { ReactNode } from 'react'
import { FiBox, FiCpu, FiHardDrive, FiLayers, FiMonitor, FiPackage, FiWind, FiZap } from 'react-icons/fi'
import type { CategoryStat } from '../../types/dashboard'

const icons: Record<CategoryStat['icon'], ReactNode> = {
  cpu: <FiCpu />,
  gpu: <FiMonitor />,
  motherboard: <FiLayers />,
  ram: <FiBox />,
  storage: <FiHardDrive />,
  psu: <FiZap />,
  case: <FiPackage />,
  cooling: <FiWind />,
}

export function CategoryCard({ name, count, percent, icon }: CategoryStat) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
          {icons[icon]}
        </span>
        <span className="text-xs font-medium text-gray-400">{percent}%</span>
      </div>
      <p className="mt-3 text-sm font-medium text-gray-800">{name}</p>
      <p className="text-xs text-gray-400">{count} รายการ</p>
      <div className="mt-2 h-1.5 w-full rounded-full bg-gray-100">
        <div className="h-1.5 rounded-full bg-emerald-400" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

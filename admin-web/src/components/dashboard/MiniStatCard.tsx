import type { ReactNode } from 'react'
import { FiCpu, FiPackage } from 'react-icons/fi'
import type { MiniStat } from '../../types/dashboard'

const icons: Record<MiniStat['icon'], ReactNode> = {
  package: <FiPackage />,
  cpu: <FiCpu />,
}

export function MiniStatCard({ name, count, unit, icon }: MiniStat) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4">
      <div>
        <p className="text-sm font-medium text-gray-800">{name}</p>
        <p className="text-xs text-gray-400">
          {count} {unit}
        </p>
      </div>
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-500">
        {icons[icon]}
      </span>
    </div>
  )
}

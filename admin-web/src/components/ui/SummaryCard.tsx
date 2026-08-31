import type { ReactNode } from 'react'

type SummaryTone = 'rose' | 'amber' | 'emerald' | 'gray' | 'blue'

const toneStyles: Record<SummaryTone, string> = {
  rose: 'bg-rose-50 text-rose-500',
  amber: 'bg-amber-50 text-amber-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  gray: 'bg-gray-100 text-gray-500',
  blue: 'bg-blue-50 text-blue-500',
}

interface SummaryCardProps {
  label: string
  value: string
  icon: ReactNode
  tone: SummaryTone
}

export function SummaryCard({ label, value, icon, tone }: SummaryCardProps) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5">
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${toneStyles[tone]}`}>{icon}</span>
    </div>
  )
}

import type { ReactNode } from 'react'

type SummaryTone = 'rose' | 'amber' | 'emerald' | 'gray' | 'blue' | 'purple'

const toneStyles: Record<SummaryTone, string> = {
  rose: 'bg-rose-50 text-rose-500',
  amber: 'bg-amber-50 text-amber-500',
  emerald: 'bg-emerald-50 text-emerald-500',
  gray: 'bg-gray-100 text-gray-500',
  blue: 'bg-blue-50 text-blue-500',
  purple: 'bg-purple-50 text-purple-500',
}

interface SummaryCardProps {
  label: string
  value: string
  icon: ReactNode
  tone: SummaryTone
}

export function SummaryCard({ label, value, icon, tone }: SummaryCardProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${toneStyles[tone]}`}>
          {icon}
        </span>
      </div>
      <p className="mt-4 text-3xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  )
}

interface StatChipProps {
  label: string
  value: string
  dotColor: string
}

export function StatChip({ label, value, dotColor }: StatChipProps) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${dotColor}`} />
        <p className="text-xs font-medium text-gray-500">{label}</p>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-gray-900">{value}</p>
    </div>
  )
}

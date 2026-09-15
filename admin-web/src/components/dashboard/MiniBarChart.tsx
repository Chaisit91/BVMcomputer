import type { SalesTrendPoint } from '../../types/dashboard'

interface MiniBarChartProps {
  data: SalesTrendPoint[]
  height?: number
}

export function MiniBarChart({ data, height = 120 }: MiniBarChartProps) {
  const max = Math.max(...data.map((point) => point.value), 1)
  const barAreaHeight = height - 20

  return (
    <div className="flex gap-2" style={{ height }}>
      {data.map((point) => (
        <div key={point.label} className="flex flex-1 flex-col items-center justify-end gap-1.5" style={{ height }}>
          <div
            className="w-full rounded-t-md bg-rose-400"
            style={{ height: Math.max((point.value / max) * barAreaHeight, 2) }}
          />
          <span className="text-[10px] text-gray-400">{point.label}</span>
        </div>
      ))}
    </div>
  )
}

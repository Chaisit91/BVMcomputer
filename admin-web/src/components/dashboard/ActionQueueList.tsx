import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheckCircle } from 'react-icons/fi'
import type { ActionItem } from '../../types/dashboard'

export function ActionQueueList({ items }: { items: ActionItem[] }) {
  const pending = items.filter((item) => item.count > 0)

  if (pending.length === 0) {
    return (
      <div className="flex items-center gap-2 py-8 text-sm text-gray-400">
        <FiCheckCircle className="text-emerald-500" />
        ไม่มีงานค้างตอนนี้
      </div>
    )
  }

  return (
    <ul className="divide-y divide-gray-50">
      {pending.map((item) => (
        <li key={item.id} className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <span
              className={`flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs font-bold text-white ${
                item.tone === 'urgent' ? 'bg-rose-500' : 'bg-amber-500'
              }`}
            >
              {item.count}
            </span>
            <p className="text-sm font-medium text-gray-800">{item.label}</p>
          </div>
          <Link to={item.href} className="flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-600">
            ไปดู <FiArrowRight />
          </Link>
        </li>
      ))}
    </ul>
  )
}

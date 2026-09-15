import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

interface StatusPageProps {
  code: string
  title: string
  message: string
  icon: ReactNode
  actionLabel: string
  actionTo?: string
  onAction?: () => void
}

export function StatusPage({ code, title, message, icon, actionLabel, actionTo, onAction }: StatusPageProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 px-4 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-500">{icon}</span>
      <p className="mt-5 text-sm font-semibold tracking-wide text-rose-500">{code}</p>
      <h1 className="mt-2 text-xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 max-w-sm text-sm text-gray-400">{message}</p>

      {actionTo ? (
        <Link
          to={actionTo}
          className="mt-6 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          {actionLabel}
        </Link>
      ) : (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 rounded-xl bg-rose-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-rose-600"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

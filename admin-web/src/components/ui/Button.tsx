import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean
}

export function Button({ loading, disabled, children, className = '', ...props }: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={`btn-primary w-full py-3 ${className}`}
      {...props}
    >
      {loading ? 'กำลังเข้าสู่ระบบ...' : children}
    </button>
  )
}

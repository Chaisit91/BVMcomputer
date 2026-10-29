import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
  error?: string
  rightElement?: ReactNode
  // Opt-in — defaults to the original light styling so forgot-password/
  // set-password (the other two pages sharing this component) are untouched.
  tone?: 'light' | 'dark'
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, icon, error, rightElement, id, name, className, tone = 'light', ...props }, ref) => {
    const inputId = id ?? name
    const isDark = tone === 'dark'

    return (
      <div className={className}>
        <label htmlFor={inputId} className={`mb-1.5 block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          {label}
        </label>
        <div className="relative">
          <span className={`pointer-events-none absolute inset-y-0 left-3 flex items-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            {icon}
          </span>
          <input
            id={inputId}
            name={name}
            ref={ref}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-xl border py-2.5 pl-10 text-sm outline-none focus:ring-2 ${
              rightElement ? 'pr-10' : 'pr-3'
            } ${
              isDark
                ? 'border-white/10 bg-white/5 text-white placeholder:text-gray-500 hover:border-white/20 focus:border-rose-400/70 focus:ring-rose-500/20'
                : 'border-gray-200 bg-gray-50 text-gray-900 placeholder:text-gray-400 hover:border-gray-300 focus:border-rose-400 focus:ring-rose-100'
            } ${error ? '!border-red-400' : ''}`}
            {...props}
          />
          {rightElement && (
            <span className="absolute inset-y-0 right-3 flex items-center">{rightElement}</span>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
      </div>
    )
  },
)
TextField.displayName = 'TextField'

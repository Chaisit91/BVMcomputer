import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  icon: ReactNode
  error?: string
  rightElement?: ReactNode
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, icon, error, rightElement, id, name, className, ...props }, ref) => {
    const inputId = id ?? name

    return (
      <div className={className}>
        <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-gray-700">
          {label}
        </label>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
            {icon}
          </span>
          <input
            id={inputId}
            name={name}
            ref={ref}
            aria-invalid={Boolean(error)}
            className={`w-full rounded-xl border bg-gray-50 py-2.5 pl-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-100 ${
              rightElement ? 'pr-10' : 'pr-3'
            } ${error ? 'border-red-400' : 'border-gray-200'}`}
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

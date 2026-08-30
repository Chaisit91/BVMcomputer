import { forwardRef, type InputHTMLAttributes } from 'react'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, id, name, ...props }, ref) => {
    const inputId = id ?? name

    return (
      <label htmlFor={inputId} className="flex select-none items-center gap-2 text-sm text-gray-600">
        <input
          id={inputId}
          name={name}
          ref={ref}
          type="checkbox"
          className="h-4 w-4 rounded border-gray-300 text-rose-500 focus:ring-rose-400"
          {...props}
        />
        {label}
      </label>
    )
  },
)
Checkbox.displayName = 'Checkbox'

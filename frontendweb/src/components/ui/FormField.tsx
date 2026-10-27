import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react';
import { cn } from '../../lib/cn';

interface FormFieldProps {
  label: string;
  required?: boolean;
  /** Small grey note after the label, e.g. "(ไม่บังคับ)". */
  hint?: string;
  /** Validation message (e.g. from react-hook-form's `errors.x?.message`). */
  error?: string;
  className?: string;
  children: ReactNode;
}

/** Label + control + error message — wrap any input so every form lays out and reports errors the same way. */
export function FormField({ label, required, hint, error, className, children }: FormFieldProps) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-brand"> *</span>}
        {hint && <span className="font-normal text-slate-400"> {hint}</span>}
      </span>
      {children}
      {error && (
        <span role="alert" className="text-xs text-red-500">
          {error}
        </span>
      )}
    </label>
  );
}

const controlClass = 'h-11 w-full rounded-lg border px-3.5 text-sm text-ink outline-none transition-colors';

function stateClass(invalid?: boolean) {
  return invalid ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-brand';
}

interface TextInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

/** Text input styled for forms; forwards its ref so react-hook-form's `register` works directly. */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({ invalid, className, ...props }, ref) => (
  <input ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass, stateClass(invalid), className)} {...props} />
));
TextInput.displayName = 'TextInput';

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
}

export const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(({ invalid, className, ...props }, ref) => (
  <select ref={ref} aria-invalid={invalid || undefined} className={cn(controlClass, stateClass(invalid), className)} {...props} />
));
SelectInput.displayName = 'SelectInput';

import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFacebookF } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi';
import { useAppDispatch } from '../../app/hooks';
import { login } from '../../features/auth/authSlice';
import { cn } from '../../lib/cn';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

// Full local@domain.tld shape — rejects "admin@gmail" (no TLD), accepts "admin@gmail.com".
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface LoginModalProps {
  /** Called right after a (mock) successful login — used to close the dialog. */
  onLoggedIn: () => void;
}

/** Login dialog rendered inside the AccountMenu's Dialog.Root. */
export function LoginModal({ onLoggedIn }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    // Validate on blur first (no error until the field has been touched and
    // left), then re-validate on every change so a fixed value clears the
    // error immediately — refocusing alone never clears it, only a valid value does.
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: { email: '', password: '', remember: false },
  });

  const onSubmit = handleSubmit((data) => {
    // TODO(backend): call the real login endpoint once it exists. For now,
    // any non-empty email/password logs you in so the rest of the site can
    // be built and tested behind an authenticated state.
    dispatch(login(data.email));
    onLoggedIn();
  });

  return (
    <Dialog.Portal>
      {/* A plain div, not Dialog.Overlay: Radix only renders its own Overlay when
          modal={true}, which would also relock page scroll — we want the dark
          backdrop without losing the ability to scroll the page behind it. */}
      <div className="fixed inset-0 z-50 bg-black/60" aria-hidden="true" />
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl outline-none focus-visible:ring-2 focus-visible:ring-brand/40 focus-visible:ring-offset-2">
        <div className="relative px-6 pb-6 pt-8">
          <Dialog.Close
            aria-label="ปิด"
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 outline-none hover:bg-slate-100 hover:text-ink focus-visible:ring-2 focus-visible:ring-brand/40"
          >
            <FiX size={18} aria-hidden="true" />
          </Dialog.Close>

          <Dialog.Title className="text-center text-lg font-bold text-ink">เข้าสู่ระบบ</Dialog.Title>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            <div
              className={cn(
                'auth-input-wrap flex h-[50px] w-full items-center gap-2 rounded-[25px] border px-4',
                errors.email ? 'border-red-500' : 'border-slate-200',
              )}
            >
              <FiMail size={18} strokeWidth={1.8} className="shrink-0 text-[#64748B]" aria-hidden="true" />
              <input
                type="email"
                placeholder="อีเมล"
                autoComplete="email"
                className="auth-input h-full w-full appearance-none rounded-[25px] border-0 bg-transparent text-[15px] font-medium text-ink placeholder:text-[15px] placeholder:font-normal placeholder:text-[#7C8DA6] focus:outline-none focus:ring-0"
                {...register('email', { required: true, pattern: EMAIL_PATTERN })}
              />
            </div>

            <div
              className={cn(
                'auth-input-wrap flex h-[50px] w-full items-center gap-2 rounded-[25px] border px-4',
                errors.password ? 'border-red-500' : 'border-slate-200',
              )}
            >
              <FiLock size={18} strokeWidth={1.8} className="shrink-0 text-[#64748B]" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่าน"
                autoComplete="current-password"
                className="auth-input h-full w-full appearance-none rounded-[25px] border-0 bg-transparent text-[15px] font-medium text-ink placeholder:text-[15px] placeholder:font-normal placeholder:text-[#7C8DA6] focus:outline-none focus:ring-0"
                {...register('password', { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#7C8DA6] transition-colors hover:bg-slate-100"
              >
                {showPassword ? <FiEyeOff size={16} aria-hidden="true" /> : <FiEye size={16} aria-hidden="true" />}
              </button>
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-500">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                {...register('remember')}
              />
              จำฉันเข้าระบบ
            </label>

            <button
              type="submit"
              className="mt-1 flex h-[50px] w-full items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="mt-3 text-center text-xs text-slate-400">หรือเข้าสู่ระบบด้วย</p>

          <div className="mt-3 flex flex-col gap-3">
            <button
              type="button"
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#3B5998] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                <FaFacebookF size={11} className="text-[#1877F2]" aria-hidden="true" />
              </span>
              เข้าสู่ระบบด้วย Facebook
            </button>
            <button
              type="button"
              className="flex h-[50px] w-full items-center justify-center gap-2 rounded-full bg-[#4285F4] text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white">
                <FcGoogle size={14} aria-hidden="true" />
              </span>
              เข้าสู่ระบบด้วย Google
            </button>
          </div>

          <p className="mt-3 text-center text-xs text-slate-500">
            ไม่ใช่สมาชิก?{' '}
            <a href="#register" className="font-medium text-brand hover:text-brand-dark">
              สมัครสมาชิก
            </a>
          </p>
        </div>

        <div className="border-t border-slate-100 bg-slate-50 py-3 text-center">
          <a href="#forgot-password" className="text-xs text-slate-500 hover:text-ink">
            ลืมรหัสผ่าน ?
          </a>
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}

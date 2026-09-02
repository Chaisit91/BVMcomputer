import * as Dialog from '@radix-ui/react-dialog';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaFacebookF } from 'react-icons/fa';
import { FiEye, FiEyeOff, FiLock, FiMail, FiX } from 'react-icons/fi';
import { SiGoogle } from 'react-icons/si';
import { useAppDispatch } from '../../app/hooks';
import { login } from '../../features/auth/authSlice';

interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

interface LoginModalProps {
  /** Called right after a (mock) successful login — used to close the dialog. */
  onLoggedIn: () => void;
}

/** Login dialog rendered inside the AccountMenu's Dialog.Root. */
export function LoginModal({ onLoggedIn }: LoginModalProps) {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);
  const { register, handleSubmit } = useForm<LoginFormValues>({
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
      <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl">
        <div className="relative px-6 pb-6 pt-8">
          <Dialog.Close
            aria-label="ปิด"
            className="absolute right-4 top-4 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-ink"
          >
            <FiX size={18} aria-hidden="true" />
          </Dialog.Close>

          <Dialog.Title className="text-center text-lg font-bold text-ink">เข้าสู่ระบบ</Dialog.Title>

          <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-3" noValidate>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 focus-within:border-ink">
              <FiMail className="shrink-0 text-slate-400" aria-hidden="true" />
              <input
                type="email"
                placeholder="อีเมล"
                autoComplete="email"
                className="w-full bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                {...register('email', { required: true })}
              />
            </div>

            <div className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2.5 focus-within:border-ink">
              <FiLock className="shrink-0 text-slate-400" aria-hidden="true" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="รหัสผ่าน"
                autoComplete="current-password"
                className="w-full bg-transparent text-sm text-ink placeholder:text-slate-400 focus:outline-none"
                {...register('password', { required: true })}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                className="shrink-0 text-slate-400 hover:text-ink"
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
              className="mt-1 rounded-full bg-brand py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-400">หรือเข้าสู่ระบบด้วย</p>

          <div className="mt-3 flex flex-col gap-2">
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#1877F2] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <FaFacebookF size={14} aria-hidden="true" />
              เข้าสู่ระบบด้วย Facebook
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-full bg-[#4285F4] py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            >
              <SiGoogle size={14} aria-hidden="true" />
              เข้าสู่ระบบด้วย Google
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-slate-500">
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

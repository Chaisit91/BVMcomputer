import * as Dialog from '@radix-ui/react-dialog';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { FiLogOut, FiPackage, FiUser } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { getInitials } from '../../lib/format';
import { LoginModal } from './LoginModal';

const triggerClassName =
  'flex h-11 w-11 items-center justify-center rounded-full bg-[#F3F5F8] text-ink transition-colors hover:bg-slate-200';
const itemClassName =
  'flex h-11 items-center gap-3 rounded-lg px-4 text-sm font-medium text-[#253047] outline-none hover:bg-slate-50 focus:bg-slate-50';

export function AccountMenu() {
  const dispatch = useAppDispatch();
  const [open, setOpen] = useState(false);
  const { isAuthenticated, email, user } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return (
      <DropdownMenu.Root modal={false}>
        <DropdownMenu.Trigger asChild>
          <button type="button" aria-label={email ?? 'บัญชีของฉัน'} className={triggerClassName}>
            <span className="text-lg font-semibold leading-none text-[#253047]">{getInitials(email ?? '')}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={8}
            className="z-50 w-64 rounded-xl border border-slate-100 bg-white p-1.5 shadow-card"
          >
            <div className="px-4 pb-2 pt-1.5">
              {user?.name && <p className="truncate text-sm font-semibold text-ink">{user.name}</p>}
              <p className="truncate text-xs text-slate-400">{email}</p>
            </div>
            <DropdownMenu.Separator className="mb-1.5 border-t border-slate-100" />
            <DropdownMenu.Item asChild>
              <Link to="/account/profile" className={itemClassName}>
                <FiUser size={19} strokeWidth={1.8} className="shrink-0 text-[#253047]" aria-hidden="true" />
                บัญชีของฉัน
              </Link>
            </DropdownMenu.Item>
            <DropdownMenu.Item asChild>
              <a href="#orders" className={itemClassName}>
                <FiPackage size={19} strokeWidth={1.8} className="shrink-0 text-[#253047]" aria-hidden="true" />
                คำสั่งซื้อของฉัน
              </a>
            </DropdownMenu.Item>
            <DropdownMenu.Separator className="my-1.5 border-t border-slate-100" />
            <DropdownMenu.Item asChild>
              <button
                type="button"
                onClick={() => void dispatch(logoutUser())}
                className={`${itemClassName} w-full text-[#E60012] hover:bg-red-50 focus:bg-red-50`}
              >
                <FiLogOut size={19} strokeWidth={1.8} className="shrink-0 text-[#E60012]" aria-hidden="true" />
                ออกจากระบบ
              </button>
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    );
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen} modal={false}>
      <Dialog.Trigger asChild>
        <button type="button" aria-label="เข้าสู่ระบบ" className={triggerClassName}>
          <FiUser size={20} aria-hidden="true" />
        </button>
      </Dialog.Trigger>
      {/* Mounted only while open, so it's a fresh component (fresh react-hook-form
          state) every time — closing and reopening never carries over stale
          validation errors from the last attempt. */}
      {open && <LoginModal onLoggedIn={() => setOpen(false)} />}
    </Dialog.Root>
  );
}

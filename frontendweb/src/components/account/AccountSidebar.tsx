import type { IconType } from 'react-icons';
import {
  FiCreditCard,
  FiFileText,
  FiHeart,
  FiLock,
  FiLogOut,
  FiMapPin,
  FiShoppingBag,
  FiTruck,
  FiUser,
} from 'react-icons/fi';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { logoutUser } from '../../features/auth/authSlice';
import { cn } from '../../lib/cn';

interface AccountNavItem {
  label: string;
  icon: IconType;
  /** Only set for pages that exist — the rest are listed but disabled until they're built. */
  to?: string;
}

const navGroups: { title: string; items: AccountNavItem[] }[] = [
  {
    title: 'รายการของฉัน',
    items: [
      { label: 'คำสั่งซื้อ', icon: FiShoppingBag },
      { label: 'สินค้าที่ถูกใจ', icon: FiHeart },
      { label: 'เช็กสถานะการจัดส่ง', icon: FiTruck },
    ],
  },
  {
    title: 'บัญชีของฉัน',
    items: [
      { label: 'ข้อมูลส่วนตัว', icon: FiUser, to: '/account/profile' },
      { label: 'ที่อยู่สำหรับจัดส่ง', icon: FiMapPin },
      { label: 'ที่อยู่ออกใบกำกับภาษี', icon: FiFileText },
      { label: 'ช่องทางชำระเงิน', icon: FiCreditCard },
      { label: 'เปลี่ยนรหัสผ่าน', icon: FiLock },
    ],
  },
];

const itemClass = 'relative flex h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors';

/** Left column shared by every account page: the account sections and log out. */
export function AccountSidebar() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    navigate('/');
  };

  return (
    <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-20">
      <nav aria-label="เมนูบัญชีของฉัน" className="flex flex-col gap-5">
        {navGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-1.5 px-3 text-xs font-semibold text-slate-400">{group.title}</p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map(({ label, icon: Icon, to }) => (
                <li key={label}>
                  {to ? (
                    <NavLink
                      to={to}
                      className={({ isActive }) =>
                        cn(itemClass, isActive ? 'bg-red-50 text-brand' : 'text-ink hover:bg-slate-50 hover:text-brand')
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <span className="absolute -left-5 top-2 h-7 w-1 rounded-r-full bg-brand" aria-hidden="true" />}
                          <Icon size={18} aria-hidden="true" />
                          {label}
                        </>
                      )}
                    </NavLink>
                  ) : (
                    // TODO(build-page): no page yet — listed so the account structure is complete, but not clickable.
                    <span aria-disabled="true" className={cn(itemClass, 'cursor-not-allowed text-slate-400')}>
                      <Icon size={18} aria-hidden="true" />
                      {label}
                      <span className="ml-auto rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                        เร็วๆ นี้
                      </span>
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div className="border-t border-slate-100 pt-3">
          <button type="button" onClick={() => void handleLogout()} className={cn(itemClass, 'text-brand hover:bg-red-50')}>
            <FiLogOut size={18} aria-hidden="true" />
            ออกจากระบบ
          </button>
        </div>
      </nav>
    </aside>
  );
}

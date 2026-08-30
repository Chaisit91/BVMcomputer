import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FiUser } from 'react-icons/fi';
import { HeaderIconLabel } from './HeaderIconLabel';

const menuItems = [
  { id: 'login', label: 'เข้าสู่ระบบ', href: '#login' },
  { id: 'register', label: 'สมัครสมาชิก', href: '#register' },
  { id: 'orders', label: 'คำสั่งซื้อของฉัน', href: '#orders' },
];

export function AccountMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button className="flex flex-col items-center rounded-lg px-2.5 py-1.5 text-ink hover:bg-slate-100">
          <HeaderIconLabel icon={<FiUser size={20} aria-hidden="true" />} label="เข้าสู่ระบบ" />
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-card"
        >
          {menuItems.map((item) => (
            <DropdownMenu.Item key={item.id} asChild>
              <a
                href={item.href}
                className="block cursor-pointer select-none rounded-lg px-3 py-2 text-sm text-ink outline-none hover:bg-slate-100 focus:bg-slate-100"
              >
                {item.label}
              </a>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

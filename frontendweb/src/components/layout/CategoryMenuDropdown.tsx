import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import type { ReactNode } from 'react';
import { FiChevronRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { categoryMenuItems } from '../../data/categoryMenuItems';

const menuItemClassName =
  'flex cursor-pointer select-none items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-ink outline-none hover:bg-slate-50 focus:bg-slate-50';

interface CategoryMenuDropdownProps {
  /** The trigger element (a button) — rendered as-is via Radix's `asChild`. */
  trigger: ReactNode;
  align?: 'start' | 'center' | 'end';
}

/** The "หมวดหมู่สินค้า" dropdown menu, shared by the normal CategoryNav bar and the compact sticky header. */
export function CategoryMenuDropdown({ trigger, align = 'start' }: CategoryMenuDropdownProps) {
  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>{trigger}</DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align={align}
          sideOffset={8}
          className="z-50 flex max-h-[420px] w-80 flex-col overflow-y-auto rounded-xl border border-slate-200 bg-white p-2 shadow-card"
        >
          {categoryMenuItems.map((item) => {
            const content = (
              <>
                <span className="flex min-w-0 items-center gap-3">
                  <item.icon size={item.iconSize ?? 18} className="shrink-0 text-[#2B3445]" aria-hidden="true" />
                  <span className="truncate">{item.label}</span>
                </span>
                {item.hasSubmenu && <FiChevronRight size={14} className="shrink-0 text-slate-300" aria-hidden="true" />}
              </>
            );
            return (
              <DropdownMenu.Item key={item.id} asChild>
                {item.to ? (
                  <Link to={item.to} className={menuItemClassName}>
                    {content}
                  </Link>
                ) : (
                  <a
                    href={item.href}
                    onClick={item.disabled ? (e) => e.preventDefault() : undefined}
                    className={menuItemClassName}
                  >
                    {content}
                  </a>
                )}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronDown, FiGrid } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { SearchBar } from './SearchBar';
import { WishlistButton } from './WishlistButton';
import { CartButton } from './CartButton';
import { AccountMenu } from './AccountMenu';
import { CategoryMenuDropdown } from './CategoryMenuDropdown';
import { cn } from '../../lib/cn';

// How far past the top the page needs to scroll before the compact bar slides in.
const SCROLL_THRESHOLD = 96;

/**
 * A second, compact header bar — always mounted, `position: fixed` so it never
 * reflows the page (no layout shift). Hidden above the viewport by default and
 * slid into view once the user scrolls past the normal Header + CategoryNav.
 */
export function StickyHeader() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={cn(
        'fixed inset-x-0 top-0 z-40 border-b border-slate-100 bg-white shadow-sm transition-transform duration-300 ease-out',
        visible ? 'translate-y-0' : '-translate-y-full',
        !visible && 'pointer-events-none',
      )}
    >
      <Container className="flex items-center gap-3 py-2.5">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            M
          </span>
          <span className="hidden text-xl font-bold tracking-tight text-ink sm:block">
            MAX<span className="text-brand">COM</span>
          </span>
        </Link>

        <CategoryMenuDropdown
          trigger={
            <button
              type="button"
              aria-label="หมวดหมู่สินค้า"
              tabIndex={visible ? 0 : -1}
              className="flex shrink-0 items-center gap-0.5 rounded-lg bg-[#F3F5F8] px-2.5 py-2 text-ink transition-colors hover:bg-slate-200"
            >
              <FiGrid size={18} aria-hidden="true" />
              <FiChevronDown size={14} className="text-slate-400" aria-hidden="true" />
            </button>
          }
        />

        <div className="flex flex-1 justify-center">
          <SearchBar className="w-full md:max-w-xl" />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <WishlistButton />
          <CartButton />
          <AccountMenu />
        </div>
      </Container>
    </div>
  );
}

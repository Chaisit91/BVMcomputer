import { Container } from '../ui/Container';
import { SearchBar } from './SearchBar';
import { AccountMenu } from './AccountMenu';
import { WishlistButton } from './WishlistButton';
import { CartButton } from './CartButton';

export function Header() {
  return (
    <div className="bg-white">
      <Container className="flex flex-wrap items-center gap-3 py-3 md:flex-nowrap md:gap-6">
        <a href="#top" className="order-1 flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand text-lg font-bold text-white">
            M
          </span>
          <span className="text-xl font-bold tracking-tight text-ink">
            MAX<span className="text-brand">COM</span>
          </span>
        </a>

        <div className="order-2 ml-auto flex shrink-0 items-center gap-2 md:order-3 md:ml-0">
          <WishlistButton />
          <CartButton />
          <AccountMenu />
        </div>

        <div className="order-3 w-full md:order-2 md:flex md:flex-1 md:justify-center">
          <SearchBar className="w-full md:max-w-xl" />
        </div>
      </Container>
    </div>
  );
}

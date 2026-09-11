import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { CategoryNav } from './CategoryNav';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

/** Shared site chrome (Header + category nav + Footer) around every routed page. */
export function Layout() {
  return (
    <div id="top" className="flex min-h-screen flex-col bg-white">
      <Header />
      <CategoryNav />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      <CartDrawer />
    </div>
  );
}

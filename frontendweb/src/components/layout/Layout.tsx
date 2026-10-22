import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { restoreSession } from '../../features/auth/authSlice';
import { Header } from './Header';
import { CategoryNav } from './CategoryNav';
import { StickyHeader } from './StickyHeader';
import { Footer } from './Footer';
import { CartDrawer } from '../cart/CartDrawer';

/** Shared site chrome (Header + category nav + Footer) around every routed page. */
export function Layout() {
  const dispatch = useAppDispatch();

  // Confirm a stored login with the backend once per page load.
  useEffect(() => {
    void dispatch(restoreSession());
  }, [dispatch]);

  return (
    <div id="top" className="flex min-h-screen flex-col bg-white">
      <StickyHeader />

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

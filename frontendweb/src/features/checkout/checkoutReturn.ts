import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { selectAddressForCheckout } from './checkoutSlice';

/**
 * Router state put on the account address pages when the customer comes from checkout.
 * Living in history state (not Redux) means arriving from the normal account menu never
 * carries it, so the add modal only auto-opens for the checkout trip.
 */
export interface CheckoutReturnState {
  from: 'checkout';
  /** Open the "add" modal once the page has loaded. Removed as soon as it's used. */
  autoOpenAdd?: boolean;
}

export const ACCOUNT_ADDRESS_ROUTES = {
  address: '/account/addresses',
  tax: '/account/tax-addresses',
} as const;

function isCheckoutReturnState(value: unknown): value is CheckoutReturnState {
  return typeof value === 'object' && value !== null && (value as { from?: unknown }).from === 'checkout';
}

/**
 * Account address pages: handles the checkout → account → checkout round trip.
 * - `ready`: the page's list has loaded (so the modal knows whether this is the first address).
 * - `openAdd`: opens the page's own "add" modal.
 * Returns whether the visit came from checkout, and `returnToCheckout` for the modal's save / cancel.
 */
export function useCheckoutReturn(kind: 'address' | 'tax', { ready, openAdd }: { ready: boolean; openAdd: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const state = isCheckoutReturnState(location.state) ? location.state : null;
  const fromCheckout = state !== null;
  const shouldAutoOpen = state?.autoOpenAdd === true;
  // Guards against opening twice (React StrictMode runs effects twice in development).
  const autoOpened = useRef(false);

  // Real side effect: react to the navigation that brought us here. The flag is removed from
  // history right away, so a reload or Back/Forward can never reopen the modal.
  useEffect(() => {
    if (!shouldAutoOpen || !ready || autoOpened.current) return;
    autoOpened.current = true;
    navigate(location.pathname, { replace: true, state: { from: 'checkout' } satisfies CheckoutReturnState });
    openAdd();
  }, [shouldAutoOpen, ready, navigate, location.pathname, openAdd]);

  /**
   * Back to checkout. `savedId` = the address just added there, which checkout then selects for
   * this order. `replace` swaps the account entry out of history, so Back from checkout goes to
   * wherever the customer was before checkout instead of bouncing between the two pages.
   */
  const returnToCheckout = (savedId?: string) => {
    if (savedId) dispatch(selectAddressForCheckout({ kind, id: savedId }));
    navigate('/checkout', { replace: true });
  };

  return { fromCheckout, returnToCheckout };
}

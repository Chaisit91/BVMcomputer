import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { addToWishlist, fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice';
import type { ProductCategorySlug } from '../data/catalog';

export const WISHLIST_PATH = '/account/wishlist';

/** Loads the signed-in customer's wishlist once (the thunk dedupes concurrent callers). */
export function useWishlist() {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const wishlist = useAppSelector((state) => state.wishlist);

  useEffect(() => {
    if (isAuthenticated) void dispatch(fetchWishlist());
  }, [dispatch, isAuthenticated]);

  const reload = useCallback(() => {
    void dispatch(fetchWishlist({ force: true }));
  }, [dispatch]);

  return { ...wishlist, isAuthenticated, reload };
}

/**
 * State + toggle for one product's heart button. The wishlist is per account, so a signed-out
 * customer is taken to the wishlist page, which asks them to log in.
 */
export function useWishlistToggle(category: ProductCategorySlug, productId: string) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { entries, isAuthenticated } = useWishlist();
  const entry = entries.find((item) => item.category === category && item.productId === productId);

  const toggle = () => {
    if (!isAuthenticated) {
      navigate(WISHLIST_PATH);
      return;
    }
    if (entry) void dispatch(removeFromWishlist(entry));
    else void dispatch(addToWishlist({ category, productId }));
  };

  return { isWishlisted: Boolean(entry), toggle };
}

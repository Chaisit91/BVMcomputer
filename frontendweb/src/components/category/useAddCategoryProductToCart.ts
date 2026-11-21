import type { MouseEvent } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { addToCart } from '../../features/cart/cartSlice';
import type { CategoryIconKey } from '../../types';

interface CartableProduct {
  id: string;
  name: string;
  price: number;
}

/**
 * Click handler for the cart button inside a product card/row. The card itself is a
 * <Link>, so the click must not also navigate to the product page.
 */
export function useAddCategoryProductToCart(product: CartableProduct, category: CategoryIconKey) {
  const dispatch = useAppDispatch();

  return (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(addToCart({ id: product.id, name: product.name, slug: product.id, price: product.price, category }));
  };
}

import { useEffect } from 'react';
import { FiMinus, FiPlus, FiShoppingCart, FiTrash2, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addToCart, clearCart, removeFromCart, setQuantity } from '../../features/cart/cartSlice';
import { closeCart } from '../../features/cart/cartUiSlice';
import { selectCartCount, selectCartItems, selectCartTotal, selectIsCartOpen } from '../../features/cart/cartSelectors';
import { cartRecommendations } from '../../data/cartRecommendations';
import { categoryIcons } from '../home/categoryIcons';
import { formatTHB } from '../../lib/format';
import { cn } from '../../lib/cn';

/**
 * Right-side mini-cart drawer. Always mounted (visibility driven by translate/opacity
 * classes, not conditional rendering) so open/close can animate with a plain CSS
 * transition instead of needing a portal + exit-animation library.
 */
export function CartDrawer() {
  const dispatch = useAppDispatch();
  const isOpen = useAppSelector(selectIsCartOpen);
  const items = useAppSelector(selectCartItems);
  const count = useAppSelector(selectCartCount);
  const total = useAppSelector(selectCartTotal);

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') dispatch(closeCart());
    };
    document.addEventListener('keydown', onKeyDown);

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen, dispatch]);

  const cartProductIds = new Set(items.map((item) => item.product.id));
  const recommendations = cartRecommendations.filter((item) => !cartProductIds.has(item.id)).slice(0, 4);

  return (
    <>
      {/* Overlay */}
      <div
        aria-hidden="true"
        onClick={() => dispatch(closeCart())}
        className={cn(
          'fixed inset-0 z-50 bg-black/50 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="ตะกร้าสินค้าของคุณ"
        className={cn(
          'fixed right-0 top-0 z-50 flex h-[100dvh] w-full max-w-[420px] flex-col bg-white shadow-2xl transition-transform duration-300 ease-out rounded-l-2xl',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Sticky header */}
        <div className="flex shrink-0 items-center justify-between gap-2 rounded-tl-2xl border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand">
              <FiShoppingCart size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <h2 className="truncate text-sm font-bold text-ink">ตะกร้าสินค้าของคุณ</h2>
              <p className="text-xs text-slate-400">{count} รายการ</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            {items.length > 0 && (
              <button
                type="button"
                onClick={() => dispatch(clearCart())}
                className="whitespace-nowrap rounded-full bg-brand px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                ล้างตะกร้า
              </button>
            )}
            <button
              type="button"
              aria-label="ปิดตะกร้าสินค้า"
              onClick={() => dispatch(closeCart())}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <FiX size={18} aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
                <FiShoppingCart size={28} aria-hidden="true" />
              </span>
              <p className="text-sm font-semibold text-ink">ยังไม่มีสินค้าในตะกร้า</p>
              <p className="text-xs text-slate-400">เลือกสินค้าที่ถูกใจแล้วมาเจอกันตรงนี้</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {items.map(({ product, quantity }) => {
                const Icon = categoryIcons[product.category];
                return (
                  <div key={product.id} className="flex gap-3 rounded-xl border border-slate-100 p-3">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-lg object-contain" />
                      ) : (
                        <Icon size={32} className="text-slate-300" aria-hidden="true" />
                      )}
                    </div>

                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-2">
                        <p className="line-clamp-2 text-sm font-semibold leading-snug text-ink">{product.name}</p>
                        <button
                          type="button"
                          aria-label={`นำ ${product.name} ออกจากตะกร้า`}
                          onClick={() => dispatch(removeFromCart(product.id))}
                          className="shrink-0 text-slate-300 transition-colors hover:text-brand"
                        >
                          <FiTrash2 size={15} aria-hidden="true" />
                        </button>
                      </div>
                      {(product.brand || product.skuCode) && (
                        <p className="mt-0.5 truncate text-[11px] text-slate-400">
                          {product.brand}
                          {product.brand && product.skuCode ? ' · ' : ''}
                          {product.skuCode ? `SKU: ${product.skuCode}` : ''}
                        </p>
                      )}

                      <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                        <span className="text-sm font-bold text-brand">{formatTHB(product.price)}</span>
                        <div className="flex items-center gap-2 rounded-full border border-slate-200 px-1 py-1">
                          <button
                            type="button"
                            aria-label="ลดจำนวน"
                            onClick={() => dispatch(setQuantity({ productId: product.id, quantity: quantity - 1 }))}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                          >
                            <FiMinus size={12} aria-hidden="true" />
                          </button>
                          <span className="w-4 text-center text-xs font-semibold text-ink">{quantity}</span>
                          <button
                            type="button"
                            aria-label="เพิ่มจำนวน"
                            onClick={() => dispatch(setQuantity({ productId: product.id, quantity: quantity + 1 }))}
                            className="flex h-6 w-6 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                          >
                            <FiPlus size={12} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <div className="mb-2.5 flex items-center justify-between">
                <h3 className="text-xs font-bold text-ink">สินค้าที่คุณอาจสนใจ</h3>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {recommendations.map((item) => {
                  const Icon = categoryIcons[item.category];
                  return (
                    <div key={item.id} className="flex flex-col overflow-hidden rounded-xl border border-slate-100">
                      <div className="flex aspect-square items-center justify-center bg-slate-50">
                        {item.imageUrl ? (
                          <img src={item.imageUrl} alt={item.name} className="h-full w-full object-contain" />
                        ) : (
                          <Icon size={28} className="text-slate-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className="flex flex-col gap-0.5 p-2">
                        <p className="line-clamp-1 text-[11px] font-semibold text-ink">{item.name}</p>
                        <p className="line-clamp-1 text-[10px] text-slate-400">{item.subtitle}</p>
                        <div className="mt-1 flex items-center justify-between gap-1.5">
                          <span className="text-xs font-bold text-brand">{formatTHB(item.price)}</span>
                          <button
                            type="button"
                            aria-label={`เพิ่ม ${item.name} ลงตะกร้า`}
                            onClick={() => dispatch(addToCart(item))}
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-brand text-white transition-colors hover:bg-brand-dark"
                          >
                            <FiPlus size={12} aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Sticky footer */}
        {items.length > 0 && (
          <div className="shrink-0 rounded-bl-2xl border-t border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-1.5 text-xs text-slate-500">
              <div className="flex items-center justify-between">
                <span>จำนวนสินค้า ({count} รายการ)</span>
                <span className="font-medium text-ink">{formatTHB(total)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ค่าจัดส่ง</span>
                <span className="font-medium text-ink">คำนวณตอนชำระเงิน</span>
              </div>
            </div>

            <div className="mt-2 flex items-center justify-between border-t border-slate-100 pt-2.5">
              <span className="text-sm font-semibold text-ink">ยอดรวมทั้งหมด</span>
              <span className="text-lg font-extrabold text-brand">{formatTHB(total)}</span>
            </div>

            <div className="mt-3 flex flex-col gap-2">
              <button
                type="button"
                className="flex h-11 w-full items-center justify-center gap-1.5 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                ดำเนินการสั่งซื้อ →
              </button>
              <button
                type="button"
                onClick={() => dispatch(closeCart())}
                className="flex h-10 w-full items-center justify-center rounded-full border border-brand text-sm font-semibold text-brand transition-colors hover:bg-brand/5"
              >
                ดูตะกร้าสินค้าทั้งหมด
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

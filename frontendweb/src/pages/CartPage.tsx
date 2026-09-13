import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiChevronRight, FiMinus, FiPlus, FiShoppingCart, FiTag, FiTrash2 } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { serviceBadges } from '../data/serviceBadges';
import { categoryIcons } from '../components/home/categoryIcons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCart, removeFromCart, setQuantity } from '../features/cart/cartSlice';
import { selectCartItems } from '../features/cart/cartSelectors';
import { formatTHB } from '../lib/format';
import { cn } from '../lib/cn';

// Mock checkout-side numbers — no backend yet, so free shipping mirrors the
// threshold already promised elsewhere on the site (product FAQ, service badges).
const FREE_SHIPPING_THRESHOLD = 5000;
const FLAT_SHIPPING_FEE = 50;
// Displayed product prices already include VAT, so the pre-tax price and the
// tax itself are both backed out of that VAT-inclusive total for display.
const VAT_RATE = 0.07;

export function CartPage() {
  const dispatch = useAppDispatch();
  const items = useAppSelector(selectCartItems);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(items.map((item) => item.product.id)));
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponMessage, setCouponMessage] = useState<string | null>(null);
  const selectAllRef = useRef<HTMLInputElement>(null);

  // Keep the selection set in sync when items are added/removed elsewhere (e.g. the header
  // cart drawer). Adjusted directly during render (React's recommended pattern for reacting
  // to a prop/store change) rather than in an effect, since there's no external system to
  // synchronize with here — just derived component state.
  const [knownItems, setKnownItems] = useState(items);
  if (items !== knownItems) {
    setKnownItems(items);
    const validIds = new Set(items.map((item) => item.product.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => validIds.has(id)));
      for (const item of items) {
        if (!prev.has(item.product.id)) next.add(item.product.id);
      }
      return next;
    });
  }

  const allSelected = items.length > 0 && selectedIds.size === items.length;
  const someSelected = selectedIds.size > 0 && !allSelected;

  useEffect(() => {
    if (selectAllRef.current) selectAllRef.current.indeterminate = someSelected;
  }, [someSelected]);

  const toggleSelectAll = () => {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((item) => item.product.id)));
  };

  const toggleSelectOne = (productId: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const selectedItems = items.filter((item) => selectedIds.has(item.product.id));
  const subtotal = selectedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discount = 0;
  const shipping = selectedItems.length === 0 ? 0 : subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
  const total = subtotal - discount + shipping;
  const preVatSubtotal = subtotal / (1 + VAT_RATE);
  const vatAmount = subtotal - preVatSubtotal;

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponMessage('ระบบโค้ดส่วนลดยังไม่เปิดให้ใช้งานในขณะนี้');
  };

  return (
    <section className="bg-slate-50 py-6">
      <Container>
        {/* Breadcrumb */}
        <nav className="mb-4 flex items-center gap-1.5 text-xs text-slate-400">
          <Link to="/" className="hover:text-brand">
            หน้าแรก
          </Link>
          <FiChevronRight size={12} aria-hidden="true" />
          <span className="text-slate-500">ตะกร้าสินค้า</span>
        </nav>

        {/* Title row */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-ink">ตะกร้าสินค้า</h1>
            <span className="rounded-full bg-brand px-2.5 py-1 text-xs font-semibold text-white">
              {items.reduce((sum, item) => sum + item.quantity, 0)} รายการ
            </span>
          </div>
          {items.length > 0 && (
            <button
              type="button"
              onClick={() => dispatch(clearCart())}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-brand hover:text-brand"
            >
              <FiTrash2 size={13} aria-hidden="true" />
              ล้างตะกร้าทั้งหมด
            </button>
          )}
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-100 bg-white py-20 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <FiShoppingCart size={30} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-ink">ตะกร้าสินค้าของคุณว่างเปล่า</p>
            <p className="text-sm text-slate-400">เลือกซื้อสินค้าที่ถูกใจแล้วมาเจอกันตรงนี้</p>
            <Link
              to="/"
              className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
            {/* Left: product list */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <div className="flex items-center gap-3 border-b border-slate-100 pb-3 text-sm">
                  <input
                    ref={selectAllRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                    aria-label="เลือกสินค้าทั้งหมด"
                  />
                  <span className="font-medium text-ink">เลือกทั้งหมด ({items.length})</span>
                </div>

                <div className="flex flex-col">
                  {items.map(({ product, quantity }, index) => {
                    const Icon = categoryIcons[product.category];
                    return (
                      <div
                        key={product.id}
                        className={cn(
                          'flex flex-wrap items-center gap-4 py-4 sm:flex-nowrap',
                          index !== items.length - 1 && 'border-b border-slate-100',
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(product.id)}
                          onChange={() => toggleSelectOne(product.id)}
                          className="h-4 w-4 shrink-0 rounded border-slate-300 text-brand focus:ring-brand"
                          aria-label={`เลือก ${product.name}`}
                        />

                        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full rounded-lg object-contain"
                            />
                          ) : (
                            <Icon size={52} className="text-slate-300" aria-hidden="true" />
                          )}
                        </div>

                        <div className="min-w-[160px] flex-1">
                          <p className="line-clamp-2 text-sm font-semibold text-ink">{product.name}</p>
                          {(product.brand || product.skuCode) && (
                            <p className="mt-0.5 text-xs text-slate-400">
                              {product.brand}
                              {product.brand && product.skuCode ? ' · ' : ''}
                              {product.skuCode ? `SKU: ${product.skuCode}` : ''}
                            </p>
                          )}
                          <p className="mt-1 text-xs text-slate-400 sm:hidden">{formatTHB(product.price)} / ชิ้น</p>
                        </div>

                        <span className="hidden w-24 shrink-0 text-[16px] font-semibold text-slate-700 sm:block">
                          {formatTHB(product.price)}
                        </span>

                        <div className="flex shrink-0 items-center gap-2 rounded-full border border-slate-200 px-1 py-1">
                          <button
                            type="button"
                            aria-label="ลดจำนวน"
                            onClick={() => dispatch(setQuantity({ productId: product.id, quantity: quantity - 1 }))}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                          >
                            <FiMinus size={13} aria-hidden="true" />
                          </button>
                          <span className="w-5 text-center text-sm font-semibold text-ink">{quantity}</span>
                          <button
                            type="button"
                            aria-label="เพิ่มจำนวน"
                            onClick={() => dispatch(setQuantity({ productId: product.id, quantity: quantity + 1 }))}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                          >
                            <FiPlus size={13} aria-hidden="true" />
                          </button>
                        </div>

                        <span className="w-24 shrink-0 text-right text-[17px] font-bold text-brand">
                          {formatTHB(product.price * quantity)}
                        </span>

                        <button
                          type="button"
                          aria-label={`นำ ${product.name} ออกจากตะกร้า`}
                          onClick={() => dispatch(removeFromCart(product.id))}
                          className="shrink-0 text-slate-500 transition-colors hover:text-brand"
                        >
                          <FiTrash2 size={16} aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Link
                  to="/"
                  className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-brand hover:text-brand"
                >
                  <FiArrowLeft size={15} aria-hidden="true" />
                  เลือกซื้อสินค้าต่อ
                </Link>
              </div>
            </div>

            {/* Right: order summary */}
            <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <h2 className="text-base font-bold text-ink">สรุปคำสั่งซื้อ</h2>

                <div className="mt-4 flex flex-col gap-2.5 text-sm">
                  <div className="flex items-center justify-between text-slate-500">
                    <span>ค่าจัดส่ง:</span>
                    <span className="font-medium text-ink">{formatTHB(shipping)}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-[11px] text-slate-400">
                      ซื้อครบ {formatTHB(FREE_SHIPPING_THRESHOLD)} ส่งฟรีทันที
                    </p>
                  )}

                  <div className="flex items-center justify-between text-slate-500">
                    <span>ราคาก่อนภาษี:</span>
                    <span className="font-medium text-ink">{formatTHB(preVatSubtotal)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-500">
                    <span>ภาษี VAT 7%:</span>
                    <span className="font-medium text-ink">{formatTHB(vatAmount)}</span>
                  </div>

                  <div className="pt-1">
                    <p className="text-xs font-semibold text-ink">ส่วนลดทั้งหมด</p>
                    <div className="mt-1.5 flex items-center justify-between text-slate-500">
                      <span>ส่วนลด:</span>
                      <span className="font-medium text-emerald-600">- {formatTHB(discount)}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setCouponOpen((open) => !open)}
                    className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2.5 text-left text-xs font-semibold text-ink transition-colors hover:bg-slate-100"
                  >
                    <span className="flex items-center gap-1.5">
                      <FiTag size={13} className="text-brand" aria-hidden="true" />
                      เพิ่มโค้ดส่วนลด
                    </span>
                    <FiChevronRight
                      size={13}
                      className={cn('transition-transform', couponOpen && 'rotate-90')}
                      aria-hidden="true"
                    />
                  </button>
                  {couponOpen && (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="กรอกโค้ดส่วนลด"
                          className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-xs text-ink outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="rounded-lg bg-ink px-3 text-xs font-semibold text-white transition-colors hover:bg-ink-light"
                        >
                          ใช้โค้ด
                        </button>
                      </div>
                      {couponMessage && <p className="text-[11px] text-slate-400">{couponMessage}</p>}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                  <span className="text-sm font-semibold text-ink">ยอดรวมทั้งหมด</span>
                  <span className="text-xl font-extrabold text-brand">{formatTHB(total)}</span>
                </div>

                <button
                  type="button"
                  disabled={selectedItems.length === 0}
                  className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ดำเนินการสั่งซื้อ →
                </button>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white p-5">
                <h3 className="mb-3 text-sm font-bold text-ink">บริการของเรา</h3>
                <div className="grid grid-cols-2 gap-3">
                  {serviceBadges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-3 text-center">
                      <badge.icon size={24} className="text-[#8FA4C0]" aria-hidden="true" />
                      <p className="text-[11px] font-semibold leading-snug text-ink">{badge.title}</p>
                      <p className="text-[10px] leading-snug text-slate-400">{badge.subtitle}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  BsBank,
  BsCashCoin,
  BsCheckCircleFill,
  BsCreditCard2Front,
  BsQrCode,
  BsShieldCheck,
} from 'react-icons/bs';
import { FiAlertCircle, FiLock, FiShoppingCart, FiTag } from 'react-icons/fi';
import type { IconType } from 'react-icons';
import { TbCalendar, TbTruck } from 'react-icons/tb';
import { FastDeliveryVanIcon } from '../components/checkout/FastDeliveryVanIcon';
import { Container } from '../components/ui/Container';
import { EmptyState } from '../components/ui/EmptyState';
import { Spinner } from '../components/ui/Spinner';
import { ShippingInfoSection, type AccountAddressBook } from '../components/checkout/ShippingInfoSection';
import { categoryIcons } from '../components/home/categoryIcons';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectCartItems } from '../features/cart/cartSelectors';
import { placeOrder, resetOrder } from '../features/order/orderSlice';
import { fetchAddresses } from '../features/address/addressSlice';
import { fetchTaxAddresses } from '../features/taxAddress/taxAddressSlice';
import { clearCheckoutDraft, saveCheckoutDraft } from '../features/checkout/checkoutSlice';
import { ACCOUNT_ADDRESS_ROUTES, type CheckoutReturnState } from '../features/checkout/checkoutReturn';
import { validateCoupon } from '../api/orderApi';
import { getErrorMessage } from '../api/apiError';
import { formatTHB } from '../lib/format';
import { cn } from '../lib/cn';
import type {
  CheckoutTaxInvoice,
  CreateOrderResponse,
  PaymentMethodId,
  SavedAddress,
  ShippingAddress,
  ShippingMethodId,
  TaxAddress,
} from '../types/api';

const steps = [
  { id: 1, label: 'ตรวจสอบคำสั่งซื้อ' },
  { id: 2, label: 'ข้อมูลการจัดส่ง' },
  { id: 3, label: 'ชำระเงิน' },
];

const shippingMethods: { id: ShippingMethodId; icon: IconType; label: string; subtitle: string; fee: number; recommended?: boolean }[] = [
  { id: 'standard', icon: TbTruck, label: 'จัดส่งมาตรฐาน', subtitle: '1 - 3 วันทำการ', fee: 0, recommended: true },
  { id: 'express', icon: FastDeliveryVanIcon, label: 'จัดส่งด่วน', subtitle: 'ภายใน 1 วัน', fee: 50 },
];

const paymentMethods: { id: PaymentMethodId; icon: typeof BsBank; label: string; subtitle: string; feeNote?: string }[] = [
  { id: 'bank', icon: BsBank, label: 'โอนผ่านธนาคาร', subtitle: 'ชำระผ่านแอปธนาคาร / Internet Banking' },
  { id: 'card', icon: BsCreditCard2Front, label: 'บัตรเครดิต / เดบิต', subtitle: 'Visa, Mastercard, JCB' },
  { id: 'qr', icon: BsQrCode, label: 'QR Payment', subtitle: 'สแกน QR ผ่านแอปธนาคาร' },
  { id: 'cod', icon: BsCashCoin, label: 'เก็บเงินปลายทาง (COD)', subtitle: 'ชำระเงินเมื่อได้รับสินค้า', feeNote: '+ ฿50' },
];

const trustNotes = [
  'จัดส่งทั่วประเทศไทย',
  'สินค้าของแท้ 100%',
  'ชำระเงินปลอดภัย ข้อมูลถูกเข้ารหัส',
  'ตรวจสอบสถานะคำสั่งซื้อได้ทุกขั้นตอน',
];

const VAT_RATE = 0.07;
const COD_FEE = 50;

/** The order's shipping address, from a saved account address. */
const toShippingAddress = (saved: SavedAddress): ShippingAddress => ({
  fullName: saved.recipientName,
  phone: saved.phone,
  address: saved.addressLine,
  province: saved.province,
  district: saved.district,
  subdistrict: saved.subdistrict,
  postalCode: saved.postalCode,
});

/** The order's tax-invoice details, from a saved account tax address (without its id / default flag). */
const toCheckoutTaxInvoice = ({ payerType, name, taxId, phone, addressLine, subdistrict, district, province, postalCode }: TaxAddress): CheckoutTaxInvoice => ({
  payerType,
  name,
  taxId,
  phone,
  addressLine,
  subdistrict,
  district,
  province,
  postalCode,
});

/** The order's pick if it's still in the list, else the account default, else the first one. */
function pickSaved<T extends { id: string; isDefault: boolean }>(items: T[], selectedId: string | null): T | null {
  return items.find((item) => item.id === selectedId) ?? items.find((item) => item.isDefault) ?? items[0] ?? null;
}

/** The address and tax details come from ShippingInfoSection's modals; the form itself holds the two method picks. */
interface CheckoutFormValues {
  shippingMethod: ShippingMethodId;
  paymentMethod: PaymentMethodId;
}

export function CheckoutPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector(selectCartItems);
  const { status: orderStatus, error: orderError, lastOrder } = useAppSelector((state) => state.order);
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  const addressState = useAppSelector((state) => state.address);
  const taxAddressState = useAppSelector((state) => state.taxAddress);

  // Picks saved before a trip to the account pages (see checkoutSlice) — frozen at mount, used as initial values.
  const storedDraft = useAppSelector((state) => state.checkout.draft);
  const [draft] = useState(storedDraft);
  const { register, handleSubmit, control, setValue } = useForm<CheckoutFormValues>({
    defaultValues: {
      shippingMethod: draft?.shippingMethod ?? 'standard',
      paymentMethod: draft?.paymentMethod ?? 'bank',
    },
  });

  // Guest checkout — details kept for this order only (nothing is saved to an account).
  const [guestAddress, setGuestAddress] = useState<ShippingAddress | null>(null);
  const [saveAddress, setSaveAddress] = useState(false);
  const [taxRequested, setTaxRequested] = useState(draft?.taxRequested ?? false);
  const [guestTaxInvoice, setGuestTaxInvoice] = useState<CheckoutTaxInvoice | null>(null);

  // Signed in — which saved account address this order uses (the account default is never changed here).
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(draft?.selectedAddressId ?? null);
  const [selectedTaxAddressId, setSelectedTaxAddressId] = useState<string | null>(draft?.selectedTaxAddressId ?? null);
  const selectedAddress = isAuthenticated ? pickSaved(addressState.addresses, selectedAddressId) : null;
  const selectedTaxAddress = isAuthenticated ? pickSaved(taxAddressState.addresses, selectedTaxAddressId) : null;

  const shippingAddress = isAuthenticated ? (selectedAddress && toShippingAddress(selectedAddress)) : guestAddress;
  const taxInvoice = isAuthenticated ? (selectedTaxAddress && toCheckoutTaxInvoice(selectedTaxAddress)) : guestTaxInvoice;
  // Only point at missing details after the customer has tried to place the order.
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const missing = {
    address: submitAttempted && !shippingAddress,
    taxInvoice: submitAttempted && taxRequested && !taxInvoice,
  };

  // Both drive the live fee/total in the summary column.
  const shippingMethod = useWatch({ control, name: 'shippingMethod' });
  const paymentMethod = useWatch({ control, name: 'paymentMethod' });

  const [couponCode, setCouponCode] = useState(draft?.couponCode ?? '');
  const [coupon, setCoupon] = useState<{ code: string; discount: number } | null>(draft?.coupon ?? null);
  const [couponChecking, setCouponChecking] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Leaving the page clears the "order placed" screen so the next visit starts fresh.
  useEffect(() => {
    return () => {
      dispatch(resetOrder());
    };
  }, [dispatch]);

  // The draft is one-shot: it has been copied into this page's state above, so drop it.
  useEffect(() => {
    dispatch(clearCheckoutDraft());
  }, [dispatch]);

  // Real side effect: load the signed-in customer's saved addresses fresh from the account every
  // time checkout opens, so anything added or edited there shows up here. Both run in parallel.
  useEffect(() => {
    if (!isAuthenticated) return;
    void dispatch(fetchAddresses({ force: true }));
    void dispatch(fetchTaxAddresses({ force: true }));
  }, [isAuthenticated, dispatch]);

  /** "+ เพิ่ม…" for a signed-in customer: keep this page's picks, then add it on the account page. */
  const goAddInAccount = (kind: 'address' | 'tax') => {
    dispatch(
      saveCheckoutDraft({
        shippingMethod,
        paymentMethod,
        couponCode,
        coupon,
        taxRequested,
        selectedAddressId: selectedAddress?.id ?? null,
        selectedTaxAddressId: selectedTaxAddress?.id ?? null,
      }),
    );
    // replace: the account page takes this entry's place, and comes back here with replace too,
    // so Back never ping-pongs between checkout and the account page.
    navigate(ACCOUNT_ADDRESS_ROUTES[kind], {
      replace: true,
      state: { from: 'checkout', autoOpenAdd: true } satisfies CheckoutReturnState,
    });
  };

  const accountBook: AccountAddressBook | undefined = isAuthenticated
    ? {
        addresses: {
          items: addressState.addresses,
          status: addressState.status,
          error: addressState.error,
          onRetry: () => void dispatch(fetchAddresses({ force: true })),
          selected: selectedAddress,
          onSelect: setSelectedAddressId,
        },
        taxAddresses: {
          items: taxAddressState.addresses,
          status: taxAddressState.status,
          error: taxAddressState.error,
          onRetry: () => void dispatch(fetchTaxAddresses({ force: true })),
          selected: selectedTaxAddress,
          onSelect: setSelectedTaxAddressId,
        },
        onAdd: goAddInAccount,
      }
    : undefined;

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = shippingMethods.find((m) => m.id === shippingMethod)?.fee ?? 0;
  const codFee = paymentMethod === 'cod' ? COD_FEE : 0;
  const discount = coupon ? Math.min(coupon.discount, subtotal) : 0;
  const total = subtotal + shippingFee + codFee - discount;
  const vatIncluded = subtotal - subtotal / (1 + VAT_RATE);
  const isPlacingOrder = orderStatus === 'loading';

  const handleApplyCoupon = async () => {
    const code = couponCode.trim();
    if (!code) return;
    setCouponChecking(true);
    setCouponError(null);
    try {
      const result = await validateCoupon(code, subtotal);
      if (result.valid) {
        setCoupon({ code, discount: result.discount });
      } else {
        setCoupon(null);
        setCouponError(result.message ?? 'โค้ดส่วนลดนี้ไม่สามารถใช้ได้');
      }
    } catch (error) {
      setCouponError(getErrorMessage(error));
    } finally {
      setCouponChecking(false);
    }
  };

  const onSubmit = handleSubmit(async ({ shippingMethod: shipping, paymentMethod: payment }) => {
    if (!shippingAddress || (taxRequested && !taxInvoice)) {
      setSubmitAttempted(true);
      document.getElementById('checkout-shipping-info')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    const result = await dispatch(
      placeOrder({
        items: items.map(({ product, quantity }) => ({
          productId: product.id,
          category: product.category,
          quantity,
          unitPrice: product.price,
        })),
        shippingAddress,
        shippingMethod: shipping,
        paymentMethod: payment,
        couponCode: coupon?.code,
        // A signed-in customer's address already lives in their account.
        saveAddress: isAuthenticated ? false : saveAddress,
        taxInvoice: taxRequested && taxInvoice ? taxInvoice : undefined,
      }),
    );
    // Card / QR payments continue on the payment gateway's own page when the backend provides one.
    if (placeOrder.fulfilled.match(result) && result.payload.paymentUrl) {
      window.location.assign(result.payload.paymentUrl);
    }
  });

  if (orderStatus === 'succeeded' && lastOrder) {
    return <OrderSuccess order={lastOrder} />;
  }

  if (items.length === 0) {
    return (
      <section className="bg-slate-50 py-20">
        <Container>
          <EmptyState
            icon={FiShoppingCart}
            title="ยังไม่มีสินค้าสำหรับชำระเงิน"
            description="เลือกซื้อสินค้าก่อนแล้วค่อยกลับมาที่หน้านี้"
            action={
              <Link
                to="/"
                className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                เลือกซื้อสินค้าต่อ
              </Link>
            }
          />
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-6">
      <Container>
        {/* Step indicator — each step sits in a fixed-width column so differing label
            lengths never throw off the spacing between circles; connectors get a fixed
            width and are nudged to the circle's own vertical center (half its height). */}
        <div className="mb-6 flex items-start justify-center">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-start">
              <div className="flex w-16 flex-col items-center gap-1.5 sm:w-28">
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    step.id === 1 ? 'bg-brand text-white' : 'bg-slate-200 text-slate-500',
                  )}
                >
                  {step.id}
                </span>
                <span
                  className={cn(
                    'hidden text-center text-xs font-medium sm:block',
                    step.id === 1 ? 'text-brand' : 'text-slate-400',
                  )}
                >
                  {step.label}
                </span>
              </div>
              {index < steps.length - 1 && (
                <span className="mt-4 h-px w-6 shrink-0 bg-slate-200 sm:w-12" aria-hidden="true" />
              )}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          {/* Left column — the form; the submit button lives in the summary column and targets it by id. */}
          <form id="checkout-form" onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
            {/* 1. Shipping info — address card, "ขอใบกำกับภาษี", and the tax card while it's ticked */}
            <div id="checkout-shipping-info" className="scroll-mt-24 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <SectionTitle number={1} title="ข้อมูลการจัดส่ง" />
              <ShippingInfoSection
                account={accountBook}
                address={guestAddress}
                saveAddress={saveAddress}
                onAddressChange={(next, save) => {
                  setGuestAddress(next);
                  setSaveAddress(save);
                }}
                taxRequested={taxRequested}
                onTaxRequestedChange={setTaxRequested}
                taxInvoice={guestTaxInvoice}
                onTaxInvoiceChange={setGuestTaxInvoice}
                missing={missing}
              />
            </div>

            {/* 2. Shipping method */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <SectionTitle number={2} title="วิธีการจัดส่ง" />
              {/* Selection is shown by background + border colour only (no check mark, no radio dot).
                  Same-height cards: the grid row stretches both to the taller one. */}
              <div role="radiogroup" aria-label="วิธีการจัดส่ง" className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
                {shippingMethods.map((method) => {
                  const selected = shippingMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setValue('shippingMethod', method.id)}
                      className={cn(
                        // ring-1 on top of the 1px border = a 2px red edge when selected, without shifting the layout.
                        'relative flex min-h-[124px] items-center gap-3 rounded-2xl border px-4 py-5 text-left outline-none transition-colors focus-visible:ring-2 focus-visible:ring-brand/40 sm:gap-4 sm:px-5',
                        selected ? 'border-brand bg-[#FFF1F2] ring-1 ring-brand' : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      {method.recommended && (
                        <span className="absolute right-3 top-3 rounded-full bg-ink px-2.5 py-0.5 text-[11px] font-semibold text-white">
                          แนะนำ
                        </span>
                      )}
                      <method.icon
                        size={40}
                        strokeWidth={1.6}
                        className={cn('shrink-0 transition-colors', selected ? 'text-brand' : 'text-slate-400')}
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-bold text-ink">{method.label}</p>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <TbCalendar size={16} className="shrink-0 text-slate-400" aria-hidden="true" />
                          {method.subtitle}
                        </p>
                      </div>
                      <span className={cn('shrink-0 text-xl font-bold', selected ? 'text-brand' : 'text-ink')}>
                        {method.fee === 0 ? '฿0' : formatTHB(method.fee)}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Payment method */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <SectionTitle number={3} title="ช่องทางการชำระเงิน" />
              <div className="flex flex-col gap-2.5">
                {paymentMethods.map((method) => {
                  const selected = paymentMethod === method.id;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 transition-colors',
                        selected ? 'border-brand bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      <input
                        type="radio"
                        value={method.id}
                        className="h-4 w-4 shrink-0 border-slate-300 text-brand focus:ring-brand"
                        {...register('paymentMethod')}
                      />
                      <method.icon size={20} className={selected ? 'text-brand' : 'text-slate-400'} aria-hidden="true" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-ink">{method.label}</p>
                        <p className="truncate text-xs text-slate-400">{method.subtitle}</p>
                      </div>
                      {method.feeNote && <span className="shrink-0 text-xs font-semibold text-brand">{method.feeNote}</span>}
                    </label>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Right: order summary */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-4 lg:self-start">
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
              <h2 className="text-base font-bold text-ink">สรุปคำสั่งซื้อ</h2>

              <div className="mt-4 flex flex-col gap-3 border-b border-slate-100 pb-4">
                {items.map(({ product, quantity }) => {
                  const Icon = categoryIcons[product.category];
                  return (
                    <div key={product.id} className="flex items-center gap-4">
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} className="h-full w-full rounded-lg object-contain" />
                        ) : (
                          <Icon size={40} className="text-slate-300" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-semibold text-ink">{product.name}</p>
                        <p className="text-[11px] text-slate-400">x{quantity}</p>
                      </div>
                      <span className="shrink-0 text-xs font-bold text-ink">{formatTHB(product.price * quantity)}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col gap-2.5 py-4 text-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span>ราคาสินค้า ({items.length} ชิ้น)</span>
                  <span className="font-medium text-ink">{formatTHB(subtotal)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>ค่าจัดส่ง</span>
                  <span className="font-medium text-ink">{shippingFee + codFee === 0 ? 'ฟรี' : formatTHB(shippingFee + codFee)}</span>
                </div>
                <div className="flex items-center justify-between text-slate-500">
                  <span>ส่วนลด</span>
                  <span className={cn('font-medium', discount > 0 ? 'text-emerald-600' : 'text-ink')}>
                    {discount > 0 ? `- ${formatTHB(discount)}` : formatTHB(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-slate-400">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                  <span className="text-right font-medium">{formatTHB(vatIncluded)} (รวมในราคาแล้ว)</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-ink">
                  <FiTag size={12} className="text-brand" aria-hidden="true" />
                  มีโค้ดส่วนลด?
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value);
                      setCoupon(null);
                      setCouponError(null);
                    }}
                    placeholder="กรอกโค้ดส่วนลด"
                    className="h-10 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-ink outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => void handleApplyCoupon()}
                    disabled={couponChecking || !couponCode.trim()}
                    className="flex items-center gap-1.5 whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-light disabled:opacity-60"
                  >
                    {couponChecking && <Spinner size={14} />}
                    ใช้โค้ดส่วนลด
                  </button>
                </div>
                {coupon && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <BsCheckCircleFill size={12} aria-hidden="true" />
                    ใช้โค้ดส่วนลดสำเร็จ ลด {formatTHB(discount)}
                  </p>
                )}
                {couponError && (
                  <p role="alert" className="mt-2 text-xs text-red-500">
                    {couponError}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm font-semibold text-ink">ยอดรวมทั้งหมด</span>
                <span className="text-2xl font-bold text-brand">{formatTHB(total)}</span>
              </div>

              {orderStatus === 'failed' && orderError && (
                <p role="alert" className="mt-4 flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-xs text-red-600">
                  <FiAlertCircle size={14} className="mt-px shrink-0" aria-hidden="true" />
                  {orderError}
                </p>
              )}

              <button
                type="submit"
                form="checkout-form"
                disabled={isPlacingOrder}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-wait disabled:opacity-70"
              >
                {isPlacingOrder ? <Spinner size={15} /> : <FiLock size={15} aria-hidden="true" />}
                {isPlacingOrder ? 'กำลังสั่งซื้อ...' : 'ยืนยันการสั่งซื้อ'}
              </button>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
              <ul className="flex flex-col gap-2.5">
                {trustNotes.map((note) => (
                  <li key={note} className="flex items-center gap-2 text-xs text-slate-500">
                    <BsShieldCheck size={14} className="shrink-0 text-brand" aria-hidden="true" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function OrderSuccess({ order }: { order: CreateOrderResponse }) {
  return (
    <section className="bg-slate-50 py-16">
      <Container>
        <EmptyState
          icon={BsCheckCircleFill}
          title="สั่งซื้อสำเร็จ ขอบคุณที่ใช้บริการ"
          iconClassName="bg-emerald-50 text-emerald-500"
          description={
            <>
              หมายเลขคำสั่งซื้อ <span className="font-semibold text-ink">{order.orderId}</span>
              <br />
              ยอดชำระ <span className="font-semibold text-brand">{formatTHB(order.total)}</span>
            </>
          }
          action={
            <Link
              to="/"
              className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              กลับไปเลือกซื้อสินค้า
            </Link>
          }
        />
      </Container>
    </section>
  );
}

function SectionTitle({ number, title }: { number: number; title: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
        {number}
      </span>
      <h2 className="text-sm font-bold text-ink">{title}</h2>
    </div>
  );
}

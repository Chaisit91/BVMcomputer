import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  BsBank,
  BsCashCoin,
  BsCheckCircleFill,
  BsCreditCard2Front,
  BsQrCode,
  BsShieldCheck,
  BsTruck,
  BsTruckFront,
} from 'react-icons/bs';
import { FiChevronRight, FiLock, FiShoppingCart, FiTag } from 'react-icons/fi';
import { Container } from '../components/ui/Container';
import { categoryIcons } from '../components/home/categoryIcons';
import { useAppSelector } from '../app/hooks';
import { selectCartItems } from '../features/cart/cartSelectors';
import { formatTHB } from '../lib/format';
import { cn } from '../lib/cn';

type ShippingMethodId = 'standard' | 'express';
type PaymentMethodId = 'bank' | 'card' | 'qr' | 'cod';

const steps = [
  { id: 1, label: 'ตรวจสอบคำสั่งซื้อ' },
  { id: 2, label: 'ข้อมูลการจัดส่ง' },
  { id: 3, label: 'ชำระเงิน' },
];

const shippingMethods: { id: ShippingMethodId; icon: typeof BsTruck; label: string; subtitle: string; fee: number; recommended?: boolean }[] = [
  { id: 'standard', icon: BsTruck, label: 'จัดส่งมาตรฐาน', subtitle: '1 - 3 วันทำการ', fee: 0, recommended: true },
  { id: 'express', icon: BsTruckFront, label: 'จัดส่งด่วน', subtitle: 'ภายใน 1 วัน', fee: 50 },
];

const paymentMethods: { id: PaymentMethodId; icon: typeof BsBank; label: string; subtitle: string; feeNote?: string }[] = [
  { id: 'bank', icon: BsBank, label: 'โอนผ่านธนาคาร', subtitle: 'ชำระผ่านแอปธนาคาร / Internet Banking' },
  { id: 'card', icon: BsCreditCard2Front, label: 'บัตรเครดิต / เดบิต', subtitle: 'Visa, Mastercard, JCB' },
  { id: 'qr', icon: BsQrCode, label: 'QR Payment', subtitle: 'สแกน QR ผ่านแอปธนาคาร' },
  { id: 'cod', icon: BsCashCoin, label: 'เก็บเงินปลายทาง (COD)', subtitle: 'ชำระเงินเมื่อได้รับสินค้า', feeNote: '+ ฿50' },
];

const provinceOptions = [
  'กรุงเทพมหานคร',
  'นนทบุรี',
  'ปทุมธานี',
  'สมุทรปราการ',
  'ชลบุรี',
  'เชียงใหม่',
  'ขอนแก่น',
  'นครราชสีมา',
];

const trustNotes = [
  'จัดส่งทั่วประเทศไทย',
  'สินค้าของแท้ 100%',
  'ชำระเงินปลอดภัย ข้อมูลถูกเข้ารหัส',
  'ตรวจสอบสถานะคำสั่งซื้อได้ทุกขั้นตอน',
];

// Mock coupon — no backend yet, so any non-empty code just demonstrates the applied-state UI.
const MOCK_COUPON_DISCOUNT = 100;
const VAT_RATE = 0.07;

export function CheckoutPage() {
  const items = useAppSelector(selectCartItems);

  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('standard');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodId>('bank');
  const [saveAddress, setSaveAddress] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = shippingMethods.find((m) => m.id === shippingMethod)?.fee ?? 0;
  const codFee = paymentMethod === 'cod' ? 50 : 0;
  const discount = couponApplied ? Math.min(MOCK_COUPON_DISCOUNT, subtotal) : 0;
  const total = subtotal + shippingFee + codFee - discount;
  const vatIncluded = subtotal - subtotal / (1 + VAT_RATE);

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    setCouponApplied(true);
  };

  if (items.length === 0) {
    return (
      <section className="bg-slate-50 py-20">
        <Container>
          <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 text-slate-300">
              <FiShoppingCart size={28} aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-ink">ยังไม่มีสินค้าสำหรับชำระเงิน</p>
            <p className="text-sm text-slate-400">เลือกซื้อสินค้าก่อนแล้วค่อยกลับมาที่หน้านี้</p>
            <Link
              to="/"
              className="mt-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
            >
              เลือกซื้อสินค้าต่อ
            </Link>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="bg-slate-50 py-6">
      <Container>
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-brand">
          <FiChevronRight size={12} className="rotate-180" aria-hidden="true" />
          กลับไปหน้าสินค้า
        </Link>

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
          {/* Left column */}
          <div className="flex flex-col gap-5">
            {/* 1. Shipping info */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <SectionTitle number={1} title="ข้อมูลการจัดส่ง" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="ชื่อ - นามสกุล" required>
                  <input type="text" placeholder="ชื่อผู้รับสินค้า" className={inputClass} />
                </Field>
                <Field label="เบอร์โทรศัพท์" required>
                  <input type="tel" placeholder="08X-XXX-XXXX" className={inputClass} />
                </Field>
                <Field label="ที่อยู่" required className="sm:col-span-2">
                  <input type="text" placeholder="บ้านเลขที่ / ถนน / ซอย" className={inputClass} />
                </Field>
                <Field label="จังหวัด" required>
                  <select className={inputClass} defaultValue="">
                    <option value="" disabled>
                      เลือกจังหวัด
                    </option>
                    {provinceOptions.map((province) => (
                      <option key={province} value={province}>
                        {province}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="อำเภอ / เขต" required>
                  <input type="text" placeholder="อำเภอ / เขต" className={inputClass} />
                </Field>
                <Field label="ตำบล / แขวง" required>
                  <input type="text" placeholder="ตำบล / แขวง" className={inputClass} />
                </Field>
                <Field label="รหัสไปรษณีย์" required>
                  <input type="text" inputMode="numeric" placeholder="10xxx" className={inputClass} />
                </Field>
              </div>
              <label className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                <input
                  type="checkbox"
                  checked={saveAddress}
                  onChange={(e) => setSaveAddress(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-brand focus:ring-brand"
                />
                บันทึกที่อยู่นี้สำหรับการสั่งซื้อครั้งถัดไป
              </label>
            </div>

            {/* 2. Shipping method */}
            <div className="rounded-2xl border border-slate-100 bg-white p-5 sm:p-6">
              <SectionTitle number={2} title="วิธีการจัดส่ง" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {shippingMethods.map((method) => {
                  const selected = shippingMethod === method.id;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setShippingMethod(method.id)}
                      className={cn(
                        'relative flex flex-col gap-2 rounded-xl border p-4 text-left transition-colors',
                        selected ? 'border-brand bg-red-50' : 'border-slate-200 bg-white hover:border-slate-300',
                      )}
                    >
                      {method.recommended && (
                        <span className="absolute right-3 top-3 rounded-full bg-ink px-2 py-0.5 text-[10px] font-semibold text-white">
                          แนะนำ
                        </span>
                      )}
                      <method.icon size={22} className={selected ? 'text-brand' : 'text-slate-400'} aria-hidden="true" />
                      <div>
                        <p className="text-sm font-semibold text-ink">{method.label}</p>
                        <p className="text-xs text-slate-400">{method.subtitle}</p>
                      </div>
                      <span className={cn('text-sm font-bold', selected ? 'text-brand' : 'text-ink')}>
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
                        name="payment-method"
                        checked={selected}
                        onChange={() => setPaymentMethod(method.id)}
                        className="h-4 w-4 shrink-0 border-slate-300 text-brand focus:ring-brand"
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
          </div>

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
                <div className="flex items-center justify-between text-slate-400">
                  <span>ภาษีมูลค่าเพิ่ม (VAT 7%)</span>
                  <span className="font-medium">{formatTHB(vatIncluded)} (รวมในราคาแล้ว)</span>
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
                      setCouponApplied(false);
                    }}
                    placeholder="กรอกโค้ดส่วนลด"
                    className="h-10 flex-1 rounded-lg border border-slate-200 px-3 text-sm text-ink outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="whitespace-nowrap rounded-lg bg-ink px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-light"
                  >
                    ใช้โค้ดส่วนลด
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <BsCheckCircleFill size={12} aria-hidden="true" />
                    ใช้โค้ดส่วนลดสำเร็จ ลด {formatTHB(discount)}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3.5">
                <span className="text-sm font-semibold text-ink">ยอดรวมทั้งหมด</span>
                <span className="text-2xl font-bold text-brand">{formatTHB(total)}</span>
              </div>

              <button
                type="button"
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                <FiLock size={15} aria-hidden="true" />
                ยืนยันการสั่งซื้อ
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

const inputClass =
  'h-11 w-full rounded-lg border border-slate-200 px-3.5 text-sm text-ink outline-none focus:border-brand';

function Field({
  label,
  required,
  className,
  children,
}: {
  label: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={cn('flex flex-col gap-1.5', className)}>
      <span className="text-xs font-medium text-slate-500">
        {label}
        {required && <span className="text-brand"> *</span>}
      </span>
      {children}
    </label>
  );
}

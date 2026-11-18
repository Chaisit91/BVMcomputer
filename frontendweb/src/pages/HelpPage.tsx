import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Link } from 'react-router-dom';
import { FiChevronRight, FiCreditCard, FiHelpCircle, FiMessageCircle, FiShoppingCart, FiTruck } from 'react-icons/fi';
import { InfoPageLayout } from '../components/layout/InfoPageLayout';
import { SupportChat } from '../components/chat/SupportChat';
import { useAppDispatch } from '../app/hooks';
import { connectChat, openChat } from '../features/chat/chatSlice';

/*
 * "ช่วยเหลือ" — how ordering, payment and delivery work on this site, plus how to reach the team.
 * Everything here mirrors what the checkout actually offers; prices/fees are left out on purpose
 * because the backend owns them.
 * TODO(content): add FAQ entries and the shop's phone / LINE / e-mail once they're confirmed.
 */

const orderSteps = [
  'เลือกสินค้าที่ต้องการแล้วกด “เพิ่มลงตะกร้า”',
  'เปิดตะกร้าสินค้าแล้วกด “ดำเนินการสั่งซื้อ”',
  'ตรวจสอบคำสั่งซื้อ กรอกข้อมูลการจัดส่ง แล้วเลือกวิธีชำระเงิน',
  'ติดตามสถานะได้ที่เมนู “ติดตามคำสั่งซื้อ”',
];

const paymentMethods = ['โอนผ่านธนาคาร (แอปธนาคาร / Internet Banking)', 'บัตรเครดิต / เดบิต (Visa, Mastercard, JCB)', 'QR Payment', 'เก็บเงินปลายทาง (COD)'];

const shippingMethods = ['จัดส่งมาตรฐาน — 1–3 วันทำการ', 'จัดส่งด่วน — ภายใน 1 วัน'];

export function HelpPage() {
  const dispatch = useAppDispatch();

  const startChat = () => {
    dispatch(openChat());
    void dispatch(connectChat());
  };

  return (
    <InfoPageLayout title="ช่วยเหลือ" icon={FiHelpCircle} description="วิธีสั่งซื้อ การชำระเงิน การจัดส่ง และช่องทางติดต่อทีมงาน">
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <HelpCard icon={FiShoppingCart} title="วิธีสั่งซื้อ">
          <ol className="flex flex-col gap-2.5">
            {orderSteps.map((step, index) => (
              <li key={step} className="flex gap-3 text-sm text-[#2B3445]">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-50 text-xs font-bold text-brand">{index + 1}</span>
                <span className="pt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </HelpCard>

        <HelpCard icon={FiCreditCard} title="การชำระเงิน">
          <BulletList items={paymentMethods} />
        </HelpCard>

        <HelpCard icon={FiTruck} title="การจัดส่ง">
          <BulletList items={shippingMethods} />
          <Link to="/account/orders" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:text-brand-dark">
            ติดตามคำสั่งซื้อของคุณ
            <FiChevronRight size={16} aria-hidden="true" />
          </Link>
        </HelpCard>

        <HelpCard icon={FiMessageCircle} title="ติดต่อทีมงาน">
          <p className="text-sm text-[#2B3445]">มีคำถามเรื่องสินค้า การสั่งซื้อ หรือการจัดส่ง แชทกับแอดมินได้เลย</p>
          <button
            type="button"
            onClick={startChat}
            className="mt-4 flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark sm:w-fit"
          >
            <FiMessageCircle size={18} aria-hidden="true" />
            แชทกับแอดมิน
          </button>
        </HelpCard>
      </div>

      <SupportChat />
    </InfoPageLayout>
  );
}

function HelpCard({ icon: Icon, title, children }: { icon: IconType; title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-ink">
        <Icon size={18} className="shrink-0 text-brand" aria-hidden="true" />
        {title}
      </h2>
      {children}
    </section>
  );
}

function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2.5 text-sm text-[#2B3445]">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  );
}

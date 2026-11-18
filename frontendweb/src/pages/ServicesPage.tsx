import type { IconType } from 'react-icons';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCpu, FiTrendingUp, FiTruck } from 'react-icons/fi';
import { FaRegCommentDots } from 'react-icons/fa';
import { BsTools } from 'react-icons/bs';
import { InfoPageLayout } from '../components/layout/InfoPageLayout';

interface Service {
  id: string;
  icon: IconType;
  title: string;
  description: string;
  cta: string;
  to: string;
}

// Only services the site actually offers today — each card opens the real page for it.
const services: Service[] = [
  {
    id: 'build',
    icon: FiCpu,
    title: 'จัดสเปกและประกอบคอมพิวเตอร์',
    description: 'เลือกชิ้นส่วนได้ตามงบและการใช้งาน ระบบช่วยกรองชิ้นส่วนให้เข้ากัน เช่น เมนบอร์ดตาม socket ของซีพียู',
    cta: 'เริ่มจัดสเปก',
    to: '/build',
  },
  {
    id: 'upgrade',
    icon: FiTrendingUp,
    title: 'อัปเกรดคอมพิวเตอร์',
    description: 'กรอกสเปกเครื่องเดิม แล้วรับคำแนะนำชิ้นส่วนที่ควรอัปเกรดเพื่อให้เครื่องแรงขึ้น',
    cta: 'เริ่มอัปเกรด',
    to: '/upgrade-pc',
  },
  {
    id: 'consult',
    icon: FaRegCommentDots,
    title: 'ปรึกษาทีมงาน',
    description: 'สอบถามเรื่องสินค้า การเลือกสเปก การสั่งซื้อ หรือการจัดส่งกับทีมงาน MAXCOM',
    cta: 'ไปหน้าช่วยเหลือ',
    to: '/help',
  },
  {
    id: 'orders',
    icon: FiTruck,
    title: 'ติดตามคำสั่งซื้อ',
    description: 'ตรวจสอบสถานะคำสั่งซื้อและติดตามพัสดุได้ตลอดเวลาจากบัญชีของคุณ',
    cta: 'ดูคำสั่งซื้อ',
    to: '/account/orders',
  },
];

/** "บริการของเรา" — what MAXCOM can do for the customer, each linking to where it's done. */
export function ServicesPage() {
  return (
    <InfoPageLayout title="บริการของเรา" icon={BsTools} description="บริการด้านคอมพิวเตอร์ครบวงจรจาก MAXCOM">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {services.map(({ id, icon: Icon, title, description, cta, to }) => (
          <Link
            key={id}
            to={to}
            className="group flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-colors hover:border-brand/40 sm:p-6"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-brand">
              <Icon size={24} aria-hidden="true" />
            </span>
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="flex-1 text-sm text-slate-500">{description}</p>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand">
              {cta}
              <FiArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </div>
    </InfoPageLayout>
  );
}

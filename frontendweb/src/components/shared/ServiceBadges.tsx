import type { IconType } from 'react-icons';
import { BsArrowRepeat, BsFileEarmarkCheck, BsStopwatch, BsTruck } from 'react-icons/bs';
import { Container } from '../ui/Container';

interface ServiceBadge {
  id: string;
  icon: IconType;
  title: string;
  subtitle: string;
}

const serviceBadges: ServiceBadge[] = [
  { id: 'shipping', icon: BsTruck, title: 'ส่งฟรีทั่วไทย', subtitle: 'เมื่อซื้อครบ 5,000 ขึ้นไป' },
  { id: 'return', icon: BsArrowRepeat, title: 'เปลี่ยนคืนสินค้าง่าย', subtitle: 'เปลี่ยนใหม่ภายใน 7 วัน' },
  { id: 'service', icon: BsStopwatch, title: 'รวดเร็วในการให้บริการ', subtitle: 'ตอบด่วน ตอบไว' },
  { id: 'payment', icon: BsFileEarmarkCheck, title: 'ชำระเงินปลอดภัย', subtitle: 'ด้วยระบบออนไลน์' },
];

/** Four standalone service-badge cards — used at the bottom of the homepage and category pages alike. */
export function ServiceBadges() {
  return (
    <section className="bg-slate-50 py-10">
      <Container>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex h-full items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <badge.icon size={36} className="text-[#8FA4C0]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-extrabold text-[#172033]">{badge.title}</p>
                <p className="truncate text-[13px] text-slate-500">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

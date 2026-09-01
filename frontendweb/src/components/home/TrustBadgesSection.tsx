import type { IconType } from 'react-icons';
import { BsChatDots, BsShieldCheck, BsTools, BsTruck } from 'react-icons/bs';
import { Container } from '../ui/Container';

interface TrustBadge {
  id: string;
  icon: IconType;
  title: string;
  lines: [string, string];
}

const trustBadges: TrustBadge[] = [
  {
    id: 'shipping',
    icon: BsTruck,
    title: 'จัดส่งทั่วประเทศ',
    lines: ['ส่งไว ทั่วไทย', 'แพ็กแน่นหนา ปลอดภัยทุกออเดอร์'],
  },
  {
    id: 'warranty',
    icon: BsShieldCheck,
    title: 'รับประกันสินค้า',
    lines: ['ของแท้ 100%', 'เคลมง่าย มั่นใจได้'],
  },
  {
    id: 'consult',
    icon: BsChatDots,
    title: 'ให้คำปรึกษาฟรี',
    lines: ['ผู้เชี่ยวชาญพร้อมแนะนำ', 'เลือกสเปคที่ใช่สำหรับคุณ'],
  },
  {
    id: 'build-service',
    icon: BsTools,
    title: 'บริการประกอบคอม',
    lines: ['ประกอบเสร็จ ทดสอบให้', 'พร้อมใช้งานทันที'],
  },
];

export function TrustBadgesSection() {
  return (
    <section id="trust-badges" className="pb-10">
      <Container>
        <div className="flex flex-col divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white sm:flex-row sm:divide-x sm:divide-y-0">
          {trustBadges.map((badge) => (
            <div key={badge.id} className="flex flex-1 items-center gap-3 px-5 py-4">
              <badge.icon size={36} className="shrink-0 text-brand" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{badge.title}</p>
                <p className="text-xs leading-snug text-slate-400">
                  {badge.lines[0]}
                  <br />
                  {badge.lines[1]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

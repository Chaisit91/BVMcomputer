import type { IconType } from 'react-icons';
import { FiRepeat, FiSearch, FiSliders, FiStar, FiZap } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { cn } from '../../lib/cn';

interface FeatureLink {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: IconType;
  iconBg: string;
  iconColor: string;
}

const featureLinks: FeatureLink[] = [
  {
    id: 'build',
    title: 'จัดสเปคคอม',
    subtitle: 'เลือกชิ้นส่วน จับคู่ให้เข้ากัน',
    href: '#build',
    icon: FiSliders,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
  },
  {
    id: 'search',
    title: 'ค้นหาสินค้า',
    subtitle: 'ค้นหาไว ครบ จบทุกอย่าง',
    href: '#top',
    icon: FiSearch,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-600',
  },
  {
    id: 'compare',
    title: 'เปรียบเทียบสินค้า',
    subtitle: 'เทียบสเปค 2-4 ชิ้น',
    href: '#compare',
    icon: FiRepeat,
    iconBg: 'bg-cyan-50',
    iconColor: 'text-cyan-600',
  },
  {
    id: 'popular',
    title: 'สินค้ายอดนิยม',
    subtitle: 'สินค้ายอดนิยม ประจำสัปดาห์',
    href: '#popular',
    icon: FiStar,
    iconBg: 'bg-violet-50',
    iconColor: 'text-violet-600',
  },
  {
    id: 'promo',
    title: 'โปรโมชั่นวันนี้',
    subtitle: 'อัปเดตดีลใหม่ทุกวัน',
    href: '#promo-build-week',
    icon: FiZap,
    iconBg: 'bg-orange-50',
    iconColor: 'text-orange-600',
  },
];

export function FeatureLinks() {
  return (
    <section className="bg-slate-50 pb-8 pt-4">
      <Container>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {featureLinks.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-card"
            >
              <span className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', item.iconBg, item.iconColor)}>
                <item.icon size={20} aria-hidden="true" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm font-semibold text-ink">{item.title}</span>
                <span className="block truncate text-xs text-slate-400">{item.subtitle}</span>
              </span>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}

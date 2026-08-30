import { BsCpu, BsGpuCard, BsHdd, BsMemory, BsMotherboard, BsPcDisplay, BsPlug } from 'react-icons/bs';
import { FiArrowRight, FiHeadphones } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { CategoryFeatureCard, type CategoryFeatureItem } from './CategoryFeatureCard';

// This curated set mirrors a fixed homepage layout (one featured category +
// seven supporting ones), separate from the full category list in the header.
const featuredCategory: CategoryFeatureItem = {
  id: 'gpu',
  title: 'การ์ดจอ',
  subtitle: 'GRAPHICS CARD',
  href: '#category-gpu',
  icon: BsGpuCard,
};

const secondaryCategories: CategoryFeatureItem[] = [
  { id: 'cpu', title: 'ซีพียู', subtitle: 'CPU', href: '#category-cpu', icon: BsCpu },
  { id: 'motherboard', title: 'เมนบอร์ด', subtitle: 'MOTHERBOARD', href: '#category-motherboard', icon: BsMotherboard },
  { id: 'ram', title: 'แรม', subtitle: 'RAM', href: '#category-ram', icon: BsMemory },
  { id: 'storage', title: 'ที่เก็บข้อมูล', subtitle: 'STORAGE', href: '#category-storage', icon: BsHdd },
  { id: 'psu', title: 'พาวเวอร์ซัพพลาย', subtitle: 'PSU', href: '#category-psu', icon: BsPlug },
  { id: 'case', title: 'เคส', subtitle: 'CASE', href: '#category-case', icon: BsPcDisplay },
  { id: 'peripherals', title: 'อุปกรณ์ต่อพ่วง', subtitle: 'PERIPHERALS', href: '#category-peripherals', icon: FiHeadphones },
];

const firstRow = secondaryCategories.slice(0, 3);
const secondRow = secondaryCategories.slice(3);

export function CategorySection() {
  return (
    <section className="py-10">
      <Container>
        <SectionHeading title="หมวดหมู่สินค้า" viewAllHref="#categories" />

        <div className="flex flex-col gap-4 lg:flex-row">
          <a
            href={featuredCategory.href}
            className="group relative flex min-h-[260px] w-full flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br from-black via-ink to-red-950 p-6 lg:w-64 lg:shrink-0"
          >
            <featuredCategory.icon
              className="pointer-events-none absolute -right-8 bottom-0 text-white/10 transition-transform duration-500 group-hover:scale-105"
              size={220}
              aria-hidden="true"
            />
            <div className="relative">
              <h3 className="text-2xl font-bold text-white">{featuredCategory.title}</h3>
              <p className="mt-1 text-xs font-medium tracking-widest text-slate-400">{featuredCategory.subtitle}</p>
            </div>
            <span className="relative flex items-center gap-1 text-sm font-medium text-brand">
              เลือกดูสินค้า
              <FiArrowRight aria-hidden="true" />
            </span>
          </a>

          <div className="flex flex-1 flex-col gap-3">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {firstRow.map((item) => (
                <CategoryFeatureCard key={item.id} item={item} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {secondRow.map((item) => (
                <CategoryFeatureCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

import type { IconType } from 'react-icons';
import { PiFan } from 'react-icons/pi';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { categoryMenuItems } from '../../data/categoryMenuItems';
import { CategoryFeatureCard, type CategoryFeatureItem } from './CategoryFeatureCard';

// Homepage order and labels. Route and icon come from the header's category menu, so both
// always point at the same real category pages; `icon` overrides the menu icon on this section only.
const homepageCategories: { id: string; title: string; subtitle: string; icon?: IconType }[] = [
  { id: 'cpu', title: 'ซีพียู', subtitle: 'CPU' },
  { id: 'motherboard', title: 'เมนบอร์ด', subtitle: 'MOTHERBOARD' },
  { id: 'gpu', title: 'การ์ดจอ', subtitle: 'GRAPHICS CARD' },
  { id: 'ram', title: 'แรม', subtitle: 'RAM' },
  { id: 'storage', title: 'ที่เก็บข้อมูล', subtitle: 'STORAGE' },
  { id: 'psu', title: 'พาวเวอร์ซัพพลาย', subtitle: 'PSU' },
  { id: 'case', title: 'เคส', subtitle: 'CASE' },
  { id: 'cooling', title: 'ชุดระบายความร้อน', subtitle: 'COOLING', icon: PiFan },
];

const categories: CategoryFeatureItem[] = homepageCategories.flatMap(({ icon, ...category }) => {
  const menuItem = categoryMenuItems.find((item) => item.id === category.id);
  return menuItem?.to ? [{ ...category, to: menuItem.to, icon: icon ?? menuItem.icon }] : [];
});

export function CategorySection() {
  return (
    <section className="bg-slate-50 py-10">
      <Container>
        <SectionHeading
          title="หมวดหมู่สินค้า"
          eyebrow="เลือกหมวดสินค้าที่คุณสนใจ ค้นหา และเลือกสเปคที่ใช่สำหรับคุณ"
          viewAllHref="#categories"
        />

        {/* Equal-width horizontal cards. A horizontal card needs ~215px for the longest name
            ("ชุดระบายความร้อน"), so 8 in one row (~1,800px) never fits the 1,216px container
            without overflowing — 4 per row (2 even rows) from lg up, 2 per row below. */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {categories.map((item) => (
            <CategoryFeatureCard key={item.id} item={item} />
          ))}
        </div>
      </Container>
    </section>
  );
}

import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';
import { CategoryPill } from './CategoryPill';

export function CategorySection() {
  const { categories, status } = useAppSelector((state) => state.home);

  return (
    <section className="py-10">
      <Container>
        <SectionHeading title="หมวดหมู่สินค้า" viewAllHref="#categories" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {status === 'loading' && categories.length === 0
            ? Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} className="h-[52px]" />)
            : categories.map((category) => <CategoryPill key={category.id} category={category} />)}
        </div>
      </Container>
    </section>
  );
}

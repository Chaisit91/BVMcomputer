import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';
import { ProductCard } from './ProductCard';

// Homepage teaser: show a fixed 6 — the rest of the catalog lives behind "ดูทั้งหมด".
const VISIBLE_COUNT = 6;

export function ProductSection() {
  const { products, status } = useAppSelector((state) => state.home);
  const visibleProducts = products.slice(0, VISIBLE_COUNT);

  return (
    <section id="popular" className="pb-10">
      <Container>
        <SectionHeading eyebrow="POPULAR PC BUILDS & COMPONENTS" title="สินค้ายอดนิยม" viewAllHref="#products" />
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {status === 'loading' && products.length === 0
            ? Array.from({ length: VISIBLE_COUNT }).map((_, i) => <Skeleton key={i} className="h-40" />)
            : visibleProducts.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Container>
    </section>
  );
}

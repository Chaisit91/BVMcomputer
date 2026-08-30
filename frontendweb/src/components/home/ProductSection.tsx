import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { SectionHeading } from '../ui/SectionHeading';
import { Skeleton } from '../ui/Skeleton';
import { ProductCard } from './ProductCard';

export function ProductSection() {
  const { products, status } = useAppSelector((state) => state.home);

  return (
    <section id="popular" className="py-10">
      <Container>
        <SectionHeading eyebrow="POPULAR PC BUILDS & COMPONENTS" title="สินค้ายอดนิยม" viewAllHref="#products" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {status === 'loading' && products.length === 0
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-64" />)
            : products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </Container>
    </section>
  );
}

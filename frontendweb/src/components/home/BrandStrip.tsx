import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { Skeleton } from '../ui/Skeleton';

export function BrandStrip() {
  const { brands, status } = useAppSelector((state) => state.home);

  return (
    <section className="bg-slate-50 py-6">
      <Container>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-7">
          {status === 'loading' && brands.length === 0
            ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-12" />)
            : brands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex h-12 items-center justify-center rounded-lg border border-slate-200 bg-white text-xs font-semibold tracking-wide text-slate-400"
                >
                  {brand.name}
                </div>
              ))}
        </div>
      </Container>
    </section>
  );
}

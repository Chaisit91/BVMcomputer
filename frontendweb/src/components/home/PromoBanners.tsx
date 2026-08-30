import { FiArrowRight } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { Skeleton } from '../ui/Skeleton';
import { cn } from '../../lib/cn';

export function PromoBanners() {
  const { promoBanners, status } = useAppSelector((state) => state.home);

  return (
    <section className="pb-10">
      <Container>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {status === 'loading' && promoBanners.length === 0
            ? Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40" />)
            : promoBanners.map((banner) => (
                <a
                  key={banner.id}
                  href={banner.href}
                  className={cn(
                    'group relative flex h-40 flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br p-5',
                    banner.gradient,
                  )}
                >
                  <span
                    className={cn(
                      'inline-flex w-fit items-center rounded-md px-2 py-1 text-[11px] font-semibold',
                      banner.tagColor === 'red' ? 'bg-brand text-white' : 'bg-amber-400 text-ink',
                    )}
                  >
                    {banner.tag}
                  </span>
                  <div className="flex items-end justify-between gap-2">
                    <h3 className="text-lg font-semibold leading-snug text-white">{banner.title}</h3>
                    <FiArrowRight
                      className="shrink-0 text-white transition-transform group-hover:translate-x-1"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              ))}
        </div>
      </Container>
    </section>
  );
}

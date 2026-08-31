import { useEffect, useState } from 'react';
import { FiChevronRight, FiZap } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { Skeleton } from '../ui/Skeleton';
import { SpecialDealCard } from './SpecialDealCard';

export function SpecialDealsSection() {
  const { specialDeals, status } = useAppSelector((state) => state.home);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Real side effect: tick the shared countdown forward every second.
  useEffect(() => {
    const timer = setInterval(() => setSecondsElapsed((s) => s + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="special-deals" className="pb-10">
      <Container>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiZap className="text-brand" size={22} aria-hidden="true" />
            <h2 className="text-xl font-bold text-ink">
              Special <span className="text-brand">deals</span>
            </h2>
          </div>
          <a
            href="#special-deals"
            className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
          >
            ดูทั้งหมด
            <FiChevronRight aria-hidden="true" />
          </a>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {status === 'loading' && specialDeals.length === 0
            ? Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)
            : specialDeals.map((deal) => (
                <SpecialDealCard
                  key={deal.id}
                  deal={deal}
                  remainingSeconds={deal.endsInSeconds - secondsElapsed}
                />
              ))}
        </div>
      </Container>
    </section>
  );
}

import { Container } from '../ui/Container';
import { serviceBadges } from '../../data/serviceBadges';
import { cn } from '../../lib/cn';

interface ServiceBadgesProps {
  /** Section background — defaults to the usual light-gray; the homepage overrides it to white. */
  bgClassName?: string;
}

/** Four standalone service-badge cards — used at the bottom of the homepage and category pages alike. */
export function ServiceBadges({ bgClassName = 'bg-slate-50' }: ServiceBadgesProps) {
  return (
    <section className={cn(bgClassName, 'py-10')}>
      <Container>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {serviceBadges.map((badge) => (
            <div
              key={badge.id}
              className="flex h-full items-center gap-3 rounded-xl bg-white px-5 py-4 shadow-card"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center">
                <badge.icon size={36} className="text-[#8FA4C0]" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-[16px] font-extrabold text-[#172033]">{badge.title}</p>
                <p className="truncate text-[13px] text-slate-500">{badge.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}

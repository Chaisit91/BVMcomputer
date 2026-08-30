import { FiArrowRight } from 'react-icons/fi';

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  viewAllHref?: string;
}

/** Reusable "title + optional 'view all' link" header used at the top of every homepage section. */
export function SectionHeading({ eyebrow, title, viewAllHref }: SectionHeadingProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div className="flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <div>
          <h2 className="text-lg font-semibold text-ink sm:text-xl">{title}</h2>
          {eyebrow && <p className="text-xs font-medium tracking-wide text-slate-400">{eyebrow}</p>}
        </div>
      </div>
      {viewAllHref && (
        <a
          href={viewAllHref}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-brand hover:text-brand-dark"
        >
          ดูทั้งหมด
          <FiArrowRight aria-hidden="true" />
        </a>
      )}
    </div>
  );
}

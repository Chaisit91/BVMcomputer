import type { IconType } from 'react-icons';

export interface CategoryFeatureItem {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  icon: IconType;
}

export function CategoryFeatureCard({ item }: { item: CategoryFeatureItem }) {
  return (
    <a
      href={item.href}
      className="flex flex-col items-center justify-center gap-2 rounded-xl border border-slate-100 bg-white px-3 py-5 text-center shadow-sm transition-colors hover:bg-slate-50"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-slate-50 text-ink">
        <item.icon size={22} aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold text-ink">{item.title}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.subtitle}</span>
    </a>
  );
}

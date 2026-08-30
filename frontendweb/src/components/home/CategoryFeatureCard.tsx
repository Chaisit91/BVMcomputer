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
      className="flex flex-col items-center justify-center gap-2 rounded-xl bg-[#f6f9fc] px-3 py-5 text-center transition-colors hover:bg-slate-100"
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-white text-ink shadow-sm">
        <item.icon size={22} aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold text-ink">{item.title}</span>
      <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">{item.subtitle}</span>
    </a>
  );
}

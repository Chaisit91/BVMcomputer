import { categoryIcons } from './categoryIcons';
import type { Category } from '../../types';

export function CategoryPill({ category }: { category: Category }) {
  const Icon = categoryIcons[category.icon];
  return (
    <a
      href={`#category-${category.slug}`}
      className="group flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink transition-all hover:-translate-y-0.5 hover:border-brand hover:shadow-card"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-ink group-hover:bg-brand group-hover:text-white">
        <Icon size={16} aria-hidden="true" />
      </span>
      <span className="truncate font-medium">{category.name}</span>
    </a>
  );
}

import type { IconType } from 'react-icons';
import { FiCheck } from 'react-icons/fi';
import { cn } from '../../lib/cn';
import { formatTHB } from '../../lib/format';

export interface BuildOptionItem {
  id: string;
  name: string;
  price: number;
  specLines: string[];
  badge?: string;
  inStock: boolean;
}

interface BuildOptionCardProps {
  item: BuildOptionItem;
  icon: IconType;
  selected: boolean;
  onSelect: () => void;
}

/** One selectable part option inside a build step — click to pick it, click again elsewhere to swap. */
export function BuildOptionCard({ item, icon: Icon, selected, onSelect }: BuildOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-white p-3 text-left transition-shadow',
        selected ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200 hover:shadow-card',
      )}
    >
      {selected && (
        <span className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
          <FiCheck size={14} aria-hidden="true" />
        </span>
      )}
      {item.badge && (
        <span className="absolute left-2 top-2 z-10 rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white shadow-sm">
          {item.badge}
        </span>
      )}

      <div className="flex aspect-square items-center justify-center rounded-lg bg-slate-50">
        <Icon size={44} className="text-slate-300" aria-hidden="true" />
      </div>

      <div className="mt-2 flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 min-h-[2.25rem] text-sm font-medium text-ink">{item.name}</h3>
        <p className="line-clamp-2 text-xs text-slate-400">{item.specLines.join(' · ')}</p>
        {!item.inStock && <p className="text-[11px] font-medium text-slate-500">สั่งจอง</p>}
        <span className="mt-auto pt-1 text-base font-bold text-brand">{formatTHB(item.price)}</span>
      </div>
    </button>
  );
}

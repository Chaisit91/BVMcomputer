import type { IconType } from 'react-icons';
import { FiMinus, FiPlus } from 'react-icons/fi';
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
  /** Called instead of onSelect when clicking an already-selected card, to unpick it. */
  onRemove?: () => void;
}

/** One selectable part option inside a build step — click to pick it, click again to remove it. */
export function BuildOptionCard({ item, icon: Icon, selected, onSelect, onRemove }: BuildOptionCardProps) {
  return (
    <button
      type="button"
      onClick={selected && onRemove ? onRemove : onSelect}
      aria-pressed={selected}
      className={cn(
        'relative flex flex-col overflow-hidden rounded-xl border bg-white p-3 text-left transition-shadow',
        selected ? 'border-brand ring-2 ring-brand/30' : 'border-slate-200 hover:shadow-card',
      )}
    >
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
        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="text-base font-bold text-brand">{formatTHB(item.price)}</span>
          <span
            aria-hidden="true"
            className={cn(
              'flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
              selected ? 'border-brand bg-brand text-white' : 'border-brand bg-white text-brand',
            )}
          >
            {selected ? <FiMinus size={20} /> : <FiPlus size={20} />}
          </span>
        </div>
      </div>
    </button>
  );
}

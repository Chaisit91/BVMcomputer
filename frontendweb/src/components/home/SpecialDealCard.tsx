import { FiShoppingCart } from 'react-icons/fi';
import { formatTHB } from '../../lib/format';
import { categoryIcons } from './categoryIcons';
import type { SpecialDeal } from '../../types';

function formatCountdown(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = clamped % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

interface SpecialDealCardProps {
  deal: SpecialDeal;
  remainingSeconds: number;
}

export function SpecialDealCard({ deal, remainingSeconds }: SpecialDealCardProps) {
  const Icon = categoryIcons[deal.category];

  return (
    <a href={`#deal-${deal.slug}`} className="flex flex-col rounded-xl border border-slate-200 bg-white p-3">
      <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg bg-slate-50">
        <span className="absolute left-2 top-2 z-10 rounded-md bg-brand px-2 py-1 text-xs font-bold text-white">
          -{deal.discountPercent}%
        </span>
        {deal.image ? (
          // object-contain keeps the whole product visible at its natural proportions —
          // a wide GPU and a squarer CPU/PSU/mainboard box both just sit centered, no crop/stretch.
          <img src={deal.image} alt={deal.name} className="h-full w-full object-contain p-3" />
        ) : (
          <Icon size={64} className="text-slate-300" aria-hidden="true" />
        )}
      </div>

      <h3 className="mt-2.5 line-clamp-3 min-h-[3.75rem] text-sm font-semibold leading-snug text-ink">
        {deal.name}
      </h3>

      <div className="mt-1.5 flex items-baseline gap-2">
        <span className="text-lg font-bold text-brand">{formatTHB(deal.price)}</span>
        <span className="text-xs text-slate-400 line-through">{formatTHB(deal.originalPrice)}</span>
      </div>

      <div className="mt-2.5">
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-brand" style={{ width: `${deal.soldPercent}%` }} />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
          <span>เหลือ {deal.stockLeft} ชิ้น</span>
          <span className="font-medium text-ink">{deal.soldPercent}%</span>
        </div>
      </div>

      <div className="mt-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-brand/40 px-3 py-2 text-xs font-medium tabular-nums text-brand">
        <FiShoppingCart size={14} aria-hidden="true" />
        <span>เหลือ {formatCountdown(remainingSeconds)}</span>
      </div>
    </a>
  );
}

import { categoryIcons } from '../home/categoryIcons';
import { cn } from '../../lib/cn';
import { upgradeSpecRows } from '../../data/upgradeSpecRows';
import type { UpgradeSelection } from '../../types/upgrade';

interface AnalysisSpecCardProps {
  currentSpec: UpgradeSelection;
  upgrades: UpgradeSelection;
}

/**
 * Left column of step 3 — read-only view of the spec being analyzed (old part, or the
 * replacement with an "อัปเกรด" badge). Same row layout as step 2's sidebar, minus the
 * remove/continue controls since nothing here is editable anymore.
 */
export function AnalysisSpecCard({ currentSpec, upgrades }: AnalysisSpecCardProps) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card lg:sticky lg:top-20">
      <div className="mb-2 flex items-center gap-2.5">
        <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <h2 className="text-base font-bold text-ink">สเปคคอมปัจจุบันของคุณ</h2>
      </div>

      <ul className="flex flex-col divide-y divide-slate-100">
        {upgradeSpecRows.map(({ key, label }) => {
          const current = currentSpec[key];
          const upgrade = upgrades[key];
          const shown = upgrade ?? current;
          const Icon = categoryIcons[key];

          return (
            <li key={key} className="flex items-center gap-3 py-2">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-slate-50 p-1.5">
                {shown?.image ? (
                  <img src={shown.image} alt={shown.name} className="h-full w-full object-contain" />
                ) : (
                  <Icon size={24} className="text-slate-300" aria-hidden="true" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">{label}</p>
                {shown ? (
                  <>
                    <p className={cn('truncate text-sm font-medium', upgrade ? 'text-brand' : 'text-ink')}>{shown.name}</p>
                    <p className="truncate text-xs text-slate-400">
                      {upgrade ? (current ? `จาก ${current.name}` : 'เพิ่มชิ้นส่วนใหม่') : shown.specifications.join(' · ')}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400">ยังไม่ได้ระบุ</p>
                )}
              </div>

              {upgrade && (
                <span className="shrink-0 rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-brand">
                  อัปเกรด
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { FiAlertCircle, FiCheckCircle, FiLock, FiTrash2, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { categoryIcons } from '../home/categoryIcons';
import { cn } from '../../lib/cn';
import { upgradeSpecRows as specRows } from '../../data/upgradeSpecRows';
import type { UpgradeComponentKey, UpgradeSelection } from '../../types/upgrade';

interface UpgradeCurrentSpecSidebarProps {
  currentSpec: UpgradeSelection;
  upgrades: UpgradeSelection;
  onRemoveUpgrade: (key: UpgradeComponentKey) => void;
  onClearUpgrades: () => void;
  onContinue: () => void;
}

/**
 * Right column of step 2. Each row shows the part the customer will end up with:
 * their current one, or — once they've picked a replacement — the new one with an
 * "อัปเกรด" badge and "จาก <old part>", so old → new is visible in real time.
 */
export function UpgradeCurrentSpecSidebar({
  currentSpec,
  upgrades,
  onRemoveUpgrade,
  onClearUpgrades,
  onContinue,
}: UpgradeCurrentSpecSidebarProps) {
  const upgradeCount = specRows.filter((row) => upgrades[row.key]).length;

  return (
    <div className="flex flex-col gap-4 lg:sticky lg:top-20">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            <h2 className="text-base font-bold text-ink">สเปคคอมปัจจุบันของคุณ</h2>
          </div>
          <Link to="/upgrade-pc" className="text-xs font-medium text-brand hover:text-brand-dark">
            ดูทั้งหมด →
          </Link>
        </div>

        <ul className="flex flex-col divide-y divide-slate-100">
          {specRows.map(({ key, label }) => {
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
                        {upgrade
                          ? current
                            ? `จาก ${current.name}`
                            : 'เพิ่มชิ้นส่วนใหม่'
                          : shown.specifications.join(' · ')}
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

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-bold text-ink">รายการอัปเกรดที่เลือก ({upgradeCount} รายการ)</h2>
          {upgradeCount > 0 && (
            <button
              type="button"
              onClick={onClearUpgrades}
              className="flex shrink-0 items-center gap-1 text-xs font-medium text-brand hover:text-brand-dark"
            >
              <FiTrash2 size={12} aria-hidden="true" />
              ล้างทั้งหมด
            </button>
          )}
        </div>

        {upgradeCount === 0 ? (
          <p className="mt-2 text-xs text-slate-400">ยังไม่ได้เลือกชิ้นส่วนที่ต้องการอัปเกรด</p>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {specRows.map(({ key, label }) => {
              const upgrade = upgrades[key];
              if (!upgrade) return null;
              return (
                <li
                  key={key}
                  className="flex items-center justify-between gap-2 rounded-md border border-slate-200 bg-white px-2.5 py-1.5"
                >
                  <span className="min-w-0 truncate text-xs text-ink">
                    <span className="font-semibold">{label}:</span> {upgrade.name}
                  </span>
                  <button
                    type="button"
                    aria-label={`ยกเลิกการอัปเกรด ${label}`}
                    onClick={() => onRemoveUpgrade(key)}
                    className="shrink-0 text-slate-400 transition-colors hover:text-brand"
                  >
                    <FiX size={14} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div
          className={cn(
            'mt-3 flex items-start gap-2.5 rounded-lg border px-3 py-2.5',
            upgradeCount > 0
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-amber-200 bg-amber-50 text-amber-700',
          )}
        >
          {upgradeCount > 0 ? (
            <>
              <FiCheckCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold">เลือกสินค้าแล้ว {upgradeCount} รายการ</p>
                <p className="text-xs text-emerald-700/80">สามารถวิเคราะห์และดูคำแนะนำได้เลย</p>
              </div>
            </>
          ) : (
            <>
              <FiAlertCircle size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <p className="text-sm font-medium">เลือกสินค้าอย่างน้อย 1 รายการเพื่อดำเนินการต่อ</p>
            </>
          )}
        </div>

        <button
          type="button"
          disabled={upgradeCount === 0}
          onClick={onContinue}
          className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
        >
          วิเคราะห์และดูคำแนะนำ →
        </button>

        <p className="mt-2.5 flex items-center justify-center gap-1 text-xs text-slate-400">
          <FiLock size={12} aria-hidden="true" />
          ปลอดภัย 100% ข้อมูลของคุณจะไม่ถูกเปิดเผย
        </p>
      </div>
    </div>
  );
}

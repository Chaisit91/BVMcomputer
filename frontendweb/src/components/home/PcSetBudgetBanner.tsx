import { useState } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { cn } from '../../lib/cn';

interface BudgetPick {
  /** Real pcSetProducts id this card links to — the closest match to the marketing budget below. */
  productId: string;
  /** Rounded marketing budget figure shown on the card (not necessarily the product's exact price). */
  budget: number;
  tierLabel: string;
  /** Product photo — a real asset, once the backend/team provides one at this path. Falls back to a
   *  drawn illustration (below) so the card still looks intentional in the meantime. */
  imageUrl: string;
  cardGradient: string;
  accent: string;
}

// Nearest real PC-set product to each round marketing budget tier — the card links
// through to that real product, but shows the tier's rounded figure, not its exact price.
const budgetPicks: BudgetPick[] = [
  {
    productId: 'set7',
    budget: 15000,
    tierLabel: 'เริ่มต้นที่นี่',
    imageUrl: '/images/pc-set-15k.png',
    cardGradient: 'from-sky-500/20 via-sky-900/10 to-transparent',
    accent: '#38bdf8',
  },
  {
    productId: 'set4',
    budget: 25000,
    tierLabel: 'ยอดนิยม',
    imageUrl: '/images/pc-set-25k.png',
    cardGradient: 'from-blue-500/20 via-purple-900/15 to-transparent',
    accent: '#a78bfa',
  },
  {
    productId: 'set1',
    budget: 40000,
    tierLabel: 'สายจริงจัง',
    imageUrl: '/images/pc-set-40k.png',
    cardGradient: 'from-purple-500/20 via-red-900/15 to-transparent',
    accent: '#f472b6',
  },
  {
    productId: 'set8',
    budget: 70000,
    tierLabel: 'ระดับพรีเมียม',
    imageUrl: '/images/pc-set-70k.png',
    cardGradient: 'from-orange-500/20 via-amber-900/15 to-transparent',
    accent: '#fbbf24',
  },
];

/** Homepage entry point into the PC-set category — deliberately not a "build your own PC" pitch. */
export function PcSetBudgetBanner() {
  return (
    <section className="bg-slate-50">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0a0f1c] via-[#0b1220] to-black">
          <span
            className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-brand/20 blur-[90px]"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-brand/10 blur-[90px]"
            aria-hidden="true"
          />

          <div className="relative grid grid-cols-1 gap-6 p-5 sm:p-6 lg:grid-cols-[280px_1fr] lg:items-center lg:py-7">
            {/* Left: pitch */}
            <div>
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
                Recommended
              </span>
              <h2 className="mt-2.5 text-2xl font-extrabold leading-tight text-white sm:text-[26px]">
                คอมเซ็ตแนะนำ
                <br />
                <span className="text-brand">ตามงบประมาณ</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">คัดสเปคที่คุ้มค่ามาให้แล้ว เหมาะกับทุกการใช้งาน</p>
              <Link
                to="/category/pc-sets"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                ดูเซ็ตทั้งหมด
                <FiArrowRight aria-hidden="true" />
              </Link>
            </div>

            {/* Right: 4 real PC-set picks, one per budget tier */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {budgetPicks.map((pick) => (
                <BudgetPickCard key={pick.productId} pick={pick} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function BudgetPickCard({ pick }: { pick: BudgetPick }) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    // TODO(link-target): not wired to a product page yet — plain div for now, on request.
    <div
      className={cn(
        'group relative flex cursor-pointer flex-col overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b px-3 pt-3.5 text-center transition-colors duration-300 hover:border-white/25',
        pick.cardGradient,
      )}
    >
      <p className="text-[15px] font-extrabold leading-none text-white">งบ {pick.budget.toLocaleString('th-TH')}.-</p>
      <p className="mt-1.5 text-[11px] font-semibold text-slate-300">{pick.tierLabel}</p>

      <div className="relative mt-1 flex flex-1 items-end justify-center">
        {/* Ambient glow behind the rig, in the tier's accent color */}
        <span
          className="absolute bottom-4 h-20 w-20 rounded-full opacity-50 blur-2xl transition-opacity duration-300 group-hover:opacity-80"
          style={{ background: pick.accent }}
          aria-hidden="true"
        />

        <div className="relative w-full translate-y-0 transition-transform duration-300 ease-out group-hover:-translate-y-1.5">
          {pick.imageUrl && !imageFailed ? (
            <img
              src={pick.imageUrl}
              alt=""
              aria-hidden="true"
              onError={() => setImageFailed(true)}
              className="mx-auto h-32 w-full object-contain object-bottom sm:h-36"
            />
          ) : (
            <PcRigPlaceholder accent={pick.accent} />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Drawn fallback rig — used until the real product photo exists at each pick's
 * `imageUrl` above. Deliberately not a flat category icon: a case silhouette with
 * glowing fans and a stand, so the card still reads as "a PC", not a placeholder.
 */
function PcRigPlaceholder({ accent }: { accent: string }) {
  return (
    <div className="mx-auto flex h-32 w-20 flex-col items-center justify-end sm:h-36">
      <div
        className="relative flex h-28 w-16 flex-col items-center justify-end overflow-hidden rounded-md border bg-gradient-to-b from-[#161b26] to-[#05060a] pb-2 sm:h-32"
        style={{ borderColor: `${accent}4d` }}
      >
        <span className="absolute inset-y-1.5 left-1 w-[3px] rounded-full" style={{ background: accent, boxShadow: `0 0 6px ${accent}` }} aria-hidden="true" />
        <div className="flex flex-col items-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-3.5 w-3.5 rounded-full border"
              style={{ borderColor: accent, boxShadow: `0 0 8px 1.5px ${accent}` }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>
      <span className="mt-1 h-1.5 w-14 rounded-full opacity-70 blur-[2px]" style={{ background: accent }} aria-hidden="true" />
    </div>
  );
}

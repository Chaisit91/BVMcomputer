import { useState } from 'react';
import { BsCheckCircleFill, BsGpuCard, BsLightningChargeFill } from 'react-icons/bs';
import { FiTrendingUp } from 'react-icons/fi';
import { PiCpuFill } from 'react-icons/pi';

interface HeroFeature {
  id: string;
  icon: typeof BsCheckCircleFill;
  title: string;
  subtitle: string;
}

const features: HeroFeature[] = [
  { id: 'ai', icon: PiCpuFill, title: 'วิเคราะห์ด้วย AI', subtitle: 'รู้ว่าควรอัปเกรดอะไร' },
  { id: 'compat', icon: BsCheckCircleFill, title: 'ตรวจสอบความเข้ากันได้', subtitle: 'มั่นใจก่อนซื้อ' },
  { id: 'value', icon: BsLightningChargeFill, title: 'แนะนำชิ้นส่วนที่เหมาะสม', subtitle: 'ตรงกับงบและการใช้งาน' },
];

interface UpgradeHeroBannerProps {
  badge?: string;
  headingPrefix?: string;
  /** Rendered in red — the highlighted half of the heading. */
  headingHighlight?: string;
  subheading?: string;
  description?: string;
  /** Real PC/hardware photo (PNG/WebP, transparent bg), once the backend/CMS provides one — falls back to a drawn showcase when absent. */
  imageUrl?: string;
}

/**
 * Hero for the upgrade-advisor page, sized to the site's actual banner area:
 * 1216×304px, `py-10 px-12` (40/48px) padding, border-box. `min-h` (not a hard
 * `h-`) so it never clips text if content ends up slightly taller.
 */
export function UpgradeHeroBanner({
  badge = 'UPGRADE YOUR PC',
  headingPrefix = 'อัปเกรด',
  headingHighlight = 'คอมเก่า',
  subheading = 'มีคอมอยู่แล้ว แต่อยากแรงขึ้น?',
  description = 'ให้เราช่วยวิเคราะห์และแนะนำการอัปเกรดที่เหมาะกับเครื่องและการใช้งานของคุณ',
  imageUrl,
}: UpgradeHeroBannerProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="relative mb-5 box-border flex w-full max-w-[1216px] flex-col justify-center overflow-hidden rounded-2xl border border-red-100 bg-gradient-to-br from-white via-white to-red-50 px-6 py-6 sm:min-h-[304px] sm:px-12 sm:py-10">
      {/* Background only — soft pink glow + a thin abstract reflection, no text baked in. */}
      <span
        className="pointer-events-none absolute -right-10 -top-24 h-72 w-72 rounded-full bg-brand/10 blur-[90px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -bottom-16 right-1/3 h-56 w-56 rounded-full bg-rose-200/40 blur-[80px]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/2 bg-gradient-to-l from-white/40 to-transparent sm:block"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        {/* Left ~51% */}
        <div className="flex flex-col justify-center sm:w-[51%]">
          <span className="inline-block w-fit rounded-full bg-brand/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand">
            {badge}
          </span>
          <h1 className="mt-2 text-[32px] font-extrabold leading-[1.1] sm:text-[38px]">
            <span className="text-ink">{headingPrefix}</span>
            <span className="text-brand">{headingHighlight}</span>
          </h1>
          <p className="mt-1.5 text-[17px] font-semibold text-ink sm:text-[18px]">{subheading}</p>
          <p className="mt-1.5 text-[15px] font-medium leading-relaxed text-slate-700">{description}</p>

          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
            {features.map((feature) => (
              <div key={feature.id} className="flex items-center gap-1.5">
                <feature.icon size={22} className="shrink-0 text-brand" aria-hidden="true" />
                <div className="leading-tight">
                  <p className="text-[12px] font-semibold text-ink sm:text-[13px]">{feature.title}</p>
                  <p className="text-[11px] text-slate-400">{feature.subtitle}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right ~48% — real hardware photo when available, drawn showcase otherwise. The
            PC itself is the visual anchor here, not a row of small icons. */}
        <div className="relative hidden shrink-0 items-end justify-center sm:flex sm:h-full sm:w-[46%]">
          {imageUrl && !imageFailed ? (
            <img
              src={imageUrl}
              alt=""
              aria-hidden="true"
              onError={() => setImageFailed(true)}
              className="h-full max-h-[260px] w-full object-contain object-bottom"
            />
          ) : (
            <GamingPcShowcase />
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Drawn "gaming PC" fallback — the case (RGB fans) is the anchor, with the
 * motherboard, GPU, CPU and PSU laid out around/in front of it for depth,
 * standing in for a real product photo until one exists (see `imageUrl` above).
 */
function GamingPcShowcase() {
  return (
    <div className="relative h-[232px] w-[496px] max-w-full">
      {/* Motherboard — behind the case, peeking out top-left. */}
      <div
        className="absolute left-0 top-2 z-0 h-[154px] w-[74px] -rotate-3 rounded-md border border-brand/15 bg-gradient-to-b from-[#141821] to-[#05060a] shadow-md"
        aria-hidden="true"
      >
        <span className="absolute left-1/2 top-3 h-9 w-9 -translate-x-1/2 rounded-sm bg-brand/20" />
        <span className="absolute bottom-2 left-1.5 right-1.5 h-[3px] rounded-full bg-brand/60" />
      </div>

      {/* Case body — the dominant visual. */}
      <div className="absolute bottom-0 left-[66px] z-10 flex h-[232px] w-[142px] flex-col items-center justify-end overflow-hidden rounded-lg border border-brand/25 bg-gradient-to-b from-[#1c212e] to-[#05060a] pb-3.5 shadow-xl">
        <span
          className="absolute inset-y-2 left-2 w-1 rounded-full bg-brand"
          style={{ boxShadow: '0 0 8px #e6001a' }}
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-3">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-8 w-8 rounded-full border-2 border-brand"
              style={{ boxShadow: '0 0 14px 2px rgba(230,0,18,0.55)' }}
              aria-hidden="true"
            />
          ))}
        </div>
      </div>

      {/* GPU — horizontal card, overlapping the case's bottom-left corner. */}
      <div className="absolute bottom-4 left-7 z-20 flex h-[52px] w-[112px] items-center justify-center gap-2 rounded-md border border-brand/20 bg-gradient-to-b from-[#161b26] to-[#05060a] shadow-lg">
        {[0, 1].map((i) => (
          <span key={i} className="h-6 w-6 rounded-full border border-brand/70" aria-hidden="true" />
        ))}
        <BsGpuCard size={17} className="ml-1 shrink-0 text-brand" aria-hidden="true" />
      </div>

      {/* CPU — small labelled chip, in front, between the case and the PSU. */}
      <div className="absolute bottom-0 left-[216px] z-20 flex h-14 w-14 flex-col items-center justify-center rounded-md border border-slate-300 bg-gradient-to-b from-slate-100 to-slate-300 shadow-md">
        <PiCpuFill size={19} className="text-slate-500" aria-hidden="true" />
        <span className="mt-0.5 text-[9px] font-bold tracking-wide text-slate-500">CPU</span>
      </div>

      {/* PSU — box with its own fan, to the right. */}
      <div className="absolute bottom-0 left-[284px] z-10 flex h-16 w-[76px] items-center justify-center rounded-md border border-brand/20 bg-gradient-to-b from-[#161b26] to-[#05060a] shadow-md">
        <span className="h-7 w-7 rounded-full border-2 border-brand/70" aria-hidden="true" />
      </div>

      {/* Upgrade motif — to the right of all the hardware, never overlapped by it. */}
      <div className="absolute right-0 top-2 flex -rotate-6 items-center gap-1" aria-hidden="true">
        <FiTrendingUp size={20} className="text-brand drop-shadow-[0_0_8px_rgba(230,0,18,0.35)]" />
        <div className="text-left leading-[1.05]">
          <p className="text-[12px] font-extrabold italic tracking-wide text-brand">UPGRADE</p>
          <p className="text-[10px] font-bold italic tracking-wide text-ink/60">BETTER PERFORMANCE</p>
        </div>
      </div>

      {/* Base/stand glow */}
      <span
        className="absolute bottom-[-6px] left-[84px] h-3 w-32 rounded-full bg-brand/40 blur-[7px]"
        aria-hidden="true"
      />
    </div>
  );
}

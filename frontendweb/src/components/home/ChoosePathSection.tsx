import type { IconType } from 'react-icons';
import { FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { PiComputerTowerFill } from 'react-icons/pi';
import { Link } from 'react-router-dom';
import { Container } from '../ui/Container';
import { categoryIcons } from './categoryIcons';
import { cn } from '../../lib/cn';
import type { CategoryIconKey } from '../../types';

interface PathCardConfig {
  id: string;
  badge: string;
  heading: string;
  description: string;
  ctaLabel: string;
  to: string;
  accent: string;
  cardGradient: string;
  glow: string;
  parts: CategoryIconKey[];
  backdropIcon: IconType;
}

const pathCards: PathCardConfig[] = [
  {
    id: 'build',
    badge: 'BUILD YOUR PC',
    heading: 'จัดสเปคคอมใหม่',
    description: 'เลือกสเปคได้ตามงบและการใช้งาน ประกอบคอมในแบบของคุณได้ง่ายๆ',
    ctaLabel: 'เริ่มจัดสเปคเลย',
    to: '/build',
    accent: '#e6001a',
    cardGradient: 'from-[#2a0a0f] via-[#1a0709] to-[#0b0304]',
    glow: 'bg-brand/25',
    parts: ['case', 'gpu', 'cpu', 'motherboard', 'ram', 'psu'],
    backdropIcon: PiComputerTowerFill,
  },
  {
    id: 'upgrade',
    badge: 'UPGRADE YOUR PC',
    heading: 'อัปเกรดคอมเก่า',
    description: 'มีคอมอยู่แล้ว แต่อยากแรงขึ้น? ตรวจสอบและแนะนำชิ้นส่วนที่ควรอัปเกรด',
    ctaLabel: 'เริ่มอัปเกรดเลย',
    // TODO(backend): no upgrade-advisor system yet — this mock route just gets the
    // CTA somewhere real (a page, not a dead link) until that feature is built.
    to: '/upgrade-pc',
    accent: '#38bdf8',
    cardGradient: 'from-[#08202e] via-[#071722] to-[#040c12]',
    glow: 'bg-sky-400/20',
    parts: ['gpu', 'cpu', 'ram', 'storage', 'psu', 'motherboard'],
    backdropIcon: FiTrendingUp,
  },
];

/** Homepage entry section — two routes into the site's two "get a PC" flows. */
export function ChoosePathSection() {
  return (
    <section className="bg-slate-50 pb-10">
      <Container>
        <div className="mb-5 flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-ink sm:text-xl">เลือกเส้นทางที่เหมาะกับคุณ</h2>
          </div>
          {/* TODO(build-page): no buying-advice page yet — inert for now, matching other unbuilt nav links. */}
          <a
            href="#guide"
            className="flex shrink-0 items-center gap-1 whitespace-nowrap text-xs font-medium text-slate-400 hover:text-brand sm:text-sm"
          >
            ไม่แน่ใจว่าจะเลือกแบบไหน? <span className="text-brand">ดูคำแนะนำ →</span>
          </a>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {pathCards.map((card) => (
            <Link
              key={card.id}
              to={card.to}
              className={cn(
                'group relative flex min-h-[220px] items-center overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br p-5 transition-colors duration-300 hover:border-white/25 sm:min-h-[240px] sm:p-6',
                card.cardGradient,
              )}
            >
              <span
                className={cn('pointer-events-none absolute -right-10 -top-10 h-52 w-52 rounded-full blur-[80px]', card.glow)}
                aria-hidden="true"
              />

              <div className="relative flex w-full items-center justify-between gap-4">
                <div className="max-w-[230px] sm:max-w-[260px]">
                  <span
                    className="inline-block rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider"
                    style={{ color: card.accent }}
                  >
                    {card.badge}
                  </span>
                  <h3 className="mt-2.5 text-xl font-extrabold leading-tight text-white sm:text-2xl">{card.heading}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-300 sm:text-sm">{card.description}</p>
                  <span
                    className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors sm:text-sm"
                    style={{ background: card.accent }}
                  >
                    {card.ctaLabel}
                    <FiArrowRight aria-hidden="true" />
                  </span>
                </div>

                <ComponentShowcase parts={card.parts} accent={card.accent} BackdropIcon={card.backdropIcon} />
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}

function ComponentShowcase({
  parts,
  accent,
  BackdropIcon,
}: {
  parts: CategoryIconKey[];
  accent: string;
  BackdropIcon: IconType;
}) {
  return (
    <div className="relative hidden h-[150px] w-[190px] shrink-0 items-center justify-center sm:flex">
      <BackdropIcon size={110} className="absolute text-white/[0.06]" aria-hidden="true" />
      <div className="relative grid grid-cols-3 gap-2.5">
        {parts.map((key, index) => {
          const Icon = categoryIcons[key];
          return (
            <span
              key={key}
              className={cn(
                'flex h-11 w-11 items-center justify-center rounded-xl border bg-white/[0.05] backdrop-blur-sm transition-transform duration-300 group-hover:-translate-y-0.5',
                index % 2 === 1 && 'translate-y-2.5',
              )}
              style={{ borderColor: `${accent}40`, boxShadow: `0 0 14px -5px ${accent}` }}
            >
              <Icon size={19} style={{ color: accent }} aria-hidden="true" />
            </span>
          );
        })}
      </div>
    </div>
  );
}

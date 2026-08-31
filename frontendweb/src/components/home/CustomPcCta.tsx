import type { IconType } from 'react-icons';
import { BsController } from 'react-icons/bs';
import {
  FiArrowRight,
  FiBookmark,
  FiBriefcase,
  FiCreditCard,
  FiPenTool,
  FiSettings,
  FiShoppingCart,
  FiSliders,
  FiTag,
  FiVideo,
} from 'react-icons/fi';
import { Container } from '../ui/Container';
import { cn } from '../../lib/cn';

interface Feature {
  id: string;
  icon: IconType;
  title: string;
  subtitle: string;
}

const features: Feature[] = [
  { id: 'auto', icon: FiSliders, title: 'แนะนำสเปคอัตโนมัติ', subtitle: 'ตามงบประมาณและการใช้งาน' },
  { id: 'price', icon: FiTag, title: 'เช็คราคาแบบเรียลไทม์', subtitle: 'อัปเดตราคาทุกวัน ถูกที่สุด' },
  { id: 'save', icon: FiBookmark, title: 'บันทึกและแชร์สเปค', subtitle: 'ง่ายต่อการเปรียบเทียบและตัดสินใจ' },
];

interface Preset {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  price: number;
  accentIcon: IconType;
  accentColor: string;
  priceColor: string;
  glow: string;
}

// TODO(assets): swap the gradient placeholder for a real setup photo per
// preset once those files are available — see CustomPcCta card markup below.
const presets: Preset[] = [
  {
    id: 'gaming',
    title: 'เล่นเกม',
    subtitle: 'GAMING',
    description: 'สเปคแรง ลื่นทุกเกม เฟรมเรตสูง ไม่มีสะดุด',
    price: 25000,
    accentIcon: BsController,
    accentColor: 'text-pink-400',
    priceColor: 'text-pink-400',
    glow: 'from-pink-500/30 via-ink-light/70 to-ink-light',
  },
  {
    id: 'streaming',
    title: 'สตรีมมิ่ง',
    subtitle: 'STREAMING',
    description: 'สตรีมลื่น คมชัด ไม่กระตุก พร้อมใช้งานและสร้างสรรค์',
    price: 35000,
    accentIcon: FiVideo,
    accentColor: 'text-cyan-400',
    priceColor: 'text-cyan-400',
    glow: 'from-cyan-500/30 via-ink-light/70 to-ink-light',
  },
  {
    id: 'creator',
    title: 'ครีเอเตอร์',
    subtitle: 'CREATOR',
    description: 'ตัดต่อ เรนเดอร์ 3D ทำงานไว ประสิทธิภาพสูง',
    price: 45000,
    accentIcon: FiPenTool,
    accentColor: 'text-violet-400',
    priceColor: 'text-violet-400',
    glow: 'from-violet-500/30 via-ink-light/70 to-ink-light',
  },
  {
    id: 'office',
    title: 'ทำงานทั่วไป',
    subtitle: 'OFFICE',
    description: 'ทำงานเอกสาร ประชุมออนไลน์ ใช้งานทั่วไป คุ้มค่า ประหยัด',
    price: 18000,
    accentIcon: FiBriefcase,
    accentColor: 'text-amber-400',
    priceColor: 'text-amber-400',
    glow: 'from-amber-400/25 via-ink-light/70 to-ink-light',
  },
];

interface Step {
  id: string;
  icon: IconType;
  title: string;
  subtitle: string;
}

const steps: Step[] = [
  { id: 'usage', icon: BsController, title: 'เลือกการใช้งาน', subtitle: 'บอกเราว่าคุณจะใช้คอมทำอะไรเป็นหลัก' },
  { id: 'budget', icon: FiCreditCard, title: 'เลือกกรอบงบประมาณ', subtitle: 'ตั้งงบประมาณที่ต้องการให้เหมาะกับการใช้งาน' },
  { id: 'parts', icon: FiSettings, title: 'เลือกชิ้นส่วน', subtitle: 'เลือกชิ้นส่วนที่ต้องการ ปรับแต่งได้ตามใจ' },
  { id: 'checkout', icon: FiShoppingCart, title: 'สรุปและสั่งซื้อ', subtitle: 'ตรวจสอบสเปค สรุปราคา สั่งซื้อได้ทันที' },
];

export function CustomPcCta() {
  return (
    <section id="build" className="pb-10">
      <Container>
        <div className="overflow-hidden rounded-2xl bg-ink p-5 sm:p-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
            <div>
              <h2 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                จัดสเปคคอม
                <br />
                <span className="text-brand">ในแบบของคุณ</span>
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-400">
                เลือกชิ้นส่วนที่ใช่ สำหรับการใช้งานของคุณ
                <br />
                ประกอบสเปคได้ตามงบ ง่าย ครบ จบในที่เดียว
              </p>
              <a
                href="#build-start"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                เริ่มจัดสเปคเลย
                <FiArrowRight aria-hidden="true" />
              </a>

              <div className="mt-6 flex flex-col gap-3">
                {features.map((feature) => (
                  <div key={feature.id} className="flex items-start gap-3">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-brand">
                      <feature.icon size={16} aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-white">{feature.title}</p>
                      <p className="text-xs text-slate-400">{feature.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {presets.map((preset) => (
                <a
                  key={preset.id}
                  href={`#build-${preset.id}`}
                  className="group flex flex-col rounded-xl border border-white/10 bg-ink-light transition-colors hover:border-brand/50"
                >
                  <div className="relative">
                    <div
                      className={cn(
                        'relative flex aspect-square items-end overflow-hidden rounded-t-xl bg-gradient-to-b',
                        preset.glow,
                      )}
                    >
                      <span
                        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"
                        aria-hidden="true"
                      />
                    </div>
                    <span className="absolute -bottom-3 left-3 flex h-9 w-9 items-center justify-center rounded-lg bg-ink-light ring-1 ring-white/10">
                      <preset.accentIcon size={16} className={preset.accentColor} aria-hidden="true" />
                    </span>
                  </div>

                  <div className="flex flex-col gap-1 px-3 pb-3 pt-6">
                    <h3 className="text-sm font-bold text-white">{preset.title}</h3>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                      {preset.subtitle}
                    </p>
                    <p className="line-clamp-1 text-[11px] leading-relaxed text-slate-400">{preset.description}</p>
                    <p className="mt-1 text-[11px] text-slate-500">เริ่มต้น</p>
                    <p className={cn('text-base font-bold', preset.priceColor)}>
                      {preset.price.toLocaleString('th-TH')}.-
                    </p>
                  </div>
                </a>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 p-3 sm:p-4">
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex w-full items-start gap-3 sm:w-auto sm:max-w-[210px]">
                  <div className="relative shrink-0">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                      <step.icon size={20} aria-hidden="true" />
                    </span>
                    <span className="absolute -left-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white ring-2 ring-ink">
                      {index + 1}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{step.title}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-slate-400">{step.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

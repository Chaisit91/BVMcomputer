import { BsMotherboard } from 'react-icons/bs';
import { Container } from '../ui/Container';

export function MotherboardHeroBanner() {
  return (
    <section className="bg-slate-50 pt-6">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-light to-brand-dark px-6 py-14 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Large decorative motherboard glyph, not a copy of any real board photo/logo. */}
          <BsMotherboard
            className="pointer-events-none absolute -right-6 bottom-0 hidden text-white/10 sm:block"
            size={220}
            aria-hidden="true"
          />

          <div className="relative flex max-w-xl flex-col gap-3">
            <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              MOTHERBOARD
            </span>
            <h1 className="text-4xl font-extrabold leading-none text-white sm:text-5xl">
              เมนบอร์ด
              <span className="mt-1 block text-lg font-semibold uppercase tracking-wide text-slate-300 sm:text-xl">
                The Foundation of Your Build
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              รองรับซีพียูและอุปกรณ์รุ่นใหม่ล่าสุด เสถียร ทนทาน ขยายได้เต็มศักยภาพ
              เลือกเมนบอร์ดของแท้ ประกันศูนย์ไทย
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

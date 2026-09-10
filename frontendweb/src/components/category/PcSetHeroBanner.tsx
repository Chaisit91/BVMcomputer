import { BsPcDisplay } from 'react-icons/bs';
import { Container } from '../ui/Container';

export function PcSetHeroBanner() {
  return (
    <section className="bg-slate-50 pt-6">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-light to-brand-dark px-6 py-14 sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-10 -top-10 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/4 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          {/* Large decorative PC-set glyph, not a copy of any real product photo/logo. */}
          <BsPcDisplay
            className="pointer-events-none absolute -right-6 bottom-0 hidden text-white/10 sm:block"
            size={220}
            aria-hidden="true"
          />

          <div className="relative flex max-w-xl flex-col gap-3">
            <span className="w-fit rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">PROMOTION</span>
            <h1 className="text-4xl font-extrabold leading-none text-white sm:text-5xl">
              คอมพิวเตอร์เซตโปรโมชั่น
              <span className="mt-1 block text-lg font-semibold uppercase tracking-wide text-slate-300 sm:text-xl">
                Great Specs, Better Price
              </span>
            </h1>
            <p className="text-sm leading-relaxed text-slate-300 sm:text-base">
              คอมพิวเตอร์เซตจัดโปรราคาพิเศษ สเปคครบ พร้อมใช้งานทันที
              คุ้มค่าที่สุดในราคานี้ ของแท้ ประกันศูนย์ไทย
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

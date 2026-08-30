import { useEffect, useState } from 'react';
import { FiArrowRight, FiCreditCard, FiShield, FiTool, FiTruck } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { cn } from '../../lib/cn';

interface HeroSlide {
  id: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  // TODO(design): swap this gradient for the real product photo per slide once the image files are added.
  gradient: string;
}

const slides: HeroSlide[] = [
  {
    id: 'slide-1',
    title: 'คอมแรง\nเล่นลื่น ไม่มีสะดุด',
    subtitle: 'อัปเกรดทุกความเป็นโปรได้ ด้วยสินค้าคุณภาพจากแบรนด์ชั้นนำ',
    ctaLabel: 'ดูสินค้าทั้งหมด',
    ctaHref: '#popular',
    gradient: 'from-violet-950 via-purple-900 to-fuchsia-900',
  },
  {
    id: 'slide-2',
    title: 'จัดสเปกคอม\nตามใจคุณ',
    subtitle: 'เลือกอุปกรณ์ทีละชิ้น ตรวจสอบความเข้ากันได้ทันที ประกอบให้ฟรี',
    ctaLabel: 'เริ่มจัดสเปก',
    ctaHref: '#build',
    gradient: 'from-ink via-sky-950 to-cyan-900',
  },
  {
    id: 'slide-3',
    title: 'ดีลพิเศษ\nลดสูงสุด 40%',
    subtitle: 'โปรโมชั่นการ์ดจอและซีพียูรุ่นล่าสุด จำนวนจำกัด',
    ctaLabel: 'ช้อปดีลเด็ด',
    ctaHref: '#promo-build-week',
    gradient: 'from-brand-dark via-rose-900 to-orange-900',
  },
  {
    id: 'slide-4',
    title: 'บริการประกอบคอม\nโดยทีมมืออาชีพ',
    subtitle: 'ประกอบ ทดสอบ และจัดส่งถึงบ้าน เริ่มต้นเพียง 590 บาท',
    ctaLabel: 'ดูรายละเอียด',
    ctaHref: '#build',
    gradient: 'from-emerald-950 via-teal-900 to-ink',
  },
];

const trustBadges = [
  { id: 'genuine', icon: FiShield, title: 'ของแท้ 100%', subtitle: 'รับประกันศูนย์ไทย' },
  { id: 'shipping', icon: FiTruck, title: 'จัดส่งไว', subtitle: '1-2 วันทั่วไทย' },
  { id: 'installment', icon: FiCreditCard, title: 'ผ่อนสบาย', subtitle: '0% สูงสุด 10 เดือน' },
  { id: 'build', icon: FiTool, title: 'บริการประกอบคอม', subtitle: 'เริ่มต้น 590.-' },
];

const AUTO_PLAY_MS = 5000;

export function HeroBanner() {
  const [activeIndex, setActiveIndex] = useState(0);

  // Real side effect: auto-advance the carousel every 5s, looping back to the
  // first slide after the last. Restarts the 5s countdown on manual navigation too.
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [activeIndex]);

  return (
    <section className="bg-slate-50 pt-6">
      <Container>
        <div className="relative overflow-hidden rounded-2xl">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              aria-hidden={index !== activeIndex}
              className={cn(
                'bg-gradient-to-br px-6 py-14 transition-opacity duration-700 sm:px-12 sm:py-20',
                slide.gradient,
                index === activeIndex ? 'relative opacity-100' : 'pointer-events-none absolute inset-0 opacity-0',
              )}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/5 blur-3xl" />

              <div className="relative max-w-xl">
                <h1 className="whitespace-pre-line text-3xl font-bold leading-tight text-white sm:text-5xl">
                  {slide.title}
                </h1>
                <p className="mt-4 text-sm leading-relaxed text-slate-200 sm:text-base">{slide.subtitle}</p>
                <a
                  href={slide.ctaHref}
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3 text-base font-medium text-white transition-colors hover:bg-brand-dark"
                >
                  {slide.ctaLabel}
                  <FiArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          ))}

          {/* Trust badges: a static overlay shown on every slide, not part of the crossfade. */}
          <div className="pointer-events-none absolute right-4 top-1/2 hidden -translate-y-1/2 flex-col gap-3 sm:right-8 lg:flex">
            {trustBadges.map((badge) => (
              <div
                key={badge.id}
                className="pointer-events-auto flex items-center gap-3 rounded-xl border border-white/15 bg-black/30 px-4 py-3 backdrop-blur-sm"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                  <badge.icon size={18} aria-hidden="true" />
                </span>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white">{badge.title}</p>
                  <p className="text-[11px] text-slate-300">{badge.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Slide indicators: four equal-width dashes, active one highlighted. */}
          <div className="absolute bottom-5 left-6 z-10 flex items-center gap-2 sm:left-12">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                aria-label={`ไปที่แบนเนอร์ที่ ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  'h-1.5 w-8 rounded-full transition-colors',
                  index === activeIndex ? 'bg-white' : 'bg-white/35 hover:bg-white/55',
                )}
              />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}

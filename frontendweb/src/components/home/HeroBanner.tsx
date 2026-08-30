import { FiArrowRight } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

export function HeroBanner() {
  return (
    <section className="bg-slate-50 pt-6">
      <Container>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ink via-ink-light to-brand-dark px-6 py-14 sm:px-12 sm:py-20">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-brand/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

          <div className="relative max-w-xl">
            <span className="inline-flex items-center rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white">
              SUMMER TECH SALE 2026
            </span>
            <h1 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">
              UPGRADE YOUR
              <br />
              BATTLESTATION
            </h1>
            <p className="mt-4 text-sm leading-relaxed text-slate-300 sm:text-base">
              พบกับสินค้าคอมพิวเตอร์และอุปกรณ์ไอทีคัดสรรพิเศษ ลดสูงสุด 40%
              พร้อมบริการผ่อนชำระ 0% นานสูงสุด 10 เดือน
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg">
                สั่งซื้อทันที
                <FiArrowRight aria-hidden="true" />
              </Button>
              <Button variant="outline" size="lg">
                ปรึกษาผู้เชี่ยวชาญ
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

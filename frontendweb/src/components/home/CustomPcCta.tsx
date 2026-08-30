import { FiArrowRight } from 'react-icons/fi';
import { Container } from '../ui/Container';
import { Button } from '../ui/Button';

export function CustomPcCta() {
  return (
    <section className="bg-ink py-14">
      <Container className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="max-w-lg text-center sm:text-left">
          <h2 className="text-xl font-semibold text-white sm:text-2xl">เลือกสเปคเองประกอบคอมพิวเตอร์ตามใจคุณ</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-400">
            ระบบแนะนำสเปคอัตโนมัติ เลือกอุปกรณ์ทีละชิ้น ตรวจสอบความเข้ากันได้ทันที
            พร้อมทีมช่างมืออาชีพช่วยประกอบให้ฟรี
          </p>
        </div>
        <Button size="lg" className="shrink-0">
          เริ่มต้นออกแบบ
          <FiArrowRight aria-hidden="true" />
        </Button>
      </Container>
    </section>
  );
}

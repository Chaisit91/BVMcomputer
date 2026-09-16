import { useState } from 'react';
import { BsCheckCircleFill } from 'react-icons/bs';
import { FiChevronDown } from 'react-icons/fi';
import { cn } from '../../lib/cn';

const faqItems = [
  { question: 'ทำไมต้องรู้สเปคคอมตัวเองก่อน?', answer: 'เพื่อให้ระบบแนะนำชิ้นส่วนที่เข้ากันได้กับของเดิมที่คุณมีอยู่ และไม่แนะนำสิ่งที่คุณมีอยู่แล้ว' },
  { question: 'ระบบตรวจสอบความเข้ากันได้อย่างไร?', answer: 'ตรวจสอบ Socket, ประเภทแรม, ขนาดเมนบอร์ด, กำลังไฟ และพื้นที่ในเคส เพื่อให้แน่ใจว่าชิ้นส่วนที่แนะนำใช้งานร่วมกันได้จริง' },
  { question: 'จำเป็นต้องอัปเกรดหลายชิ้นส่วนไหม?', answer: 'ไม่จำเป็นครับ ระบบจะแนะนำเฉพาะชิ้นส่วนที่คุ้มค่าที่สุดตามงบและการใช้งานของคุณ อาจเป็นแค่ชิ้นเดียวก็ได้' },
  { question: 'สามารถเลือกเฉพาะบางชิ้นส่วนได้หรือไม่?', answer: 'ได้ครับ คุณเลือกได้ว่าจะอัปเกรดชิ้นไหนบ้างจากคำแนะนำ ไม่จำเป็นต้องซื้อทั้งหมด' },
  { question: 'ข้อมูลของฉันปลอดภัยหรือไม่?', answer: 'ข้อมูลสเปคที่กรอกใช้เพื่อการวิเคราะห์เท่านั้น ไม่มีการบันทึกหรือเปิดเผยข้อมูลส่วนตัวของคุณ' },
];

const checkItems = [
  'ความเข้ากันได้ของ CPU กับ Mainboard',
  'ความเหมาะสมของ GPU กับ PSU',
  'ความเข้ากันได้ของ RAM กับ Mainboard',
  'ขนาด Case กับอุปกรณ์ต่างๆ',
  'ความเหมาะสมของ CPU Cooler',
  'คำแนะนำการอัปเกรดที่เหมาะสม',
];

export function UpgradeSidebar() {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">คำถามที่พบบ่อย</h2>
          <a href="#faq" className="text-xs font-medium text-brand hover:text-brand-dark">
            ดูทั้งหมด →
          </a>
        </div>
        <div className="flex flex-col divide-y divide-slate-100">
          {faqItems.map((item) => {
            const isOpen = openFaq === item.question;
            return (
              <div key={item.question} className="py-2.5">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : item.question)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center justify-between gap-2 text-left"
                >
                  <span className="text-sm font-medium text-ink">{item.question}</span>
                  <FiChevronDown
                    size={15}
                    className={cn('shrink-0 text-slate-400 transition-transform', isOpen && 'rotate-180')}
                    aria-hidden="true"
                  />
                </button>
                {isOpen && <p className="mt-2 text-xs leading-relaxed text-slate-500">{item.answer}</p>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">ระบบจะตรวจสอบอะไรบ้าง?</h2>
        <ul className="mt-3 flex flex-col gap-2.5">
          {checkItems.map((item) => (
            <li key={item} className="flex items-center gap-2.5">
              <BsCheckCircleFill size={15} className="shrink-0 text-brand" aria-hidden="true" />
              <span className="text-sm text-ink">{item}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

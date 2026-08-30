import { FaCcMastercard, FaCcVisa, FaFacebookF, FaInstagram, FaLine, FaYoutube } from 'react-icons/fa';
import { Container } from '../ui/Container';
import { FooterLinkColumn } from './FooterLinkColumn';

const aboutLinks = [
  { id: 'about-us', label: 'เกี่ยวกับเรา', href: '#' },
  { id: 'careers', label: 'ร่วมงานกับเรา', href: '#' },
  { id: 'branches', label: 'สาขาของเรา', href: '#' },
  { id: 'news', label: 'ข่าวสาร & โปรโมชั่น', href: '#' },
];

const policyLinks = [
  { id: 'privacy', label: 'นโยบายความเป็นส่วนตัว', href: '#' },
  { id: 'shipping', label: 'เงื่อนไขการจัดส่ง', href: '#' },
  { id: 'return', label: 'เงื่อนไขการคืนสินค้า', href: '#' },
  { id: 'warranty', label: 'เงื่อนไขการรับประกัน', href: '#' },
];

const contactLinks = [
  { id: 'support', label: 'ศูนย์ช่วยเหลือลูกค้า', href: '#' },
  { id: 'track', label: 'ติดตามสถานะสินค้า', href: '#' },
  { id: 'installment', label: 'ผ่อนชำระ 0%', href: '#' },
  { id: 'faq', label: 'คำถามที่พบบ่อย', href: '#' },
];

const socialLinks = [
  { id: 'facebook', label: 'Facebook', href: '#', Icon: FaFacebookF },
  { id: 'line', label: 'Line', href: '#', Icon: FaLine },
  { id: 'instagram', label: 'Instagram', href: '#', Icon: FaInstagram },
  { id: 'youtube', label: 'YouTube', href: '#', Icon: FaYoutube },
];

export function Footer() {
  return (
    <footer className="bg-ink text-slate-300">
      <Container className="grid grid-cols-1 gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <a href="#top" className="mb-4 flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
              M
            </span>
            <span className="text-lg font-bold text-white">
              MAX<span className="text-brand">COM</span>
            </span>
          </a>
          <p className="mb-5 text-sm leading-relaxed text-slate-400">
            ผู้นำด้านจำหน่ายคอมพิวเตอร์และอุปกรณ์ไอทีครบวงจร บริการประกอบคอมพิวเตอร์
            และให้คำปรึกษาโดยทีมงานผู้เชี่ยวชาญ
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map(({ id, label, href, Icon }) => (
              <a
                key={id}
                href={href}
                aria-label={label}
                title={label}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-brand"
              >
                <Icon size={13} aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        <FooterLinkColumn title="เกี่ยวกับเรา" links={aboutLinks} />
        <FooterLinkColumn title="นโยบายเว็บไซต์" links={policyLinks} />

        <div>
          <FooterLinkColumn title="ช่องทางติดต่อ & บริการ" links={contactLinks} />
          <div className="mt-5 flex items-center gap-2 text-slate-400">
            <FaCcVisa size={28} aria-hidden="true" />
            <FaCcMastercard size={28} aria-hidden="true" />
          </div>
        </div>
      </Container>

      <div className="border-t border-white/10">
        <Container className="flex flex-col items-center justify-between gap-3 py-5 text-xs text-slate-500 sm:flex-row">
          <p>© 2026 MAXCOM CO., LTD. สงวนลิขสิทธิ์</p>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:text-white">
              ข้อกำหนดการใช้งาน
            </a>
            <a href="#" className="hover:text-white">
              แผนผังเว็บไซต์
            </a>
          </div>
        </Container>
      </div>
    </footer>
  );
}

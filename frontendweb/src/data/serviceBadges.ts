import type { IconType } from 'react-icons';
import { BsArrowRepeat, BsFileEarmarkCheck, BsStopwatch, BsTruck } from 'react-icons/bs';

export interface ServiceBadge {
  id: string;
  icon: IconType;
  title: string;
  subtitle: string;
}

// Shared copy for the standalone ServiceBadges strip (homepage/category/product pages)
// and the compact "บริการของเรา" card on the cart page.
export const serviceBadges: ServiceBadge[] = [
  { id: 'shipping', icon: BsTruck, title: 'ส่งฟรีทั่วไทย', subtitle: 'เมื่อซื้อครบ 5,000 ขึ้นไป' },
  { id: 'return', icon: BsArrowRepeat, title: 'เปลี่ยนคืนสินค้าง่าย', subtitle: 'เปลี่ยนใหม่ภายใน 7 วัน' },
  { id: 'service', icon: BsStopwatch, title: 'รวดเร็วในการให้บริการ', subtitle: 'ตอบด่วน ตอบไว' },
  { id: 'payment', icon: BsFileEarmarkCheck, title: 'ชำระเงินปลอดภัย', subtitle: 'ด้วยระบบออนไลน์' },
];

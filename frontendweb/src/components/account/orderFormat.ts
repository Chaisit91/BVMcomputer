import type { OrderItem, OrderStatus, OrderTrackingStep } from '../../types/api';

/** Order times are shown in Thai time whatever the visitor's clock says. */
const TIME_ZONE = 'Asia/Bangkok';

/** Date and time parts in Thai time, or null for an unreadable value. */
function thaiParts(value: string): { day: string; weekday: string; time: string } | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return {
    day: date.toLocaleDateString('th-TH-u-ca-gregory', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TIME_ZONE }),
    weekday: date.toLocaleDateString('th-TH', { weekday: 'long', timeZone: TIME_ZONE }),
    time: date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TIME_ZONE }),
  };
}

/** "13 พ.ย. 2026 เวลา 14:32 น." */
export function formatOrderDateTime(value: string): string {
  const parts = thaiParts(value);
  return parts ? `${parts.day} เวลา ${parts.time} น.` : value;
}

/** "13 พ.ย. 2026" */
export const formatOrderDate = (value: string): string => thaiParts(value)?.day ?? value;

/** "14 พ.ย. 2026 | 09:30 น." — carrier update rows. */
export function formatUpdateTime(value: string): string {
  const parts = thaiParts(value);
  return parts ? `${parts.day} | ${parts.time} น.` : value;
}

/** "วันเสาร์ที่ 14 พ.ย. 2026 (ภายในเวลา 18:00 น.)" */
export function formatDeliveryEstimate(value: string): string {
  const parts = thaiParts(value);
  return parts ? `${parts.weekday}ที่ ${parts.day} (ภายในเวลา ${parts.time} น.)` : value;
}

/** "วันศุกร์ที่ 14 พ.ย. 2026 เวลา 16:42 น." — when the parcel was actually delivered. */
export function formatDeliveredAt(value: string): string {
  const parts = thaiParts(value);
  return parts ? `${parts.weekday}ที่ ${parts.day} เวลา ${parts.time} น.` : value;
}

/** Carrier milestones as labelled on the tracking timeline. */
export const TRACKING_STEPS: { step: OrderTrackingStep; label: string; status: string }[] = [
  { step: 'picked_up', label: 'รับเข้าระบบ', status: 'รับพัสดุเข้าระบบแล้ว (Picked Up)' },
  { step: 'in_transit', label: 'กำลังขนส่ง', status: 'กำลังขนส่งพัสดุ (In Transit)' },
  { step: 'out_for_delivery', label: 'กำลังนำส่ง', status: 'กำลังนำส่งพัสดุ (Out for Delivery)' },
  { step: 'delivered', label: 'จัดส่งสำเร็จ', status: 'จัดส่งสำเร็จ (Delivered)' },
];

/** Index of the furthest milestone reached, -1 when the parcel hasn't been handed over yet. */
export const latestTrackingIndex = (reached: ReadonlySet<OrderTrackingStep>): number =>
  TRACKING_STEPS.reduce((last, { step }, index) => (reached.has(step) ? index : last), -1);

/** "890 บาท" */
export const formatBaht = (amount: number): string => `${amount.toLocaleString('th-TH')} บาท`;

/** "สินค้า A และสินค้าอื่นอีก 1 รายการ" for several lines, "สินค้า A x 1" for one. */
export function summarizeOrderItems(items: OrderItem[]): string {
  if (items.length === 0) return '';
  const [first, ...rest] = items;
  return rest.length > 0 ? `${first.name} และสินค้าอื่นอีก ${rest.length} รายการ` : `${first.name} x ${first.quantity}`;
}

/** Tab order and labels on "คำสั่งซื้อของฉัน" (after "ทั้งหมด"). */
export const ORDER_STATUS_TABS: { status: OrderStatus; label: string }[] = [
  { status: 'to_ship', label: 'ที่ต้องจัดส่ง' },
  { status: 'shipping', label: 'กำลังนำส่ง' },
  { status: 'delivered', label: 'จัดส่งสำเร็จ' },
];

export const isOrderStatus = (value: string | null): value is OrderStatus => ORDER_STATUS_TABS.some((tab) => tab.status === value);

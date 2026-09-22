import type { CompatibilityStatus } from '../types/upgrade';

/**
 * TODO(backend): step 3's score, stat counts and checklist are illustrative placeholders.
 * A teammate owns the real compatibility engine (see services/upgrade/compatibilityService.ts) —
 * swap this file for its response once that exists; nothing else on the page needs to change.
 */
export const mockCompatibilityScore = {
  score: 85,
  max: 100,
  status: 'เข้ากันได้ดีมาก',
  passed: 7,
  totalChecks: 8,
  warnings: 1,
  errors: 0,
  opportunities: 3,
};

export interface CompatibilityCheckItem {
  id: string;
  title: string;
  detail: string;
  status: CompatibilityStatus;
}

export const mockCompatibilityChecklist: CompatibilityCheckItem[] = [
  { id: 'cpu-mb', title: 'CPU ↔ Mainboard', detail: 'ซ็อกเก็ตตรงกัน รองรับ BIOS ล่าสุด', status: 'compatible' },
  { id: 'ram-mb', title: 'RAM ↔ Mainboard', detail: 'ประเภทและความเร็วรองรับโดย Mainboard', status: 'compatible' },
  { id: 'gpu-psu', title: 'GPU ↔ PSU', detail: 'กำลังไฟของ PSU เพียงพอสำหรับการ์ดจอใหม่', status: 'compatible' },
  { id: 'cooler-cpu', title: 'CPU Cooler ↔ CPU ใหม่', detail: 'ชุดระบายความร้อนเดิมอาจไม่เพียงพอ แนะนำให้ตรวจสอบ', status: 'warning' },
  { id: 'storage-mb', title: 'Storage ↔ Mainboard', detail: 'พอร์ตและอินเทอร์เฟซรองรับ', status: 'compatible' },
  { id: 'case-parts', title: 'Case ↔ ชิ้นส่วนใหม่ทั้งหมด', detail: 'มีพื้นที่และช่องระบายอากาศเพียงพอ', status: 'compatible' },
];

export const mockAiInsight =
  'AI พบว่า CPU เดิมของคุณอาจเป็นคอขวด (Bottleneck) ให้กับการ์ดจอที่เลือกใหม่ แนะนำให้พิจารณาอัปเกรด CPU ควบคู่กันเพื่อดึงประสิทธิภาพออกมาได้เต็มที่';

export type RecommendationTabKey = 'primary' | 'sequential' | 'skip';

export const recommendationTabs: { key: RecommendationTabKey; label: string }[] = [
  { key: 'primary', label: 'แนะนำหลัก' },
  { key: 'sequential', label: 'อัปเกรดตามลำดับ' },
  { key: 'skip', label: 'ไม่จำเป็น' },
];

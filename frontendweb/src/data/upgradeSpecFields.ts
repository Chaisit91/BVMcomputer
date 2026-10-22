import type { UpgradeComponentKey, UpgradeSelection } from '../types/upgrade';

export interface SpecFieldMeta {
  key: UpgradeComponentKey;
  label: string;
  placeholder: string;
  required: boolean;
}

/** Step-1 part fields, in on-screen order (also the order validation scrolls through). */
export const specFields: SpecFieldMeta[] = [
  { key: 'cpu', label: 'CPU (ซีพียู)', placeholder: 'ค้นหา CPU เช่น Intel, Ryzen 5 5600', required: true },
  { key: 'gpu', label: 'การ์ดจอ (GPU)', placeholder: 'ค้นหา GPU เช่น RTX 3060, RX 6600', required: true },
  { key: 'motherboard', label: 'Mainboard (เมนบอร์ด)', placeholder: 'ค้นหาเมนบอร์ด เช่น B460, B550, Z790', required: true },
  { key: 'ram', label: 'RAM (หน่วยความจำ)', placeholder: 'ค้นหา RAM เช่น 16GB DDR4 3200', required: true },
  { key: 'storage', label: 'Storage (ที่เก็บข้อมูล)', placeholder: 'ค้นหา SSD/HDD เช่น Samsung 970 EVO', required: true },
  // Never default any of these to a guessed part — customers who don't know a model are pointed to the support chat.
  { key: 'psu', label: 'PSU (พาวเวอร์ซัพพลาย)', placeholder: 'ค้นหา PSU เช่น 550W, 750W, Corsair', required: true },
  { key: 'case', label: 'Case (เคส)', placeholder: 'ค้นหาเคส เช่น ATX, NZXT, Cooler Master', required: true },
  { key: 'cooling', label: 'CPU Cooler (ชุดระบายความร้อน)', placeholder: 'ค้นหาชุดระบายความร้อน เช่น Air Cooler, 240mm', required: true },
];

// Free-text answers that really mean "I don't know" — they don't count as filled in.
const UNKNOWN_ANSWERS = new Set(['ไม่รู้', 'ไม่ทราบ', 'ไม่แน่ใจ', 'ไม่รู้จัก', 'no', 'na', 'n/a', 'none', 'unknown', 'idk', 'null']);

/** True for blank input, filler like "-", "...", "?" or an explicit "don't know" answer. */
export function isUnknownAnswer(value: string): boolean {
  const normalized = value.trim().toLowerCase().replace(/\s+/g, ' ');
  if (!normalized) return true;
  // Nothing but punctuation/symbols ("-", "--", "...", "?", "/").
  if (!/[\p{L}\p{N}]/u.test(normalized)) return true;
  return UNKNOWN_ANSWERS.has(normalized) || UNKNOWN_ANSWERS.has(normalized.replace(/[.\s]/g, ''));
}

export type UpgradeSpecFieldId = UpgradeComponentKey | 'budget' | 'usage' | 'games';

export type UpgradeSpecErrors = Partial<Record<UpgradeSpecFieldId, string>>;

export interface UpgradeSpecValues {
  selection: UpgradeSelection;
  budget: string;
  usage: string;
  games: string;
}

/** Every validated field, in on-screen order — used to find the first error to scroll to. */
export const specFieldOrder: UpgradeSpecFieldId[] = [...specFields.map((field) => field.key), 'budget', 'usage', 'games'];

/** DOM id of a field's focusable control, so validation can scroll to it. */
export const specFieldDomId = (id: UpgradeSpecFieldId) => `upgrade-spec-${id}`;

export function validateUpgradeSpec({ selection, budget, usage, games }: UpgradeSpecValues): UpgradeSpecErrors {
  const errors: UpgradeSpecErrors = {};
  for (const field of specFields) {
    if (field.required && !selection[field.key]) errors[field.key] = 'กรุณาค้นหาและเลือกรุ่นจากรายการ';
  }
  if (!budget) errors.budget = 'กรุณาเลือกงบประมาณ';
  if (!usage) errors.usage = 'กรุณาเลือกจุดประสงค์การใช้งาน';
  if (isUnknownAnswer(games)) {
    errors.games = games.trim()
      ? 'กรุณาระบุชื่อเกมหรือโปรแกรม หากไม่แน่ใจสามารถสอบถามแอดมินได้'
      : 'กรุณาระบุเกมหรือโปรแกรมที่ใช้งาน';
  }
  return errors;
}

/**
 * Optional parts the user left blank — passed on explicitly as "unknown" rather than guessed.
 * Every part is currently required, so this is empty after validation; kept so a field can be
 * made optional again by flipping its `required` flag alone.
 */
export function getUnknownParts(selection: UpgradeSelection): UpgradeComponentKey[] {
  return specFields.filter((field) => !field.required && !selection[field.key]).map((field) => field.key);
}

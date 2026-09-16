import { BsCheckCircleFill, BsExclamationTriangleFill, BsXCircleFill } from 'react-icons/bs';
import { cn } from '../../lib/cn';
import type { CompatibilityStatus } from '../../types/upgrade';

const statusStyle: Record<CompatibilityStatus, { icon: typeof BsCheckCircleFill; className: string; defaultLabel: string }> = {
  compatible: { icon: BsCheckCircleFill, className: 'bg-emerald-50 text-emerald-600', defaultLabel: 'เข้ากันได้' },
  warning: { icon: BsExclamationTriangleFill, className: 'bg-amber-50 text-amber-600', defaultLabel: 'ควรตรวจสอบเพิ่มเติม' },
  incompatible: { icon: BsXCircleFill, className: 'bg-red-50 text-red-600', defaultLabel: 'ไม่เข้ากัน' },
};

interface CompatibilityBadgeProps {
  status: CompatibilityStatus;
  /** e.g. "GPU ไม่เข้ากับ PSU" — falls back to a generic label per status when omitted. */
  message?: string;
}

/**
 * Not wired to any real check yet — step 4 (ตรวจสอบความเข้ากันได้) and the real
 * compatibility engine (see services/upgrade/compatibilityService.ts) aren't built.
 * This just reserves the visual so that UI can render whatever the backend/AI
 * response says later, without another round of component work.
 */
export function CompatibilityBadge({ status, message }: CompatibilityBadgeProps) {
  const { icon: Icon, className, defaultLabel } = statusStyle[status];
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold', className)}>
      <Icon size={12} aria-hidden="true" />
      {message ?? defaultLabel}
    </span>
  );
}

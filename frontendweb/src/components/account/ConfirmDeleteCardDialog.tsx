import * as Dialog from '@radix-ui/react-dialog';
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { Spinner } from '../ui/Spinner';
import type { PaymentMethod } from '../../types/api';
import { CardBrandLogo } from './CardBrandLogo';

interface ConfirmDeleteCardDialogProps {
  /** The card to delete; null = closed. */
  method: PaymentMethod | null;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "ต้องการลบบัตรนี้ใช่ไหม?" — nothing is deleted until the customer confirms. */
export function ConfirmDeleteCardDialog({ method, deleting, error, onCancel, onConfirm }: ConfirmDeleteCardDialogProps) {
  return (
    <Dialog.Root open={method !== null} onOpenChange={(next) => !next && !deleting && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-center shadow-xl outline-none">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-brand">
            <FiTrash2 size={24} aria-hidden="true" />
          </span>
          <Dialog.Title className="mt-4 text-lg font-bold text-ink">ต้องการลบบัตรนี้ใช่ไหม?</Dialog.Title>
          <Dialog.Description asChild>
            <div className="mt-3 flex items-center justify-center gap-3 text-left text-sm text-slate-500">
              {method && (
                <>
                  <CardBrandLogo brand={method.brand} className="h-10 w-16" />
                  <span className="min-w-0">
                    <span className="block truncate font-semibold text-[#2B3445]">{method.holderName}</span>
                    XXXX-XXXX-XXXX-{method.last4}
                  </span>
                </>
              )}
            </div>
          </Dialog.Description>
          {method?.isDefault && (
            <p className="mt-3 text-xs text-slate-500">บัตรนี้เป็นค่าเริ่มต้น หากลบ ระบบจะใช้บัตรถัดไปเป็นค่าเริ่มต้นแทน</p>
          )}
          {error && (
            <p role="alert" className="mt-3 flex items-center justify-center gap-1.5 text-sm text-brand">
              <FiAlertCircle size={15} aria-hidden="true" />
              {error}
            </p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={deleting}
              className="flex h-11 items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-[#2B3445] transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={deleting}
              className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
            >
              {deleting && <Spinner size={16} />}
              {deleting ? 'กำลังลบ...' : 'ลบบัตร'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

import * as Dialog from '@radix-ui/react-dialog';
import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import { Spinner } from '../ui/Spinner';
import { formatAddress } from './formatAddress';

/** Any saved address — shipping or tax-invoice — reduced to what the confirmation shows. */
export interface DeletableAddress {
  /** Recipient, person or company name. */
  name: string;
  addressLine: string;
  subdistrict: string;
  district: string;
  province: string;
  postalCode: string;
  isDefault: boolean;
}

interface ConfirmDeleteAddressDialogProps {
  /** The address to delete; null = closed. */
  address: DeletableAddress | null;
  deleting: boolean;
  error: string | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "ลบที่อยู่นี้?" — nothing is deleted until the customer confirms. */
export function ConfirmDeleteAddressDialog({ address, deleting, error, onCancel, onConfirm }: ConfirmDeleteAddressDialogProps) {
  return (
    <Dialog.Root open={address !== null} onOpenChange={(next) => !next && !deleting && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 text-center shadow-xl outline-none">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-brand">
            <FiTrash2 size={24} aria-hidden="true" />
          </span>
          <Dialog.Title className="mt-4 text-lg font-bold text-ink">ต้องการลบที่อยู่นี้ใช่ไหม?</Dialog.Title>
          <Dialog.Description className="mt-2 text-sm leading-relaxed text-slate-500">
            {address && (
              <>
                <span className="font-semibold text-[#2B3445]">{address.name}</span>
                <br />
                {formatAddress(address)}
              </>
            )}
          </Dialog.Description>
          {address?.isDefault && (
            <p className="mt-3 text-xs text-slate-500">ที่อยู่นี้เป็นที่อยู่หลัก หากลบ ระบบจะใช้ที่อยู่ถัดไปเป็นที่อยู่หลักแทน</p>
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
              {deleting ? 'กำลังลบ...' : 'ลบที่อยู่'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

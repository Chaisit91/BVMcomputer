import type { FormEventHandler, ReactNode } from 'react';
import type { IconType } from 'react-icons';
import * as Dialog from '@radix-ui/react-dialog';
import { FiX } from 'react-icons/fi';

interface CheckoutDialogProps {
  open: boolean;
  onClose: () => void;
  icon: IconType;
  title: string;
  description: string;
  submitLabel: string;
  onSubmit: FormEventHandler<HTMLFormElement>;
  /** The form fields (laid out on a 2-column grid from `sm`). */
  children: ReactNode;
}

/** Modal frame shared by the checkout's address and tax-invoice forms (same look as the account address modal). */
export function CheckoutDialog({ open, onClose, icon: Icon, title, description, submitLabel, onSubmit, children }: CheckoutDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-xl outline-none">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
              <Icon size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-ink">{title}</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">{description}</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="ปิด"
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink"
            >
              <FiX size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">{children}</div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#2B3445] transition-colors hover:bg-slate-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="flex h-11 items-center justify-center rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark"
              >
                {submitLabel}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

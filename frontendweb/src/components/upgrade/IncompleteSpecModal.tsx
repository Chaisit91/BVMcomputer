import * as Dialog from '@radix-ui/react-dialog';
import { BsChatDotsFill } from 'react-icons/bs';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

interface IncompleteSpecModalProps {
  open: boolean;
  /** Called on X / "ตกลง" / Esc / backdrop click. */
  onClose: () => void;
  /** Runs after the dialog has closed — used to bring the first missing field into view. */
  onClosed?: () => void;
}

/**
 * Shown when step 1 is submitted incomplete. Deliberately generic — the missing fields are
 * highlighted on the form itself, not listed here. Help is pointed at the floating support
 * chat that already exists on the page; there's intentionally no second "ask admin" button.
 */
export function IncompleteSpecModal({ open, onClose, onClosed }: IncompleteSpecModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content
          onCloseAutoFocus={(e) => {
            // Skip Radix's default "focus the submit button again" — focus the first missing field instead.
            if (onClosed) {
              e.preventDefault();
              onClosed();
            }
          }}
          className="fixed left-1/2 top-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[460px] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl bg-white px-5 pb-5 pt-7 text-center shadow-xl outline-none sm:px-7 sm:pb-6"
        >
          <Dialog.Close
            aria-label="ปิด"
            className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          >
            <FiX size={20} aria-hidden="true" />
          </Dialog.Close>

          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-brand sm:h-[72px] sm:w-[72px]">
            <FiAlertTriangle size={32} strokeWidth={2.2} aria-hidden="true" />
          </span>

          <Dialog.Title className="mt-4 text-lg font-bold text-ink sm:text-xl">
            กรุณากรอกข้อมูล<span className="text-brand">ให้ครบถ้วน</span>
          </Dialog.Title>
          <Dialog.Description className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-700">
            เพื่อให้ระบบสามารถวิเคราะห์และแนะนำชิ้นส่วนอัปเกรดได้อย่างเหมาะสม กรุณาระบุข้อมูลทุกช่องก่อนดำเนินการต่อ
          </Dialog.Description>

          <div className="mt-5 flex items-start gap-3 rounded-xl bg-red-50/70 p-4 text-left">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-100 text-brand">
              <BsChatDotsFill size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand">ไม่ทราบรุ่นอุปกรณ์หรือไม่แน่ใจว่าจะกรอกอย่างไร?</p>
              <p className="mt-1 text-xs leading-relaxed text-slate-700 sm:text-[13px]">
                สามารถเปิดแชทสอบถามแอดมินได้เลย
                <br />
                ทีมงานยินดีให้คำแนะนำครับ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="mt-5 flex h-12 w-full items-center justify-center rounded-xl bg-brand text-sm font-semibold text-white transition-colors hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30"
          >
            ตกลง
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

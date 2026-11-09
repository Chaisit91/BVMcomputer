import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm, useWatch } from 'react-hook-form';
import { FiAlertCircle, FiCreditCard, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { addPaymentMethod, clearPaymentMethodError } from '../../features/paymentMethod/paymentMethodSlice';
import { detectCardBrand, passesLuhn, tokenizeCard } from '../../services/payment/cardTokenizer';
import { getErrorMessage } from '../../api/apiError';
import { FormField, TextInput } from '../ui/FormField';
import { Spinner } from '../ui/Spinner';
import { CardBrandLogo } from './CardBrandLogo';

interface AddCardFormValues {
  number: string;
  holderName: string;
  expiry: string;
  cvv: string;
  makeDefault: boolean;
}

const REQUIRED = 'กรุณากรอกข้อมูลนี้';
const blankValues = (): AddCardFormValues => ({
  number: '',
  holderName: '',
  expiry: '',
  cvv: '',
  makeDefault: true,
});

const digitsOf = (value: string) => value.replace(/\D/g, '');
/** "4111111111111111" -> "4111 1111 1111 1111" while typing. */
const formatCardNumber = (value: string) => digitsOf(value).slice(0, 19).replace(/(\d{4})(?=\d)/g, '$1 ');
/** "1228" -> "12/28" while typing. */
const formatExpiry = (value: string) => {
  const digits = digitsOf(value).slice(0, 4);
  return digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
};

function parseExpiry(value: string): { month: number; year: number } | null {
  const match = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!match) return null;
  const month = Number(match[1]);
  if (month < 1 || month > 12) return null;
  return { month, year: 2000 + Number(match[2]) };
}

interface AddCardModalProps {
  open: boolean;
  /** No saved cards yet — the new one has to be the default. */
  isFirst: boolean;
  /** No backend connected — tokenise locally (demo) instead of through the payment gateway. */
  demo: boolean;
  onClose: () => void;
  onSaved: () => void;
}

/**
 * "เพิ่มบัตร" — four fields only. Card number and CVV stay inside this form: they're turned into a gateway
 * token here, and only the token plus display fields (brand, last 4, expiry, name, issuer from the provider's
 * BIN lookup) go to the store and API. The form is wiped on every open and close.
 */
export function AddCardModal({ open, isFirst, demo, onClose, onSaved }: AddCardModalProps) {
  const dispatch = useAppDispatch();
  const { mutationStatus, mutationError } = useAppSelector((state) => state.paymentMethod);
  const [tokenizing, setTokenizing] = useState(false);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const isSaving = tokenizing || mutationStatus === 'loading';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<AddCardFormValues>({ mode: 'onBlur', reValidateMode: 'onChange', defaultValues: blankValues() });

  const number = useWatch({ control, name: 'number' });
  const brand = detectCardBrand(digitsOf(number ?? ''));
  const cvvLength = brand === 'amex' ? 4 : 3;

  // Fresh, empty form on every open — and wipe it on close, so card data doesn't linger in memory.
  useEffect(() => {
    reset(blankValues());
    if (open) dispatch(clearPaymentMethodError());
  }, [open, reset, dispatch]);

  const close = () => {
    setTokenError(null);
    onClose();
  };

  const onSubmit = handleSubmit(async (values) => {
    const expiry = parseExpiry(values.expiry);
    if (!expiry) return;
    setTokenError(null);
    setTokenizing(true);
    let token;
    try {
      token = await tokenizeCard(
        {
          number: digitsOf(values.number),
          holderName: values.holderName.trim().replace(/\s+/g, ' '),
          expMonth: expiry.month,
          expYear: expiry.year,
          cvv: values.cvv,
        },
        { demo },
      );
    } catch (error) {
      setTokenError(getErrorMessage(error));
      return;
    } finally {
      setTokenizing(false);
    }

    const result = await dispatch(
      addPaymentMethod({
        token,
        makeDefault: isFirst || values.makeDefault,
      }),
    );
    if (addPaymentMethod.fulfilled.match(result)) onSaved();
  });

  const shownError = tokenError ?? mutationError;

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !isSaving && close()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[560px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-xl outline-none">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
              <FiCreditCard size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-ink">เพิ่มบัตรเครดิต / เดบิต</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">รองรับ Visa, Mastercard, JCB และ American Express</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="ปิด"
              disabled={isSaving}
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-40"
            >
              <FiX size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} noValidate autoComplete="on" className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar grid flex-1 grid-cols-2 gap-4 overflow-y-auto px-5 py-5 sm:px-6">
              <FormField label="หมายเลขบัตร" required error={errors.number?.message} className="col-span-2">
                <div className="relative">
                  <TextInput
                    inputMode="numeric"
                    autoComplete="cc-number"
                    placeholder="0000 0000 0000 0000"
                    invalid={!!errors.number}
                    className="pr-[92px] tracking-wider"
                    {...register('number', {
                      onChange: (e: { target: HTMLInputElement }) => {
                        e.target.value = formatCardNumber(e.target.value);
                      },
                      validate: (v) => {
                        const digits = digitsOf(v);
                        if (!digits) return REQUIRED;
                        if (digits.length < 13 || digits.length > 19) return 'หมายเลขบัตรไม่ครบถ้วน';
                        if (detectCardBrand(digits) === 'unknown') return 'ไม่รองรับประเภทบัตรนี้';
                        return passesLuhn(digits) || 'หมายเลขบัตรไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง';
                      },
                    })}
                  />
                  <CardBrandLogo brand={brand} className="pointer-events-none absolute right-1.5 top-1/2 h-8 w-[64px] -translate-y-1/2 scale-90 border-0" />
                </div>
              </FormField>

              <FormField label="ชื่อเจ้าของบัตร" required hint="(ตามที่ระบุบนบัตร)" error={errors.holderName?.message} className="col-span-2">
                <TextInput
                  autoComplete="cc-name"
                  invalid={!!errors.holderName}
                  {...register('holderName', {
                    validate: (v) => v.trim().length >= 2 || REQUIRED,
                    maxLength: { value: 60, message: 'ไม่เกิน 60 ตัวอักษร' },
                  })}
                />
              </FormField>

              <FormField label="วันหมดอายุ" required error={errors.expiry?.message}>
                <TextInput
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  placeholder="MM/YY"
                  invalid={!!errors.expiry}
                  {...register('expiry', {
                    onChange: (e: { target: HTMLInputElement }) => {
                      e.target.value = formatExpiry(e.target.value);
                    },
                    validate: (v) => {
                      if (!v) return REQUIRED;
                      const parsed = parseExpiry(v);
                      if (!parsed) return 'รูปแบบไม่ถูกต้อง (MM/YY)';
                      const now = new Date();
                      const expired = parsed.year < now.getFullYear() || (parsed.year === now.getFullYear() && parsed.month < now.getMonth() + 1);
                      return !expired || 'บัตรหมดอายุแล้ว';
                    },
                  })}
                />
              </FormField>
              <FormField label="CVV" required hint={`(${cvvLength} หลักหลังบัตร)`} error={errors.cvv?.message}>
                <TextInput
                  type="password"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength={4}
                  placeholder={'•'.repeat(cvvLength)}
                  invalid={!!errors.cvv}
                  {...register('cvv', {
                    validate: (v) => {
                      if (!v) return REQUIRED;
                      return new RegExp(`^\\d{${cvvLength}}$`).test(v) || `CVV ต้องเป็นตัวเลข ${cvvLength} หลัก`;
                    },
                  })}
                />
              </FormField>

              {/* Ticked by default and can be unticked. The first card becomes the default regardless (see hint). */}
              <label className="col-span-2 flex cursor-pointer flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-[#2B3445]">
                <input type="checkbox" className="h-4 w-4 accent-brand" {...register('makeDefault')} />
                ตั้งเป็นบัตรเริ่มต้นสำหรับการชำระเงิน
                <span className="text-xs text-slate-400">(บัตรใบแรกจะเป็นค่าเริ่มต้น)</span>
              </label>

              {shownError && (
                <p role="alert" className="col-span-2 flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand">
                  <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
                  {shownError}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={close}
                disabled={isSaving}
                className="flex h-11 items-center justify-center rounded-xl border border-slate-200 px-6 text-sm font-semibold text-[#2B3445] transition-colors hover:bg-slate-50 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-70"
              >
                {isSaving && <Spinner size={16} />}
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกบัตร'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

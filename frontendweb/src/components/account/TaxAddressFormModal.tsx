import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm, useWatch } from 'react-hook-form';
import { FiAlertCircle, FiFileText, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearTaxAddressError, createTaxAddress, updateTaxAddress } from '../../features/taxAddress/taxAddressSlice';
import { thaiProvinces } from '../../data/thaiProvinces';
import { cn } from '../../lib/cn';
import { FormField, SelectInput, TextInput } from '../ui/FormField';
import { Spinner } from '../ui/Spinner';
import type { TaxAddress, TaxAddressInput, TaxPayerType } from '../../types/api';

const REQUIRED = 'กรุณากรอกข้อมูลนี้';

const payerTypes: { value: TaxPayerType; label: string }[] = [
  { value: 'individual', label: 'บุคคลธรรมดา' },
  { value: 'company', label: 'นิติบุคคล' },
];

const toFormValues = (address: TaxAddress | null, isFirst: boolean): TaxAddressInput =>
  address
    ? {
        payerType: address.payerType,
        name: address.name,
        taxId: address.taxId,
        phone: address.phone,
        addressLine: address.addressLine,
        subdistrict: address.subdistrict,
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
        isDefault: address.isDefault,
      }
    : {
        payerType: 'individual',
        name: '',
        taxId: '',
        phone: '',
        addressLine: '',
        subdistrict: '',
        district: '',
        province: '',
        postalCode: '',
        isDefault: isFirst,
      };

const requiredText = (max: number) => ({
  validate: (v: string) => v.trim().length > 0 || REQUIRED,
  maxLength: { value: max, message: `ไม่เกิน ${max} ตัวอักษร` },
});

interface TaxAddressFormModalProps {
  open: boolean;
  /** The address being edited; null = adding a new one. */
  address: TaxAddress | null;
  /** No saved addresses yet — the new one has to be the default. */
  isFirst: boolean;
  onClose: () => void;
  /** After the save succeeded — the page shows its own confirmation. */
  onSaved: (mode: 'create' | 'update') => void;
}

/** Add / edit a tax-invoice address, for an individual or a company. Nothing is saved until "บันทึกที่อยู่". */
export function TaxAddressFormModal({ open, address, isFirst, onClose, onSaved }: TaxAddressFormModalProps) {
  const dispatch = useAppDispatch();
  const { mutationStatus, mutationError } = useAppSelector((state) => state.taxAddress);
  const isSaving = mutationStatus === 'loading';

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<TaxAddressInput>({ mode: 'onBlur', reValidateMode: 'onChange', defaultValues: toFormValues(address, isFirst) });

  // Every opening starts from the address being edited (or blank), with no leftover error.
  useEffect(() => {
    if (!open) return;
    reset(toFormValues(address, isFirst));
    dispatch(clearTaxAddressError());
  }, [open, address, isFirst, reset, dispatch]);

  const payerType = useWatch({ control, name: 'payerType' });
  const isCompany = payerType === 'company';
  // The only address, or the current default, has to stay the default — the box is shown ticked and locked.
  const defaultLocked = isFirst || Boolean(address?.isDefault);

  const onSubmit = handleSubmit(async (values) => {
    const input: TaxAddressInput = {
      payerType: values.payerType,
      name: values.name.trim(),
      taxId: values.taxId.replace(/[\s-]/g, ''),
      phone: values.phone.replace(/[\s-]/g, ''),
      addressLine: values.addressLine.trim(),
      subdistrict: values.subdistrict.trim(),
      district: values.district.trim(),
      province: values.province,
      postalCode: values.postalCode.trim(),
      isDefault: defaultLocked || values.isDefault,
    };
    const result = address
      ? await dispatch(updateTaxAddress({ id: address.id, input }))
      : await dispatch(createTaxAddress(input));
    if (result.meta.requestStatus === 'fulfilled') onSaved(address ? 'update' : 'create');
  });

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !isSaving && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-xl outline-none">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
              <FiFileText size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-ink">
                {address ? 'แก้ไขที่อยู่สำหรับออกใบกำกับภาษี' : 'เพิ่มที่อยู่สำหรับออกใบกำกับภาษี'}
              </Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">ข้อมูลนี้จะแสดงบนใบกำกับภาษี / ใบเสร็จรับเงิน</Dialog.Description>
            </div>
            <Dialog.Close
              aria-label="ปิด"
              disabled={isSaving}
              className="-mr-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-ink disabled:opacity-40"
            >
              <FiX size={20} aria-hidden="true" />
            </Dialog.Close>
          </div>

          <form onSubmit={onSubmit} noValidate className="flex min-h-0 flex-1 flex-col">
            <div className="no-scrollbar grid flex-1 grid-cols-1 gap-4 overflow-y-auto px-5 py-5 sm:grid-cols-2 sm:px-6">
              <fieldset className="sm:col-span-2">
                <legend className="mb-1.5 text-xs font-medium text-slate-500">
                  ประเภทผู้เสียภาษี<span className="text-brand"> *</span>
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {payerTypes.map((type) => {
                    const checked = payerType === type.value;
                    return (
                      <label
                        key={type.value}
                        className={cn(
                          'flex h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border text-sm font-medium transition-colors',
                          checked ? 'border-brand bg-red-50 text-brand' : 'border-slate-200 text-[#2B3445] hover:border-slate-300',
                        )}
                      >
                        <input type="radio" value={type.value} className="h-4 w-4 accent-brand" {...register('payerType')} />
                        {type.label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <FormField label={isCompany ? 'ชื่อบริษัท / นิติบุคคล' : 'ชื่อ-นามสกุล'} required error={errors.name?.message}>
                <TextInput
                  autoComplete={isCompany ? 'organization' : 'name'}
                  placeholder={isCompany ? 'เช่น บริษัท ตัวอย่าง จำกัด' : undefined}
                  invalid={!!errors.name}
                  {...register('name', requiredText(150))}
                />
              </FormField>
              <FormField
                label="เลขประจำตัวผู้เสียภาษี"
                required
                hint={isCompany ? '(13 หลัก)' : '(เลขบัตรประชาชน 13 หลัก)'}
                error={errors.taxId?.message}
              >
                <TextInput
                  inputMode="numeric"
                  maxLength={17}
                  invalid={!!errors.taxId}
                  {...register('taxId', {
                    validate: (v) => {
                      if (!v.trim()) return REQUIRED;
                      return /^\d{13}$/.test(v.replace(/[\s-]/g, '')) || 'เลขประจำตัวผู้เสียภาษีต้องเป็นตัวเลข 13 หลัก';
                    },
                  })}
                />
              </FormField>
              <FormField label="เบอร์โทรศัพท์" required error={errors.phone?.message} className="sm:col-span-2">
                <TextInput
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="08X-XXX-XXXX"
                  invalid={!!errors.phone}
                  {...register('phone', {
                    validate: (v) => {
                      if (!v.trim()) return REQUIRED;
                      return /^0\d{8,9}$/.test(v.replace(/[\s-]/g, '')) || 'เบอร์โทรศัพท์ไม่ถูกต้อง';
                    },
                  })}
                />
              </FormField>
              <FormField label="ที่อยู่" required hint="(เลขที่ หมู่บ้าน ซอย ถนน)" error={errors.addressLine?.message} className="sm:col-span-2">
                <TextInput autoComplete="street-address" invalid={!!errors.addressLine} {...register('addressLine', requiredText(200))} />
              </FormField>
              <FormField label="แขวง / ตำบล" required error={errors.subdistrict?.message}>
                <TextInput invalid={!!errors.subdistrict} {...register('subdistrict', requiredText(80))} />
              </FormField>
              <FormField label="เขต / อำเภอ" required error={errors.district?.message}>
                <TextInput invalid={!!errors.district} {...register('district', requiredText(80))} />
              </FormField>
              <FormField label="จังหวัด" required error={errors.province?.message}>
                <SelectInput invalid={!!errors.province} {...register('province', { required: 'กรุณาเลือกจังหวัด' })}>
                  <option value="">เลือกจังหวัด</option>
                  {thaiProvinces.map((province) => (
                    <option key={province} value={province}>
                      {province}
                    </option>
                  ))}
                </SelectInput>
              </FormField>
              <FormField label="รหัสไปรษณีย์" required error={errors.postalCode?.message}>
                <TextInput
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  invalid={!!errors.postalCode}
                  {...register('postalCode', {
                    validate: (v) => {
                      if (!v.trim()) return REQUIRED;
                      return /^\d{5}$/.test(v.trim()) || 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก';
                    },
                  })}
                />
              </FormField>

              <label className={cn('flex items-center gap-2.5 text-sm text-[#2B3445] sm:col-span-2', defaultLocked ? 'cursor-not-allowed' : 'cursor-pointer')}>
                <input
                  // Separate elements for locked (fixed checked) vs free (registered), so React never switches one input's mode.
                  key={defaultLocked ? 'locked' : 'free'}
                  type="checkbox"
                  disabled={defaultLocked}
                  className="h-4 w-4 accent-brand"
                  {...(defaultLocked ? { checked: true, readOnly: true } : register('isDefault'))}
                />
                ตั้งเป็นที่อยู่หลักสำหรับออกใบกำกับภาษี
                {defaultLocked && <span className="text-xs text-slate-400">{isFirst ? '(ที่อยู่แรกจะเป็นที่อยู่หลัก)' : '(ที่อยู่หลักปัจจุบัน)'}</span>}
              </label>

              {mutationError && (
                <p role="alert" className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-brand sm:col-span-2">
                  <FiAlertCircle size={16} className="shrink-0" aria-hidden="true" />
                  {mutationError}
                </p>
              )}
            </div>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
              <button
                type="button"
                onClick={onClose}
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
                {isSaving ? 'กำลังบันทึก...' : 'บันทึกที่อยู่'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

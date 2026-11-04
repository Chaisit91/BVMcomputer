import { useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { FiAlertCircle, FiMapPin, FiX } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { clearAddressError, createAddress, updateAddress } from '../../features/address/addressSlice';
import { thaiProvinces } from '../../data/thaiProvinces';
import { FormField, SelectInput, TextInput } from '../ui/FormField';
import { Spinner } from '../ui/Spinner';
import type { SavedAddress, SavedAddressInput } from '../../types/api';

const REQUIRED = 'กรุณากรอกข้อมูลนี้';

const emptyValues: SavedAddressInput = {
  recipientName: '',
  phone: '',
  addressLine: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

const toFormValues = (address: SavedAddress | null): SavedAddressInput =>
  address
    ? {
        recipientName: address.recipientName,
        phone: address.phone,
        addressLine: address.addressLine,
        subdistrict: address.subdistrict,
        district: address.district,
        province: address.province,
        postalCode: address.postalCode,
      }
    : emptyValues;

const requiredText = (max: number) => ({
  validate: (v: string) => v.trim().length > 0 || REQUIRED,
  maxLength: { value: max, message: `ไม่เกิน ${max} ตัวอักษร` },
});

interface AddressFormModalProps {
  open: boolean;
  /** The address being edited; null = adding a new one. */
  address: SavedAddress | null;
  onClose: () => void;
  /** After the save succeeded — the page shows its own confirmation. */
  onSaved: (mode: 'create' | 'update') => void;
}

/** Add / edit a shipping address. Validates on blur, then again on submit; nothing is saved until "บันทึกที่อยู่". */
export function AddressFormModal({ open, address, onClose, onSaved }: AddressFormModalProps) {
  const dispatch = useAppDispatch();
  const { mutationStatus, mutationError } = useAppSelector((state) => state.address);
  const isSaving = mutationStatus === 'loading';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<SavedAddressInput>({ mode: 'onBlur', reValidateMode: 'onChange', defaultValues: toFormValues(address) });

  // Every opening starts from the address being edited (or blank), with no leftover error.
  useEffect(() => {
    if (!open) return;
    reset(toFormValues(address));
    dispatch(clearAddressError());
  }, [open, address, reset, dispatch]);

  const onSubmit = handleSubmit(async (values) => {
    const input: SavedAddressInput = {
      recipientName: values.recipientName.trim(),
      phone: values.phone.replace(/[\s-]/g, ''),
      addressLine: values.addressLine.trim(),
      subdistrict: values.subdistrict.trim(),
      district: values.district.trim(),
      province: values.province,
      postalCode: values.postalCode.trim(),
    };
    const result = address
      ? await dispatch(updateAddress({ id: address.id, input }))
      : await dispatch(createAddress(input));
    if (result.meta.requestStatus === 'fulfilled') onSaved(address ? 'update' : 'create');
  });

  return (
    <Dialog.Root open={open} onOpenChange={(next) => !next && !isSaving && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[1px]" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-[600px] -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl bg-white shadow-xl outline-none">
          <div className="flex items-start gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-brand">
              <FiMapPin size={18} aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <Dialog.Title className="text-lg font-bold text-ink">{address ? 'แก้ไขที่อยู่สำหรับจัดส่ง' : 'เพิ่มที่อยู่สำหรับจัดส่ง'}</Dialog.Title>
              <Dialog.Description className="text-sm text-slate-500">กรอกข้อมูลผู้รับและที่อยู่ให้ครบถ้วน เพื่อการจัดส่งที่ถูกต้อง</Dialog.Description>
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
              <FormField label="ชื่อ-นามสกุลผู้รับ" required error={errors.recipientName?.message}>
                <TextInput autoComplete="name" invalid={!!errors.recipientName} {...register('recipientName', requiredText(100))} />
              </FormField>
              <FormField label="เบอร์โทรศัพท์" required error={errors.phone?.message}>
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
              <FormField label="ที่อยู่" required hint="(บ้านเลขที่ หมู่บ้าน ซอย ถนน)" error={errors.addressLine?.message} className="sm:col-span-2">
                <TextInput
                  autoComplete="street-address"
                  placeholder="เช่น 36/134 หมู่บ้านเลคการ์เด้น ซอย 4/13 หมู่ 9"
                  invalid={!!errors.addressLine}
                  {...register('addressLine', requiredText(200))}
                />
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

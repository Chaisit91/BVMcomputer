import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { FiFileText } from 'react-icons/fi';
import { FormField, SelectInput, TextInput } from '../ui/FormField';
import { thaiProvinces } from '../../data/thaiProvinces';
import { cn } from '../../lib/cn';
import { CheckoutDialog } from './CheckoutDialog';
import type { CheckoutTaxInvoice, TaxPayerType } from '../../types/api';

const REQUIRED = 'กรุณากรอกข้อมูลนี้';
const filled = (v: string) => v.trim().length > 0 || REQUIRED;

const payerTypes: { value: TaxPayerType; label: string }[] = [
  { value: 'individual', label: 'บุคคลธรรมดา' },
  { value: 'company', label: 'นิติบุคคล' },
];

const blank: CheckoutTaxInvoice = {
  payerType: 'individual',
  name: '',
  taxId: '',
  phone: '',
  addressLine: '',
  subdistrict: '',
  district: '',
  province: '',
  postalCode: '',
};

interface CheckoutTaxModalProps {
  open: boolean;
  /** Details already entered for this order, when editing them. */
  taxInvoice: CheckoutTaxInvoice | null;
  onClose: () => void;
  /** Keeps the details for this order only — nothing is sent anywhere until the order is placed. */
  onSave: (taxInvoice: CheckoutTaxInvoice) => void;
}

/** "เพิ่มข้อมูลใบกำกับภาษี" at checkout — same fields and rules as the account's tax-address form. */
export function CheckoutTaxModal({ open, taxInvoice, onClose, onSave }: CheckoutTaxModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<CheckoutTaxInvoice>({ mode: 'onBlur', reValidateMode: 'onChange', defaultValues: blank });
  const isCompany = useWatch({ control, name: 'payerType' }) === 'company';

  useEffect(() => {
    if (open) reset(taxInvoice ?? blank);
  }, [open, taxInvoice, reset]);

  const submit = handleSubmit((values) =>
    onSave({
      payerType: values.payerType,
      name: values.name.trim(),
      taxId: values.taxId.replace(/[\s-]/g, ''),
      phone: values.phone.replace(/[\s-]/g, ''),
      addressLine: values.addressLine.trim(),
      subdistrict: values.subdistrict.trim(),
      district: values.district.trim(),
      province: values.province,
      postalCode: values.postalCode.trim(),
    }),
  );

  return (
    <CheckoutDialog
      open={open}
      onClose={onClose}
      icon={FiFileText}
      title={taxInvoice ? 'แก้ไขข้อมูลใบกำกับภาษี' : 'เพิ่มข้อมูลใบกำกับภาษี'}
      description="ข้อมูลนี้จะใช้ออกใบกำกับภาษีสำหรับคำสั่งซื้อนี้"
      submitLabel="ใช้ข้อมูลนี้"
      onSubmit={submit}
    >
      <fieldset className="sm:col-span-2">
        <legend className="mb-1.5 text-xs font-medium text-slate-500">
          ประเภทผู้เสียภาษี<span className="text-brand"> *</span>
        </legend>
        <div className="grid grid-cols-2 gap-2">
          {payerTypes.map((type) => {
            const checked = (type.value === 'company') === isCompany;
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
        <TextInput autoComplete={isCompany ? 'organization' : 'name'} invalid={!!errors.name} {...register('name', { validate: filled })} />
      </FormField>
      <FormField label="เลขประจำตัวผู้เสียภาษี" required hint={isCompany ? '(13 หลัก)' : '(เลขบัตรประชาชน 13 หลัก)'} error={errors.taxId?.message}>
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
        <TextInput autoComplete="street-address" invalid={!!errors.addressLine} {...register('addressLine', { validate: filled })} />
      </FormField>
      <FormField label="แขวง / ตำบล" required error={errors.subdistrict?.message}>
        <TextInput invalid={!!errors.subdistrict} {...register('subdistrict', { validate: filled })} />
      </FormField>
      <FormField label="เขต / อำเภอ" required error={errors.district?.message}>
        <TextInput invalid={!!errors.district} {...register('district', { validate: filled })} />
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
    </CheckoutDialog>
  );
}

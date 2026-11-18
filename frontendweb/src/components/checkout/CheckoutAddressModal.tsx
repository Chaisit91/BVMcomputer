import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiMapPin } from 'react-icons/fi';
import { FormField, SelectInput, TextInput } from '../ui/FormField';
import { thaiProvinces } from '../../data/thaiProvinces';
import { CheckoutDialog } from './CheckoutDialog';
import type { ShippingAddress } from '../../types/api';

const REQUIRED = 'กรุณากรอกข้อมูลนี้';

interface AddressFormValues extends ShippingAddress {
  saveAddress: boolean;
}

const blank: AddressFormValues = {
  fullName: '',
  phone: '',
  address: '',
  province: '',
  district: '',
  subdistrict: '',
  postalCode: '',
  saveAddress: false,
};

interface CheckoutAddressModalProps {
  open: boolean;
  /** The address already entered for this order, when editing it. */
  address: ShippingAddress | null;
  saveAddress: boolean;
  onClose: () => void;
  /** Keeps the address for this order only — nothing is sent anywhere until the order is placed. */
  onSave: (address: ShippingAddress, saveAddress: boolean) => void;
}

/** "เพิ่มที่อยู่จัดส่ง" at checkout — the same fields and rules the inline checkout form had. */
export function CheckoutAddressModal({ open, address, saveAddress, onClose, onSave }: CheckoutAddressModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddressFormValues>({ mode: 'onBlur', reValidateMode: 'onChange', defaultValues: blank });

  // Each opening starts from what's already entered (or blank).
  useEffect(() => {
    if (open) reset(address ? { ...address, saveAddress } : blank);
  }, [open, address, saveAddress, reset]);

  const submit = handleSubmit(({ saveAddress: save, ...values }) => {
    onSave(
      {
        fullName: values.fullName.trim(),
        phone: values.phone.replace(/[\s-]/g, ''),
        address: values.address.trim(),
        province: values.province,
        district: values.district.trim(),
        subdistrict: values.subdistrict.trim(),
        postalCode: values.postalCode.trim(),
      },
      save,
    );
  });

  return (
    <CheckoutDialog
      open={open}
      onClose={onClose}
      icon={FiMapPin}
      title={address ? 'แก้ไขที่อยู่จัดส่ง' : 'เพิ่มที่อยู่จัดส่ง'}
      description="กรอกข้อมูลผู้รับและที่อยู่ให้ครบถ้วน เพื่อการจัดส่งที่ถูกต้อง"
      submitLabel="ใช้ที่อยู่นี้"
      onSubmit={submit}
    >
      <FormField label="ชื่อ - นามสกุล" required error={errors.fullName?.message}>
        <TextInput
          placeholder="ชื่อผู้รับสินค้า"
          autoComplete="name"
          invalid={!!errors.fullName}
          {...register('fullName', { required: REQUIRED, minLength: { value: 2, message: 'กรุณากรอกชื่อให้ครบถ้วน' } })}
        />
      </FormField>
      <FormField label="เบอร์โทรศัพท์" required error={errors.phone?.message}>
        <TextInput
          type="tel"
          inputMode="tel"
          placeholder="08X-XXX-XXXX"
          autoComplete="tel"
          invalid={!!errors.phone}
          {...register('phone', {
            required: REQUIRED,
            validate: (value) => /^0\d{8,9}$/.test(value.replace(/[\s-]/g, '')) || 'เบอร์โทรศัพท์ไม่ถูกต้อง',
          })}
        />
      </FormField>
      <FormField label="ที่อยู่" required error={errors.address?.message} className="sm:col-span-2">
        <TextInput
          placeholder="บ้านเลขที่ / ถนน / ซอย"
          autoComplete="street-address"
          invalid={!!errors.address}
          {...register('address', { validate: (v) => v.trim().length > 0 || REQUIRED })}
        />
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
      <FormField label="อำเภอ / เขต" required error={errors.district?.message}>
        <TextInput placeholder="อำเภอ / เขต" invalid={!!errors.district} {...register('district', { validate: (v) => v.trim().length > 0 || REQUIRED })} />
      </FormField>
      <FormField label="ตำบล / แขวง" required error={errors.subdistrict?.message}>
        <TextInput
          placeholder="ตำบล / แขวง"
          invalid={!!errors.subdistrict}
          {...register('subdistrict', { validate: (v) => v.trim().length > 0 || REQUIRED })}
        />
      </FormField>
      <FormField label="รหัสไปรษณีย์" required error={errors.postalCode?.message}>
        <TextInput
          inputMode="numeric"
          placeholder="10xxx"
          autoComplete="postal-code"
          maxLength={5}
          invalid={!!errors.postalCode}
          {...register('postalCode', { required: REQUIRED, pattern: { value: /^\d{5}$/, message: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก' } })}
        />
      </FormField>
      <label className="flex items-center gap-2 text-sm text-[#2B3445] sm:col-span-2">
        <input type="checkbox" className="h-4 w-4 accent-brand" {...register('saveAddress')} />
        บันทึกที่อยู่นี้สำหรับการสั่งซื้อครั้งถัดไป
      </label>
    </CheckoutDialog>
  );
}

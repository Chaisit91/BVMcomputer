import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiInfo, FiLock } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { resetSaveStatus, saveProfile } from '../../features/account/accountSlice';
import { FormField, SelectInput, TextInput } from '../ui/FormField';
import { Spinner } from '../ui/Spinner';
import type { Gender, UpdateProfileRequest, UserProfile } from '../../types/api';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  gender: Gender | '';
}

const REQUIRED = 'กรุณากรอกข้อมูลนี้';

const toFormValues = (profile: UserProfile): ProfileFormValues => ({
  firstName: profile.firstName,
  lastName: profile.lastName,
  phone: profile.phone,
  birthDate: profile.birthDate ?? '',
  gender: profile.gender ?? '',
});

const todayIso = () => new Date().toISOString().slice(0, 10);

/**
 * Edit form for the personal details. "บันทึก" validates and saves; a save the server confirms goes back
 * to the summary page (which then shows the new values). "กลับไปหน้าข้อมูลส่วนตัว" leaves without saving.
 */
export function ProfileForm({ profile }: { profile: UserProfile }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { saveStatus, saveError, saveSource } = useAppSelector((state) => state.account);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    mode: 'onBlur',
    reValidateMode: 'onChange',
    defaultValues: toFormValues(profile),
  });

  // A result from an earlier visit shouldn't greet the customer on a fresh edit.
  useEffect(() => {
    dispatch(resetSaveStatus());
  }, [dispatch]);

  // Re-baseline the form whenever the stored profile changes (first load, or a save).
  useEffect(() => {
    reset(toFormValues(profile));
  }, [profile, reset]);

  const onSubmit = handleSubmit(async (values) => {
    const changes: UpdateProfileRequest = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.replace(/[\s-]/g, ''),
      birthDate: values.birthDate || undefined,
      gender: values.gender || undefined,
    };
    const result = await dispatch(saveProfile(changes));
    // Only a real save returns to the summary; demo and errors stay here with their message.
    if (saveProfile.fulfilled.match(result) && result.payload.source === 'live') navigate('/account/profile', { state: { saved: true } });
  });

  const isSaving = saveStatus === 'loading';

  return (
    <form
      onSubmit={onSubmit}
      // Any new edit clears the previous save result, so a stale "saved" message never sits next to unsaved changes.
      onChange={() => saveStatus !== 'idle' && saveStatus !== 'loading' && dispatch(resetSaveStatus())}
      noValidate
      className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-6"
    >
      <div className="mb-1 flex items-center gap-2.5">
        <span className="h-6 w-1.5 rounded-full bg-brand" aria-hidden="true" />
        <h2 className="text-lg font-bold text-ink">ข้อมูลส่วนตัว</h2>
      </div>
      <p className="mb-5 pl-4 text-sm text-slate-400">กรอกข้อมูลให้ถูกต้อง เพื่อใช้ในการจัดส่งสินค้าและติดต่อคุณ</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormField label="ชื่อ" required error={errors.firstName?.message}>
          <TextInput
            autoComplete="given-name"
            invalid={!!errors.firstName}
            {...register('firstName', {
              validate: (v) => v.trim().length > 0 || REQUIRED,
              maxLength: { value: 50, message: 'ไม่เกิน 50 ตัวอักษร' },
            })}
          />
        </FormField>
        <FormField label="นามสกุล" required error={errors.lastName?.message}>
          <TextInput
            autoComplete="family-name"
            invalid={!!errors.lastName}
            {...register('lastName', {
              validate: (v) => v.trim().length > 0 || REQUIRED,
              maxLength: { value: 50, message: 'ไม่เกิน 50 ตัวอักษร' },
            })}
          />
        </FormField>

        <FormField label="อีเมล" hint="(ใช้เข้าสู่ระบบ แก้ไขไม่ได้)">
          <div className="relative">
            <TextInput value={profile.email} readOnly aria-readonly="true" className="cursor-not-allowed bg-slate-50 pr-10 text-slate-500" />
            <FiLock size={16} className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
          </div>
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

        <FormField label="วันเกิด" hint="(ไม่บังคับ)" error={errors.birthDate?.message}>
          <TextInput
            type="date"
            max={todayIso()}
            invalid={!!errors.birthDate}
            {...register('birthDate', {
              validate: (v) => {
                if (!v) return true;
                if (v > todayIso()) return 'วันเกิดต้องไม่เป็นวันในอนาคต';
                return v >= '1900-01-01' || 'วันเกิดไม่ถูกต้อง';
              },
            })}
          />
        </FormField>
        <FormField label="เพศ" hint="(ไม่บังคับ)">
          <SelectInput {...register('gender')}>
            <option value="">ไม่ระบุ</option>
            <option value="male">ชาย</option>
            <option value="female">หญิง</option>
            <option value="other">อื่นๆ</option>
          </SelectInput>
        </FormField>
      </div>

      <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <SaveStatus status={saveStatus} error={saveError} source={saveSource} />

        <div className="flex flex-col-reverse gap-3 sm:ml-auto sm:flex-row">
          <Link
            to="/account/profile"
            className="flex h-11 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-ink transition-colors hover:bg-slate-50 sm:flex-none"
          >
            <FiArrowLeft size={15} aria-hidden="true" />
            กลับไปหน้าข้อมูลส่วนตัว
          </Link>
          <button
            type="submit"
            disabled={!isDirty || isSaving}
            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-brand px-6 text-sm font-semibold text-white transition-colors hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
          >
            {isSaving && <Spinner size={15} />}
            {isSaving ? 'กำลังบันทึก...' : 'บันทึก'}
          </button>
        </div>
      </div>
    </form>
  );
}

function SaveStatus({
  status,
  error,
  source,
}: {
  status: string;
  error: string | null;
  source: 'live' | 'demo' | null;
}) {
  if (status === 'failed') {
    return (
      <p role="alert" className="flex items-center gap-1.5 text-sm text-red-600">
        <FiAlertCircle size={15} className="shrink-0" aria-hidden="true" />
        {error}
      </p>
    );
  }
  if (status !== 'succeeded') return null;
  if (source === 'demo') {
    return (
      <p role="status" className="flex items-start gap-1.5 text-sm text-amber-700">
        <FiInfo size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
        โหมดทดสอบ: ระบบบัญชียังไม่ได้เชื่อมต่อ ข้อมูลนี้ยังไม่ได้บันทึกไปยังเซิร์ฟเวอร์
      </p>
    );
  }
  return (
    <p role="status" className="flex items-center gap-1.5 text-sm text-emerald-600">
      <FiCheckCircle size={15} className="shrink-0" aria-hidden="true" />
      บันทึกข้อมูลเรียบร้อยแล้ว
    </p>
  );
}

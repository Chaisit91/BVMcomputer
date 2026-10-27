import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import type { IconType } from 'react-icons';
import { FiAlertCircle, FiCalendar, FiCamera, FiCheckCircle, FiCreditCard, FiHeart, FiInfo, FiMail, FiShoppingBag, FiTruck } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchAccountSummary, resetAvatarStatus, uploadProfileAvatar } from '../../features/account/accountSlice';
import { Skeleton } from '../ui/Skeleton';
import { Spinner } from '../ui/Spinner';
import { AccountAvatar } from './AccountAvatar';
import { formatThaiDate } from './formatThaiDate';
import type { AccountSummary, UserProfile } from '../../types/api';

const MAX_AVATAR_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];

const stats: { key: keyof AccountSummary; label: string; icon: IconType }[] = [
  { key: 'orders', label: 'คำสั่งซื้อ', icon: FiShoppingBag },
  { key: 'wishlist', label: 'สินค้าที่ถูกใจ', icon: FiHeart },
  { key: 'shipping', label: 'กำลังจัดส่ง', icon: FiTruck },
  { key: 'pendingPayment', label: 'รอชำระเงิน', icon: FiCreditCard },
];

/** Top card of the profile page: avatar (with upload), name, email, membership — and the 4 account counts. */
export function ProfileHeaderCard({ profile }: { profile: UserProfile }) {
  const dispatch = useAppDispatch();
  const { avatarStatus, avatarError, avatarSource, summary, summaryStatus } = useAppSelector((state) => state.account);
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const fullName = `${profile.firstName} ${profile.lastName}`.trim();

  useEffect(() => {
    if (summaryStatus === 'idle') void dispatch(fetchAccountSummary());
  }, [summaryStatus, dispatch]);

  // Free the object URL when it's replaced or the card unmounts.
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // allow choosing the same file again after an error
    if (!file) return;

    dispatch(resetAvatarStatus());
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setFileError('รองรับเฉพาะไฟล์ JPG หรือ PNG');
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setFileError('ไฟล์มีขนาดเกิน 5 MB กรุณาเลือกไฟล์ที่เล็กลง');
      return;
    }

    setFileError(null);
    setPreview(URL.createObjectURL(file));
    void dispatch(uploadProfileAvatar(file));
  };

  const isUploading = avatarStatus === 'loading';
  // A failed upload must not leave the unsaved picture on screen as if it were the profile photo.
  const shownAvatar = (avatarStatus === 'failed' ? null : preview) ?? profile.avatarUrl ?? null;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white shadow-card">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-center">
        <div className="flex min-w-0 flex-1 items-center gap-4 sm:gap-5">
          <div className="relative shrink-0">
            <AccountAvatar src={shownAvatar} label={fullName || profile.email} className="h-20 w-20 text-3xl sm:h-24 sm:w-24" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={isUploading}
              aria-label="เปลี่ยนรูปโปรไฟล์ (JPG, PNG ไม่เกิน 5 MB)"
              title="เปลี่ยนรูปโปรไฟล์ (JPG, PNG ไม่เกิน 5 MB)"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-slate-500 text-white transition-colors hover:bg-brand disabled:opacity-60"
            >
              {isUploading ? <Spinner size={14} /> : <FiCamera size={14} aria-hidden="true" />}
            </button>
            <input ref={inputRef} type="file" accept={ACCEPTED_TYPES.join(',')} onChange={handleFile} className="hidden" />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-xl font-bold text-ink">{fullName || 'ยังไม่ได้ระบุชื่อ'}</h2>
              <span className="rounded-md bg-red-50 px-2 py-0.5 text-[11px] font-semibold text-brand">สมาชิก MAXCOM</span>
            </div>
            <p className="mt-1.5 flex items-center gap-2 text-sm text-slate-500">
              <FiMail size={15} className="shrink-0" aria-hidden="true" />
              <span className="truncate">{profile.email}</span>
            </p>
            {profile.memberSince && (
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <FiCalendar size={15} className="shrink-0" aria-hidden="true" />
                เป็นสมาชิกตั้งแต่ {formatThaiDate(profile.memberSince, 'short')}
              </p>
            )}
          </div>
        </div>

        <dl className="grid grid-cols-2 gap-y-4 border-t border-slate-100 pt-4 sm:grid-cols-4 lg:w-[460px] lg:shrink-0 lg:border-l lg:border-t-0 lg:pt-0">
          {stats.map(({ key, label, icon: Icon }, index) => (
            <div
              key={key}
              className={`flex flex-col items-center gap-1 text-center ${index > 0 ? 'sm:border-l sm:border-slate-100' : ''}`}
            >
              <Icon size={22} className="text-brand" aria-hidden="true" />
              {/* <dt> before <dd> in the markup; `order` puts the number above the label on screen. */}
              <dt className="order-3 text-xs text-slate-500">{label}</dt>
              <dd className="order-2 text-lg font-bold leading-tight text-ink">
                {summaryStatus === 'loading' || summaryStatus === 'idle' ? (
                  <Skeleton className="mx-auto h-5 w-6" />
                ) : summary ? (
                  summary[key].toLocaleString('th-TH')
                ) : (
                  // Never a made-up 0: without real data there's nothing to count yet.
                  <span className="text-xs font-medium text-slate-400">ไม่มีข้อมูล</span>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {(fileError || avatarStatus === 'failed' || avatarStatus === 'succeeded') && (
        <div className="border-t border-slate-100 px-5 py-2.5 text-xs sm:px-6">
          {fileError || avatarStatus === 'failed' ? (
            <p role="alert" className="flex items-center gap-1.5 text-red-600">
              <FiAlertCircle size={14} aria-hidden="true" />
              {fileError ?? avatarError}
            </p>
          ) : avatarSource === 'demo' ? (
            <p className="flex items-center gap-1.5 text-amber-700">
              <FiInfo size={14} aria-hidden="true" />
              โหมดทดสอบ: แสดงตัวอย่างรูปในเครื่องนี้เท่านั้น ยังไม่ได้อัปโหลดไปยังเซิร์ฟเวอร์
            </p>
          ) : (
            <p className="flex items-center gap-1.5 text-emerald-600">
              <FiCheckCircle size={14} aria-hidden="true" />
              อัปเดตรูปโปรไฟล์เรียบร้อยแล้ว
            </p>
          )}
        </div>
      )}
    </div>
  );
}

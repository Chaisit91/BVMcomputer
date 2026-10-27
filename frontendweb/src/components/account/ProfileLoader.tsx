import { useEffect, type ReactNode } from 'react';
import { FiInfo } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProfile } from '../../features/account/accountSlice';
import { ErrorState } from '../ui/ErrorState';
import { Skeleton } from '../ui/Skeleton';
import type { UserProfile } from '../../types/api';

/**
 * Loads the signed-in customer's profile (once per sign-in — the slice resets on logout) and
 * renders `children` with it; shows a skeleton while loading, a retry on failure, and a clear
 * notice when the data is demo-only because the account backend isn't connected.
 */
export function ProfileLoader({ children }: { children: (profile: UserProfile) => ReactNode }) {
  const dispatch = useAppDispatch();
  const { profile, source, loadStatus, loadError } = useAppSelector((state) => state.account);

  useEffect(() => {
    if (loadStatus === 'idle') void dispatch(fetchProfile());
  }, [loadStatus, dispatch]);

  if (loadStatus === 'failed') {
    return <ErrorState title="โหลดข้อมูลบัญชีไม่สำเร็จ" message={loadError} onRetry={() => void dispatch(fetchProfile())} />;
  }

  if (!profile) {
    return (
      <div className="flex flex-col gap-5" aria-busy="true" aria-label="กำลังโหลดข้อมูลบัญชี">
        <div className="flex items-center gap-5 rounded-2xl border border-slate-100 bg-white p-6 shadow-card">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-24 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <>
      {source === 'demo' && (
        <p className="flex items-start gap-2 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          <FiInfo size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          โหมดทดสอบ: ระบบบัญชียังไม่ได้เชื่อมต่อ ข้อมูลด้านล่างมาจากการเข้าสู่ระบบในเครื่องนี้เท่านั้น และการแก้ไขจะยังไม่ถูกบันทึกไปยังเซิร์ฟเวอร์
        </p>
      )}
      {children(profile)}
    </>
  );
}

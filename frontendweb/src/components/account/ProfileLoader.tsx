import { useEffect, type ReactNode } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchProfile } from '../../features/account/accountSlice';
import { ErrorState } from '../ui/ErrorState';
import { Skeleton } from '../ui/Skeleton';
import type { UserProfile } from '../../types/api';

/**
 * Loads the signed-in customer's profile (once per sign-in — the slice resets on logout) and
 * renders `children` with it; shows a skeleton while loading and a retry on failure.
 */
export function ProfileLoader({ children }: { children: (profile: UserProfile) => ReactNode }) {
  const dispatch = useAppDispatch();
  const { profile, loadStatus, loadError } = useAppSelector((state) => state.account);

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

  return <>{children(profile)}</>;
}

import { Link, useLocation } from 'react-router-dom';
import { BsPersonFill } from 'react-icons/bs';
import { FiCheckCircle, FiEdit2 } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { PersonalInfoCard } from '../components/account/PersonalInfoCard';
import { ProfileHeaderCard } from '../components/account/ProfileHeaderCard';
import { ProfileLoader } from '../components/account/ProfileLoader';
import { RequireLogin } from '../components/account/RequireLogin';

/** "บัญชีของฉัน › ข้อมูลส่วนตัว" — profile card with account counts, and the personal-details summary. */
export function AccountProfilePage() {
  // Set by the edit page only after the server confirmed the save — tied to that one navigation.
  const justSaved = (useLocation().state as { saved?: boolean } | null)?.saved === true;

  return (
    <RequireLogin>
      <AccountLayout
        title="ข้อมูลส่วนตัว"
        icon={BsPersonFill}
        description="จัดการข้อมูลส่วนตัวของคุณ เพื่อให้การใช้งานสะดวกและปลอดภัยยิ่งขึ้น"
        actions={
          <Link
            to="/account/profile/edit"
            className="flex h-10 shrink-0 items-center gap-2 rounded-xl bg-red-50 px-4 text-sm font-semibold text-brand transition-colors hover:bg-red-100"
          >
            <FiEdit2 size={15} aria-hidden="true" />
            แก้ไขข้อมูลส่วนตัว
          </Link>
        }
      >
        {justSaved && (
          <p role="status" className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            <FiCheckCircle size={16} className="shrink-0" aria-hidden="true" />
            บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว
          </p>
        )}
        <ProfileLoader>
          {(profile) => (
            <>
              <ProfileHeaderCard profile={profile} />
              <PersonalInfoCard profile={profile} />
            </>
          )}
        </ProfileLoader>
      </AccountLayout>
    </RequireLogin>
  );
}

import { FiEdit2 } from 'react-icons/fi';
import { AccountLayout } from '../components/account/AccountLayout';
import { ProfileForm } from '../components/account/ProfileForm';
import { ProfileLoader } from '../components/account/ProfileLoader';
import { RequireLogin } from '../components/account/RequireLogin';

/** "บัญชีของฉัน › ข้อมูลส่วนตัว › แก้ไข" — the personal-details form. */
export function AccountProfileEditPage() {
  return (
    <RequireLogin>
      <AccountLayout
        title="แก้ไขข้อมูลส่วนตัว"
        icon={FiEdit2}
        description="แก้ไขข้อมูลให้ถูกต้อง เพื่อใช้ในการจัดส่งสินค้าและติดต่อคุณ"
      >
        <ProfileLoader>{(profile) => <ProfileForm profile={profile} />}</ProfileLoader>
      </AccountLayout>
    </RequireLogin>
  );
}

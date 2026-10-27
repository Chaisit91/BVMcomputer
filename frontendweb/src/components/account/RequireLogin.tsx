import type { ReactNode } from 'react';
import { FiUser } from 'react-icons/fi';
import { useAppSelector } from '../../app/hooks';
import { Container } from '../ui/Container';
import { EmptyState } from '../ui/EmptyState';

/** Account pages are for the signed-in customer only — everyone else gets a prompt to log in. */
export function RequireLogin({ children }: { children: ReactNode }) {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (isAuthenticated) return <>{children}</>;

  return (
    <section className="bg-slate-50 py-16">
      <Container>
        <EmptyState
          icon={FiUser}
          title="กรุณาเข้าสู่ระบบเพื่อดูข้อมูลบัญชี"
          description="กดไอคอนบัญชีที่มุมขวาบนของหน้าเพื่อเข้าสู่ระบบ แล้วกลับมาที่หน้านี้อีกครั้ง"
        />
      </Container>
    </section>
  );
}

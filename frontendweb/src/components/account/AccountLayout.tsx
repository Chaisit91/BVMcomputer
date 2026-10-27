import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Container } from '../ui/Container';
import { AccountSidebar } from './AccountSidebar';

interface AccountLayoutProps {
  title: string;
  /** Red icon before the heading. */
  icon: IconType;
  description: string;
  /** Top-right of the content area, e.g. the "แก้ไขข้อมูลส่วนตัว" button. */
  actions?: ReactNode;
  children: ReactNode;
}

/**
 * Shell for every "บัญชีของฉัน" page: sidebar on the left, heading + content on the right
 * (stacked on smaller screens). Header and Footer come from the site-wide Layout as usual.
 */
export function AccountLayout({ title, icon: Icon, description, actions, children }: AccountLayoutProps) {
  return (
    <section className="bg-slate-50 pb-16 pt-6">
      <Container>
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[260px_1fr]">
          <AccountSidebar />

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2.5">
                  <Icon size={24} className="shrink-0 text-brand" aria-hidden="true" />
                  {/* Text only, nudged down 2px so it reads level with the icon — the icon and row stay put. */}
                  <h1 className="m-0 translate-y-[2px] text-2xl font-bold leading-[1.4] text-ink">{title}</h1>
                </div>
                <p className="mt-1 text-sm text-slate-500">{description}</p>
              </div>
              {actions}
            </div>

            <div className="flex flex-col gap-5">{children}</div>
          </div>
        </div>
      </Container>
    </section>
  );
}

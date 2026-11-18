import type { ReactNode } from 'react';
import type { IconType } from 'react-icons';
import { Container } from '../ui/Container';

interface InfoPageLayoutProps {
  title: string;
  /** Red icon before the heading. */
  icon: IconType;
  description: string;
  children: ReactNode;
}

/** Shell for the Topbar's content pages (บทความ / บริการของเรา / ช่วยเหลือ) — same heading style as the account pages. */
export function InfoPageLayout({ title, icon: Icon, description, children }: InfoPageLayoutProps) {
  return (
    <section className="bg-slate-50 pb-16 pt-6">
      <Container>
        <div className="mb-5">
          <div className="flex items-center gap-2.5">
            <Icon size={24} className="shrink-0 text-brand" aria-hidden="true" />
            <h1 className="m-0 translate-y-[2px] text-2xl font-bold leading-[1.4] text-ink">{title}</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
        <div className="flex flex-col gap-5">{children}</div>
      </Container>
    </section>
  );
}

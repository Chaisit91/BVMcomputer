import { formatThaiDate } from './formatThaiDate';
import type { UserProfile } from '../../types/api';

/** Read-only summary of the personal details, 4 equal columns (2 on tablet, 1 on phones). */
export function PersonalInfoCard({ profile }: { profile: UserProfile }) {
  const fields = [
    { label: 'ชื่อ - นามสกุล', value: `${profile.firstName} ${profile.lastName}`.trim() },
    { label: 'อีเมล', value: profile.email },
    { label: 'หมายเลขโทรศัพท์', value: profile.phone },
    { label: 'วัน / เดือน / ปีเกิด', value: profile.birthDate ? formatThaiDate(profile.birthDate) : '' },
  ];

  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-card sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
      {fields.map(({ label, value }) => (
        <div key={label} className="min-w-0">
          <dt className="text-xs text-slate-400">{label}</dt>
          <dd className={value ? 'mt-1 break-words text-sm font-medium text-ink' : 'mt-1 text-sm text-slate-400'}>
            {value || 'ยังไม่ได้ระบุ'}
          </dd>
        </div>
      ))}
    </dl>
  );
}

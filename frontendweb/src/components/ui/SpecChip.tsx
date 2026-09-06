import type { IconType } from 'react-icons';

interface SpecChipProps {
  icon: IconType;
  label: string;
}

/** Small icon + label tag used to show a single spec value in list-view rows. */
export function SpecChip({ icon: Icon, label }: SpecChipProps) {
  return (
    <span className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500">
      <Icon size={13} className="shrink-0 text-slate-400" aria-hidden="true" />
      {label}
    </span>
  );
}

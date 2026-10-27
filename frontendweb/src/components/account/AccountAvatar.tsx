import { getInitials } from '../../lib/format';
import { cn } from '../../lib/cn';

interface AccountAvatarProps {
  /** Photo URL (uploaded avatar or a local preview); initials are shown when absent. */
  src?: string | null;
  /** Name or email the initials are taken from. */
  label: string;
  className?: string;
}

/** Round profile picture — falls back to the same initials the header's account button shows. */
export function AccountAvatar({ src, label, className }: AccountAvatarProps) {
  return (
    <span
      className={cn(
        'flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-red-50 font-bold text-brand ring-4 ring-white',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={`รูปโปรไฟล์ของ ${label}`} className="h-full w-full object-cover" />
      ) : (
        <span aria-hidden="true">{getInitials(label)}</span>
      )}
    </span>
  );
}

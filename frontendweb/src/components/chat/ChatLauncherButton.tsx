import { forwardRef } from 'react';
import { BsChatDotsFill } from 'react-icons/bs';
import { cn } from '../../lib/cn';

interface ChatLauncherButtonProps {
  unreadCount: number;
  hidden: boolean;
  onClick: () => void;
}

/**
 * Floating "ปรึกษาแอดมิน" button — `position: fixed`, so it stays in the same screen corner
 * whatever the scroll position. Icon-only on phones so it covers as little of the page as possible.
 */
export const ChatLauncherButton = forwardRef<HTMLButtonElement, ChatLauncherButtonProps>(
  ({ unreadCount, hidden, onClick }, ref) => (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      aria-label={unreadCount > 0 ? `ปรึกษาแอดมิน (ข้อความใหม่ ${unreadCount} ข้อความ)` : 'ปรึกษาแอดมิน'}
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
      title="ปรึกษาแอดมิน"
      className={cn(
        'fixed bottom-4 right-4 z-40 flex h-14 w-14 items-center justify-center gap-2 rounded-full bg-brand text-sm font-semibold text-white shadow-[0_8px_24px_-6px_rgba(226,0,26,0.55)] transition-all duration-200 hover:bg-brand-dark focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand/30 motion-reduce:transition-none sm:bottom-6 sm:right-6 sm:h-12 sm:w-auto sm:px-5',
        hidden ? 'pointer-events-none translate-y-2 scale-90 opacity-0' : 'translate-y-0 scale-100 opacity-100',
      )}
    >
      <BsChatDotsFill size={20} aria-hidden="true" />
      <span className="hidden sm:inline">ปรึกษาแอดมิน</span>
      {unreadCount > 0 && (
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-white bg-ink px-1 text-[10px] font-bold leading-none">
          {unreadCount > 9 ? '9+' : unreadCount}
        </span>
      )}
    </button>
  ),
);
ChatLauncherButton.displayName = 'ChatLauncherButton';

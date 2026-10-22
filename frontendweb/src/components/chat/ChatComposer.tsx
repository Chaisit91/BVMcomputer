import { forwardRef, useLayoutEffect, useRef, type KeyboardEvent } from 'react';
import { FiSend } from 'react-icons/fi';
import { cn } from '../../lib/cn';

const MAX_LENGTH = 1000;
const MAX_HEIGHT_PX = 120;

interface ChatComposerProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (text: string) => void;
  disabled?: boolean;
}

/** Message input: Enter sends, Shift+Enter adds a line; grows with its content up to ~5 lines. */
export const ChatComposer = forwardRef<HTMLTextAreaElement, ChatComposerProps>(({ value, onChange, onSend, disabled }, ref) => {
  const innerRef = useRef<HTMLTextAreaElement | null>(null);
  const canSend = !disabled && value.trim().length > 0;

  useLayoutEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, MAX_HEIGHT_PX)}px`;
  }, [value]);

  const submit = () => {
    if (!canSend) return;
    onSend(value.trim());
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // isComposing: Thai/IME input confirms candidates with Enter — that must not send the message.
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <div className="flex items-end gap-2 border-t border-slate-100 bg-white px-3 py-3">
      <textarea
        ref={(node) => {
          innerRef.current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
        }}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        rows={1}
        maxLength={MAX_LENGTH}
        placeholder="พิมพ์ข้อความสอบถาม..."
        aria-label="พิมพ์ข้อความสอบถาม"
        className="max-h-[120px] min-h-[44px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-base leading-snug text-ink outline-none transition-colors placeholder:text-slate-400 focus:border-brand focus:bg-white sm:text-sm"
      />
      <button
        type="button"
        onClick={submit}
        disabled={!canSend}
        aria-label="ส่งข้อความ"
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white transition-colors',
          canSend ? 'bg-brand hover:bg-brand-dark' : 'cursor-not-allowed bg-slate-200 text-slate-400',
        )}
      >
        <FiSend size={18} aria-hidden="true" />
      </button>
    </div>
  );
});
ChatComposer.displayName = 'ChatComposer';

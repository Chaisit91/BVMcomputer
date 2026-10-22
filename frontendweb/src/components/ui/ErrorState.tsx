import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi';
import { Button } from './Button';
import { EmptyState } from './EmptyState';

interface ErrorStateProps {
  title?: string;
  message?: string | null;
  onRetry?: () => void;
  className?: string;
}

/** Failed-request placeholder with an optional retry — pairs with every slice's `error` field. */
export function ErrorState({ title = 'โหลดข้อมูลไม่สำเร็จ', message, onRetry, className }: ErrorStateProps) {
  return (
    <EmptyState
      icon={FiAlertTriangle}
      title={title}
      description={message ?? undefined}
      className={className}
      action={
        onRetry && (
          <Button type="button" onClick={onRetry}>
            <FiRefreshCw size={14} aria-hidden="true" />
            ลองใหม่อีกครั้ง
          </Button>
        )
      }
    />
  );
}

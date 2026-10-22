import { FiLoader } from 'react-icons/fi';
import { cn } from '../../lib/cn';

/** Inline loading indicator — for buttons and small in-flight states. */
export function Spinner({ size = 16, className }: { size?: number; className?: string }) {
  return <FiLoader size={size} className={cn('animate-spin', className)} aria-hidden="true" />;
}

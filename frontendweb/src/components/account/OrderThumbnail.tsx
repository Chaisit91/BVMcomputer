import { FiPackage } from 'react-icons/fi';
import { cn } from '../../lib/cn';

/** Product photo for an order line; a neutral box icon when the order has no image. */
export function OrderThumbnail({ src, alt, className }: { src?: string; alt: string; className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50', className)}>
      {src ? (
        <img src={src} alt={alt} loading="lazy" className="h-full w-full object-contain" />
      ) : (
        <FiPackage size={28} className="text-slate-300" aria-hidden="true" />
      )}
    </span>
  );
}

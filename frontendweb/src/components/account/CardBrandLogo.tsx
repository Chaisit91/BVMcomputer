import { FiCreditCard } from 'react-icons/fi';
import { SiAmericanexpress, SiJcb, SiVisa } from 'react-icons/si';
import { cn } from '../../lib/cn';
import type { CardBrand } from '../../types/api';

const brandLabel: Record<CardBrand, string> = {
  visa: 'Visa',
  mastercard: 'Mastercard',
  jcb: 'JCB',
  amex: 'American Express',
  unknown: 'บัตร',
};

/** Card-network mark in a small white tile, e.g. the Visa wordmark or Mastercard's two circles. */
export function CardBrandLogo({ brand, className }: { brand: CardBrand; className?: string }) {
  return (
    <span
      role="img"
      aria-label={brandLabel[brand]}
      className={cn('flex h-12 w-[76px] shrink-0 items-center justify-center rounded-lg border border-slate-100 bg-white', className)}
    >
      {brand === 'visa' && <SiVisa size={44} className="text-[#1A1F71]" aria-hidden="true" />}
      {brand === 'mastercard' && (
        <svg viewBox="0 0 48 30" className="h-7 w-11" aria-hidden="true">
          <circle cx="17" cy="15" r="13" fill="#EB001B" />
          <circle cx="31" cy="15" r="13" fill="#F79E1B" />
          <path d="M24 4.2a13 13 0 0 1 0 21.6 13 13 0 0 1 0-21.6z" fill="#FF5F00" />
        </svg>
      )}
      {brand === 'jcb' && <SiJcb size={34} className="text-[#0B4EA2]" aria-hidden="true" />}
      {brand === 'amex' && <SiAmericanexpress size={34} className="text-[#2E77BC]" aria-hidden="true" />}
      {brand === 'unknown' && <FiCreditCard size={24} className="text-[#7D879C]" aria-hidden="true" />}
    </span>
  );
}

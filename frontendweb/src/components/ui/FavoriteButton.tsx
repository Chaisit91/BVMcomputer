import { useState } from 'react';
import { BsHeartFill } from 'react-icons/bs';
import { FiHeart } from 'react-icons/fi';

interface FavoriteButtonProps {
  label: string;
}

/**
 * Wishlist toggle overlaid on a product card's image. Purely a local UI
 * toggle for now — there's no wishlist slice/backend yet to persist it to.
 */
export function FavoriteButton({ label }: FavoriteButtonProps) {
  const [active, setActive] = useState(false);

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={label}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setActive((prev) => !prev);
      }}
      className="absolute right-2.5 top-2.5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-[0_1px_3px_rgba(15,23,42,0.08)] transition-all duration-200 hover:bg-slate-50"
    >
      {active ? (
        <BsHeartFill size={19} className="text-brand" aria-hidden="true" />
      ) : (
        <FiHeart size={20} strokeWidth={1.6} className="text-[#172033]" aria-hidden="true" />
      )}
    </button>
  );
}

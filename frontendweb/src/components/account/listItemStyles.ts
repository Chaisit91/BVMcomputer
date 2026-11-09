/**
 * Shared look for the saved-item rows on the shipping-address and payment-method pages, so both lists
 * have the same box, padding, radio and border. ≈80px tall on desktop (min-height keeps one-line rows
 * as tall as two-line ones).
 */
export const listItemBoxClass =
  'rounded-2xl border bg-white px-4 py-4 shadow-card transition-colors sm:px-5 md:min-h-[80px] md:py-3.5';

/** Light red border for the default item, light grey otherwise. */
export const listItemBorderClass = (isDefault: boolean) => (isDefault ? 'border-brand/30' : 'border-slate-200');

/** Red when selected (accent), the browser's grey ring when not. */
export const listItemRadioClass = 'h-5 w-5 shrink-0 cursor-pointer accent-brand disabled:cursor-not-allowed';

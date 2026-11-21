import type { IconBaseProps } from 'react-icons';

/**
 * Outline delivery van with speed lines ("fast delivery") — none of the bundled icon sets has this
 * shape, so it's drawn here. Same contract as a react-icons outline icon: 24×24 grid, colour from
 * `currentColor` (so text-* classes recolour it), `size` / `strokeWidth` props.
 */
export function FastDeliveryVanIcon({ size = '1em', strokeWidth = 1.6, title, ...props }: IconBaseProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {title && <title>{title}</title>}
      {/* speed lines */}
      <path d="M1.8 10h2.4" />
      <path d="M1 12.6h3.2" />
      <path d="M2.4 15.2h1.8" />
      {/* van body — long and low: flat roof, sloped windscreen, gaps where the wheels sit */}
      <path d="M7.7 17.6H7a1 1 0 0 1-1-1V8.6a1 1 0 0 1 1-1h8.9a1.6 1.6 0 0 1 1.2.55l3.9 4.4a1.6 1.6 0 0 1 .4 1.05v3a1 1 0 0 1-1 1h-.8" />
      <path d="M11.3 17.6h5" />
      {/* side window */}
      <path d="M15.7 7.9v4.3h5.2" />
      {/* wheels */}
      <circle cx="9.5" cy="17.6" r="1.8" />
      <circle cx="18.1" cy="17.6" r="1.8" />
    </svg>
  );
}

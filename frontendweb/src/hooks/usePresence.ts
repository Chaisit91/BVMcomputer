import { useEffect, useState } from 'react';

/**
 * Keep an element mounted long enough to animate out. `mounted` controls rendering;
 * `visible` flips one frame after mount (so the enter transition runs) and back to false
 * `durationMs` before unmount (so the exit transition runs).
 */
export function usePresence(open: boolean, durationMs = 200) {
  const [mounted, setMounted] = useState(open);
  const [visible, setVisible] = useState(open);

  // Adjusting state while rendering (React's recommended alternative to setState-in-effect).
  if (open && !mounted) setMounted(true);
  if (!open && visible) setVisible(false);

  useEffect(() => {
    if (open) {
      // Wait a frame so the browser paints the hidden state first — otherwise there's nothing to transition from.
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }
    const timer = setTimeout(() => setMounted(false), durationMs);
    return () => clearTimeout(timer);
  }, [open, durationMs]);

  return { mounted, visible };
}

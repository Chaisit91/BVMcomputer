import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 639px)';

/**
 * On phones, the visible area shrinks when the on-screen keyboard opens but `position: fixed;
 * inset: 0` doesn't. Returns the visual viewport's box (mobile only) so a full-screen panel can
 * size itself to it and keep its input above the keyboard. Returns null on larger screens.
 */
export function useMobileViewport(enabled: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    const media = window.matchMedia(MOBILE_QUERY);
    const viewport = window.visualViewport;

    const update = () => {
      if (!media.matches) {
        setBox(null);
        return;
      }
      setBox(viewport ? { top: viewport.offsetTop, height: viewport.height } : { top: 0, height: window.innerHeight });
    };

    update();
    media.addEventListener('change', update);
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    return () => {
      media.removeEventListener('change', update);
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return enabled ? box : null;
}

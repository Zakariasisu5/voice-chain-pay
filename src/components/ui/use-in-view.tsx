import { useEffect, useRef, useState } from 'react';

/**
 * Simple hook that toggles `revealed` when element enters viewport.
 * Returns { ref, revealed } to wire into components.
 */
export default function useInView<T extends HTMLElement>(options?: IntersectionObserverInit) {
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setRevealed(true);
          // once revealed we can unobserve to avoid repeating
          obs.unobserve(el);
        }
      });
    }, { threshold: 0.12, ...options });

    obs.observe(el);
    return () => obs.disconnect();
  }, [ref.current]);

  return { ref, revealed } as const;
}

/**
 * Observe all elements with the 'reveal' class and add 'revealed' when they enter viewport.
 * Call from top-level components to enable declarative reveal animations.
 */
export function useRevealOnScroll(options?: IntersectionObserverInit) {
  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>('.reveal'));
    if (!nodes.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, ...options });

    nodes.forEach((n) => obs.observe(n));
    return () => obs.disconnect();
  }, []);
}

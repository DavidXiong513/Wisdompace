'use client';

import { useEffect, useRef } from 'react';

/**
 * CursorGlow — subtle radial gradient that follows the cursor.
 * Inspired by fojin-master's CursorGlow component.
 * Only rendered on the homepage (controlled by parent SiteLayout).
 * Respects prefers-reduced-motion: skips animation entirely if set.
 */
export function CursorGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Respect user's motion preference
    const prefersReduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    if (prefersReduced) return;

    const el = glowRef.current;
    if (!el) return;

    const handleMouseMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX}px`;
      el.style.top  = `${e.clientY}px`;
      el.style.opacity = '1';
    };

    const handleMouseLeave = () => {
      el.style.opacity = '0';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      aria-hidden="true"
      style={{
        position:     'fixed',
        pointerEvents:'none',
        zIndex:       9998,
        width:        '400px',
        height:       '400px',
        borderRadius: '50%',
        transform:    'translate(-50%, -50%)',
        background:   'radial-gradient(circle, rgba(176,141,87,0.08) 0%, transparent 70%)',
        opacity:      0,
        transition:   'opacity 0.3s ease',
      }}
    />
  );
}

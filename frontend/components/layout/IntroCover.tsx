'use client';

import React, { useEffect, useRef, useState } from 'react';
import enTranslations from '@/src/locales/en.json';
import kaTranslations from '@/src/locales/ka.json';
import styles from './IntroCover.module.scss';

import { INTRO_SESSION_KEY } from './introCoverScript';

interface IntroCoverProps {
  /** Total time on screen in ms, including the 600ms slide-up exit. */
  durationMs: number;
  /** Optional SVG logo (from /public/images/brand). Falls back to the text logo. */
  logoSrc?: string | null;
}

/**
 * Full-screen brand cover shown once per browser session on first landing.
 *
 * Visibility is decided before first paint by the inline script from
 * `introCoverScript.ts` (sets `html[data-intro="on"]`), so returning visitors
 * never see a flash. All animation is pure CSS so it starts at first paint,
 * independent of hydration; React only handles skipping and cleanup.
 */
export const IntroCover: React.FC<IntroCoverProps> = ({ durationMs, logoSrc }) => {
  const [mounted, setMounted] = useState(true);
  const [skipping, setSkipping] = useState(false);
  const coverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    // Not showing this visit: CSS already keeps the cover display:none, nothing to do
    if (root.dataset.intro !== 'on') return;

    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, '1');
    } catch {
      /* ignore */
    }

    const skip = () => setSkipping(true);
    window.addEventListener('keydown', skip);

    // Safety net in case animationend never fires (e.g. background tab)
    const fallback = window.setTimeout(() => setMounted(false), durationMs + 1500);

    return () => {
      window.removeEventListener('keydown', skip);
      window.clearTimeout(fallback);
    };
  }, [durationMs]);

  // Release scroll lock and move focus to the page once the cover is gone
  useEffect(() => {
    if (mounted) return;
    const root = document.documentElement;
    if (root.dataset.intro !== 'on') return;
    root.removeAttribute('data-intro');
    root.removeAttribute('data-intro-lang');

    const active = document.activeElement;
    if (!active || active === document.body) {
      const main = document.getElementById('main-content') ?? document.querySelector('main');
      main?.focus({ preventScroll: true });
    }
  }, [mounted]);

  if (!mounted) return null;

  const handleAnimationEnd = (e: React.AnimationEvent<HTMLDivElement>) => {
    // Only the cover's own exit/skip animation ends the intro (child animations bubble up)
    if (e.target === coverRef.current) setMounted(false);
  };

  const exitDelay = Math.max(durationMs, 1200) - 600;

  return (
    <div
      ref={coverRef}
      className={`${styles.cover} ${skipping ? styles.skipping : ''}`}
      style={{ '--intro-exit-delay': `${exitDelay}ms` } as React.CSSProperties}
      onClick={() => setSkipping(true)}
      onAnimationEnd={handleAnimationEnd}
      aria-hidden="true"
    >
      <div className={styles.content}>
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={`${styles.logo} ${styles.logoImage}`} src={logoSrc} alt="" draggable={false} />
        ) : (
          <div className={styles.logo}>
            BUN <span className={styles.amp}>&amp;</span> PATTY
          </div>
        )}

        <p className={styles.tagline}>
          <span className={styles.taglineKa}>{kaTranslations.common.introTagline}</span>
          <span className={styles.taglineEn}>{enTranslations.common.introTagline}</span>
        </p>
      </div>
    </div>
  );
};

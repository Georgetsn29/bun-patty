'use client';

import React, { useRef } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './LanguageSwitcher.module.scss';

interface LanguageSwitcherProps {
  variant?: 'desktop' | 'mobile';
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  variant = 'desktop',
  className = '',
}) => {
  const { language, setLanguage, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();

  const kaBtnRef = useRef<HTMLButtonElement>(null);
  const enBtnRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setLanguage('en');
      enBtnRef.current?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setLanguage('ka');
      kaBtnRef.current?.focus();
    }
  };

  const isKa = language === 'ka';
  const groupLabel = language === 'ka' ? 'ენა' : 'Language';

  return (
    <div
      role="radiogroup"
      aria-label={t('common.langSwitcherLabel') || groupLabel}
      onKeyDown={handleKeyDown}
      className={`${styles.container} ${variant === 'mobile' ? styles.mobileVariant : styles.desktopVariant} ${className}`}
    >
      {/* Sliding Active Pill */}
      <motion.span
        className={styles.activePill}
        aria-hidden="true"
        initial={false}
        animate={{
          x: isKa ? '0%' : '100%',
        }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.2,
          ease: [0.16, 1, 0.3, 1],
        }}
      />

      {/* Georgian Option */}
      <button
        ref={kaBtnRef}
        type="button"
        role="radio"
        aria-checked={isKa}
        aria-label="ქართული"
        tabIndex={isKa ? 0 : -1}
        onClick={() => setLanguage('ka')}
        className={`${styles.optionBtn} ${isKa ? styles.activeText : styles.inactiveText}`}
      >
        ქარ
      </button>

      {/* English Option */}
      <button
        ref={enBtnRef}
        type="button"
        role="radio"
        aria-checked={!isKa}
        aria-label="English"
        tabIndex={!isKa ? 0 : -1}
        onClick={() => setLanguage('en')}
        className={`${styles.optionBtn} ${!isKa ? styles.activeText : styles.inactiveText}`}
      >
        EN
      </button>
    </div>
  );
};

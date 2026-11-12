'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import styles from './NotFoundView.module.scss';

interface NotFoundViewProps {
  onNavigate: (route: string) => void;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className={styles.notFound}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <span className={styles.kicker}>
          Error 404
        </span>
        <h1 className={styles.title}>
          {t('notFound.title')}
        </h1>
        <p className={styles.subtext}>
          {t('notFound.desc')}
        </p>
      </div>

      <div className={styles.actionRow}>
        <button
          onClick={() => onNavigate('home')}
          className={styles.primaryBtn}
        >
          {t('notFound.returnHome')}
        </button>
        <button
          onClick={() => onNavigate('shop')}
          className={styles.secondaryBtn}
        >
          {t('nav.menu')}
        </button>
      </div>
    </div>
  );
};


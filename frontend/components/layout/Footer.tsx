'use client';

import React from 'react';
import { BUSINESS_CONTENT } from '@/data/businessContent';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowIcon } from './Header';
import styles from './Footer.module.scss';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { language, t, getCategoryName } = useLanguage();
  const ka = language === 'ka';

  const go = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(route);
  };
  const shortName = (name: string) => name.split(' ')[0];

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        <div className={styles.cta}>
          <h2 className={styles.ctaTitle}>
            {ka ? 'მოგშივდა?' : 'Hungry?'}
            <br />
            {ka ? 'შეუკვეთე წინასწარ' : 'Order ahead'}
            <span className={styles.dot}>.</span>
          </h2>
          <div className={styles.ctaButtons}>
            <a href="#/shop" onClick={go('shop')} className={styles.btnRed}>
              {ka ? 'შეკვეთა გასატანად' : 'Order for pickup'} <ArrowIcon size={20} />
            </a>
            <a href="#/track" onClick={go('track')} className={styles.btnOutline}>
              {t('nav.track')} <ArrowIcon size={20} />
            </a>
          </div>
        </div>

        <div className={styles.columns}>
          <div className={styles.col}>
            <span className={styles.colLabel}>{ka ? 'გვესტუმრე' : 'Visit'}</span>
            {BUSINESS_CONTENT.locations.map((loc) => (
              <a key={loc.id} href={`#/locations/${loc.id}`} onClick={go(`locations/${loc.id}`)}>
                {shortName(loc.name)}
              </a>
            ))}
            <a href="#/locations" onClick={go('locations')}>
              {ka ? 'სამუშაო საათები' : 'Opening hours'}
            </a>
          </div>
          <div className={styles.col}>
            <span className={styles.colLabel}>{t('nav.menu')}</span>
            {['Burgers', 'Side Dishes', 'Desserts', 'Drinks'].map((c) => (
              <a key={c} href="#/shop" onClick={go('shop')}>
                {getCategoryName(c)}
              </a>
            ))}
          </div>
          <div className={styles.col}>
            <span className={styles.colLabel}>{t('nav.contact')}</span>
            <a href={`mailto:${BUSINESS_CONTENT.contact.generalEmail}`}>{BUSINESS_CONTENT.contact.generalEmail}</a>
            <a href={`mailto:${BUSINESS_CONTENT.contact.cateringEmail}`}>{BUSINESS_CONTENT.contact.cateringEmail}</a>
            <a href={`tel:${BUSINESS_CONTENT.locations[0].phone.replace(/\s/g, '')}`}>
              {BUSINESS_CONTENT.locations[0].phone}
            </a>
          </div>
          <div className={styles.col}>
            <span className={styles.colLabel}>{ka ? 'გამოგვყევი' : 'Follow'}</span>
            {BUSINESS_CONTENT.socials.map((soc) =>
              soc.url.startsWith('#/') ? (
                <a key={soc.label} href={soc.url} onClick={go(soc.url.replace('#/', ''))}>
                  {soc.label}
                </a>
              ) : (
                <a key={soc.label} href={soc.url} target="_blank" rel="noopener noreferrer">
                  {soc.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>

      <div className={styles.wordmark} aria-hidden="true">
        BUN <span className={styles.amp}>&amp;</span> PATTY
      </div>

      <div className={styles.bottom}>
        <span>{t('footer.copyright')}</span>
        <span>{ka ? 'ფასები ლარში' : 'Prices in Georgian lari'}</span>
      </div>
    </footer>
  );
};

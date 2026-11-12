'use client';

import React from 'react';
import { BUSINESS_CONTENT } from '@/data/businessContent';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder } from '@/lib/utils';
import { MapPin, Phone, Clock } from 'lucide-react';
import styles from './Footer.module.scss';

interface FooterProps {
  onNavigate: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        {/* Locations Grid (Stacked in single column on mobile, 3-column on desktop) */}
        <div className={styles.locationsGrid}>
          {BUSINESS_CONTENT.locations.map((loc) => {
            const cleanedAddress = cleanPlaceholder(loc.address);
            const cleanedCity = cleanPlaceholder(loc.cityStateZip);
            const fullAddress = `${cleanedAddress}, ${cleanedCity}`;
            const mapQuery = encodeURIComponent(`${loc.name}, ${fullAddress}`);

            return (
              <div key={loc.id} className={styles.locationCol}>
                <div className={styles.locationName}>{loc.name}</div>

                {/* Tappable Address Link */}
                <div className={styles.locationRow}>
                  <MapPin className={styles.locationIcon} aria-hidden="true" />
                  <a
                    href={`https://maps.google.com/?q=${mapQuery}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.locationLink}
                    title="View on Google Maps"
                  >
                    {fullAddress}
                  </a>
                </div>

                {/* Tappable Phone Link */}
                <div className={styles.locationRow}>
                  <Phone className={styles.locationIcon} aria-hidden="true" />
                  <a href={`tel:${loc.phone}`} className={styles.locationLink}>
                    {loc.phone}
                  </a>
                </div>

                <div className={styles.locationRow}>
                  <Clock className={styles.locationIcon} aria-hidden="true" />
                  <span>{loc.hoursDisplay}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Centered Brand Mark & Social Navigation */}
        <div className={styles.footerCenter}>
          <div className={styles.footerLogo}>
            {BUSINESS_CONTENT.brandName.toUpperCase()}
          </div>

          <div className={styles.socialRow}>
            <button
              type="button"
              onClick={() => onNavigate('track')}
              className={styles.socialLink}
            >
              {t('nav.track')}
            </button>
            <span className={styles.socialDot}>·</span>
            {BUSINESS_CONTENT.socials.map((soc, idx) => (
              <React.Fragment key={soc.label}>
                {idx > 0 && <span className={styles.socialDot}>·</span>}
                <button
                  type="button"
                  onClick={() => {
                    if (soc.url.startsWith('#/')) {
                      onNavigate(soc.url.replace('#/', ''));
                    }
                  }}
                  className={styles.socialLink}
                >
                  {soc.label}
                </button>
              </React.Fragment>
            ))}
          </div>

          <div className={styles.copyrightLine}>
            {t('footer.copyright')}
          </div>
        </div>
      </div>
    </footer>
  );
};

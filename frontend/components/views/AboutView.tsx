'use client';

import React from 'react';
import { FoodImage } from '@/components/ui/FoodImage';
import { useLanguage } from '@/context/LanguageContext';
import styles from './AboutView.module.scss';

interface AboutViewProps {
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className={styles.about}>
      {/* 1. Founding Essay Header */}
      <section className={styles.essayHeader}>
        <span className={styles.kicker}>
          {t('about.kicker')}
        </span>
        <h1 className={styles.title}>
          {t('about.title')}
        </h1>
        <p className={styles.subtitle}>
          {t('about.subheading')}
        </p>
      </section>

      {/* 2. Full-Width Editorial Photo Slot */}
      <section>
        <FoodImage
          src="/images/about-kitchen-plancha.jpg"
          alt="Chef working behind carbon steel plancha at BUN & PATTY"
          slotLabel="Wide kitchen shot: cook in white apron pressing patty with heavy steel weight, steam and caramelized juices rising under overhead heat lamps"
        />
        <div className={styles.photoCaptionRow}>
          <span>{language === 'ka' ? 'სამზარეულო ბარნოვის 24-ში' : 'Service line at 24 Barnovi St, Vera'}</span>
          <span>260°C {language === 'ka' ? 'ფოლადის პლანშა' : 'polished carbon steel'}</span>
        </div>
      </section>

      {/* 3. The 3 Founding Arguments (Asymmetric Grid) */}
      <section className={styles.argumentsGrid}>
        <div className={styles.sidebar}>
          <span className={styles.sidebarTag}>[ {t('about.pillarsTitle')} ]</span>
          <span>{language === 'ka' ? 'რატომ მუშაობს ჩვენი რეცეპტი' : 'Why our recipe works'}</span>
        </div>

        <div className={styles.argumentsContent}>
          {/* Argument 1 */}
          <div className={styles.argumentBlock}>
            <h2 className={styles.argumentTitle}>
              01. {t('about.pillar2Title')}
            </h2>
            <p className={styles.argumentBody}>
              {t('about.pillar2Desc')}
            </p>
          </div>

          {/* Argument 2 */}
          <div className={styles.argumentBlock}>
            <h2 className={styles.argumentTitle}>
              02. {t('about.pillar3Title')}
            </h2>
            <p className={styles.argumentBody}>
              {t('about.pillar3Desc')}
            </p>
          </div>

          {/* Argument 3 */}
          <div className={styles.argumentBlock}>
            <h2 className={styles.argumentTitle}>
              03. {t('about.pillar1Title')}
            </h2>
            <p className={styles.argumentBody}>
              {t('about.pillar1Desc')}
            </p>
          </div>
        </div>
      </section>

      {/* 4. Large Pull Quote & Secondary Photography Slot */}
      <section className={styles.quoteBanner}>
        <blockquote className={styles.quoteText}>
          {language === 'ka'
            ? '„ჩვენ არ ვამზადებთ ოცდაათ სხვადასხვა სენდვიჩს. ჩვენ ვამზადებთ ერთ სტილს — სმეშ ჩიზბურგერს ფანატიკური დისციპლინით, ყოველდღე.“'
            : '“We don’t make thirty different sandwiches. We make one style of smashed cheeseburger with fanatic discipline, and we make it every single day.”'}
        </blockquote>

        <div className={styles.teamGrid}>
          <FoodImage
            src="/images/about-butcher-block.jpg"
            alt="Hand trimming beef primals on butcher block"
            slotLabel="Butcher cutting fresh chuck primal on end-grain maple wood block with carbon knife"
          />
          <div className={styles.teamContent}>
            <h3 className={styles.teamTitle}>
              {language === 'ka' ? 'გუნდი ხაზზე' : 'The People on the Line'}
            </h3>
            <p>
              {language === 'ka'
                ? 'BUN & PATTY დაფუძნდა თბილისში უმარტივესი მიზნით: შეგვექმნა ნამდვილი, უკომპრომისო სმეშ ბურგერი საუკეთესო ადგილობრივი ინგრედიენტებით. ჩვენი მზარეულები ღია სამზარეულოში მუშაობენ და ყოველ კვირას თავად არიან პლანშასთან.'
                : 'BUN & PATTY was founded with a singular conviction: creating honest, uncompromised smash burgers using the finest local ingredients, seasoned carbon steel, and rigorous technique. Our team runs an open kitchen where craft is respected and precision is non-negotiable.'}
            </p>
            <div style={{ paddingTop: '8px', fontFamily: 'var(--font-mono, monospace)', fontSize: '0.75rem', color: '#6B625B' }}>
              <p>{language === 'ka' ? 'მზარეულები ხაზზე ყოველდღე 11:30-დან.' : 'Culinary team on line daily from 11:30.'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Closing Action */}
      <section className={styles.closingSection}>
        <h3 className={styles.closingTitle}>
          {language === 'ka' ? 'შეაფასეთ პლანშის ხარისხი თავად.' : 'Taste the plancha work yourself.'}
        </h3>
        <p className={styles.closingText}>
          {language === 'ka'
            ? 'კარები ღიაა ყოველდღე 11:30 საათიდან. დაჯავშნა არ არის საჭირო.'
            : 'Doors open daily from 11:30. No reservations required.'}
        </p>
        <div style={{ paddingTop: '8px' }}>
          <button
            onClick={() => onNavigate('shop')}
            className={styles.orderCta}
          >
            {t('common.orderOnline')}
          </button>
        </div>
      </section>
    </div>
  );
};


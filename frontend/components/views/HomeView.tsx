'use client';

import React from 'react';
import { motion } from 'motion/react';
import { MENU_ITEMS, MenuItem } from '@/data/menu';
import { PRESS_QUOTES, KITCHEN_STANDARDS } from '@/data/testimonials';
import { BUSINESS_CONTENT } from '@/data/businessContent';
import { FoodImage } from '@/components/ui/FoodImage';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder } from '@/lib/utils';
import { formatPrice } from '@/data/settings';
import { ActiveOrderCard } from '@/components/home/ActiveOrderCard';
import styles from './HomeView.module.scss';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenProductModal: (item: MenuItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenProductModal }) => {
  const { addItem } = useCart();
  const { t, getItemTranslation, getCategoryName, language } = useLanguage();

  const signatureItem = MENU_ITEMS.find((i) => i.id === 'bun-patty-smash') || MENU_ITEMS[0];
  const secondaryItems = MENU_ITEMS.filter(
    (i) => i.id === 'golden-double-classic' || i.id === 'parmesan-truffle-fries' || i.id === 'roasted-vanilla-bean-shake'
  );

  const signatureTrans = getItemTranslation(signatureItem.id);
  const flagshipAddress = cleanPlaceholder(BUSINESS_CONTENT.locations[0].address);

  return (
    <div className={styles.home}>
      {/* 1. Hero: Oversized Headline & Full-Bleed Real Photography */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          {/* Oversized Headline */}
          <div className={styles.heroLeft}>
            <span className={styles.kicker}>
              {BUSINESS_CONTENT.brandName} · {flagshipAddress}, {BUSINESS_CONTENT.locations[0].neighborhood}
            </span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={styles.headline}
            >
              {t('home.headlineMain')} <br />
              <span className={styles.headlineItalic}>{t('home.headlineItalic')}</span> <br />
              {t('home.headlineSub')}
            </motion.h1>

            {/* Active order card with live countdown timer */}
            <ActiveOrderCard onNavigate={onNavigate} />
          </div>

          {/* Subtext & Quick Action */}
          <div className={styles.heroRight}>
            <p className={styles.heroSubtext}>
              {t('home.heroSubtext')}
            </p>

            <div className={styles.heroActions}>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className={styles.primaryCta}
              >
                {t('home.heroCta')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className={styles.secondaryCta}
              >
                {t('home.exploreAllButton', { count: MENU_ITEMS.length })}
              </button>
            </div>
          </div>
        </div>

        {/* Real Food Photography Hero Asset */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className={styles.heroImageSlot}
        >
          <FoodImage
            src="/images/hero-burger-table.jpg"
            alt="Double smash cheeseburger with crispy caramelized edges on rustic wooden table"
          />
        </motion.div>
      </section>

      {/* 2. Opinionated Company Story */}
      <section className={styles.manifestoSection}>
        <div className={styles.manifestoGrid}>
          <div className={styles.manifestoSidebar}>
            <span className={styles.manifestoTag}>[ 01 / {language === 'ka' ? 'სამზარეულოს ფილოსოფია' : 'Kitchen Philosophy'} ]</span>
            <span>{language === 'ka' ? 'პლანშის წესდება' : 'The Plancha Rulebook'}</span>
          </div>

          <div className={styles.manifestoBody}>
            <blockquote className={styles.pullQuote}>
              {language === 'ka'
                ? '„ბურგერი არ არის რვა სახეობის ტრიუფელის მაიონეზის ტილო. ის არის ზუსტი არგუმენტი საქონლის ხორცზე, ცხიმზე, მარილსა და მცხუნვარე სიმხურვალეზე.“'
                : '“A burger is not a canvas for eight kinds of melted truffle aioli. It is a precise argument about beef, fat, salt, and searing heat.”'}
            </blockquote>

            <div className={styles.essayColumns}>
              <div className={styles.essayCol}>
                <p>
                  {language === 'ka'
                    ? 'სწრაფი კვების უმეტესობა იყენებს გაყინულ კატლეტებს და ტკბილი სოუსებით ფარავს ხორცის ბუნებრივი გემოს ნაკლებობას. ჩვენ სრულიად განსხვავებულად ვუდგებით საქმეს.'
                    : 'Most burger bars take pre-formed frozen patties, cook them on grooved grills, and bury them in sugary sauce to compensate for a lack of beef character. We do the opposite.'}
                </p>
                <p>
                  {language === 'ka'
                    ? 'ვიწყებთ კახეთისა და ქვემო ქართლის საოჯახო ფერმების ნედლი ხორცით. ანგუსის ნაჭრები იფქვება დღეში ორჯერ და ცივად ინახება 260°C პლანშაზე დადებამდე.'
                    : 'We start with whole muscle cuts from family farms in Kakheti and Kvemo Kartli. Ground twice a day and kept ice-cold until it hits the carbon steel griddle.'}
                </p>
              </div>
              <div className={styles.essayCol}>
                <p>
                  {language === 'ka'
                    ? 'შეწვა გრძელდება 90 წამზე ნაკლებს. მძიმე ფოლადის წნეხი წამებში წარმოქმნის ხრაშუნა მაიარის ქერქსა და მაქმანისებრ ნაპირებს.'
                    : 'The sear takes less than ninety seconds. Heavy carbon steel at 260°C forces the meat into direct contact before internal fat liquefies, creating those paper-thin, crispy lacy skirts.'}
                </p>
                <p>
                  {language === 'ka'
                    ? 'ფუნთუშა ცხვება 18-საათიანი ცივი ფერმენტაციითა და ევროპული კარაქით, რათა ხორცის წვენი იდეალურად შეინარჩუნოს. მარტივი ინგრედიენტები ყოველგვარი კომპრომისის გარეშე.'
                    : 'The bun is our own potato-milk brioche, griddled lightly in clarified butter so it cradles the juices without dissolving into sponge. Simple ingredients, executed without shortcuts.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Showcase Grid */}
      <section className={styles.menuSection}>
        <div className={styles.menuSectionHeader}>
          <div>
            <span className={styles.kicker}>{t('home.standardsKicker')}</span>
            <h2 className={styles.sectionTitle}>{t('home.standardsTitle')}</h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('shop')}
            className={styles.menuLink}
          >
            {t('home.exploreAllButton', { count: MENU_ITEMS.length })}
          </button>
        </div>

        <div className={styles.showcaseGrid}>
          {/* Spotlight Item */}
          <div
            onClick={() => onOpenProductModal(signatureItem)}
            className={styles.spotlightCard}
          >
            <FoodImage
              src={signatureItem.imageSlot}
              alt={signatureTrans.name || signatureItem.name}
            />
            <div>
              <div className={styles.spotlightHeader}>
                <h3 className={styles.spotlightTitle}>{signatureTrans.name || signatureItem.name}</h3>
                <span className={styles.spotlightPrice}>
                  {formatPrice(signatureItem.price)}
                </span>
              </div>
              <p className={styles.spotlightDescription}>
                {signatureTrans.longDescription || signatureItem.longDescription}
              </p>
            </div>
            <div className={styles.spotlightFooter}>
              <span>{signatureTrans.description || signatureItem.description}</span>
              <span style={{ color: '#E27344', fontWeight: 700 }}>{t('common.customizeIngredients')}</span>
            </div>
          </div>

          {/* Secondary Stack */}
          <div className={styles.sideStack}>
            {secondaryItems.map((item) => {
              const trans = getItemTranslation(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => onOpenProductModal(item)}
                  className={styles.sideRow}
                >
                  <div className={styles.sideHeader}>
                    <h4 className={styles.sideTitle}>{trans.name || item.name}</h4>
                    <span className={styles.sidePrice}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  <p className={styles.sideDescription}>{trans.description || item.description}</p>
                  <div className={styles.sideFooter}>
                    <span>{getCategoryName(item.category)}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        addItem(item, 1);
                      }}
                      className={styles.quickAddBtn}
                    >
                      {t('common.addToCart')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Kitchen Standards Strip */}
      <section className={styles.standardsSection}>
        <div className={styles.standardsWrap}>
          <span className={styles.kicker} style={{ marginBottom: '1.5rem' }}>
            {t('home.standardsKicker')}
          </span>
          <div className={styles.standardsGrid}>
            {KITCHEN_STANDARDS.map((std, idx) => (
              <div key={idx} className={styles.standardCard}>
                <span className={styles.standardIndex}>0{idx + 1}.</span>
                <h4 className={styles.standardTitle}>{std.label}</h4>
                <p className={styles.standardDetail}>{std.detail}</p>
                <p className={styles.standardNote}>{std.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Editorial Press Section */}
      <section className={styles.pressSection}>
        <div className={styles.pressGrid}>
          {PRESS_QUOTES.map((press) => (
            <div key={press.id} className={styles.pressCard}>
              <blockquote className={styles.pressQuote}>
                &ldquo;{press.quote}&rdquo;
              </blockquote>
              <div className={styles.pressMeta}>
                <strong style={{ color: '#FFFFFF' }}>{press.publication}</strong>
                <span>{press.date}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Practical Strip: Hours & Neighborhood Details */}
      <section className={styles.practicalStrip}>
        <div className={styles.practicalInner}>
          <div className={styles.practicalGrid}>
            <div className={styles.practicalAddressCol}>
              <span className={styles.kicker}>{t('home.practicalStripKicker')}</span>
              <h3 className={styles.practicalTitle}>
                {BUSINESS_CONTENT.locations[0].name}
              </h3>
              <p style={{ fontSize: '0.825rem', color: '#8A9698', paddingTop: '4px' }}>
                {flagshipAddress} · {cleanPlaceholder(BUSINESS_CONTENT.locations[0].cityStateZip)}
              </p>
            </div>

            <div className={styles.practicalHoursCol}>
              <span className={styles.kicker}>{t('home.serviceHoursKicker')}</span>
              <div className={styles.hoursBlock}>
                <p>{BUSINESS_CONTENT.locations[0].hoursDisplay}</p>
                <p>{BUSINESS_CONTENT.locations[0].phone}</p>
              </div>
            </div>

            <div className={styles.practicalActionsCol}>
              <button
                type="button"
                onClick={() => onNavigate('shop')}
                className={styles.practicalPrimaryBtn}
              >
                {t('home.placeOrderOnlineBtn')}
              </button>
              <button
                type="button"
                onClick={() => onNavigate('locations')}
                className={styles.practicalSecondaryBtn}
              >
                {t('home.allLocationsBtn')}
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveOrders, useLiveTimestamp, calculateOrderProgress } from '@/services/orders';
import { LOCATIONS, isLocationOpen } from '@/data/locations';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import styles from './Header.module.scss';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

/* Line icons drawn to match the redesign (1.75 stroke, square caps) */
const BagIcon = ({ size = 22 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16l-1.2 13H5.2L4 7Z" stroke="currentColor" strokeWidth="1.75" />
    <path d="M8.5 7V5.5a3.5 3.5 0 0 1 7 0V7" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);
export const ArrowIcon = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
  </svg>
);
const BackIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.25" strokeLinecap="square" />
  </svg>
);
const MenuLinesIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" />
  </svg>
);
const TAB_ICONS: Record<string, React.ReactNode> = {
  home: <path d="M4 10.5 12 4l8 6.5V20h-5.5v-6h-5v6H4v-9.5Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />,
  shop: <path d="M4 9h16M5 9c0-3 3-5 7-5s7 2 7 5M4 13h16M5 17h14l-1 3H6l-1-3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />,
  track: (
    <>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 8h6M9 12h6" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
  locations: (
    <>
      <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" stroke="currentColor" strokeWidth="1.75" />
      <circle cx="12" cy="9.5" r="2.5" stroke="currentColor" strokeWidth="1.75" />
    </>
  ),
};

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <span className={className}>
    BUN <span className={styles.logoAmp}>&amp;</span> PATTY
  </span>
);

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const { totalItemCount, setIsCartOpen, isCartOpen, grandTotal, orderType } = useCart();
  const { language, t } = useLanguage();
  const ka = language === 'ka';
  const shouldReduceMotion = useReducedMotion();
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [openCount, setOpenCount] = useState<number | null>(null);

  const hasActiveOrders = activeOrders.length > 0;
  const hasInProgressOrder = activeOrders.some((order) => {
    const progress = calculateOrderProgress(order, now);
    return !progress.isReadyOrFinished && !order.cancelledAt;
  });

  // Publish the real header height so sticky page toolbars can sit right under it
  const headerRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = headerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const set = () => document.documentElement.style.setProperty('--header-h', `${el.offsetHeight}px`);
    set();
    const ro = new ResizeObserver(set);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const prevCountRef = useRef(totalItemCount);
  useEffect(() => {
    if (totalItemCount > prevCountRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      prevCountRef.current = totalItemCount;
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalItemCount;
  }, [totalItemCount]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Opening status is time-dependent, so compute it on the client only (no hydration mismatch)
  useEffect(() => {
    const update = () => setOpenCount(LOCATIONS.filter(isLocationOpen).length);
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  const navItems = useMemo(
    () => [
      { id: 'home', label: t('nav.home') },
      { id: 'shop', label: t('nav.menu') },
      { id: 'about', label: t('nav.about') },
      { id: 'locations', label: t('nav.locations') },
      { id: 'contact', label: t('nav.contact') },
    ],
    [t]
  );

  const isActive = (id: string) => currentRoute === id || currentRoute.startsWith(`${id}/`);

  // Mobile app bar: inner pages get a back button that returns to their parent
  const backTarget: string | null = currentRoute.startsWith('locations/')
    ? 'locations'
    : currentRoute === 'checkout'
      ? 'shop'
      : currentRoute === '404'
        ? 'home'
        : null;

  const primaryOrderNum = activeOrders[0]?.orderNumber;
  const trackRoute = primaryOrderNum ? `track/${primaryOrderNum}` : 'track';

  const cartLabel = `${t('common.cart')} (${totalItemCount})`;
  const openLabel =
    openCount === null
      ? ''
      : ka
        ? `ახლა ღიაა ${openCount} / ${LOCATIONS.length} ფილიალი`
        : `${openCount} of ${LOCATIONS.length} kitchens open now`;

  const tabs = [
    { id: 'home', route: 'home', label: t('nav.home') },
    { id: 'shop', route: 'shop', label: t('nav.menu') },
    { id: 'track', route: trackRoute, label: ka ? 'შეკვეთები' : 'Orders' },
    { id: 'locations', route: 'locations', label: ka ? 'ფილიალები' : 'Kitchens' },
  ];

  return (
    <>
      {/* 1. Ink announcement bar (desktop + tablet) */}
      <div className={styles.announcementBar}>
        <span className={styles.openStatus}>
          <span className={`${styles.statusDot} ${openCount === 0 ? styles.statusDotClosed : ''}`} aria-hidden="true" />
          {openLabel || ' '}
        </span>
        <span className={styles.announcementMuted}>
          {t('common.topAnnouncementPrefix')} {t('common.topAnnouncementHighlight')}
        </span>
        <LanguageSwitcher variant="onInk" />
      </div>

      {/* 2. Sticky header */}
      <header ref={headerRef} className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        {/* Mobile app bar (< 768px): menu/back · logo · cart */}
        <div className={styles.appBar}>
          {backTarget ? (
            <button
              type="button"
              onClick={() => onNavigate(backTarget)}
              className={styles.appBarIconBtn}
              aria-label={ka ? 'უკან' : 'Back'}
            >
              <BackIcon />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={styles.appBarIconBtn}
              aria-label={ka ? 'მენიუ' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-panel"
            >
              <MenuLinesIcon />
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={styles.appBarLogo}
            aria-label={`${t('common.brandName')} - ${t('nav.home')}`}
          >
            <Logo />
          </button>

          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className={styles.appBarIconBtn}
            aria-label={cartLabel}
          >
            <BagIcon />
            {totalItemCount > 0 && (
              <span className={`${styles.appBarBadge} ${isPulsing ? styles.badgePulsing : ''}`}>
                {totalItemCount}
              </span>
            )}
          </button>
        </div>

        {/* Desktop / tablet bar */}
        <div className={styles.inner}>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={styles.logoButton}
            aria-label={`${t('common.brandName')} - ${t('nav.home')}`}
          >
            <Logo className={styles.logoText} />
            <span className={styles.logoTagline}>
              {ka ? 'სმაშ-ბურგერ ბარი' : 'Smash burger bar'}
              <br />
              {ka ? 'თბილისი' : 'Tbilisi'}
            </span>
          </button>

          <nav className={styles.navCenter} aria-label={ka ? 'მთავარი ნავიგაცია' : 'Main'}>
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={styles.navLink}
                aria-current={isActive(item.id) ? 'page' : undefined}
              >
                {item.label}
                {isActive(item.id) && (
                  <motion.span
                    layoutId="nav-underline"
                    className={styles.navUnderline}
                    transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }}
                    aria-hidden="true"
                  />
                )}
              </button>
            ))}
          </nav>

          <div className={styles.actionsRight}>
            <button
              type="button"
              onClick={() => onNavigate(trackRoute)}
              className={`${styles.textAction} ${currentRoute.startsWith('track') ? styles.textActionActive : ''}`}
            >
              {t('nav.track')}
              {hasInProgressOrder && <span className={styles.liveDot} aria-hidden="true" />}
            </button>

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={styles.cartButton}
              aria-label={cartLabel}
            >
              <BagIcon />
              <span className={styles.cartLabel}>{t('common.cart')}</span>
              <span className={`${styles.cartBadge} ${isPulsing ? styles.badgePulsing : ''}`}>{totalItemCount}</span>
            </button>

            <button type="button" onClick={() => onNavigate('shop')} className={styles.orderButton}>
              {ka ? 'შეკვეთა' : 'Order now'}
              <ArrowIcon />
            </button>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className={styles.menuToggle}
              aria-label={ka ? 'მენიუ' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-panel"
            >
              <MenuLinesIcon />
            </button>
          </div>
        </div>
      </header>

      {/* 3. Mobile bottom tab bar (< 768px) */}
      <nav
        className={`${styles.bottomNav} ${currentRoute === 'checkout' ? styles.bottomNavHidden : ''}`}
        aria-label={ka ? 'აპის ნავიგაცია' : 'App'}
      >
        {tabs.map((tab) => {
          const active = isActive(tab.id);
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onNavigate(tab.route)}
              className={`${styles.tab} ${active ? styles.tabActive : ''}`}
              aria-current={active ? 'page' : undefined}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                {TAB_ICONS[tab.id]}
              </svg>
              <span className={styles.tabLabel}>{tab.label}</span>
              {tab.id === 'track' && hasActiveOrders && (
                <AnimatePresence>
                  <motion.span
                    className={styles.tabDot}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    aria-hidden="true"
                  />
                </AnimatePresence>
              )}
            </button>
          );
        })}
      </nav>

      {/* 3b. Floating "View order" bar above the tab bar (phones, canvas App-Home/App-Menu) */}
      {totalItemCount > 0 && !isCartOpen && currentRoute !== 'checkout' && !currentRoute.startsWith('track') && (
        <button type="button" data-cartbar onClick={() => setIsCartOpen(true)} className={styles.cartBar}>
          <span className={styles.cartBarInfo}>
            <span className={styles.cartBarMeta}>
              {ka ? `${totalItemCount} პოზიცია` : `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`} ·{' '}
              {orderType === 'pickup' ? (ka ? 'გატანა' : 'Pickup') : ka ? 'მიწოდება' : 'Delivery'}
            </span>
            <span className={styles.cartBarTotal}>{grandTotal.toFixed(2)} ₾</span>
          </span>
          <span className={styles.cartBarCta}>{ka ? 'შეკვეთის ნახვა →' : 'View order →'}</span>
        </button>
      )}

      {/* 4. Navigation drawer (phones + narrow desktops) */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentRoute={currentRoute}
        onNavigate={onNavigate}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

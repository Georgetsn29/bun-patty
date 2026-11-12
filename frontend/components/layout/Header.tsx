'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveOrders, useLiveTimestamp, calculateOrderProgress } from '@/services/orders';
import { ShoppingBag, Menu as MenuIcon, Clock } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import styles from './Header.module.scss';

interface HeaderProps {
  currentRoute: string;
  onNavigate: (route: string) => void;
}

export const Header: React.FC<HeaderProps> = ({ currentRoute, onNavigate }) => {
  const { totalItemCount, subtotal, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);

  // Responsive desktop navigation fit state
  const [showDesktopNav, setShowDesktopNav] = useState(false);

  // Active orders state
  const hasActiveOrders = activeOrders.length > 0;
  const hasInProgressOrder = activeOrders.some((order) => {
    const progress = calculateOrderProgress(order, now);
    return !progress.isReadyOrFinished && !order.cancelledAt;
  });

  const prevCountRef = useRef(totalItemCount);
  const logoRef = useRef<HTMLButtonElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);
  const navMeasureRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (totalItemCount > prevCountRef.current) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 400);
      return () => clearTimeout(timer);
    }
    prevCountRef.current = totalItemCount;
  }, [totalItemCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Desktop Navigation Links: Home, Menu, About, Locations, Contact
  const navItems = [
    { id: 'home', label: t('nav.home') },
    { id: 'shop', label: t('nav.menu') },
    { id: 'about', label: t('nav.about') },
    { id: 'locations', label: t('nav.locations') },
    { id: 'contact', label: t('nav.contact') },
  ];

  // Dynamic link measurement & breakpoint enforcement:
  // - Minimum threshold: below 980px in Georgian and below 920px in English -> switch to hamburger
  // - Measurement: calculate available space in center column:
  //     availableSpace = headerContentWidth - logoWidth - actionsWidth - (gap * 2)
  //   If required link width > availableSpace -> switch to hamburger
  const checkNavFit = useCallback(() => {
    if (typeof window === 'undefined') return;

    const width = window.innerWidth;
    const minThreshold = language === 'ka' ? 980 : 920;

    if (width < minThreshold) {
      setShowDesktopNav(false);
      return;
    }

    const headerMax = 1120;
    const sidePadding = width < 768 ? 32 : 40; // 20px padding left & right
    const containerWidth = Math.min(headerMax, width) - sidePadding;

    const logoW = logoRef.current ? logoRef.current.offsetWidth : 180;
    const actionsW = actionsRef.current ? actionsRef.current.offsetWidth : 240;
    const gapTotal = 32 * 2; // at least 32px gap between columns

    const availableCenterWidth = containerWidth - logoW - actionsW - gapTotal;
    const requiredNavWidth = navMeasureRef.current ? navMeasureRef.current.scrollWidth : 0;

    if (requiredNavWidth > 0 && availableCenterWidth < requiredNavWidth + 8) {
      setShowDesktopNav(false);
      return;
    }

    setShowDesktopNav(true);
  }, [language]);

  useEffect(() => {
    const handleResize = () => {
      checkNavFit();
    };

    const frameId = requestAnimationFrame(() => {
      checkNavFit();
    });

    const timer = setTimeout(() => {
      checkNavFit();
    }, 220);

    window.addEventListener('resize', handleResize, { passive: true });

    if (typeof document !== 'undefined' && 'fonts' in document) {
      document.fonts.ready.then(() => {
        requestAnimationFrame(() => {
          checkNavFit();
        });
      });
    }

    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [checkNavFit, hasActiveOrders]);

  const handleNav = (route: string) => {
    onNavigate(route);
  };

  const primaryOrderNum = activeOrders[0]?.orderNumber;
  const trackRoute = primaryOrderNum ? `track/${primaryOrderNum}` : 'track';

  return (
    <>
      {/* 1. Slim Announcement Bar */}
      <div className={styles.announcementBar}>
        <span>
          {t('common.topAnnouncementPrefix')}{' '}
          <span className={styles.announcementAccent}>{t('common.topAnnouncementHighlight')}</span>
        </span>
      </div>

      {/* Hidden off-screen measurement element to accurately measure unconstrained links width */}
      <div ref={navMeasureRef} className={styles.measureNav} aria-hidden="true">
        {navItems.map((item) => (
          <span key={item.id} className={styles.measureItem}>
            {item.label}
          </span>
        ))}
      </div>

      {/* 2. Main Sticky Header (72px on desktop, 56px on mobile) */}
      <header className={`${styles.header} ${isScrolled ? styles.scrolled : ''}`}>
        <div className={styles.inner}>
          {/* Column 1: Logo (Left, single line, does not shrink or wrap) */}
          <button
            ref={logoRef}
            type="button"
            onClick={() => handleNav('home')}
            className={styles.logoButton}
            aria-label={`${t('common.brandName')} - ${t('nav.home')}`}
          >
            <span className={styles.logoText}>BUN & PATTY</span>
          </button>

          {/* Column 2: Center Navigation (only visible when links fit and above min threshold) */}
          <nav
            className={`${styles.navCenter} ${showDesktopNav ? styles.navCenterVisible : styles.navCenterHidden}`}
            aria-label={t('nav.menu')}
          >
            {navItems.map((item) => {
              const isActive = currentRoute === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNav(item.id)}
                  className={styles.navLink}
                  aria-current={isActive ? 'page' : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Column 3: Actions Right (Language switcher, Track button, Cart button, Hamburger toggle) */}
          <div ref={actionsRef} className={styles.actionsRight}>
            {/* Desktop Segmented Control Language Switcher: 36px high, 92px wide, sliding pill */}
            <LanguageSwitcher variant="desktop" className={styles.desktopLangSwitcher} />

            {/* Desktop Track Order Button: ONLY shown when customer has active order */}
            <AnimatePresence>
              {hasActiveOrders && (
                <motion.button
                  key="desktop-track-btn"
                  type="button"
                  onClick={() => handleNav(trackRoute)}
                  className={`${styles.desktopTrackBtn} ${currentRoute.startsWith('track') ? styles.trackActive : ''}`}
                  aria-label={t('nav.track')}
                  title={t('nav.track')}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                >
                  <Clock size={20} aria-hidden="true" />
                  {hasInProgressOrder && (
                    <span className={styles.desktopTrackAccentDot} aria-hidden="true" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Desktop Cart Button (44px high, icon and "კალათა" on one line without wrapping) */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={styles.desktopCartButton}
              aria-label={`${t('common.cart')} (${totalItemCount})`}
            >
              <ShoppingBag size={18} className={styles.cartBagIcon} aria-hidden="true" />
              <span className={styles.cartLabel}>{t('common.cart')}</span>
              {totalItemCount > 0 && (
                <span className={`${styles.cartBadge} ${isPulsing ? styles.badgePulsing : ''}`}>
                  {totalItemCount}
                </span>
              )}
              {totalItemCount > 0 && subtotal > 0 && (
                <span className={styles.cartTotal}>· {subtotal.toFixed(2)} ₾</span>
              )}
            </button>

            {/* Mobile Track Icon: 44px transparent icon button ONLY when customer has active order */}
            <AnimatePresence>
              {hasActiveOrders && (
                <motion.button
                  key="mobile-track-btn"
                  type="button"
                  onClick={() => handleNav(trackRoute)}
                  className={`${styles.mobileTrackIconBtn} ${currentRoute.startsWith('track') ? styles.trackActive : ''}`}
                  aria-label={t('nav.track')}
                  title={t('nav.track')}
                  initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, x: 8 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: 'easeOut' }}
                >
                  <Clock size={20} aria-hidden="true" />
                  {hasInProgressOrder && (
                    <span className={styles.mobileTrackAccentDot} aria-hidden="true" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>

            {/* Mobile Cart Icon: 44px transparent icon button shown on screens < 768px */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className={styles.mobileCartIconBtn}
              aria-label={`${t('common.cart')} (${totalItemCount})`}
            >
              <ShoppingBag size={22} aria-hidden="true" />
              {totalItemCount > 0 && (
                <span className={`${styles.mobileCartBadge} ${isPulsing ? styles.badgePulsing : ''}`}>
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Hamburger Toggle (Shown whenever desktop nav is hidden) */}
            {!showDesktopNav && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(true)}
                className={styles.mobileMenuToggle}
                aria-label="Open navigation menu"
                aria-expanded={mobileMenuOpen}
                aria-controls="mobile-navigation-panel"
              >
                <MenuIcon size={24} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* 3. Mobile Navigation Drawer */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        currentRoute={currentRoute}
        onNavigate={handleNav}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};

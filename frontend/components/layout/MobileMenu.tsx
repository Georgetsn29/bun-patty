'use client';

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion, type Variants } from 'motion/react';
import { X as CloseIcon, ChevronRight, Clock, Phone, MapPin, Instagram } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveOrders, useLiveTimestamp, calculateOrderProgress } from '@/services/orders';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { BUSINESS_CONTENT } from '@/data/businessContent';
import { cleanPlaceholder } from '@/lib/utils';
import styles from './MobileMenu.module.scss';

interface MobileMenuProps {
  isOpen: boolean;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({
  isOpen,
  currentRoute,
  onNavigate,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();
  const hasActiveOrders = activeOrders.length > 0;
  const hasInProgressOrder = activeOrders.some((order) => {
    const progress = calculateOrderProgress(order, now);
    return !progress.isReadyOrFinished && !order.cancelledAt;
  });

  const drawerRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Lock background scroll and trap focus
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus close button on open
    const timer = setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      if (e.key === 'Tab' && drawerRef.current) {
        const focusables = drawerRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Main Links: Home, Menu, About, Locations, Contact + (Track Order only when active order exists)
  const navItems = [
    { id: 'home', label: t('nav.home') || (language === 'ka' ? 'მთავარი' : 'Home') },
    { id: 'shop', label: t('nav.menu') || (language === 'ka' ? 'მენიუ' : 'Menu') },
    { id: 'about', label: t('nav.about') || (language === 'ka' ? 'ჩვენ შესახებ' : 'About') },
    { id: 'locations', label: t('nav.locations') || (language === 'ka' ? 'ფილიალები' : 'Locations') },
    { id: 'contact', label: t('nav.contact') || (language === 'ka' ? 'კონტაქტი' : 'Contact') },
  ];

  if (hasActiveOrders) {
    navItems.push({
      id: 'track',
      label: t('nav.track') || (language === 'ka' ? 'შეკვეთის თვალთვალი' : 'Track Order'),
    });
  }

  const primaryOrderNum = activeOrders[0]?.orderNumber;
  const trackRoute = primaryOrderNum ? `track/${primaryOrderNum}` : 'track';

  const handleLinkClick = (route: string) => {
    if (route === 'track') {
      onNavigate(trackRoute);
    } else {
      onNavigate(route);
    }
    onClose();
  };

  const flagship = BUSINESS_CONTENT.locations[0];
  const cleanedAddress = cleanPlaceholder(flagship.address);
  const cleanedCity = cleanPlaceholder(flagship.cityStateZip);

  // Animation variants
  const backdropVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.25 } },
    exit: { opacity: 0, transition: { duration: 0.2 } },
  };

  const drawerVariants: Variants = {
    hidden: { x: shouldReduceMotion ? 0 : '100%', opacity: shouldReduceMotion ? 0 : 1 },
    visible: {
      x: 0,
      opacity: 1,
      transition: { duration: shouldReduceMotion ? 0.15 : 0.25, ease: [0.16, 1, 0.3, 1] as const },
    },
    exit: {
      x: shouldReduceMotion ? 0 : '100%',
      opacity: shouldReduceMotion ? 0 : 1,
      transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] as const },
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlayRoot} role="dialog" aria-modal="true" aria-label="Mobile Navigation">
          {/* Dimmed Blurred Backdrop */}
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          />

          {/* Sliding Drawer (86% width, max 360px) */}
          <motion.aside
            ref={drawerRef}
            className={styles.drawer}
            variants={drawerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {/* Top Row: Logo on Left, 44px Close Icon on Right */}
            <div className={styles.topRow}>
              <button
                type="button"
                onClick={() => handleLinkClick('home')}
                className={styles.logoBtn}
                aria-label={`${t('common.brandName')} - ${t('nav.home')}`}
              >
                <span className={styles.logoText}>BUN & PATTY</span>
              </button>

              <button
                ref={closeButtonRef}
                type="button"
                onClick={onClose}
                className={styles.closeBtn}
                aria-label={t('common.close') || 'Close menu'}
              >
                <CloseIcon size={20} aria-hidden="true" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className={styles.scrollContent}>
              {/* Main Links (52px high row, thin divider, small chevron, 3px accent line on active) */}
              <nav className={styles.navList} aria-label="Site pages">
                {navItems.map((item, index) => {
                  const isActive = currentRoute === item.id || (item.id === 'track' && currentRoute.startsWith('track'));
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => handleLinkClick(item.id)}
                      className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                      aria-current={isActive ? 'page' : undefined}
                      initial={shouldReduceMotion ? false : { opacity: 0, x: 12 }}
                      animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
                      transition={{ delay: 0.05 + index * 0.03, duration: 0.2 }}
                    >
                      <div className={styles.navLabelGroup}>
                        <span className={styles.navLabel}>{item.label}</span>
                        {item.id === 'track' && hasInProgressOrder && (
                          <span className={styles.trackMenuAccentDot} aria-hidden="true" />
                        )}
                      </div>
                      <ChevronRight size={16} className={styles.chevron} aria-hidden="true" />
                    </motion.button>
                  );
                })}
              </nav>

              {/* Full-Width Accent "Order Now" Button */}
              <div className={styles.orderCtaWrap}>
                <button
                  type="button"
                  onClick={() => handleLinkClick('shop')}
                  className={styles.orderNowBtn}
                >
                  {language === 'ka' ? 'შეუკვეთე ონლაინ' : 'Order Now'}
                </button>
              </div>

              {/* Compact Info Card (Today's hours, phone, get directions - no placeholder) */}
              <div className={styles.infoCard}>
                <div className={styles.infoRow}>
                  <Clock size={15} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoTextGroup}>
                    <span className={styles.infoTitle}>
                      {language === 'ka' ? 'დღევანდელი საათები' : "Today's Hours"}
                    </span>
                    <span className={styles.infoDesc}>{flagship.hoursDisplay}</span>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Phone size={15} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoTextGroup}>
                    <span className={styles.infoTitle}>
                      {language === 'ka' ? 'ტელეფონი' : 'Direct Line'}
                    </span>
                    <a href={`tel:${flagship.phone}`} className={styles.infoLink}>
                      {flagship.phone}
                    </a>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <MapPin size={15} className={styles.infoIcon} aria-hidden="true" />
                  <div className={styles.infoTextGroup}>
                    <span className={styles.infoTitle}>{flagship.name}</span>
                    <span className={styles.infoDesc}>
                      {cleanedAddress}, {cleanedCity}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleLinkClick('locations')}
                      className={styles.directionsBtn}
                    >
                      {language === 'ka' ? 'მარშრუტი და ლოკაციები →' : 'Get directions →'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Full-Width 44px Language Switcher and Social Icons */}
            <div className={styles.bottomArea}>
              <LanguageSwitcher variant="mobile" />

              <div className={styles.socialGroup}>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.socialIconBtn}
                  aria-label="Instagram"
                >
                  <Instagram size={18} aria-hidden="true" />
                </a>
              </div>
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

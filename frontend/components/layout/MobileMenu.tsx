'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import {
  X as CloseIcon,
  ArrowUpRight,
  ChevronRight,
  Clock,
  Info,
  Instagram,
  MapPin,
  MessageSquare,
  Phone,
  ShoppingBag,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useActiveOrders, useLiveTimestamp, calculateOrderProgress } from '@/services/orders';
import { LanguageSwitcher } from '@/components/common/LanguageSwitcher';
import { LOCATIONS, isLocationOpen } from '@/data/locations';
import { useIsMobile } from '@/hooks/use-mobile';
import { cleanPlaceholder } from '@/lib/utils';
import styles from './MobileMenu.module.scss';

interface MobileMenuProps {
  isOpen: boolean;
  currentRoute: string;
  onNavigate: (route: string) => void;
  onClose: () => void;
}

export const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, currentRoute, onNavigate, onClose }) => {
  const { language, t } = useLanguage();
  const ka = language === 'ka';
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();
  const hasActiveOrders = activeOrders.length > 0;
  const hasInProgressOrder = activeOrders.some((order) => {
    const progress = calculateOrderProgress(order, now);
    return !progress.isReadyOrFinished && !order.cancelledAt;
  });

  const drawerRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const touchStartY = useRef<number | null>(null);

  // Live open/closed status, computed client-side while the menu is open
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() =>
      setOpenMap(Object.fromEntries(LOCATIONS.map((l) => [l.id, isLocationOpen(l)])))
    );
    return () => cancelAnimationFrame(frame);
  }, [isOpen]);

  // Scroll lock, focus, Escape, focus trap
  useEffect(() => {
    if (!isOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const timer = setTimeout(() => closeButtonRef.current?.focus(), 50);

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
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isOpen, onClose]);

  const primaryOrderNum = activeOrders[0]?.orderNumber;
  const trackRoute = primaryOrderNum ? `track/${primaryOrderNum}` : 'track';

  const go = (route: string) => {
    onNavigate(route === 'track' ? trackRoute : route);
    onClose();
  };

  const isActive = (id: string) =>
    currentRoute === id || currentRoute.startsWith(`${id}/`) || (id === 'track' && currentRoute.startsWith('track'));

  // Home, Menu and Locations live in the bottom tab bar; only list the rest here
  const links = [
    { id: 'about', label: t('nav.about'), Icon: Info },
    { id: 'contact', label: t('nav.contact'), Icon: MessageSquare },
  ];

  const flagship = LOCATIONS[0];

  // Swipe the sheet header down to close (phones)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    if (e.changedTouches[0].clientY - touchStartY.current > 70) onClose();
    touchStartY.current = null;
  };

  const panelMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : isMobile
      ? {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' },
          transition: { type: 'spring' as const, damping: 34, stiffness: 340 },
        }
      : {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' },
          transition: { type: 'spring' as const, damping: 36, stiffness: 340 },
        };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className={styles.overlayRoot}>
          <motion.div
            className={styles.backdrop}
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.aside
            ref={drawerRef}
            id="mobile-navigation-panel"
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-label={ka ? 'მენიუ' : 'Menu'}
            {...panelMotion}
          >
            {/* Header (drag handle on phones) */}
            <div className={styles.topRow} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <span className={styles.dragHandle} aria-hidden="true" />
              <div className={styles.topInner}>
                <button
                  type="button"
                  onClick={() => go('home')}
                  className={styles.logoBtn}
                  aria-label={`${t('common.brandName')} - ${t('nav.home')}`}
                >
                  <span className={styles.logoText}>
                    BUN <span className={styles.logoAmp}>&amp;</span> PATTY
                  </span>
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
            </div>

            <div className={styles.scrollContent}>
              {/* Active order */}
              {hasActiveOrders && (
                <button type="button" onClick={() => go('track')} className={styles.trackCard}>
                  <span className={styles.trackIcon}>
                    <Clock size={18} aria-hidden="true" />
                    {hasInProgressOrder && <span className={styles.trackDot} aria-hidden="true" />}
                  </span>
                  <span className={styles.trackText}>
                    <span className={styles.trackTitle}>{t('nav.track')}</span>
                    <span className={styles.trackSub}>#{primaryOrderNum}</span>
                  </span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              )}

              {/* Pages not in the bottom tab bar */}
              <nav aria-label={ka ? 'გვერდები' : 'Pages'}>
                <ul className={styles.linkList}>
                  {links.map(({ id, label, Icon }) => (
                    <li key={id}>
                      <button
                        type="button"
                        onClick={() => go(id)}
                        className={`${styles.linkRow} ${isActive(id) ? styles.linkActive : ''}`}
                        aria-current={isActive(id) ? 'page' : undefined}
                      >
                        <Icon size={18} aria-hidden="true" className={styles.linkIcon} />
                        <span>{label}</span>
                        <ChevronRight size={16} aria-hidden="true" className={styles.linkChevron} />
                      </button>
                    </li>
                  ))}
                </ul>
              </nav>

              {/* Order CTA */}
              <button type="button" onClick={() => go('shop')} className={styles.orderNowBtn}>
                <ShoppingBag size={18} aria-hidden="true" />
                {ka ? 'შეუკვეთე ონლაინ' : 'Order now'}
                <span className={styles.orderNowSub}>~20 {ka ? 'წთ' : 'min'}</span>
              </button>

              {/* Kitchens with live status */}
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>{ka ? 'ჩვენი ლოკაციები' : 'Our kitchens'}</h2>
                <ul className={styles.kitchenList}>
                  {LOCATIONS.map((loc) => {
                    const open = openMap[loc.id];
                    return (
                      <li key={loc.id}>
                        <button type="button" onClick={() => go(`locations/${loc.id}`)} className={styles.kitchenRow}>
                          <span className={styles.kitchenInfo}>
                            <span className={styles.kitchenName}>{loc.name}</span>
                            <span className={styles.kitchenMeta}>
                              {cleanPlaceholder(loc.address)} · {loc.hoursDisplay}
                            </span>
                          </span>
                          {open !== undefined && (
                            <span className={`${styles.status} ${open ? styles.statusOpen : styles.statusClosed}`}>
                              <span className={styles.statusDot} aria-hidden="true" />
                              {open ? (ka ? 'ღიაა' : 'Open') : ka ? 'დაკეტილია' : 'Closed'}
                            </span>
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>

              {/* Quick actions */}
              <div className={styles.quickRow}>
                <a href={`tel:${flagship.phone.replace(/\s/g, '')}`} className={styles.quickBtn}>
                  <Phone size={16} aria-hidden="true" />
                  {ka ? 'დარეკვა' : 'Call'}
                </a>
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className={styles.quickBtn}
                  aria-label="Instagram"
                >
                  <Instagram size={16} aria-hidden="true" />
                  Instagram
                </a>
              </div>
            </div>

            {/* Language */}
            <div className={styles.bottomArea}>
              <span className={styles.bottomLabel}>{ka ? 'ენა' : 'Language'}</span>
              <LanguageSwitcher variant="mobile" />
            </div>
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
};

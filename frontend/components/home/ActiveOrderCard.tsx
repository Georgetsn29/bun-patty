'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import Image from 'next/image';
import {
  OrderRecord,
  useActiveOrders,
  useLiveTimestamp,
  calculateOrderProgress,
  dismissOrderFromHome,
  format24HourTime,
} from '@/services/orders';
import { ORDER_TRACKING_CONFIG } from '@/services/orderConfig';
import { MENU_ITEMS } from '@/data/menu';
import { useLanguage } from '@/context/LanguageContext';
import { Copy, Check, ChevronDown, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import styles from './ActiveOrderCard.module.scss';

function subscribeToExpandedStore(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getExpandedSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(ORDER_TRACKING_CONFIG.homeCardExpandedKey) === 'true';
  } catch {
    return false;
  }
}

function getServerExpandedSnapshot(): boolean {
  return false;
}

interface ActiveOrderCardProps {
  onNavigate: (route: string) => void;
}

export const ActiveOrderCard: React.FC<ActiveOrderCardProps> = ({ onNavigate }) => {
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();
  const shouldReduceMotion = useReducedMotion();
  const { t, getItemTranslation, getIngredientName, getExtraName, getChoiceOptionName, language } = useLanguage();

  // Remembered expanded state via external store
  const storedExpanded = useSyncExternalStore(
    subscribeToExpandedStore,
    getExpandedSnapshot,
    getServerExpandedSnapshot
  );
  const [localExpandedOverride, setLocalExpandedOverride] = useState<boolean | null>(null);
  const isExpanded = localExpandedOverride !== null ? localExpandedOverride : storedExpanded;

  // Selected order number if multiple active orders exist (defaults to first finishing)
  const [selectedOrderNum, setSelectedOrderNum] = useState<string | null>(null);
  const [showOtherOrders, setShowOtherOrders] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleToggleExpand = () => {
    const nextState = !isExpanded;
    setLocalExpandedOverride(nextState);
    try {
      localStorage.setItem(ORDER_TRACKING_CONFIG.homeCardExpandedKey, String(nextState));
    } catch {
      // ignore
    }
  };

  // Derive current order to display
  const currentOrder: OrderRecord | null = useMemo(() => {
    if (!activeOrders.length) return null;
    if (selectedOrderNum) {
      const found = activeOrders.find((o) => o.orderNumber === selectedOrderNum);
      if (found) return found;
    }
    return activeOrders[0];
  }, [activeOrders, selectedOrderNum]);

  // Derive progress
  const progress = useMemo(() => {
    if (!currentOrder) return null;
    return calculateOrderProgress(currentOrder, now || currentOrder.createdAt);
  }, [currentOrder, now]);

  if (!currentOrder || !progress) {
    return null;
  }

  // Main item image
  const firstItemId = currentOrder.items[0]?.itemId;
  const mainMenuItem = MENU_ITEMS.find((m) => m.id === firstItemId);
  const mainItemImage = mainMenuItem?.imageSlot || '/images/menu/bun-patty-smash.jpg';

  // SVG circular countdown constants
  const circleRadius = 54;
  const circumference = 2 * Math.PI * circleRadius; // ~339.292
  const strokeDashoffset = circumference * (1 - progress.progressRatio);

  const handleCopyOrderNumber = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(currentOrder.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleGotIt = (e: React.MouseEvent) => {
    e.stopPropagation();
    dismissOrderFromHome(currentOrder.orderNumber);
  };

  // Other active orders list
  const otherOrders = activeOrders.filter((o) => o.orderNumber !== currentOrder.orderNumber);

  // Estimate label
  const remainingEstimateLabel = progress.isReadyOrFinished
    ? t('orderCard.readyTitle')
    : language === 'ka'
    ? `~${progress.remainingMinutes} წთ`
    : `~${progress.remainingMinutes} min`;

  return (
    <aside className={styles.cardWrapper} aria-label={t('orderCard.title')}>
      {/* Screen reader live announcement */}
      <div className="sr-only" role="status" aria-live="polite">
        {progress.isReadyOrFinished ? t('orderCard.readyAnnouncement') : ''}
      </div>

      <div
        className={`${styles.orderCard} ${
          progress.isReadyOrFinished ? styles.cardReady : ''
        }`}
      >
        {/* Collapsed Bar / Expand Toggle Button */}
        <button
          type="button"
          onClick={handleToggleExpand}
          className={styles.summaryBar}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? t('orderCard.collapse') : t('orderCard.expand')}
        >
          <div className={styles.summaryLeft}>
            {/* Thumbnail */}
            <div className={styles.itemThumbWrap}>
              <Image
                src={mainItemImage}
                alt={mainMenuItem?.name || 'Order Item'}
                fill
                sizes="44px"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Info summary */}
            <div className={styles.summaryInfo}>
              <span className={styles.orderNumber}>{currentOrder.orderNumber}</span>
              <span className={styles.dividerDot}>·</span>
              <span
                className={`${styles.statusBadge} ${
                  progress.isReadyOrFinished ? styles.statusReadyBadge : ''
                }`}
              >
                {!progress.isReadyOrFinished ? (
                  <span className={styles.pulseDot} aria-hidden="true" />
                ) : (
                  <span className={styles.readyStaticDot} aria-hidden="true" />
                )}
                {t(progress.statusLabelKey)}
              </span>
              <span className={styles.dividerDot}>·</span>
              <span
                className={`${styles.remainingTag} ${
                  progress.isReadyOrFinished ? styles.remainingTagReady : ''
                }`}
              >
                {remainingEstimateLabel}
              </span>
            </div>
          </div>

          <div className={styles.summaryRight}>
            <ChevronDown
              size={18}
              className={`${styles.chevronIcon} ${
                isExpanded ? styles.chevronRotated : ''
              }`}
              aria-hidden="true"
            />
          </div>
        </button>

        {/* Progress Bar along bottom of the card */}
        <div
          className={styles.progressBarTrack}
          role="progressbar"
          aria-valuenow={progress.progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('orderCard.progressLabel')}
        >
          <div
            className={`${styles.progressBarFill} ${
              progress.isReadyOrFinished ? styles.progressBarReady : ''
            }`}
            style={{ width: `${progress.progressPercentage}%` }}
          />
        </div>

        {/* Expanded Content with 250ms smooth transition */}
        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{
                duration: shouldReduceMotion ? 0.01 : 0.25,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.expandedContent}>
                {/* 1. Large Circular Countdown Clock */}
                <div className={styles.clockSection}>
                  <div className={styles.clockRingWrap}>
                    <svg
                      className={styles.clockSvg}
                      viewBox="0 0 130 130"
                      aria-hidden="true"
                    >
                      <circle
                        cx="65"
                        cy="65"
                        r={circleRadius}
                        className={styles.clockBgCircle}
                      />
                      <circle
                        cx="65"
                        cy="65"
                        r={circleRadius}
                        className={`${styles.clockProgressCircle} ${
                          progress.isReadyOrFinished ? styles.clockProgressReady : ''
                        }`}
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                      />
                    </svg>

                    <div className={styles.clockCenter}>
                      {!progress.isReadyOrFinished ? (
                        <span className={styles.clockDigits}>
                          {progress.formattedRemainingCountdown}
                        </span>
                      ) : (
                        <motion.div
                          key="ready-check"
                          initial={{ scale: 0.85, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{
                            duration: shouldReduceMotion ? 0.01 : 0.28,
                            ease: 'easeOut',
                          }}
                          className={styles.readyCheckWrap}
                        >
                          <Check size={44} strokeWidth={2.8} />
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* Below clock notice */}
                  {!progress.isReadyOrFinished ? (
                    <span className={styles.etaNotice}>
                      {t('orderCard.estimatedReadyAt', {
                        time: format24HourTime(progress.finishTime),
                      })}
                    </span>
                  ) : (
                    <div className={styles.readyNoticeWrap}>
                      <h4 className={styles.readyTitle}>{t('orderCard.readyTitle')}</h4>
                      <button
                        type="button"
                        onClick={handleGotIt}
                        className={styles.gotItBtn}
                      >
                        <Check size={16} />
                        <span>{t('orderCard.gotIt')}</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. Ordered Items List with Quantities & Customizations */}
                <div className={styles.itemsSection}>
                  <div className={styles.itemsHeading}>
                    {t('orderCard.itemsHeading')}
                  </div>
                  <ul className={styles.itemsList}>
                    {currentOrder.items.map((it, idx) => {
                      const itemTrans = getItemTranslation(it.itemId);
                      const displayName = itemTrans.name || it.itemId;
                      const cust = it.customization;
                      const customDetails: string[] = [];

                      if (cust?.selectedChoiceId) {
                        const choiceName = getChoiceOptionName(cust.selectedChoiceId);
                        customDetails.push(`${displayName} · ${choiceName}`);
                      }

                      if (cust?.removedIngredientIds?.length) {
                        cust.removedIngredientIds.forEach((remId) => {
                          const ingName = getIngredientName(remId);
                          customDetails.push(
                            language === 'ka' ? `${ingName}ს გარეშე` : `No ${ingName}`
                          );
                        });
                      }

                      if (cust?.extraQuantities) {
                        Object.entries(cust.extraQuantities).forEach(([extraId, qty]) => {
                          if (qty > 0) {
                            const extraName = getExtraName(extraId);
                            customDetails.push(
                              language === 'ka'
                                ? `+${extraName}${qty > 1 ? ` x${qty}` : ''}`
                                : `Extra ${extraName}${qty > 1 ? ` x${qty}` : ''}`
                            );
                          }
                        });
                      }

                      if (cust?.notes) {
                        customDetails.push(`“${cust.notes}”`);
                      }

                      return (
                        <li key={idx} className={styles.itemRow}>
                          <div className={styles.itemMainLine}>
                            <span className={styles.itemName}>
                              <span className={styles.itemQty}>{it.quantity}×</span>{' '}
                              {displayName}
                            </span>
                            <span>{(it.unitPrice * it.quantity).toFixed(2)} ₾</span>
                          </div>
                          {customDetails.length > 0 && (
                            <div className={styles.itemCustomizations}>
                              {customDetails.join(', ')}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>

                {/* 3. Order Number with Copy, Total, and Full Tracking Link */}
                <div className={styles.expandedFooter}>
                  <div className={styles.footerLeft}>
                    <span className={styles.orderNumberTag}>
                      {currentOrder.orderNumber}
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyOrderNumber}
                      className={`${styles.copyBtn} ${
                        copied ? styles.copyBtnSuccess : ''
                      }`}
                      aria-label={t('orderCard.copyOrderNumber')}
                    >
                      {copied ? (
                        <>
                          <Check size={13} />
                          <span>{t('orderCard.copied')}</span>
                        </>
                      ) : (
                        <>
                          <Copy size={13} />
                          <span>{t('orderCard.copyOrderNumber')}</span>
                        </>
                      )}
                    </button>
                    <span className={styles.grandTotal}>
                      {currentOrder.grandTotal.toFixed(2)} ₾
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onNavigate(`track/${currentOrder.orderNumber}`)}
                    className={styles.trackLinkBtn}
                  >
                    <span>{t('orderCard.trackOrder')}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 4. Multiple Orders Switcher */}
      {otherOrders.length > 0 && (
        <div className={styles.multipleOrdersBar}>
          <button
            type="button"
            onClick={() => setShowOtherOrders(!showOtherOrders)}
            className={styles.moreOrdersLink}
          >
            {otherOrders.length === 1
              ? t('orderCard.moreOrders', { count: otherOrders.length })
              : t('orderCard.moreOrdersPlural', { count: otherOrders.length })}
          </button>

          {showOtherOrders && (
            <div className={styles.otherOrdersList}>
              {otherOrders.map((other) => {
                const otherProg = calculateOrderProgress(other, now);
                return (
                  <div key={other.orderNumber} className={styles.otherOrderItem}>
                    <div className={styles.otherOrderLeft}>
                      <strong>{other.orderNumber}</strong>
                      <span>·</span>
                      <span>{t(otherProg.statusLabelKey)}</span>
                      <span>·</span>
                      <span>{otherProg.formattedRemainingCountdown}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedOrderNum(other.orderNumber);
                        setShowOtherOrders(false);
                      }}
                      className={styles.switchOrderBtn}
                    >
                      {t('orderCard.trackOrder')}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </aside>
  );
};

'use client';

import React, { useState, useMemo, useSyncExternalStore } from 'react';
import {
  OrderRecord,
  useActiveOrders,
  useLiveTimestamp,
  calculateOrderProgress,
  dismissOrderFromHome,
  format24HourTime,
} from '@/services/orders';
import { ORDER_TRACKING_CONFIG } from '@/services/orderConfig';
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

  const ka = language === 'ka';
  const ready = progress.isReadyOrFinished;
  const steps = progress.timelineSteps;

  return (
    <aside className={styles.wrap} aria-label={t('orderCard.title')}>
      <div className="sr-only" role="status" aria-live="polite">
        {ready ? t('orderCard.readyAnnouncement') : ''}
      </div>

      <div className={`${styles.card} ${ready ? styles.cardReady : ''}`}>
        <div className={styles.top}>
          <span>
            {ka ? 'შეკვეთა' : 'Order'} {currentOrder.orderNumber}
          </span>
          <span className={styles.tag}>
            {!ready && <span className={styles.pulse} aria-hidden="true" />}
            {ready ? (ka ? 'მზადაა' : 'Ready') : 'Live'}
          </span>
        </div>

        <div className={styles.main}>
          <span className={styles.status}>{t(progress.statusLabelKey)}</span>
          <span className={styles.countdown} aria-label={remainingEstimateLabel}>
            {ready ? <Check size={34} strokeWidth={3} aria-hidden="true" /> : progress.formattedRemainingCountdown}
          </span>
        </div>

        <div
          className={styles.bars}
          role="progressbar"
          aria-valuenow={progress.progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={t('orderCard.progressLabel')}
        >
          {steps.map((st) => (
            <span
              key={st.status}
              className={`${styles.bar} ${st.isCompleted ? styles.barDone : ''} ${st.isCurrent ? styles.barNow : ''}`}
            />
          ))}
        </div>

        <span className={styles.eta}>
          {ready
            ? t('orderCard.readyTitle')
            : t('orderCard.estimatedReadyAt', { time: format24HourTime(progress.finishTime) })}
        </span>

        <div className={styles.actions}>
          {ready ? (
            <button type="button" onClick={handleGotIt} className={styles.btnPaper}>
              <Check size={16} aria-hidden="true" />
              {t('orderCard.gotIt')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onNavigate(`track/${currentOrder.orderNumber}`)}
              className={styles.btnRed}
            >
              {t('orderCard.trackOrder')}
              <ArrowRight size={16} aria-hidden="true" />
            </button>
          )}
          {ready && (
            <button
              type="button"
              onClick={() => onNavigate(`track/${currentOrder.orderNumber}`)}
              className={styles.btnGhost}
            >
              {t('orderCard.trackOrder')}
            </button>
          )}
          <button
            type="button"
            onClick={handleToggleExpand}
            className={styles.toggle}
            aria-expanded={isExpanded}
          >
            {ka ? 'დეტალები' : 'Details'}
            <ChevronDown size={16} className={isExpanded ? styles.chevronUp : ''} aria-hidden="true" />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="details"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: shouldReduceMotion ? 0.01 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className={styles.details}>
                <ul className={styles.items}>
                  {currentOrder.items.map((it, idx) => {
                    const name = getItemTranslation(it.itemId).name || it.itemId;
                    const cust = it.customization;
                    const notes: string[] = [];
                    if (cust?.selectedChoiceId) notes.push(getChoiceOptionName(cust.selectedChoiceId));
                    cust?.removedIngredientIds?.forEach((id) =>
                      notes.push(ka ? `${getIngredientName(id)}ს გარეშე` : `No ${getIngredientName(id)}`)
                    );
                    Object.entries(cust?.extraQuantities || {}).forEach(([id, q]) => {
                      if (q > 0) notes.push(`+ ${getExtraName(id)}${q > 1 ? ` ×${q}` : ''}`);
                    });
                    if (cust?.notes) notes.push(`“${cust.notes}”`);
                    return (
                      <li key={idx} className={styles.item}>
                        <span className={styles.itemLine}>
                          <span>
                            {it.quantity} × {name}
                          </span>
                          <span className={styles.num}>{(it.unitPrice * it.quantity).toFixed(2)} ₾</span>
                        </span>
                        {notes.length > 0 && <span className={styles.itemNotes}>{notes.join(' · ')}</span>}
                      </li>
                    );
                  })}
                </ul>
                <div className={styles.totalLine}>
                  <button type="button" onClick={handleCopyOrderNumber} className={styles.copy}>
                    {copied ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />}
                    {copied ? t('orderCard.copied') : t('orderCard.copyOrderNumber')}
                  </button>
                  <span className={styles.total}>{currentOrder.grandTotal.toFixed(2)} ₾</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {otherOrders.length > 0 && (
        <div className={styles.others}>
          {otherOrders.map((other) => {
            const p = calculateOrderProgress(other, now);
            return (
              <button
                key={other.orderNumber}
                type="button"
                onClick={() => setSelectedOrderNum(other.orderNumber)}
                className={styles.otherRow}
              >
                <span className={styles.otherNum}>{other.orderNumber}</span>
                <span>{t(p.statusLabelKey)}</span>
                <span className={styles.num}>{p.formattedRemainingCountdown}</span>
              </button>
            );
          })}
        </div>
      )}
    </aside>
  );
};

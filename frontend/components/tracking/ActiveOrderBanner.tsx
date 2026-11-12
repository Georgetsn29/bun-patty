'use client';

import React, { useState, useEffect } from 'react';
import { getActiveOrder, calculateOrderProgress, OrderRecord, useLiveTimestamp } from '@/services/orders';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowRight, X } from 'lucide-react';
import styles from './ActiveOrderBanner.module.scss';

interface ActiveOrderBannerProps {
  onNavigate: (route: string) => void;
  currentRoute: string;
}

export const ActiveOrderBanner: React.FC<ActiveOrderBannerProps> = ({
  onNavigate,
  currentRoute,
}) => {
  const { t } = useLanguage();
  const now = useLiveTimestamp();
  const [activeOrder, setActiveOrder] = useState<OrderRecord | null>(null);
  const [dismissedOrderNum, setDismissedOrderNum] = useState<string | null>(null);

  // Poll for active order every 2.5 seconds
  useEffect(() => {
    const updateActiveOrder = () => {
      const order = getActiveOrder();
      setActiveOrder(order);
    };

    updateActiveOrder();
    const interval = setInterval(updateActiveOrder, 2500);
    return () => clearInterval(interval);
  }, []);

  if (!activeOrder) return null;

  // Don't show banner if currently already viewing tracking for this specific order
  if (currentRoute === `track/${activeOrder.orderNumber}`) {
    return null;
  }

  // Check if dismissed for this order number in this session
  if (dismissedOrderNum === activeOrder.orderNumber) {
    return null;
  }

  const progress = calculateOrderProgress(activeOrder, now || activeOrder.createdAt);
  if (progress.isDeliveredOrPickedUp || progress.isCancelled) {
    return null;
  }

  const statusText = t(progress.statusLabelKey);

  return (
    <aside className={styles.banner} aria-label="Active order status">
      <div className={styles.bannerInner}>
        <button
          type="button"
          onClick={() => onNavigate(`track/${activeOrder.orderNumber}`)}
          className={styles.bannerContentBtn}
        >
          <span className={styles.pulseDot} aria-hidden="true" />
          <span className={styles.orderLabel}>
            {t('tracking.banner.prefix')} <strong>{activeOrder.orderNumber}</strong>:
          </span>
          <span className={styles.statusLabel}>{statusText}</span>
          <span className={styles.trackLink}>
            {t('tracking.banner.trackLink')} <ArrowRight size={13} className={styles.arrow} />
          </span>
        </button>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setDismissedOrderNum(activeOrder.orderNumber);
          }}
          className={styles.dismissBtn}
          aria-label={t('tracking.banner.dismiss')}
          title={t('tracking.banner.dismiss')}
        >
          <X size={15} />
        </button>
      </div>
    </aside>
  );
};

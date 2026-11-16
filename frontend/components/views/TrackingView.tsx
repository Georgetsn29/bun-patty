'use client';

import React, { useState, useMemo } from 'react';
import {
  OrderRecord,
  getOrderByNumber,
  findOrder,
  calculateOrderProgress,
  cancelOrder,
  confirmOrderPickup,
  format24HourTime,
  formatEuropeanDate,
  useLiveTimestamp,
  useSavedOrders,
} from '@/services/orders';
import { ORDER_TRACKING_CONFIG } from '@/services/orderConfig';
import { getMenuItemById } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { LOCATIONS } from '@/data/locations';
import { ArrowIcon } from '@/components/layout/Header';
import { KitchenMap } from '@/components/map/KitchenMap';
import styles from './TrackingView.module.scss';

interface TrackingViewProps {
  orderNumberParam?: string;
  onNavigate: (route: string) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  orderNumberParam,
  onNavigate,
}) => {
  const { addItem, setIsCartOpen } = useCart();
  const { t, getItemTranslation, getIngredientName, getExtraName, getChoiceOptionName, language } = useLanguage();

  // Current active order state
  const [manualOrder, setManualOrder] = useState<OrderRecord | null>(null);
  const now = useLiveTimestamp();

  // Search form state
  const [searchOrderNumber, setSearchOrderNumber] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [searchFailed, setSearchFailed] = useState(false);

  // UI state
  const [copied, setCopied] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [reorderedFeedback, setReorderedFeedback] = useState(false);

  // Recent orders list on this device via synchronized store
  const recentOrders = useSavedOrders();

  // Derive active order from orderNumberParam or manual local state
  const order = useMemo(() => {
    if (manualOrder && (!orderNumberParam || manualOrder.orderNumber === orderNumberParam)) {
      return manualOrder;
    }
    if (orderNumberParam) {
      return getOrderByNumber(orderNumberParam);
    }
    return null;
  }, [orderNumberParam, manualOrder]);

  const notFound = Boolean((orderNumberParam && !order) || searchFailed);

  // If order is active, continuously calculate live progress based on synced live clock
  const progress = useMemo(() => {
    if (!order) return null;
    return calculateOrderProgress(order, now || order.createdAt);
  }, [order, now]);

  // Copy order number to clipboard
  const handleCopyOrderNumber = async () => {
    if (!order) return;
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback if clipboard API is restricted
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchOrderNumber.trim()) return;

    const result = findOrder(searchOrderNumber, searchPhone);
    if (result) {
      setSearchFailed(false);
      setManualOrder(result);
      onNavigate(`track/${result.orderNumber}`);
    } else {
      setSearchFailed(true);
    }
  };

  // Reorder items: add all items with customizations back to cart
  const handleReorder = () => {
    if (!order) return;

    order.items.forEach((itemRecord) => {
      const menuItem = getMenuItemById(itemRecord.itemId);
      if (menuItem) {
        const cust = itemRecord.customization;
        addItem(
          menuItem,
          itemRecord.quantity,
          {
            selectedChoiceId: cust?.selectedChoiceId,
            removedIngredientIds: cust?.removedIngredientIds || [],
            extraQuantities: cust?.extraQuantities || {},
            notes: cust?.notes || '',
          }
        );
      }
    });

    setReorderedFeedback(true);
    setTimeout(() => {
      setReorderedFeedback(false);
      setIsCartOpen(true);
    }, 800);
  };

  // Cancel order handler
  const handleConfirmCancel = () => {
    if (!order) return;
    const updated = cancelOrder(order.orderNumber);
    if (updated) {
      setManualOrder(updated);
      setShowCancelModal(false);
    }
  };

  // Confirm customer pickup
  const handleConfirmPickup = () => {
    if (!order) return;
    const updated = confirmOrderPickup(order.orderNumber);
    if (updated) {
      setManualOrder(updated);
    }
  };

  // Helper for customization text in order summary
  const renderCustomizationLines = (
    customization?: OrderRecord['items'][0]['customization']
  ) => {
    if (!customization) return null;
    const lines: string[] = [];

    if (customization.selectedChoiceId) {
      const choiceName = getChoiceOptionName(customization.selectedChoiceId);
      lines.push(choiceName);
    }

    if (customization.removedIngredientIds && customization.removedIngredientIds.length > 0) {
      customization.removedIngredientIds.forEach((id) => {
        const name = getIngredientName(id);
        lines.push(language === 'ka' ? `გარეშე: ${name}` : `No ${name}`);
      });
    }

    if (customization.extraQuantities) {
      Object.entries(customization.extraQuantities).forEach(([extraId, qty]) => {
        if (qty > 0) {
          const name = getExtraName(extraId);
          lines.push(
            language === 'ka'
              ? `დამატება: ${name}${qty > 1 ? ` x${qty}` : ''}`
              : `${/^extra\b/i.test(name) ? name : `Extra ${name}`}${qty > 1 ? ` x${qty}` : ''}`
          );
        }
      });
    }

    if (customization.notes) {
      lines.push(
        language === 'ka'
          ? `შენიშვნა: “${customization.notes}”`
          : `Note: “${customization.notes}”`
      );
    }

    if (!lines.length) return null;

    return (
      <ul className={styles.customizationList}>
        {lines.map((line, idx) => (
          <li key={idx}>{line}</li>
        ))}
      </ul>
    );
  };

  const ka = language === 'ka';

  // =========================================================================
  // Render: Find an order (no specific order chosen)
  // =========================================================================
  if (!order) {
    return (
      <div className={styles.trackingPage}>
        <section className={styles.lookupHero}>
          <div className={styles.lookupIntro}>
            <span className={styles.kicker}>{t('tracking.title')}</span>
            <h1 className={styles.bigTitle}>
              {ka ? 'იპოვე შეკვეთა' : 'Find your order'}
              <span className={styles.dot}>.</span>
            </h1>
            <p className={styles.lead}>{t('tracking.lookupSubtitle')}</p>
          </div>

          <form onSubmit={handleSearchSubmit} className={styles.lookupForm}>
            <label className={styles.field}>
              <span className={styles.label}>{t('tracking.orderNumberLabel')}</span>
              <input
                id="track-order-number"
                type="text"
                value={searchOrderNumber}
                onChange={(e) => {
                  setSearchOrderNumber(e.target.value);
                  if (searchFailed) setSearchFailed(false);
                }}
                placeholder={t('tracking.orderNumberPlaceholder')}
                className={styles.input}
                required
              />
            </label>
            <label className={styles.field}>
              <span className={styles.label}>{t('tracking.phoneLabel')}</span>
              <input
                id="track-phone"
                type="tel"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                placeholder={t('tracking.phonePlaceholder')}
                className={styles.input}
              />
            </label>
            <button type="submit" className={styles.btnRed}>
              {t('tracking.trackOrderBtn')} <ArrowIcon size={20} />
            </button>

            {notFound && (
              <div className={styles.alert} role="alert">
                <strong>{t('tracking.orderNotFound')}</strong>
                <span>{t('tracking.orderNotFoundDesc')}</span>
              </div>
            )}
          </form>
        </section>

        <section className={styles.recentSection} aria-label={t('tracking.recentOrdersTitle')}>
          <h2 className={styles.sectionTitle}>{t('tracking.recentOrdersTitle')}</h2>
          {recentOrders.length === 0 ? (
            <p className={styles.muted}>{t('tracking.noRecentOrders')}</p>
          ) : (
            <ol className={styles.recentList}>
              {recentOrders.map((rec) => {
                const recProgress = calculateOrderProgress(rec, now);
                const isFinished = recProgress.isDeliveredOrPickedUp || recProgress.isCancelled;
                return (
                  <li key={rec.orderNumber}>
                    <button
                      type="button"
                      onClick={() => onNavigate(`track/${rec.orderNumber}`)}
                      className={styles.recentRow}
                    >
                      <span className={styles.orderChip}>{rec.orderNumber}</span>
                      <span className={`${styles.recentStatus} ${isFinished ? styles.recentDone : styles.recentLive}`}>
                        {!isFinished && <span className={styles.liveDot} aria-hidden="true" />}
                        {t(recProgress.statusLabelKey)}
                      </span>
                      <span className={styles.recentMeta}>
                        {formatEuropeanDate(rec.createdAt)} · {format24HourTime(rec.createdAt)} ·{' '}
                        {rec.orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}
                      </span>
                      <span className={styles.recentTotal}>{rec.grandTotal.toFixed(2)} ₾</span>
                      <ArrowIcon size={18} />
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </section>
      </div>
    );
  }

  // =========================================================================
  // Render: Live order
  // =========================================================================
  if (!progress) return null;

  const isDelivery = order.orderType === 'delivery';
  const flagship = LOCATIONS[0];
  const isActive = !progress.isDeliveredOrPickedUp && !progress.isCancelled;
  const isReadyForPickup =
    !isDelivery &&
    (progress.currentStatus === 'ready' || progress.currentStatus === 'ready_for_pickup') &&
    !order.pickedUpAt;
  const mapQuery = isDelivery
    ? encodeURIComponent(`${order.address || ''}, Tbilisi`)
    : `${flagship.coordinates.lat},${flagship.coordinates.lng}`;
  const visibleSteps = progress.timelineSteps.filter((s) => s.isCompleted || s.isCurrent);

  return (
    <div className={styles.trackingPage}>
      {/* 1. Hero: status + ETA */}
      <section className={styles.hero}>
        <div className={styles.heroMain}>
          <div className={styles.metaRow}>
            <span className={styles.kicker}>{t('tracking.orderNumberPrefix')}</span>
            <span className={styles.orderChip}>{order.orderNumber}</span>
            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className={styles.copyBtn}
              aria-label={t('tracking.copyOrderNumber')}
            >
              {copied ? t('tracking.copied') : ka ? 'კოპირება' : 'Copy'}
            </button>
            <span className={styles.kicker}>
              · {isDelivery ? t('cartDrawer.delivery') : `${t('cartDrawer.pickup')} · ${flagship.shortName}`}
            </span>
            <button type="button" onClick={() => onNavigate('track')} className={styles.copyBtn}>
              {t('tracking.findAnotherOrder')}
            </button>
          </div>
          <h1 className={styles.statusTitle}>
            {t(progress.statusLabelKey)}
            <span className={styles.dot}>.</span>
          </h1>
          <p className={styles.lead}>{t(progress.statusMessageKey)}</p>
        </div>

        {isActive && (
          <div className={styles.etaBox}>
            <span className={styles.kicker}>
              {isDelivery ? t('tracking.estimatedArrival') : t('tracking.estimatedReady')}
            </span>
            <span className={styles.etaTime}>{format24HourTime(progress.estimatedTargetTime)}</span>
            <span className={styles.etaNote}>
              {progress.remainingMinutes <= 1
                ? t('tracking.readyNow')
                : `${t('tracking.countdownPrefix')} ${t('tracking.countdownMinutes', { count: progress.remainingMinutes })}`}
            </span>
          </div>
        )}
      </section>

      {/* 2. Progress bars */}
      <section className={styles.progressSection} aria-label={ka ? 'შეკვეთის სტატუსი' : 'Order progress'}>
        <ol className={styles.steps}>
          {progress.timelineSteps.map((step, idx) => (
            <li
              key={step.status}
              aria-current={step.isCurrent ? 'step' : undefined}
              className={`${styles.step} ${step.isCompleted ? styles.stepDone : ''} ${step.isCurrent ? styles.stepCurrent : ''}`}
            >
              <span className={styles.stepBar} />
              <span className={styles.stepHead}>
                <span className={styles.stepBadge}>{step.isCompleted ? '✓' : idx + 1}</span>
                <span className={styles.stepLabel}>{t(step.labelKey)}</span>
              </span>
              <span className={styles.stepTime}>
                {step.isCompleted || step.isCurrent ? format24HourTime(step.scheduledTime) : ' '}
              </span>
            </li>
          ))}
        </ol>
        {ORDER_TRACKING_CONFIG.showDemoNotice && <p className={styles.demoNote}>{t('tracking.demoNotice')}</p>}
      </section>

      {isReadyForPickup && (
        <div className={`${styles.banner} ${styles.bannerGreen}`}>
          <span className={styles.bannerTitle}>
            {ka ? 'შეკვეთა მზადაა დახლთან.' : 'Your order is ready at the counter.'}
          </span>
          <button type="button" onClick={handleConfirmPickup} className={styles.bannerBtn}>
            {t('tracking.confirmPickupBtn')}
          </button>
        </div>
      )}

      {progress.isDeliveredOrPickedUp && (
        <div className={`${styles.banner} ${styles.bannerInk}`}>
          <span className={styles.bannerTitle}>{t('tracking.thankYouTitle')}</span>
          <span className={styles.bannerText}>
            {isDelivery ? t('tracking.thankYouDelivered') : t('tracking.thankYouPickedUp')}
          </span>
        </div>
      )}

      {/* 3. Log + aside */}
      <div className={styles.columns}>
        <section className={styles.logSection}>
          <h2 className={styles.sectionTitle}>{ka ? 'რა ხდება' : 'What’s happening'}</h2>
          <ol className={styles.log}>
            {[...visibleSteps].reverse().map((step) => (
              <li key={step.status} className={styles.logRow}>
                <span className={styles.logTime}>{format24HourTime(step.scheduledTime)}</span>
                <div className={styles.logBody}>
                  <span className={styles.logTitle}>{t(step.labelKey)}</span>
                  <span className={styles.muted}>{t(step.messageKey)}</span>
                </div>
              </li>
            ))}
          </ol>
          {progress.canCancel && (
            <button type="button" onClick={() => setShowCancelModal(true)} className={styles.cancelBtn}>
              {t('tracking.cancelOrderBtn')}
            </button>
          )}

          <h2 className={styles.sectionTitle}>{t('tracking.orderSummary')}</h2>
          <div className={styles.summary}>
            {order.items.map((itemRecord, i) => {
              const trans = getItemTranslation(itemRecord.itemId);
              return (
                <div key={i} className={styles.summaryRow}>
                  <div className={styles.summaryItem}>
                    <span>
                      {itemRecord.quantity} × {trans.name || itemRecord.itemId}
                    </span>
                    {renderCustomizationLines(itemRecord.customization)}
                  </div>
                  <span className={styles.price}>{(itemRecord.unitPrice * itemRecord.quantity).toFixed(2)} ₾</span>
                </div>
              );
            })}
            <div className={styles.summaryRow}>
              <span className={styles.muted}>{t('cartDrawer.subtotal')}</span>
              <span className={styles.price}>{order.subtotal.toFixed(2)} ₾</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.muted}>{t('cartDrawer.deliveryFee')}</span>
                <span className={styles.price}>{order.deliveryFee.toFixed(2)} ₾</span>
              </div>
            )}
            {order.discountAmount > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.muted}>{ka ? 'ფასდაკლება' : 'Discount'}</span>
                <span className={styles.price}>-{order.discountAmount.toFixed(2)} ₾</span>
              </div>
            )}
            {order.tipAmount > 0 && (
              <div className={styles.summaryRow}>
                <span className={styles.muted}>{t('cartDrawer.gratuity')}</span>
                <span className={styles.price}>{order.tipAmount.toFixed(2)} ₾</span>
              </div>
            )}
            <div className={styles.totalRow}>
              <span>{t('cartDrawer.grandTotal')}</span>
              <span>{order.grandTotal.toFixed(2)} ₾</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleReorder}
            className={`${styles.btnOutline} ${reorderedFeedback ? styles.btnDone : ''}`}
          >
            {reorderedFeedback ? t('tracking.reorderedSuccess') : t('tracking.reorder')}
          </button>
        </section>

        <aside className={styles.aside}>
          <div className={styles.placeCard}>
            <div className={styles.placeMap}>
              {isDelivery ? (
                <iframe
                  title={ka ? 'რუკა' : 'Map'}
                  src={`https://maps.google.com/maps?q=${mapQuery}&z=15&hl=${ka ? 'ka' : 'en'}&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              ) : (
                <KitchenMap selectedId={flagship.id} focus="selected" controls={false} ids={[flagship.id]} initialZoom={16} />
              )}
            </div>
            <div className={styles.placeBody}>
              <span className={styles.kicker}>
                {isDelivery ? t('tracking.deliveryAddress') : t('tracking.pickupLocation')}
              </span>
              <span className={styles.placeName}>
                {isDelivery ? order.customerName : flagship.shortName.toUpperCase()}
              </span>
              <span>
                {isDelivery ? `${order.address || ''} ${order.apartment || ''}`.trim() : ORDER_TRACKING_CONFIG.flagshipAddress}
              </span>
              <div className={styles.placeActions}>
                {!isDelivery && (
                  <a
                    href={ORDER_TRACKING_CONFIG.flagshipDirectionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.btnOutlineSmall}
                  >
                    {t('tracking.getDirections').replace(/\s*[→↗]\s*$/, '')} <ArrowIcon size={16} />
                  </a>
                )}
                <a href={ORDER_TRACKING_CONFIG.supportPhoneHref} className={styles.textLink}>
                  {ka ? 'დარეკე სამზარეულოში' : 'Call kitchen'}
                </a>
              </div>
            </div>
          </div>
          <p className={styles.muted}>
            {ka ? 'კითხვა შეკვეთაზე? ' : 'Questions about your order? '}
            <a href={ORDER_TRACKING_CONFIG.supportPhoneHref} className={styles.phone}>
              {ORDER_TRACKING_CONFIG.supportPhone}
            </a>
          </p>
        </aside>
      </div>

      {showCancelModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCancelModal(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="cancel-title"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <h3 id="cancel-title" className={styles.modalTitle}>
              {t('tracking.cancelConfirmTitle')}
            </h3>
            <p className={styles.muted}>{t('tracking.cancelConfirmText')}</p>
            <div className={styles.modalActions}>
              <button type="button" onClick={handleConfirmCancel} className={styles.modalConfirmBtn}>
                {t('tracking.cancelConfirmYes')}
              </button>
              <button type="button" onClick={() => setShowCancelModal(false)} className={styles.btnOutlineSmall}>
                {t('tracking.cancelConfirmNo')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

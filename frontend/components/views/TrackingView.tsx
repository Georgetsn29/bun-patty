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
import { MENU_ITEMS } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import {
  Copy,
  Check,
  Search,
  Phone,
  MapPin,
  RotateCcw,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
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
  const shouldReduceMotion = useReducedMotion();

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
      const menuItem = MENU_ITEMS.find((m) => m.id === itemRecord.itemId);
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
    customization?: OrderRecord['items'][0]['customization'],
    itemName?: string
  ) => {
    if (!customization) return null;
    const lines: string[] = [];

    if (customization.selectedChoiceId) {
      const choiceName = getChoiceOptionName(customization.selectedChoiceId);
      lines.push(`${itemName ? `${itemName} · ` : ''}${choiceName}`);
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
              : `Extra ${name}${qty > 1 ? ` x${qty}` : ''}`
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

  // =========================================================================
  // Render: Search / Find an Order View (when no specific order is chosen)
  // =========================================================================
  if (!order) {
    return (
      <div className={styles.trackingPage}>
        <div className={styles.container}>
          {/* Header */}
          <div className={styles.header}>
            <span className={styles.kicker}>{t('tracking.title')}</span>
            <h1 className={styles.title}>{t('tracking.lookupTitle')}</h1>
            <p className={styles.subtitle}>{t('tracking.lookupSubtitle')}</p>
          </div>

          {/* Lookup Form */}
          <form onSubmit={handleSearchSubmit} className={styles.lookupForm}>
            <div className={styles.formRow}>
              <div className={styles.inputGroup}>
                <label htmlFor="track-order-number" className={styles.label}>
                  {t('tracking.orderNumberLabel')}
                </label>
                <div className={styles.inputWrap}>
                  <Search size={16} className={styles.inputIcon} aria-hidden="true" />
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
                </div>
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="track-phone" className={styles.label}>
                  {t('tracking.phoneLabel')}
                </label>
                <div className={styles.inputWrap}>
                  <Phone size={16} className={styles.inputIcon} aria-hidden="true" />
                  <input
                    id="track-phone"
                    type="tel"
                    value={searchPhone}
                    onChange={(e) => setSearchPhone(e.target.value)}
                    placeholder={t('tracking.phonePlaceholder')}
                    className={styles.input}
                  />
                </div>
              </div>
            </div>

            <button type="submit" className={styles.submitBtn}>
              {t('tracking.trackOrderBtn')}
            </button>
          </form>

          {/* Not Found Alert */}
          {notFound && (
            <div className={styles.notFoundAlert} role="alert">
              <AlertTriangle size={20} className={styles.alertIcon} />
              <div>
                <h3 className={styles.alertTitle}>{t('tracking.orderNotFound')}</h3>
                <p className={styles.alertDesc}>{t('tracking.orderNotFoundDesc')}</p>
              </div>
            </div>
          )}

          {/* Recent Orders on this Device */}
          <section className={styles.recentSection} aria-label="Recent orders">
            <h2 className={styles.sectionTitle}>{t('tracking.recentOrdersTitle')}</h2>

            {recentOrders.length === 0 ? (
              <p className={styles.emptyRecent}>{t('tracking.noRecentOrders')}</p>
            ) : (
              <div className={styles.recentGrid}>
                {recentOrders.map((rec) => {
                  const recProgress = calculateOrderProgress(rec, now);
                  const isFinished = recProgress.isDeliveredOrPickedUp || recProgress.isCancelled;

                  return (
                    <article
                      key={rec.orderNumber}
                      onClick={() => onNavigate(`track/${rec.orderNumber}`)}
                      className={styles.recentCard}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          onNavigate(`track/${rec.orderNumber}`);
                        }
                      }}
                    >
                      <div className={styles.recentHeader}>
                        <span className={styles.recentNumber}>
                          {rec.orderNumber}
                        </span>
                        <span
                          className={`${styles.recentStatusBadge} ${
                            isFinished ? styles.statusFinished : styles.statusActive
                          }`}
                        >
                          {!isFinished && <span className={styles.miniPulse} />}
                          {t(recProgress.statusLabelKey)}
                        </span>
                      </div>

                      <div className={styles.recentMeta}>
                        <span>{formatEuropeanDate(rec.createdAt)}</span>
                        <span>·</span>
                        <span>{format24HourTime(rec.createdAt)}</span>
                        <span>·</span>
                        <span>
                          {rec.orderType === 'delivery'
                            ? t('cartDrawer.delivery')
                            : t('cartDrawer.pickup')}
                        </span>
                      </div>

                      <div className={styles.recentFooter}>
                        <span className={styles.recentTotal}>
                          {rec.grandTotal.toFixed(2)} ₾
                        </span>
                        <span className={styles.recentViewLink}>
                          {t('tracking.banner.trackLink')} <ArrowRight size={14} />
                        </span>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // =========================================================================
  // Render: Live Order Tracking Detail View
  // =========================================================================
  if (!progress) return null;

  const isDelivery = order.orderType === 'delivery';

  return (
    <div className={styles.trackingPage}>
      <div className={styles.container}>
        {/* Navigation Breadcrumb */}
        <div className={styles.topBar}>
          <button
            type="button"
            onClick={() => onNavigate('track')}
            className={styles.backLink}
          >
            {t('tracking.findAnotherOrder')}
          </button>

          {/* Optional Demo Notice */}
          {ORDER_TRACKING_CONFIG.showDemoNotice && (
            <div className={styles.demoTag} title={t('tracking.demoNotice')}>
              <Clock size={12} />
              <span>{t('tracking.demoNotice')}</span>
            </div>
          )}
        </div>

        {/* 1. Top Section: Order Number, Copy Button, Status & Countdown */}
        <header className={styles.statusHero}>
          <div className={styles.orderNumberRow}>
            <span className={styles.orderNumberTitle}>
              {t('tracking.orderNumberPrefix')}{' '}
              <span className={styles.orderNumberCode}>{order.orderNumber}</span>
            </span>

            <button
              type="button"
              onClick={handleCopyOrderNumber}
              className={`${styles.copyBtn} ${copied ? styles.copyBtnSuccess : ''}`}
              aria-label={t('tracking.copyOrderNumber')}
              title={t('tracking.copyOrderNumber')}
            >
              {copied ? (
                <>
                  <Check size={14} />
                  <span>{t('tracking.copied')}</span>
                </>
              ) : (
                <>
                  <Copy size={14} />
                  <span>{t('tracking.copyOrderNumber')}</span>
                </>
              )}
            </button>
          </div>

          {/* Current Status Headline */}
          <h1 className={styles.statusTitle}>
            {t(progress.statusLabelKey)}
          </h1>
          <p className={styles.statusMessage}>
            {t(progress.statusMessageKey)}
          </p>

          {/* Estimated Arrival / Ready Time & Countdown (unless delivered or cancelled) */}
          {!progress.isDeliveredOrPickedUp && !progress.isCancelled && (
            <div className={styles.etaBox}>
              <div className={styles.etaCol}>
                <span className={styles.etaLabel}>
                  {isDelivery
                    ? t('tracking.estimatedArrival')
                    : t('tracking.estimatedReady')}
                </span>
                <span className={styles.etaTime}>
                  {format24HourTime(progress.estimatedTargetTime)}
                </span>
              </div>

              <div className={styles.etaDivider} aria-hidden="true" />

              <div className={styles.etaCol}>
                <span className={styles.etaLabel}>
                  {language === 'ka' ? 'დარჩენილია' : 'Time remaining'}
                </span>
                <span className={styles.etaCountdown}>
                  {progress.remainingMinutes <= 1
                    ? t('tracking.readyNow')
                    : `${t('tracking.countdownPrefix')} ${t(
                        'tracking.countdownMinutes',
                        { count: progress.remainingMinutes }
                      )}`}
                </span>
              </div>
            </div>
          )}

          {/* Pickup Order: Customer Confirmation Button */}
          {!isDelivery &&
            (progress.currentStatus === 'ready' || progress.currentStatus === 'ready_for_pickup') &&
            !order.pickedUpAt && (
              <div className={styles.pickupActionBanner}>
                <p className={styles.pickupActionText}>
                  {language === 'ka'
                    ? 'შეკვეთა მზადაა დახლთან! როდესაც აიღებთ, გთხოვთ დაადასტუროთ:'
                    : 'Your order is ready at the counter! Tap below once collected:'}
                </p>
                <button
                  type="button"
                  onClick={handleConfirmPickup}
                  className={styles.pickupConfirmBtn}
                >
                  <Check size={18} />
                  <span>{t('tracking.confirmPickupBtn')}</span>
                </button>
              </div>
            )}

          {/* Thank You Note on Completion */}
          {progress.isDeliveredOrPickedUp && (
            <div className={styles.thankYouBanner}>
              <h3 className={styles.thankYouTitle}>{t('tracking.thankYouTitle')}</h3>
              <p className={styles.thankYouDesc}>
                {isDelivery
                  ? t('tracking.thankYouDelivered')
                  : t('tracking.thankYouPickedUp')}
              </p>
            </div>
          )}
        </header>

        {/* 2. Vertical Status Timeline */}
        <section className={styles.timelineSection} aria-label="Status timeline">
          <div className={styles.timelineList}>
            {progress.timelineSteps.map((step, idx) => {
              const stepTimeStr = format24HourTime(step.scheduledTime);

              return (
                <div
                  key={step.status}
                  className={`${styles.timelineStep} ${
                    step.isCompleted ? styles.stepCompleted : ''
                  } ${step.isCurrent ? styles.stepCurrent : ''} ${
                    step.isUpcoming ? styles.stepUpcoming : ''
                  }`}
                >
                  {/* Left Column: Scheduled / Completed Time */}
                  <div className={styles.stepTimeCol}>
                    {(step.isCompleted || step.isCurrent) && (
                      <span className={styles.stepTime}>{stepTimeStr}</span>
                    )}
                  </div>

                  {/* Center Column: Node Dot & Connecting Animated Line */}
                  <div className={styles.stepIndicatorCol}>
                    <div className={styles.stepDot}>
                      {step.isCompleted && <Check size={12} className={styles.checkMini} />}
                      {step.isCurrent && <span className={styles.currentInnerDot} />}
                    </div>

                    {/* Connecting line to next step */}
                    {idx < progress.timelineSteps.length - 1 && (
                      <div className={styles.stepLineTrack}>
                        <motion.div
                          className={styles.stepLineFill}
                          initial={false}
                          animate={{
                            height: step.isCompleted ? '100%' : '0%',
                          }}
                          transition={{
                            duration: shouldReduceMotion ? 0.01 : 0.45,
                            ease: 'easeInOut',
                          }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Right Column: Step Label and Friendly Detail */}
                  <div className={styles.stepContentCol}>
                    <h3 className={styles.stepLabel}>{t(step.labelKey)}</h3>
                    {step.isCurrent && (
                      <p className={styles.stepCurrentMessage}>{t(step.messageKey)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Cancel Order Button (Only visible during "Order received") */}
          {progress.canCancel && (
            <div className={styles.cancelWrap}>
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className={styles.cancelTriggerBtn}
              >
                {t('tracking.cancelOrderBtn')}
              </button>
            </div>
          )}
        </section>

        {/* 3. Below Timeline: Order Summary, Destination, Phone, Reorder Button */}
        <section className={styles.detailsGrid}>
          {/* Order Summary Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>{t('tracking.orderSummary')}</h2>

            <div className={styles.orderItemsList}>
              {order.items.map((itemRecord, i) => {
                const trans = getItemTranslation(itemRecord.itemId);
                const itemTotal = itemRecord.unitPrice * itemRecord.quantity;

                return (
                  <div key={i} className={styles.orderItemRow}>
                    <div className={styles.orderItemInfo}>
                      <span className={styles.orderItemName}>
                        <span className={styles.orderItemQty}>{itemRecord.quantity}×</span>{' '}
                        {trans.name || itemRecord.itemId}
                      </span>
                      {renderCustomizationLines(itemRecord.customization, trans.name || itemRecord.itemId)}
                    </div>
                    <span className={styles.orderItemPrice}>
                      {itemTotal.toFixed(2)} ₾
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Calculations breakdown */}
            <div className={styles.breakdown}>
              <div className={styles.breakdownRow}>
                <span>{t('cartDrawer.subtotal')}</span>
                <span>{order.subtotal.toFixed(2)} ₾</span>
              </div>

              {order.deliveryFee > 0 && (
                <div className={styles.breakdownRow}>
                  <span>{t('cartDrawer.deliveryFee')}</span>
                  <span>{order.deliveryFee.toFixed(2)} ₾</span>
                </div>
              )}

              {order.discountAmount > 0 && (
                <div className={`${styles.breakdownRow} ${styles.discountRow}`}>
                  <span>{language === 'ka' ? 'ფასდაკლება' : 'Discount'}</span>
                  <span>-{order.discountAmount.toFixed(2)} ₾</span>
                </div>
              )}

              {order.tipAmount > 0 && (
                <div className={styles.breakdownRow}>
                  <span>{t('cartDrawer.gratuity')}</span>
                  <span>{order.tipAmount.toFixed(2)} ₾</span>
                </div>
              )}

              <div className={styles.totalRow}>
                <span>{t('cartDrawer.grandTotal')}</span>
                <span>{order.grandTotal.toFixed(2)} ₾</span>
              </div>
            </div>

            {/* Reorder Button */}
            <div className={styles.reorderWrap}>
              <button
                type="button"
                onClick={handleReorder}
                className={`${styles.reorderBtn} ${
                  reorderedFeedback ? styles.reorderedSuccess : ''
                }`}
              >
                <RotateCcw size={16} />
                <span>
                  {reorderedFeedback
                    ? t('tracking.reorderedSuccess')
                    : t('tracking.reorder')}
                </span>
              </button>
            </div>
          </div>

          {/* Fulfillment & Contact Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              {isDelivery
                ? t('tracking.deliveryAddress')
                : t('tracking.pickupLocation')}
            </h2>

            <div className={styles.fulfillmentInfo}>
              <div className={styles.infoBlock}>
                <MapPin className={styles.infoIcon} aria-hidden="true" />
                <div className={styles.infoText}>
                  <strong className={styles.destinationName}>
                    {isDelivery ? order.customerName : ORDER_TRACKING_CONFIG.flagshipName}
                  </strong>
                  <span className={styles.destinationAddress}>
                    {isDelivery
                      ? `${order.address || ''} ${order.apartment || ''}`.trim()
                      : ORDER_TRACKING_CONFIG.flagshipAddress}
                  </span>

                  {!isDelivery && (
                    <a
                      href={ORDER_TRACKING_CONFIG.flagshipDirectionsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.directionsLink}
                    >
                      {t('tracking.getDirections')}
                    </a>
                  )}
                </div>
              </div>

              {/* Tappable Restaurant Support Phone */}
              <div className={styles.infoBlock}>
                <Phone className={styles.infoIcon} aria-hidden="true" />
                <div className={styles.infoText}>
                  <span className={styles.phoneLabel}>
                    {language === 'ka' ? 'შეკვეთის მხარდაჭერა' : 'Questions about your order?'}
                  </span>
                  <a
                    href={ORDER_TRACKING_CONFIG.supportPhoneHref}
                    className={styles.phoneLink}
                  >
                    {ORDER_TRACKING_CONFIG.supportPhone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Cancel Confirmation Modal */}
        {showCancelModal && (
          <div
            className={styles.modalOverlay}
            onClick={() => setShowCancelModal(false)}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-title"
          >
            <div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalIconWrap}>
                <ShieldAlert size={28} className={styles.shieldIcon} />
              </div>
              <h3 id="cancel-title" className={styles.modalTitle}>
                {t('tracking.cancelConfirmTitle')}
              </h3>
              <p className={styles.modalText}>
                {t('tracking.cancelConfirmText')}
              </p>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  onClick={handleConfirmCancel}
                  className={styles.modalConfirmBtn}
                >
                  {t('tracking.cancelConfirmYes')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCancelModal(false)}
                  className={styles.modalCancelBtn}
                >
                  {t('tracking.cancelConfirmNo')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { LOCATIONS } from '@/data/locations';
import { STORE_SETTINGS, formatPrice } from '@/data/settings';
import { cleanPlaceholder } from '@/lib/utils';
import { generateOrderNumber, saveOrder, OrderRecord } from '@/services/orders';
import { calculateOrderEstimatedMinutes } from '@/data/menu';
import { ORDER_TRACKING_CONFIG } from '@/services/orderConfig';
import styles from './CheckoutView.module.scss';

interface CheckoutViewProps {
  onNavigate: (route: string) => void;
}

export const CheckoutView: React.FC<CheckoutViewProps> = ({ onNavigate }) => {
  const {
    items,
    subtotal,
    deliveryFee,
    discountAmount,
    promoCode,
    grandTotal,
    orderType,
    setOrderType,
    tipPercent,
    setTipPercent,
    clearCart,
  } = useCart();

  const { t, getItemTranslation, getIngredientName, getExtraName, getChoiceOptionName, language } = useLanguage();

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    address: '',
    apt: '',
    pickupLocation: LOCATIONS[0].id,
    instructions: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const getCustomizationLines = (cartItem: CartItem): string[] => {
    const lines: string[] = [];
    const { customization } = cartItem;
    if (!customization) return lines;

    if (customization.removedIngredientIds && customization.removedIngredientIds.length > 0) {
      customization.removedIngredientIds.forEach((id) => {
        const ingName = getIngredientName(id);
        lines.push(language === 'ka' ? `გარეშე: ${ingName}` : `No ${ingName}`);
      });
    }

    if (customization.extraQuantities) {
      Object.entries(customization.extraQuantities).forEach(([extraId, count]) => {
        if (count > 0) {
          const extraName = getExtraName(extraId);
          lines.push(
            language === 'ka'
              ? `დამატება: ${extraName}${count > 1 ? ` x${count}` : ''}`
              : `${/^extra\b/i.test(extraName) ? extraName : `Extra ${extraName}`}${count > 1 ? ` x${count}` : ''}`
          );
        }
      });
    }

    return lines;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = language === 'ka' ? 'სახელი და გვარი სავალდებულოა' : 'Full name is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errs.phone =
        language === 'ka'
          ? 'მიუთითეთ მოქმედი ტელეფონის ნომერი (+995...)'
          : 'Valid phone (+995) is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email =
        language === 'ka' ? 'მიუთითეთ სწორი ელ-ფოსტის მისამართი' : 'Valid email is required';
    }
    if (orderType === 'delivery' && !formData.address.trim()) {
      errs.address =
        language === 'ka' ? 'ქუჩის მისამართი სავალდებულოა' : 'Street address is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const tipAmount = tipPercent > 0 ? ((subtotal - discountAmount) * tipPercent) / 100 : 0;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = generateOrderNumber(); // Short readable order number e.g. BP-4827
      const startTime = Date.now();
      const estimatedMinutes = calculateOrderEstimatedMinutes(
        items.map((cartItem) => ({ itemId: cartItem.item.id })),
        orderType,
        ORDER_TRACKING_CONFIG.deliveryTimeMinutes
      );
      const finishTime = startTime + estimatedMinutes * 60 * 1000;

      const newOrder: OrderRecord = {
        orderNumber: orderId,
        createdAt: startTime,
        startTime,
        finishTime,
        estimatedMinutes,
        orderType,
        customerName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
        address: formData.address.trim(),
        apartment: formData.apt.trim(),
        instructions: formData.instructions.trim(),
        pickupLocationId: formData.pickupLocation,
        items: items.map((cartItem) => ({
          itemId: cartItem.item.id,
          quantity: cartItem.quantity,
          unitPrice: cartItem.unitPrice,
          customization: cartItem.customization,
        })),
        subtotal,
        deliveryFee: orderType === 'delivery' ? deliveryFee : 0,
        discountAmount,
        tipAmount,
        grandTotal,
        statusHistory: [{ status: 'received', timestamp: startTime }],
      };

      saveOrder(newOrder);

      setPlacedOrder({
        orderNumber: orderId,
        customerName: formData.fullName,
        orderType,
        destination:
          orderType === 'delivery'
            ? `${formData.address} ${formData.apt}`.trim()
            : `${LOCATIONS[0].name} (${LOCATIONS[0].address})`,
        items: [...items],
        total: grandTotal,
        estimatedTime:
          orderType === 'delivery'
            ? STORE_SETTINGS.deliveryTurnaround
            : STORE_SETTINGS.pickupPrepTime,
      });

      setIsSubmitting(false);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Send the customer straight to the tracking page for that order
      onNavigate(`track/${orderId}`);
    }, 600);
  };

  if (placedOrder) {
    return (
      <div className={styles.confirmationWrap}>
        <div className={styles.ticketCard}>
          <div className={styles.ticketHeader}>
            <span className={styles.kicker}>
              {language === 'ka' ? 'შეკვეთა მიღებულია და იწვება' : 'Order Confirmed & Fired'}
            </span>
            <h1 className={styles.ticketTitle}>
              {language === 'ka' ? 'ჩეკი' : 'Ticket'} #{placedOrder.orderNumber}
            </h1>
            <p style={{ marginTop: '8px', color: '#8A9698', fontSize: '0.825rem' }}>
              {language === 'ka' ? 'სტუმარი' : 'Guest'}: {placedOrder.customerName} ·{' '}
              {language === 'ka' ? 'მომზადების დრო' : 'Ready in approximately'} {placedOrder.estimatedTime}
            </p>
          </div>

          <div className={styles.ticketMeta}>
            <p>
              <strong style={{ color: '#FFFFFF' }}>{t('checkout.fulfillmentHeading')}:</strong>{' '}
              {placedOrder.orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}
            </p>
            <p>
              <strong style={{ color: '#FFFFFF' }}>{language === 'ka' ? 'მისამართი / პუნქტი' : 'Destination'}:</strong>{' '}
              {placedOrder.destination}
            </p>
            <p>
              <strong style={{ color: '#FFFFFF' }}>{language === 'ka' ? 'სტატუსი' : 'Status'}:</strong>{' '}
              {language === 'ka' ? 'პლანშაზე იწვება' : 'Smashed on 260°C plancha'}
            </p>
          </div>

          {/* Itemized list */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '16px 0',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              fontSize: '0.8rem',
            }}
          >
            {placedOrder.items.map((cartItem: any, idx: number) => {
              const itemTrans = getItemTranslation(cartItem.item.id);
              const displayName = itemTrans.name || cartItem.item.name;
              const lines = getCustomizationLines(cartItem);

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: '#FFFFFF' }}>
                    <span>
                      {cartItem.quantity}x {displayName}
                    </span>
                    <span>{formatPrice(cartItem.totalPrice)}</span>
                  </div>
                  {lines.map((l: string, i: number) => (
                    <span key={i} style={{ fontSize: '0.75rem', color: '#E27344' }}>
                      • {l}
                    </span>
                  ))}
                </div>
              );
            })}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 800,
                fontSize: '1rem',
                color: '#FFFFFF',
                paddingTop: '12px',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <span>{t('cartDrawer.grandTotal')}</span>
              <span>{formatPrice(placedOrder.total)}</span>
            </div>
          </div>

          <div className={styles.ticketActions}>
            <button
              type="button"
              onClick={() => onNavigate(`track/${placedOrder.orderNumber}`)}
              className={styles.ticketPrimaryBtn}
            >
              {language === 'ka' ? 'შეკვეთის თვალთვალი →' : 'Track your order →'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className={styles.ticketSecondaryBtn}
            >
              {language === 'ka' ? 'მთავარზე დაბრუნება' : 'Return to Home'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('shop')}
              className={styles.ticketSecondaryBtn}
            >
              {t('checkout.backToShop')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <h2 className={styles.emptyTitle}>{t('checkout.emptyWarning')}</h2>
        <button
          type="button"
          onClick={() => onNavigate('shop')}
          className={styles.emptyBtn}
        >
          {t('checkout.backToShop')}
        </button>
      </div>
    );
  }

  return (
    <div className={styles.checkout}>
      <div className={styles.header}>
        <span className={styles.kicker}>{t('checkout.title')}</span>
        <h1 className={styles.title}>{language === 'ka' ? 'შეკვეთის გაფორმება და მიწოდება' : 'Fulfillment & Review'}</h1>
      </div>

      <div className={styles.checkoutGrid}>
        {/* Left Column: Form Details */}
        <div className={styles.formCol}>
          {/* Order Type Toggle */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <span className={styles.sectionHeader}>{t('checkout.fulfillmentHeading')}</span>
            <div className={styles.toggleGrid}>
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`${styles.toggleBtn} ${orderType === 'delivery' ? styles.active : ''}`}
              >
                {t('cartDrawer.delivery')} (25–40 min)
              </button>
              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`${styles.toggleBtn} ${orderType === 'pickup' ? styles.active : ''}`}
              >
                {t('cartDrawer.pickup')} (15–20 min)
              </button>
            </div>
          </div>

          {/* Customer Information Form */}
          <form onSubmit={handleOrderSubmit} className={styles.form}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <span className={styles.sectionHeader}>{t('checkout.contactHeading')}</span>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('checkout.fullName')} *</label>
                  <input
                    type="text"
                    required
                    placeholder={language === 'ka' ? 'გიორგი ბერიძე' : 'Giorgi Beridze'}
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className={styles.input}
                  />
                  {errors.fullName && <p className={styles.errorText}>{errors.fullName}</p>}
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t('checkout.phone')} *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+995 599 00 00 00"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className={styles.input}
                  />
                  {errors.phone && <p className={styles.errorText}>{errors.phone}</p>}
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>{t('checkout.email')} *</label>
                <input
                  type="email"
                  required
                  placeholder="giorgi@domain.ge"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>

              {/* Delivery specific address */}
              {orderType === 'delivery' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '4px' }}>
                  <div className={styles.formRow3}>
                    <div className={styles.formGroupSpan2}>
                      <label className={styles.formLabel}>{t('checkout.streetAddress')} *</label>
                      <input
                        type="text"
                        required
                        placeholder={language === 'ka' ? 'ბარნოვის ქუჩა 24' : '24 Barnovi St'}
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        className={styles.input}
                      />
                      {errors.address && <p className={styles.errorText}>{errors.address}</p>}
                    </div>

                    <div className={styles.formGroup}>
                      <label className={styles.formLabel}>{t('checkout.apartment')}</label>
                      <input
                        type="text"
                        placeholder={language === 'ka' ? 'ბინა 14, სართ. 3' : 'Apt 14'}
                        value={formData.apt}
                        onChange={(e) => setFormData({ ...formData, apt: e.target.value })}
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.formLabel}>{t('checkout.deliveryNotes')}</label>
                    <input
                      type="text"
                      placeholder={t('checkout.deliveryNotesPlaceholder')}
                      value={formData.instructions}
                      onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                      className={styles.input}
                    />
                  </div>
                </div>
              ) : (
                <div className={styles.formGroup} style={{ paddingTop: '4px' }}>
                  <label className={styles.formLabel}>
                    {language === 'ka' ? 'გატანის ლოკაცია' : 'Pickup Location'}
                  </label>
                  <div className={styles.selectWrap}>
                    <select
                      value={formData.pickupLocation}
                      onChange={(e) => setFormData({ ...formData, pickupLocation: e.target.value })}
                      className={styles.select}
                    >
                      {LOCATIONS.map((l) => (
                        <option key={l.id} value={l.id}>
                          {l.name} — {cleanPlaceholder(l.address)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Kitchen Gratuity - Optional */}
            <div className={styles.tipWrap}>
              <div className={styles.tipHeader}>
                <span>{t('checkout.tipHeading')}</span>
                <span style={{ fontSize: '0.7rem', color: '#8A9698' }}>
                  {language === 'ka' ? 'არასავალდებულო · 100% გუნდს' : 'Optional · 100% to staff'}
                </span>
              </div>
              <div className={styles.tipGrid}>
                {STORE_SETTINGS.tipOptions.map((tip) => (
                  <button
                    key={tip.percent}
                    type="button"
                    onClick={() => setTipPercent(tip.percent)}
                    className={`${styles.tipBtn} ${tipPercent === tip.percent ? styles.active : ''}`}
                  >
                    {tip.percent === 0
                      ? language === 'ka'
                        ? 'არ მსურს'
                        : 'None'
                      : `${tip.percent}%`}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment & Refund Information Note */}
            <div className={styles.policyNoticeBox}>
              <div className={styles.policyRow}>
                <span className={styles.policyIcon}>💳</span>
                <p className={styles.policyText}>
                  <strong>{language === 'ka' ? 'გადახდის მეთოდები:' : 'Payment Methods:'}</strong>{' '}
                  {language === 'ka'
                    ? 'ნაღდი ანგარიშსწორება, ბარათით გადახდა კურიერთან მობილური POS ტერმინალით და ონლაინ Visa/Mastercard (დღგ 18% შედის ფასში).'
                    : 'Cash on delivery/pickup, mobile POS card terminals with our couriers, and online Visa/Mastercard (18% VAT included).'}
                </p>
              </div>
              <div className={styles.policyRow}>
                <span className={styles.policyIcon}>🛡️</span>
                <p className={styles.policyText}>
                  <strong>{language === 'ka' ? 'პლანშის გარანტია:' : 'Plancha Guarantee:'}</strong>{' '}
                  {language === 'ka'
                    ? 'თუ შეკვეთა არ შეესაბამება თქვენს მოთხოვნებს, სამზარეულო დაუყოვნებლივ მოგიმზადებთ ახალს ან დაგიბრუნებთ თანხას სრულად.'
                    : 'If your burger is not prepared to your exact specifications, we will immediately recook your order or issue a full refund.'}
                </p>
              </div>
            </div>

            {/* Test Mode Notice */}
            <div className={styles.sandboxBox}>
              <strong style={{ display: 'block', color: '#FFFFFF', marginBottom: '4px' }}>
                {language === 'ka' ? 'დემო რეჟიმი:' : 'Order Test Mode:'}
              </strong>
              {language === 'ka'
                ? 'საბანკო ბარათიდან თანხა არ ჩამოიჭრება. შეკვეთის გაგზავნისას იმიტირდება ჩეკის ბეჭდვა პლანშის ხაზზე.'
                : 'No real credit card transaction will be processed. Placing the order simulates ticket transmission directly to our plancha line.'}
            </div>

            <button type="submit" disabled={isSubmitting} className={styles.submitOrderBtn}>
              {isSubmitting
                ? language === 'ka'
                  ? 'შეკვეთა იგზავნება სამზარეულოში...'
                  : 'Firing Ticket on Line...'
                : t('checkout.placeOrderButton', { price: formatPrice(grandTotal) })}
            </button>
          </form>
        </div>

        {/* Right Column: Order Summary */}
        <div className={styles.summaryCol}>
          <h3 className={styles.summaryTitle}>
            {language === 'ka' ? 'შეკვეთის შეჯამება' : 'Ticket Breakdown'}
          </h3>

          <div className={styles.itemsList}>
            {items.map((cartItem) => {
              const itemTrans = getItemTranslation(cartItem.item.id);
              const displayName = itemTrans.name || cartItem.item.name;
              const choiceName = cartItem.customization?.selectedChoiceId
                ? getChoiceOptionName(cartItem.customization.selectedChoiceId)
                : null;
              const lines = getCustomizationLines(cartItem);

              return (
                <div key={cartItem.cartItemId} className={styles.itemRow}>
                  <div className={styles.itemRowHeader}>
                    <span style={{ fontWeight: 700, color: '#FFFFFF' }}>
                      {cartItem.quantity}x {displayName}
                    </span>
                    <span>{formatPrice(cartItem.totalPrice)}</span>
                  </div>

                  {choiceName && (
                    <p className={styles.customizationBullet} style={{ color: '#E27344', fontWeight: 600 }}>
                      {displayName} · {choiceName}
                    </p>
                  )}

                  {lines.map((l, i) => (
                    <p key={i} className={styles.customizationBullet}>
                      • {l}
                    </p>
                  ))}

                  {cartItem.customization?.notes && (
                    <p style={{ fontSize: '0.725rem', fontStyle: 'italic', color: '#8A9698', margin: 0 }}>
                      {t('modal.kitchenNoteLabel')}: &ldquo;{cartItem.customization.notes}&rdquo;
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Breakdown Lines */}
          <div className={styles.totalsBox}>
            <div className={styles.totalLine}>
              <span>{t('cartDrawer.subtotal')}</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className={styles.totalLine} style={{ color: '#E27344' }}>
                <span>Promo ({promoCode})</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className={styles.totalLine}>
              <span>{orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}</span>
              <span>{deliveryFee === 0 ? t('cartDrawer.freeDelivery') : formatPrice(deliveryFee)}</span>
            </div>

            <div className={styles.totalLine}>
              <span>{t('cartDrawer.taxesIncluded')}</span>
              <span>{formatPrice(0)}</span>
            </div>

            {tipPercent > 0 && (
              <div className={styles.totalLine}>
                <span>{t('cartDrawer.gratuity')} ({tipPercent}%)</span>
                <span>{formatPrice(tipAmount)}</span>
              </div>
            )}

            <div className={styles.grandTotalLine}>
              <span>{t('cartDrawer.grandTotal')}</span>
              <span>{formatPrice(grandTotal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

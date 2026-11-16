'use client';

import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { LOCATIONS, isLocationOpen } from '@/data/locations';
import { STORE_SETTINGS, formatPrice } from '@/data/settings';
import { cleanPlaceholder, cn } from '@/lib/utils';
import { generateOrderNumber, saveOrder, OrderRecord } from '@/services/orders';
import { calculateOrderEstimatedMinutes } from '@/data/menu';
import { ORDER_TRACKING_CONFIG } from '@/services/orderConfig';
import {
  ArrowLeft,
  Banknote,
  Check,
  ChevronDown,
  CreditCard,
  FlaskConical,
  Loader2,
  Lock,
  ShieldCheck,
  ShoppingBag,
  Store,
  Truck,
} from 'lucide-react';
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
    totalItemCount,
  } = useCart();

  const { t, getItemTranslation, getIngredientName, getExtraName, getChoiceOptionName, language } = useLanguage();
  const ka = language === 'ka';
  const reduceMotion = useReducedMotion();

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
  const [summaryOpen, setSummaryOpen] = useState(false);

  // Live open/closed status for the pickup cards (client-only)
  const [openMap, setOpenMap] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    const update = () => setOpenMap(Object.fromEntries(LOCATIONS.map((l) => [l.id, isLocationOpen(l)])));
    const first = window.setTimeout(update, 0);
    const id = window.setInterval(update, 60_000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const set = (key: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((errs) => ({ ...errs, [key]: '' }));
  };

  const getCustomizationLines = (cartItem: CartItem): { text: string; kind: 'removed' | 'extra' }[] => {
    const lines: { text: string; kind: 'removed' | 'extra' }[] = [];
    const { customization } = cartItem;
    if (!customization) return lines;
    customization.removedIngredientIds?.forEach((id) => {
      const ingName = getIngredientName(id);
      lines.push({ text: ka ? `გარეშე: ${ingName}` : `No ${ingName}`, kind: 'removed' });
    });
    if (customization.extraQuantities) {
      Object.entries(customization.extraQuantities).forEach(([extraId, count]) => {
        if (count > 0) {
          const extraName = getExtraName(extraId);
          lines.push({
            text: ka
              ? `+ ${extraName}${count > 1 ? ` ×${count}` : ''}`
              : `+ ${/^extra\b/i.test(extraName) ? extraName : `Extra ${extraName}`}${count > 1 ? ` ×${count}` : ''}`,
            kind: 'extra',
          });
        }
      });
    }
    return lines;
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.fullName.trim()) {
      errs.fullName = ka ? 'სახელი და გვარი სავალდებულოა' : 'Full name is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 8) {
      errs.phone = ka ? 'მიუთითეთ მოქმედი ტელეფონის ნომერი (+995...)' : 'Valid phone (+995) is required';
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      errs.email = ka ? 'მიუთითეთ სწორი ელ-ფოსტის მისამართი' : 'Valid email is required';
    }
    if (orderType === 'delivery' && !formData.address.trim()) {
      errs.address = ka ? 'ქუჩის მისამართი სავალდებულოა' : 'Street address is required';
    }
    setErrors(errs);

    // Bring the first problem into view
    const firstKey = ['fullName', 'phone', 'email', 'address'].find((k) => errs[k]);
    if (firstKey) {
      const el = document.getElementById(`checkout-${firstKey}`);
      el?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
      el?.focus({ preventScroll: true });
    }
    return Object.keys(errs).length === 0;
  };

  const tipAmount = tipPercent > 0 ? ((subtotal - discountAmount) * tipPercent) / 100 : 0;

  const handleOrderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || !validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = generateOrderNumber();
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
      setIsSubmitting(false);
      clearCart();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      onNavigate(`track/${orderId}`);
    }, 600);
  };

  // ---------- Empty ----------
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <span className={styles.emptyIcon}>
          <ShoppingBag size={26} aria-hidden="true" />
        </span>
        <h1 className={styles.emptyTitle}>{ka ? 'კალათა ცარიელია' : 'Your cart is empty'}</h1>
        <p className={styles.emptyDesc}>{t('checkout.emptyWarning')}</p>
        <button type="button" onClick={() => onNavigate('shop')} className={styles.primaryBtn}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t('checkout.backToShop').replace(/^←\s*/, '')}
        </button>
      </div>
    );
  }

  const placeLabel = isSubmitting
    ? ka ? 'იგზავნება...' : 'Placing order...'
    : ka ? 'შეკვეთის გაფორმება' : 'Place order';

  // ---------- Summary (shared by the mobile accordion and the desktop column) ----------
  const summaryBody = (
    <>
      <ul className={styles.summaryItems}>
        {items.map((cartItem) => {
          const itemTrans = getItemTranslation(cartItem.item.id);
          const displayName = itemTrans.name || cartItem.item.name;
          const choiceName = cartItem.customization?.selectedChoiceId
            ? getChoiceOptionName(cartItem.customization.selectedChoiceId)
            : null;
          const lines = getCustomizationLines(cartItem);
          return (
            <li key={cartItem.cartItemId} className={styles.summaryItem}>
              <span className={styles.summaryThumbWrap}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={cartItem.item.imageSlot} alt="" className={styles.summaryThumb} loading="lazy" />
                <span className={styles.summaryQty}>{cartItem.quantity}</span>
              </span>
              <span className={styles.summaryInfo}>
                <span className={styles.summaryName}>
                  {displayName}
                  {choiceName && <span className={styles.summaryChoice}> · {choiceName}</span>}
                </span>
                {lines.length > 0 && (
                  <span className={styles.summaryMods}>
                    {lines.map((l, i) => (
                      <span key={i} className={l.kind === 'removed' ? styles.modRemoved : styles.modExtra}>
                        {l.text}
                      </span>
                    ))}
                  </span>
                )}
                {cartItem.customization?.notes && (
                  <span className={styles.summaryNote}>&ldquo;{cartItem.customization.notes}&rdquo;</span>
                )}
              </span>
              <span className={styles.summaryPrice}>{formatPrice(cartItem.totalPrice)}</span>
            </li>
          );
        })}
      </ul>

      <dl className={styles.totals}>
        <div className={styles.totalLine}>
          <dt>{t('cartDrawer.subtotal')}</dt>
          <dd>{formatPrice(subtotal)}</dd>
        </div>
        {discountAmount > 0 && (
          <div className={cn(styles.totalLine, styles.totalDiscount)}>
            <dt>
              {ka ? 'ფასდაკლება' : 'Discount'} ({promoCode})
            </dt>
            <dd>−{formatPrice(discountAmount)}</dd>
          </div>
        )}
        <div className={styles.totalLine}>
          <dt>{orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}</dt>
          <dd className={deliveryFee === 0 ? styles.freeValue : undefined}>
            {deliveryFee === 0 ? t('cartDrawer.freeDelivery') : formatPrice(deliveryFee)}
          </dd>
        </div>
        {tipPercent > 0 && (
          <div className={styles.totalLine}>
            <dt>
              {t('cartDrawer.gratuity')} ({tipPercent}%)
            </dt>
            <dd>{formatPrice(tipAmount)}</dd>
          </div>
        )}
        <div className={styles.grandTotalLine}>
          <dt>
            {t('cartDrawer.grandTotal')}
            <span className={styles.vatNote}>{t('cartDrawer.taxesIncluded')}</span>
          </dt>
          <dd>{formatPrice(grandTotal)}</dd>
        </div>
      </dl>
    </>
  );

  const field = (
    key: 'fullName' | 'phone' | 'email' | 'address' | 'apt' | 'instructions',
    label: string,
    props: React.InputHTMLAttributes<HTMLInputElement>,
    className?: string
  ) => (
    <div className={cn(styles.formGroup, className)}>
      <label htmlFor={`checkout-${key}`} className={styles.formLabel}>
        {label}
      </label>
      <input
        id={`checkout-${key}`}
        value={formData[key]}
        onChange={set(key)}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? `checkout-${key}-error` : undefined}
        className={cn(styles.input, errors[key] && styles.inputError)}
        {...props}
      />
      {errors[key] && (
        <p id={`checkout-${key}-error`} className={styles.errorText}>
          {errors[key]}
        </p>
      )}
    </div>
  );

  // ---------- Page ----------
  return (
    <div className={styles.checkout}>
      <header className={styles.header}>
        <button type="button" onClick={() => onNavigate('shop')} className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          {t('checkout.backToShop').replace(/^←\s*/, '')}
        </button>
        <h1 className={styles.title}>
            {ka ? 'გაფორმება' : 'Checkout'}
            <span className={styles.titleDot}>.</span>
          </h1>
        <p className={styles.secureNote}>
          <Lock size={13} aria-hidden="true" />
          {ka ? 'უსაფრთხო გაფორმება · დღგ შედის ფასში' : 'Secure checkout · VAT included'}
        </p>
      </header>

      {/* Mobile order summary (collapsible) */}
      <section className={styles.mobileSummary}>
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className={styles.mobileSummaryToggle}
          aria-expanded={summaryOpen}
          aria-controls="checkout-mobile-summary"
        >
          <ShoppingBag size={16} aria-hidden="true" />
          <span>
            {summaryOpen ? (ka ? 'შეჯამების დამალვა' : 'Hide order summary') : ka ? 'შეკვეთის ნახვა' : 'Show order summary'}
            <span className={styles.mobileSummaryCount}>
              {' '}
              · {totalItemCount} {totalItemCount === 1 ? t('common.item') : t('common.items')}
            </span>
          </span>
          <ChevronDown
            size={16}
            aria-hidden="true"
            className={cn(styles.chevron, summaryOpen && styles.chevronOpen)}
          />
          <strong className={styles.mobileSummaryTotal}>{formatPrice(grandTotal)}</strong>
        </button>
        <AnimatePresence initial={false}>
          {summaryOpen && (
            <motion.div
              id="checkout-mobile-summary"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
              className={styles.mobileSummaryBody}
            >
              <div className={styles.mobileSummaryInner}>{summaryBody}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <div className={styles.grid}>
        <form id="checkout-form" onSubmit={handleOrderSubmit} className={styles.formCol} noValidate>
          {/* 1 — Fulfillment */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNum}>01</span>
              {ka ? 'მიღების ტიპი' : 'How do you want it?'}
            </h2>
            <div className={styles.typeGrid} role="radiogroup" aria-label={ka ? 'მიღების ტიპი' : 'Order type'}>
              {(
                [
                  {
                    id: 'delivery',
                    Icon: Truck,
                    title: ka ? 'მიწოდება' : 'Delivery',
                    sub: ka ? '25–40 წთ · უფასო 50\u00A0₾-დან' : '25–40 min · free over 50\u00A0₾',
                  },
                  {
                    id: 'pickup',
                    Icon: Store,
                    title: ka ? 'გატანა' : 'Pickup',
                    sub: ka ? '15–20 წთ · ყოველთვის უფასო' : '15–20 min · always free',
                  },
                ] as const
              ).map(({ id, Icon, title, sub }) => {
                const active = orderType === id;
                return (
                  <button
                    key={id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setOrderType(id)}
                    className={cn(styles.typeCard, active && styles.typeCardActive)}
                  >
                    <span className={styles.typeIcon}>
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className={styles.typeText}>
                      <span className={styles.typeTitle}>{title}</span>
                      <span className={styles.typeSub}>{sub}</span>
                    </span>
                    <span className={cn(styles.radio, active && styles.radioOn)} aria-hidden="true">
                      {active && <Check size={12} strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* 2 — Contact */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNum}>02</span>
              {ka ? 'საკონტაქტო ინფორმაცია' : 'Your details'}
            </h2>
            <div className={styles.fields}>
              {field('fullName', `${t('checkout.fullName')} *`, {
                type: 'text',
                autoComplete: 'name',
                placeholder: ka ? 'გიორგი ბერიძე' : 'Giorgi Beridze',
              })}
              <div className={styles.formRow}>
                {field('phone', `${ka ? 'ტელეფონი' : 'Phone'} *`, {
                  type: 'tel',
                  inputMode: 'tel',
                  autoComplete: 'tel',
                  placeholder: '+995 599 00 00 00',
                })}
                {field('email', `${t('checkout.email')} *`, {
                  type: 'email',
                  inputMode: 'email',
                  autoComplete: 'email',
                  placeholder: 'giorgi@domain.ge',
                })}
              </div>
            </div>
          </section>

          {/* 3 — Address / pickup */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNum}>03</span>
              {orderType === 'delivery'
                ? ka ? 'მიწოდების მისამართი' : 'Delivery address'
                : ka ? 'გატანის ლოკაცია' : 'Pickup location'}
            </h2>

            {orderType === 'delivery' ? (
              <div className={styles.fields}>
                <div className={styles.formRow3}>
                  {field(
                    'address',
                    `${ka ? 'ქუჩა და ნომერი' : 'Street & number'} *`,
                    {
                      type: 'text',
                      autoComplete: 'street-address',
                      placeholder: ka ? 'ბარნოვის ქუჩა 24' : '24 Barnovi St',
                    },
                    styles.span2
                  )}
                  {field('apt', ka ? 'ბინა / სართული' : 'Apt / floor', {
                    type: 'text',
                    autoComplete: 'address-line2',
                    placeholder: ka ? 'ბინა 14' : 'Apt 14',
                  })}
                </div>
                {field('instructions', t('checkout.deliveryNotes'), {
                  type: 'text',
                  placeholder: t('checkout.deliveryNotesPlaceholder'),
                })}
              </div>
            ) : (
              <div className={styles.pickupList} role="radiogroup" aria-label={ka ? 'გატანის ლოკაცია' : 'Pickup location'}>
                {LOCATIONS.map((loc) => {
                  const active = formData.pickupLocation === loc.id;
                  const open = openMap?.[loc.id];
                  return (
                    <button
                      key={loc.id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFormData((f) => ({ ...f, pickupLocation: loc.id }))}
                      className={cn(styles.pickupCard, active && styles.typeCardActive)}
                    >
                      <span className={styles.typeText}>
                        <span className={styles.typeTitle}>
                          {loc.name}
                          {open !== undefined && (
                            <span className={cn(styles.status, open ? styles.statusOpen : styles.statusClosed)}>
                              {open ? (ka ? 'ღიაა' : 'Open') : ka ? 'დაკეტილია' : 'Closed'}
                            </span>
                          )}
                        </span>
                        <span className={styles.typeSub}>
                          {cleanPlaceholder(loc.address)} · {loc.hoursDisplay}
                        </span>
                      </span>
                      <span className={cn(styles.radio, active && styles.radioOn)} aria-hidden="true">
                        {active && <Check size={12} strokeWidth={3} />}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* 4 — Tip */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNum}>04</span>
              {ka ? 'თიფი' : 'Tip the team'}
              <span className={styles.stepOptional}>{ka ? 'არასავალდებულო · 100% გუნდს' : 'Optional · 100% to staff'}</span>
            </h2>
            <div className={styles.tipGrid} role="radiogroup" aria-label={ka ? 'თიფი' : 'Tip'}>
              {STORE_SETTINGS.tipOptions.map((tip) => {
                const active = tipPercent === tip.percent;
                const amount = ((subtotal - discountAmount) * tip.percent) / 100;
                return (
                  <button
                    key={tip.percent}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setTipPercent(tip.percent)}
                    className={cn(styles.tipBtn, active && styles.tipActive)}
                  >
                    <span className={styles.tipPct}>
                      {tip.percent === 0 ? (ka ? 'არა' : 'None') : `${tip.percent}%`}
                    </span>
                    {tip.percent > 0 && <span className={styles.tipAmt}>{formatPrice(amount)}</span>}
                  </button>
                );
              })}
            </div>
          </section>

          {/* 5 — Payment info */}
          <section className={styles.step}>
            <h2 className={styles.stepTitle}>
              <span className={styles.stepNum}>05</span>
              {ka ? 'გადახდა' : 'Payment'}
            </h2>
            <ul className={styles.infoList}>
              <li>
                <Banknote size={18} aria-hidden="true" />
                <span>
                  <strong>{ka ? 'ნაღდი ან ბარათი ადგილზე' : 'Cash or card on arrival'}</strong>
                  {ka
                    ? 'ნაღდი ანგარიშსწორება, ან ბარათით კურიერთან / დახლთან POS ტერმინალით.'
                    : 'Pay cash, or by card on our couriers’ and counters’ POS terminals.'}
                </span>
              </li>
              <li>
                <CreditCard size={18} aria-hidden="true" />
                <span>
                  <strong>{ka ? 'ონლაინ Visa / Mastercard' : 'Online Visa / Mastercard'}</strong>
                  {ka ? 'დღგ 18% შედის ფასში.' : '18% VAT is included in all prices.'}
                </span>
              </li>
              <li>
                <ShieldCheck size={18} aria-hidden="true" />
                <span>
                  <strong>{ka ? 'პლანშის გარანტია' : 'Plancha guarantee'}</strong>
                  {ka
                    ? 'თუ შეკვეთა არ შეესაბამება მოთხოვნას, მოგიმზადებთ ახალს ან დაგიბრუნებთ თანხას.'
                    : 'Not made the way you asked? We recook it or refund you in full.'}
                </span>
              </li>
            </ul>
            <p className={styles.sandbox}>
              <FlaskConical size={14} aria-hidden="true" />
              {ka
                ? 'დემო რეჟიმი: ბარათიდან თანხა არ ჩამოიჭრება.'
                : 'Test mode: no real payment is processed.'}
            </p>
          </section>

          {/* Desktop submit */}
          <button type="submit" disabled={isSubmitting} className={cn(styles.submitBtn, styles.desktopSubmit)}>
            {isSubmitting ? <Loader2 size={18} className={styles.spin} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
            <span>{placeLabel}</span>
            <span className={styles.submitTotal}>{formatPrice(grandTotal)}</span>
          </button>
        </form>

        {/* Desktop summary */}
        <aside className={styles.summaryCol}>
          <h2 className={styles.summaryTitle}>{t('checkout.orderSummaryHeading')}</h2>
          {summaryBody}
        </aside>
      </div>

      {/* Mobile sticky submit bar */}
      <div className={styles.mobileBar}>
        <div className={styles.mobileBarTotal}>
          <span className={styles.mobileBarLabel}>{t('cartDrawer.grandTotal')}</span>
          <strong>{formatPrice(grandTotal)}</strong>
        </div>
        <button type="submit" form="checkout-form" disabled={isSubmitting} className={styles.submitBtn}>
          {isSubmitting ? <Loader2 size={18} className={styles.spin} aria-hidden="true" /> : <Lock size={16} aria-hidden="true" />}
          <span>{placeLabel}</span>
        </button>
      </div>
    </div>
  );
};

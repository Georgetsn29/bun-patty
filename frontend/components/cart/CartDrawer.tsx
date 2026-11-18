'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/data/settings';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  ArrowRight,
  ChevronDown,
  Minus,
  Pencil,
  Plus,
  ShoppingBag,
  Store,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import styles from './CartDrawer.module.scss';

interface CartDrawerProps {
  onNavigateToCheckout: () => void;
  onNavigateToShop: () => void;
  onEditCartItem?: (cartItem: CartItem) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onNavigateToCheckout,
  onNavigateToShop,
  onEditCartItem,
}) => {
  const {
    items,
    removeItem,
    updateQuantity,
    isCartOpen,
    setIsCartOpen,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold,
    promoCode,
    discountAmount,
    applyPromoCode,
    removePromoCode,
    orderType,
    setOrderType,
    tipPercent,
    grandTotal,
    totalItemCount,
  } = useCart();

  const { t, getItemTranslation, getIngredientName, getExtraName, getChoiceOptionName, language } = useLanguage();
  const ka = language === 'ka';
  const isMobile = useIsMobile();
  const reduceMotion = useReducedMotion();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ text: string; ok: boolean } | null>(null);
  const [promoOpen, setPromoOpen] = useState(false);

  const panelRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);

  const close = () => setIsCartOpen(false);

  useEffect(() => {
    if (!isCartOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Move focus into the panel once it mounts
    requestAnimationFrame(() => panelRef.current?.focus({ preventScroll: true }));
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previouslyFocused?.focus?.({ preventScroll: true });
    };
  }, [isCartOpen, setIsCartOpen]);

  // Swipe down on the sheet header to close (phones)
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    if (e.changedTouches[0].clientY - touchStartY.current > 70) close();
    touchStartY.current = null;
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage({ text: res.message, ok: res.success });
    if (res.success) {
      setPromoInput('');
      setPromoOpen(false);
    }
    setTimeout(() => setPromoMessage(null), 3500);
  };

  const handleEdit = (cartItem: CartItem) => {
    close();
    onEditCartItem?.(cartItem);
  };

  const tipAmount = tipPercent > 0 ? ((subtotal - discountAmount) * tipPercent) / 100 : 0;
  const remainingForFree = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeProgress = Math.min(1, subtotal / freeDeliveryThreshold);

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
          const text = ka
            ? `+ ${extraName}${count > 1 ? ` ×${count}` : ''}`
            : `+ ${/^extra\b/i.test(extraName) ? extraName : `Extra ${extraName}`}${count > 1 ? ` ×${count}` : ''}`;
          lines.push({ text, kind: 'extra' });
        }
      });
    }
    return lines;
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
      {isCartOpen && (
        <React.Fragment key="cart">
          <motion.div
            onClick={close}
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />

          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            className={styles.drawer}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
            {...panelMotion}
          >
            {/* Header (drag to close on phones) */}
            <div className={styles.header} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
              <span className={styles.dragHandle} aria-hidden="true" />
              <div className={styles.headerRow}>
                <div>
                  <h2 id="cart-title" className={styles.heading}>
                    {ka ? 'შენი შეკვეთა' : 'Your order'}
                  </h2>
                  <p className={styles.subheading}>
                    {totalItemCount} {totalItemCount === 1 ? t('common.item') : t('common.items')}
                  </p>
                </div>
                <button type="button" onClick={close} className={styles.closeButton} aria-label={t('common.close')}>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>

              {/* Delivery / pickup switch */}
              <div className={styles.segmented} role="radiogroup" aria-label={t('cartDrawer.orderTypeLabel')}>
                {(
                  [
                    { id: 'delivery', Icon: Truck, label: ka ? 'მიწოდება' : 'Delivery', time: '25–40′' },
                    { id: 'pickup', Icon: Store, label: ka ? 'გატანა' : 'Pickup', time: '15–20′' },
                  ] as const
                ).map(({ id, Icon, label, time }) => {
                  const active = orderType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setOrderType(id)}
                      className={`${styles.segment} ${active ? styles.segmentActive : ''}`}
                    >
                      {active && (
                        <motion.span
                          layoutId="cart-order-type"
                          className={styles.segmentPill}
                          transition={reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 460, damping: 38 }}
                          aria-hidden="true"
                        />
                      )}
                      <Icon size={16} aria-hidden="true" />
                      <span>{label}</span>
                      <span className={styles.segmentTime}>{time}</span>
                    </button>
                  );
                })}
              </div>

              {/* Free-delivery progress */}
              {items.length > 0 && orderType === 'delivery' && (
                <div className={styles.freeBar}>
                  <p className={styles.freeText}>
                    {remainingForFree > 0 ? (
                      ka ? (
                        <>
                          დაამატე <strong>{formatPrice(remainingForFree)}</strong> უფასო მიწოდებისთვის
                        </>
                      ) : (
                        <>
                          Add <strong>{formatPrice(remainingForFree)}</strong> more for free delivery
                        </>
                      )
                    ) : ka ? (
                      <strong className={styles.freeDone}>უფასო მიწოდება ✓</strong>
                    ) : (
                      <strong className={styles.freeDone}>You&apos;ve unlocked free delivery ✓</strong>
                    )}
                  </p>
                  <div className={styles.freeTrack} aria-hidden="true">
                    <motion.div
                      className={`${styles.freeFill} ${remainingForFree === 0 ? styles.freeFillDone : ''}`}
                      initial={false}
                      animate={{ scaleX: freeProgress }}
                      transition={{ duration: reduceMotion ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Items */}
            <div ref={listRef} className={styles.itemList}>
              {items.length === 0 ? (
                <div className={styles.emptyState}>
                  <span className={styles.emptyIcon}>
                    <ShoppingBag size={26} aria-hidden="true" />
                  </span>
                  <p className={styles.emptyTitle}>{t('cartDrawer.emptyTitle')}</p>
                  <p className={styles.emptyDesc}>{t('cartDrawer.emptyDesc')}</p>
                  <button
                    type="button"
                    onClick={() => {
                      close();
                      onNavigateToShop();
                    }}
                    className={styles.browseButton}
                  >
                    {t('cartDrawer.browseMenuBtn')}
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <ul className={styles.items}>
                  <AnimatePresence initial={false}>
                    {items.map((cartItem) => {
                      const itemTrans = getItemTranslation(cartItem.item.id);
                      const displayName = itemTrans.name || cartItem.item.name;
                      const choiceName = cartItem.customization?.selectedChoiceId
                        ? getChoiceOptionName(cartItem.customization.selectedChoiceId)
                        : null;
                      const lines = getCustomizationLines(cartItem);
                      const isLast = cartItem.quantity <= 1;

                      return (
                        <motion.li
                          key={cartItem.cartItemId}
                          layout={!reduceMotion}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -40, transition: { duration: 0.2 } }}
                          className={styles.itemRow}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={cartItem.item.imageSlot}
                            alt=""
                            className={styles.thumb}
                            style={cartItem.item.imagePosition ? { objectPosition: cartItem.item.imagePosition } : undefined}
                            loading="lazy"
                          />

                          <div className={styles.itemBody}>
                            <div className={styles.itemTop}>
                              <h3 className={styles.itemName}>
                                {displayName}
                                {choiceName && <span className={styles.itemChoice}> · {choiceName}</span>}
                              </h3>
                              <span className={styles.itemTotalPrice}>{formatPrice(cartItem.totalPrice)}</span>
                            </div>

                            {lines.length > 0 && (
                              <ul className={styles.modList}>
                                {lines.map((line, idx) => (
                                  <li
                                    key={idx}
                                    className={`${styles.modChip} ${line.kind === 'removed' ? styles.modRemoved : styles.modExtra}`}
                                  >
                                    {line.text}
                                  </li>
                                ))}
                              </ul>
                            )}

                            {cartItem.customization?.notes && (
                              <p className={styles.kitchenNote}>&ldquo;{cartItem.customization.notes}&rdquo;</p>
                            )}

                            <div className={styles.itemActions}>
                              <button
                                type="button"
                                onClick={() => handleEdit(cartItem)}
                                className={styles.editButton}
                                aria-label={`${t('cartDrawer.editCustomization')} ${displayName}`}
                              >
                                <Pencil size={13} aria-hidden="true" />
                                {t('cartDrawer.editCustomization')}
                              </button>

                              <div className={styles.qtyControl}>
                                <button
                                  type="button"
                                  onClick={() =>
                                    isLast
                                      ? removeItem(cartItem.cartItemId)
                                      : updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)
                                  }
                                  className={`${styles.qtyButton} ${isLast ? styles.qtyRemove : ''}`}
                                  aria-label={
                                    isLast
                                      ? `${t('common.remove')} ${displayName}`
                                      : `${ka ? 'შემცირება' : 'Decrease'} ${displayName}`
                                  }
                                >
                                  {isLast ? <Trash2 size={15} aria-hidden="true" /> : <Minus size={16} aria-hidden="true" />}
                                </button>
                                <span className={styles.qtyDisplay} aria-live="polite">
                                  {cartItem.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                                  className={styles.qtyButton}
                                  aria-label={`${ka ? 'გაზრდა' : 'Increase'} ${displayName}`}
                                >
                                  <Plus size={16} aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {/* Summary & checkout */}
            {items.length > 0 && (
              <div className={styles.footer}>
                {/* Promo code (collapsed by default to save space) */}
                {promoCode ? (
                  <div className={styles.promoApplied}>
                    <Tag size={14} aria-hidden="true" />
                    <span>
                      <strong>{promoCode}</strong> · −{formatPrice(discountAmount)}
                    </span>
                    <button type="button" onClick={removePromoCode} className={styles.promoRemove}>
                      {t('common.remove')}
                    </button>
                  </div>
                ) : promoOpen ? (
                  <form onSubmit={handleApplyPromo} className={styles.promoForm}>
                    <input
                      type="text"
                      autoFocus
                      autoCapitalize="characters"
                      placeholder={ka ? 'პრომო კოდი' : 'Promo code'}
                      aria-label={ka ? 'პრომო კოდი' : 'Promo code'}
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className={styles.promoInput}
                    />
                    <button type="submit" className={styles.promoSubmit}>
                      {ka ? 'გამოყენება' : 'Apply'}
                    </button>
                  </form>
                ) : (
                  <button type="button" onClick={() => setPromoOpen(true)} className={styles.promoToggle}>
                    <Tag size={14} aria-hidden="true" />
                    {ka ? 'გაქვს პრომო კოდი?' : 'Have a promo code?'}
                    <ChevronDown size={14} aria-hidden="true" />
                  </button>
                )}

                {promoMessage && (
                  <p className={`${styles.promoMessage} ${promoMessage.ok ? styles.promoOk : ''}`} role="status">
                    {promoMessage.text}
                  </p>
                )}

                <dl className={styles.breakdown}>
                  <div className={styles.breakdownRow}>
                    <dt>{t('cartDrawer.subtotal')}</dt>
                    <dd>{formatPrice(subtotal)}</dd>
                  </div>
                  {discountAmount > 0 && (
                    <div className={`${styles.breakdownRow} ${styles.breakdownDiscount}`}>
                      <dt>{ka ? 'ფასდაკლება' : 'Discount'}</dt>
                      <dd>−{formatPrice(discountAmount)}</dd>
                    </div>
                  )}
                  <div className={styles.breakdownRow}>
                    <dt>{orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}</dt>
                    <dd className={deliveryFee === 0 ? styles.freeValue : undefined}>
                      {deliveryFee === 0 ? t('cartDrawer.freeDelivery') : formatPrice(deliveryFee)}
                    </dd>
                  </div>
                  {tipPercent > 0 && (
                    <div className={styles.breakdownRow}>
                      <dt>
                        {t('cartDrawer.gratuity')} ({tipPercent}%)
                      </dt>
                      <dd>{formatPrice(tipAmount)}</dd>
                    </div>
                  )}
                </dl>

                <button
                  type="button"
                  onClick={() => {
                    close();
                    onNavigateToCheckout();
                  }}
                  className={styles.checkoutButton}
                >
                  <span className={styles.checkoutLabel}>
                    {ka ? 'გაფორმება' : 'Checkout'}
                    <span className={styles.checkoutSub}>{t('cartDrawer.taxesIncluded')}</span>
                  </span>
                  <span className={styles.checkoutTotal}>
                    {formatPrice(grandTotal)}
                    <ArrowRight size={18} aria-hidden="true" />
                  </span>
                </button>
              </div>
            )}
          </motion.aside>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};

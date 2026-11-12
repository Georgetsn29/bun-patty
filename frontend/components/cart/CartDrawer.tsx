'use client';

import React, { useEffect, useState } from 'react';
import { useCart, CartItem } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { formatPrice } from '@/data/settings';
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

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsCartOpen(false);
    };
    if (isCartOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartOpen, setIsCartOpen]);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    setPromoMessage(res.message);
    if (res.success) setPromoInput('');
    setTimeout(() => setPromoMessage(null), 3500);
  };

  const handleEdit = (cartItem: CartItem) => {
    setIsCartOpen(false);
    if (onEditCartItem) {
      onEditCartItem(cartItem);
    }
  };

  if (!isCartOpen) return null;

  const tipAmount = tipPercent > 0 ? ((subtotal - discountAmount) * tipPercent) / 100 : 0;

  // Format customization lines dynamically in current active language
  const getCustomizationLines = (cartItem: CartItem): string[] => {
    const lines: string[] = [];
    const { item, customization } = cartItem;
    if (!customization) return lines;

    if (customization.removedIngredientIds && customization.removedIngredientIds.length > 0) {
      customization.removedIngredientIds.forEach((id) => {
        const ingName = getIngredientName(id);
        const noText = language === 'ka' ? `გარეშე: ${ingName}` : `No ${ingName}`;
        lines.push(noText);
      });
    }

    if (customization.extraQuantities) {
      Object.entries(customization.extraQuantities).forEach(([extraId, count]) => {
        if (count > 0) {
          const extraName = getExtraName(extraId);
          const extraText =
            language === 'ka'
              ? `დამატება: ${extraName}${count > 1 ? ` x${count}` : ''}`
              : `${/^extra\b/i.test(extraName) ? extraName : `Extra ${extraName}`}${count > 1 ? ` x${count}` : ''}`;
          lines.push(extraText);
        }
      });
    }

    return lines;
  };

  return (
    <>
      <div onClick={() => setIsCartOpen(false)} className={styles.backdrop} />

      <aside className={styles.drawer} aria-label="Shopping Cart">
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.heading}>{t('cartDrawer.title')}</h2>
            <p className={styles.subheading}>
              {totalItemCount} {t('common.items')}
            </p>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className={styles.closeButton}
            aria-label="Close Bag"
          >
            [{t('common.close')}]
          </button>
        </div>

        {/* Fulfillment Switch */}
        <div className={styles.fulfillment}>
          <div className={styles.fulfillmentToggle}>
            <button
              type="button"
              onClick={() => setOrderType('delivery')}
              className={`${styles.toggleButton} ${
                orderType === 'delivery' ? styles.toggleButtonActive : ''
              }`}
            >
              {t('cartDrawer.delivery')} (25–40m)
            </button>
            <button
              type="button"
              onClick={() => setOrderType('pickup')}
              className={`${styles.toggleButton} ${styles.toggleButtonBorderLeft} ${
                orderType === 'pickup' ? styles.toggleButtonActive : ''
              }`}
            >
              {t('cartDrawer.pickup')} (15–20m)
            </button>
          </div>
        </div>

        {/* Item List */}
        <div className={styles.itemList}>
          {items.length === 0 ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>{t('cartDrawer.emptyTitle')}</p>
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  onNavigateToShop();
                }}
                className={styles.browseButton}
              >
                {t('cartDrawer.browseMenuBtn')}
              </button>
            </div>
          ) : (
            items.map((cartItem) => {
              const itemTrans = getItemTranslation(cartItem.item.id);
              const displayName = itemTrans.name || cartItem.item.name;
              const choiceName = cartItem.customization?.selectedChoiceId
                ? getChoiceOptionName(cartItem.customization.selectedChoiceId)
                : null;
              const customizationLines = getCustomizationLines(cartItem);

              return (
                <div key={cartItem.cartItemId} className={styles.itemRow}>
                  <div className={styles.itemHeader}>
                    <div style={{ flex: 1 }}>
                      <h3 className={styles.itemName}>{displayName}</h3>
                      {choiceName && (
                        <p className={styles.itemChoiceSubtitle}>
                          {displayName} · {choiceName}
                        </p>
                      )}
                      <p className={styles.itemUnitPrice}>
                        {formatPrice(cartItem.unitPrice)}
                      </p>
                    </div>
                    <span className={styles.itemTotalPrice}>
                      {formatPrice(cartItem.totalPrice)}
                    </span>
                  </div>

                  {/* Formatted Customizations */}
                  {customizationLines.length > 0 && (
                    <ul className={styles.customizationList}>
                      {customizationLines.map((line, idx) => (
                        <li key={idx} className={styles.customizationItem}>
                          • {line}
                        </li>
                      ))}
                    </ul>
                  )}

                  {/* Kitchen Note */}
                  {cartItem.customization?.notes && (
                    <p className={styles.kitchenNote}>
                      {t('modal.kitchenNoteLabel')}: &ldquo;{cartItem.customization.notes}&rdquo;
                    </p>
                  )}

                  {/* Item Actions */}
                  <div className={styles.itemActionsRow}>
                    <button
                      type="button"
                      onClick={() => handleEdit(cartItem)}
                      className={styles.editButton}
                      aria-label={`Edit ${displayName}`}
                    >
                      {t('cartDrawer.editCustomization')}
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div className={styles.qtyControl}>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity - 1)}
                          className={styles.qtyButton}
                          aria-label="Decrease quantity"
                        >
                          -
                        </button>
                        <span className={styles.qtyDisplay}>{cartItem.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(cartItem.cartItemId, cartItem.quantity + 1)}
                          className={styles.qtyButton}
                          aria-label="Increase quantity"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeItem(cartItem.cartItemId)}
                        className={styles.removeButton}
                        aria-label={`Remove ${displayName}`}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Breakdown & Actions */}
        {items.length > 0 && (
          <div className={styles.footer}>
            {promoCode ? (
              <div className={styles.promoRow}>
                <span>
                  {language === 'ka' ? 'პრომო კოდი' : 'Code'} &ldquo;{promoCode}&rdquo; (-{formatPrice(discountAmount)})
                </span>
                <button
                  type="button"
                  onClick={removePromoCode}
                  className={styles.removePromo}
                >
                  {t('common.remove')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className={styles.promoForm}>
                <input
                  type="text"
                  placeholder={language === 'ka' ? 'პრომო კოდი (BUN10)' : 'PROMO CODE (BUN10)'}
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className={styles.promoInput}
                />
                <button type="submit" className={styles.promoSubmit}>
                  {language === 'ka' ? 'გამოყენება' : 'Apply'}
                </button>
              </form>
            )}

            {promoMessage && (
              <p style={{ margin: 0, fontSize: '0.725rem', color: '#E27344' }}>
                {promoMessage}
              </p>
            )}

            <div className={styles.breakdown}>
              <div className={styles.breakdownRow}>
                <span>{t('cartDrawer.subtotal')}</span>
                <span>{formatPrice(subtotal)}</span>
              </div>

              {discountAmount > 0 && (
                <div className={`${styles.breakdownRow} ${styles.breakdownDiscount}`}>
                  <span>Promo ({promoCode})</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}

              <div className={styles.breakdownRow}>
                <span>{orderType === 'delivery' ? t('cartDrawer.delivery') : t('cartDrawer.pickup')}</span>
                <span>{deliveryFee === 0 ? t('cartDrawer.freeDelivery') : formatPrice(deliveryFee)}</span>
              </div>

              <div className={styles.breakdownRow}>
                <span>{t('cartDrawer.taxesIncluded')}</span>
                <span>{formatPrice(0)}</span>
              </div>

              {tipPercent > 0 && (
                <div className={styles.breakdownRow}>
                  <span>{t('cartDrawer.gratuity')} ({tipPercent}%)</span>
                  <span>{formatPrice(tipAmount)}</span>
                </div>
              )}

              <div className={styles.totalRow}>
                <span>{t('cartDrawer.grandTotal')}</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsCartOpen(false);
                onNavigateToCheckout();
              }}
              className={styles.checkoutButton}
            >
              {t('cartDrawer.checkoutButton', { price: formatPrice(grandTotal) })}
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

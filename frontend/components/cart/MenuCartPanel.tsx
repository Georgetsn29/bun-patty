'use client';

import React from 'react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowIcon } from '@/components/layout/Header';
import styles from './MenuCartPanel.module.scss';

interface MenuCartPanelProps {
  onCheckout: () => void;
}

/** Always-visible "Your order" panel beside the menu on wide screens (canvas: Menu board). */
export const MenuCartPanel: React.FC<MenuCartPanelProps> = ({ onCheckout }) => {
  const { items, updateQuantity, subtotal, deliveryFee, grandTotal, orderType, totalItemCount, formatItemCustomization } =
    useCart();
  const { language, getItemTranslation } = useLanguage();
  const ka = language === 'ka';

  const countLabel = ka ? `${totalItemCount} პოზიცია` : `${totalItemCount} ${totalItemCount === 1 ? 'item' : 'items'}`;

  return (
    <aside className={styles.panel} aria-label={ka ? 'შენი შეკვეთა' : 'Your order'}>
      <div className={styles.head}>
        <h2 className={styles.title}>{ka ? 'შენი შეკვეთა' : 'Your order'}</h2>
        <span className={styles.count}>{countLabel}</span>
      </div>

      {items.length === 0 ? (
        <p className={styles.empty}>
          {ka ? 'ჯერ ცარიელია. დაამატე ბურგერი შეკვეთის დასაწყებად.' : 'Nothing here yet. Add a burger to start your order.'}
        </p>
      ) : (
        <>
          <div className={styles.lines}>
            {items.map((line) => {
              const name = getItemTranslation(line.item.id).name || line.item.name;
              const mods = formatItemCustomization(line);
              return (
                <div key={line.cartItemId} className={styles.line}>
                  <div className={styles.lineTop}>
                    <span className={styles.lineName}>{name}</span>
                    <span className={styles.lineTotal}>{line.totalPrice.toFixed(2)} ₾</span>
                  </div>
                  {mods.length > 0 && <span className={styles.mods}>{mods.join(' · ')}</span>}
                  <div className={styles.qty}>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.cartItemId, line.quantity - 1)}
                      aria-label={`${ka ? 'ერთით ნაკლები' : 'Remove one'} ${name}`}
                    >
                      −
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(line.cartItemId, line.quantity + 1)}
                      aria-label={`${ka ? 'ერთით მეტი' : 'Add one'} ${name}`}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.totals}>
            <div className={styles.row}>
              <span>{ka ? 'ჯამი' : 'Subtotal'}</span>
              <span className={styles.num}>{subtotal.toFixed(2)} ₾</span>
            </div>
            <div className={styles.row}>
              <span>{orderType === 'pickup' ? (ka ? 'გატანა' : 'Pickup') : ka ? 'მიწოდება' : 'Delivery'}</span>
              <span className={styles.num}>
                {deliveryFee === 0 ? (ka ? 'უფასო' : 'Free') : `${deliveryFee.toFixed(2)} ₾`}
              </span>
            </div>
            <div className={styles.grand}>
              <span>{ka ? 'სულ' : 'Total'}</span>
              <span>{grandTotal.toFixed(2)} ₾</span>
            </div>
            <button type="button" onClick={onCheckout} className={styles.checkout}>
              <span>{ka ? 'გაფორმება' : 'Checkout'}</span>
              <ArrowIcon size={20} />
            </button>
          </div>
        </>
      )}
    </aside>
  );
};

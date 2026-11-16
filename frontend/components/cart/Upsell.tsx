'use client';

import React from 'react';
import { getMenuItemById } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './Upsell.module.scss';

/** Sides and a shake that pair with burgers — shown as "Goes well with" in the cart. */
const PAIRINGS = ['parmesan-truffle-fries', 'golden-crinkle-fries', 'roasted-vanilla-bean-shake', 'onion-rings'];

interface UpsellProps {
  /** How many suggestions to show */
  limit?: number;
  /** Horizontal scrolling tiles (phone cart) or a compact list (panels) */
  variant?: 'list' | 'tiles';
}

export const Upsell: React.FC<UpsellProps> = ({ limit = 1, variant = 'list' }) => {
  const { items, addItem } = useCart();
  const { language, getItemTranslation } = useLanguage();
  const ka = language === 'ka';

  const inCart = new Set(items.map((i) => i.item.id));
  const suggestions = PAIRINGS.map((id) => getMenuItemById(id))
    .filter((m): m is NonNullable<typeof m> => Boolean(m) && !inCart.has(m!.id) && !m!.requiredChoice)
    .slice(0, limit);

  if (items.length === 0 || suggestions.length === 0) return null;

  return (
    <div className={styles.upsell}>
      <span className={styles.label}>{ka ? 'კარგად უხდება' : 'Goes well with'}</span>
      <div className={variant === 'tiles' ? styles.tiles : styles.list}>
        {suggestions.map((m) => {
          const name = getItemTranslation(m.id).name || m.name;
          return (
            <div key={m.id} className={styles.row}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={m.imageSlot} alt="" className={styles.thumb} loading="lazy" />
              <span className={styles.info}>
                <span className={styles.name}>{name}</span>
                <span className={styles.price}>{m.price.toFixed(2)} ₾</span>
              </span>
              <button
                type="button"
                onClick={() => addItem(m, 1, { removedIngredientIds: [], extraQuantities: {}, notes: '' })}
                className={styles.add}
                aria-label={`${ka ? 'დამატება' : 'Add'} ${name}`}
              >
                + {ka ? 'დამატება' : 'Add'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

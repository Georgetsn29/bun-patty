'use client';

import React, { useState } from 'react';
import { MenuItem, getCalorieRange } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { Check, Plus, SlidersHorizontal } from 'lucide-react';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onOpenDetails }) => {
  const { addItem } = useCart();
  const { t, getItemTranslation, language } = useLanguage();
  const ka = language === 'ka';
  const [justAdded, setJustAdded] = useState(false);

  const translated = getItemTranslation(item.id);
  const displayName = translated.name || item.name;
  const displayBadge = translated.badge || item.badge;

  const calorieRange = getCalorieRange(item);
  const caloriesText =
    calorieRange.min === calorieRange.max
      ? `${calorieRange.min} ${t('common.calories')}`
      : `${calorieRange.min}–${calorieRange.max} ${t('common.calories')}`;

  const hasUnselectedRequiredChoice = Boolean(
    item.requiredChoice && !item.requiredChoice.defaultOptionId
  );

  const isCustomizable =
    Boolean(item.requiredChoice) ||
    (item.includedIngredients && item.includedIngredients.length > 0) ||
    (item.availableExtras && item.availableExtras.length > 0);

  const handleQuickAdd = () => {
    if (hasUnselectedRequiredChoice) {
      onOpenDetails(item);
      return;
    }

    addItem(item, 1, {
      selectedChoiceId: item.requiredChoice?.defaultOptionId,
      removedIngredientIds: [],
      extraQuantities: {},
      notes: '',
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const addLabel = justAdded
    ? stripCheck(t('common.added'))
    : hasUnselectedRequiredChoice
      ? ka ? 'გემოს არჩევა' : 'Choose flavor'
      : ka ? 'დამატება' : 'Add';

  const meta = item.beefWeight || item.volume || caloriesText;

  return (
    <article className={styles.card}>
      <button
        type="button"
        onClick={() => onOpenDetails(item)}
        className={styles.imageContainer}
        aria-label={`${displayName} — ${item.price.toFixed(2)} ₾`}
      >
        {displayBadge && <span className={styles.badgeTag}>{displayBadge}</span>}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageSlot}
          alt=""
          className={styles.cardImage}
          style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
          loading="lazy"
          decoding="async"
          width={400}
          height={300}
        />
      </button>

      <div className={styles.infoWrap}>
        <div className={styles.namePriceLine}>
          <h3 className={styles.title}>
            <button type="button" onClick={() => onOpenDetails(item)} className={styles.titleButton}>
              {displayName}
            </button>
          </h3>
          <span className={styles.price}>{item.price.toFixed(2)} ₾</span>
        </div>

        <p className={styles.shortDescription}>{translated.description || item.description}</p>

        <div className={styles.actionsRow}>
          <span className={styles.meta}>
            <span className={styles.metaWide}>{meta}</span>
            <span className={styles.metaPhone}>{item.price.toFixed(2)} ₾</span>
          </span>
          <div className={styles.actionBtns}>
            {isCustomizable && !hasUnselectedRequiredChoice && (
              <button
                type="button"
                onClick={() => onOpenDetails(item)}
                className={styles.customizeBtn}
                aria-label={`${ka ? 'მორგება' : 'Customize'} ${displayName}`}
                title={ka ? 'მორგება' : 'Customize'}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
              </button>
            )}
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`${styles.addBtn} ${justAdded ? styles.added : ''}`}
              aria-label={`${addLabel} ${displayName}`}
              aria-live="polite"
            >
              <span>{addLabel}</span>
              {justAdded ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

/** Translations for "added" end with "✓"; we show our own check icon. */
function stripCheck(s: string) {
  return s.replace(/\s*✓\s*$/, '');
}

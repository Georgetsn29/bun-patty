'use client';

import React, { useState } from 'react';
import { MenuItem } from '@/data/menu';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  item: MenuItem;
  onOpenDetails: (item: MenuItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ item, onOpenDetails }) => {
  const { addItem } = useCart();
  const { t, getItemTranslation, language } = useLanguage();
  const [justAdded, setJustAdded] = useState(false);

  const translated = getItemTranslation(item.id);
  const displayName = translated.name || item.name;
  const displayBadge = translated.badge || item.badge;

  const hasUnselectedRequiredChoice = Boolean(
    item.requiredChoice && !item.requiredChoice.defaultOptionId
  );

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
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
    setTimeout(() => {
      setJustAdded(false);
    }, 1200);
  };

  const isCustomizable =
    Boolean(item.requiredChoice) ||
    (item.includedIngredients && item.includedIngredients.length > 0) ||
    (item.availableExtras && item.availableExtras.length > 0);

  return (
    <article className={styles.card}>
      {/* 16:10 Rounded Image Container */}
      <div
        onClick={() => onOpenDetails(item)}
        className={styles.imageContainer}
        title={`${displayName} - ${item.price.toFixed(2)} ₾`}
      >
        {displayBadge && (
          <span className={styles.badgeTag}>{displayBadge}</span>
        )}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.imageSlot}
          alt={displayName}
          className={styles.cardImage}
          style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
          loading="lazy"
          decoding="async"
          width={400}
          height={250}
        />
      </div>

      {/* Info: Name & Price on first line (left-aligned name, right-aligned price on mobile) */}
      <div className={styles.infoWrap}>
        <div onClick={() => onOpenDetails(item)} className={styles.namePriceLine}>
          <h3 className={styles.title}>{displayName}</h3>
          <span className={styles.price}>{item.price.toFixed(2)} ₾</span>
        </div>

        {/* Short description - 2 line clamp */}
        <p className={styles.shortDescription}>
          {translated.description || item.description}
        </p>

        {/* Desktop Customize Link */}
        {isCustomizable && (
          <button
            type="button"
            onClick={() => onOpenDetails(item)}
            className={styles.desktopCustomizeLink}
            aria-label={`${t('common.customizeIngredients')} ${displayName}`}
          >
            {t('common.customizeIngredients')}
          </button>
        )}

        {/* Desktop Action Controls */}
        <div className={styles.desktopActionsRow}>
          <button
            type="button"
            onClick={handleQuickAdd}
            className={`${styles.addToCartBtn} ${justAdded ? styles.added : ''}`}
            aria-label={`${t('common.addToCart')} ${displayName}`}
          >
            {justAdded ? t('common.added') : t('common.addToCart')}
          </button>
        </div>

        {/* Mobile Full-Width Button (at least 48px high) */}
        <div className={styles.mobileActionButtonWrap}>
          {hasUnselectedRequiredChoice || (item.includedIngredients && item.includedIngredients.length > 0) ? (
            <button
              type="button"
              onClick={() => onOpenDetails(item)}
              className={styles.mobilePrimaryBtn}
              aria-label={`${t('common.customizeIngredients')} ${displayName}`}
            >
              {hasUnselectedRequiredChoice
                ? language === 'ka'
                  ? 'გემოს არჩევა'
                  : 'Choose flavor'
                : language === 'ka'
                ? 'მორგება'
                : 'Customize'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleQuickAdd}
              className={`${styles.mobilePrimaryBtn} ${justAdded ? styles.added : ''}`}
              aria-label={`${t('common.addToCart')} ${displayName}`}
            >
              {justAdded
                ? t('common.added')
                : language === 'ka'
                ? 'დამატება'
                : 'Add'}
            </button>
          )}
        </div>
      </div>
    </article>
  );
};

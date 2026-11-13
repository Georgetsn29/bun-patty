'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MenuItem, computeNutrition } from '@/data/menu';
import { useCart, ItemCustomization } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { IngredientToggleIcon } from './IngredientToggleIcon';
import { X as CloseIcon } from 'lucide-react';
import styles from './ProductModal.module.scss';

interface ProductModalProps {
  item: MenuItem | null;
  initialCustomization?: ItemCustomization | null;
  editingCartItemId?: string | null;
  initialQuantity?: number;
  onClose: () => void;
}

const ProductModalContent: React.FC<{
  item: MenuItem;
  initialCustomization?: ItemCustomization | null;
  editingCartItemId?: string | null;
  initialQuantity?: number;
  onClose: () => void;
}> = ({ item, initialCustomization, editingCartItemId, initialQuantity, onClose }) => {
  const { addItem, updateCartItem, setIsCartOpen } = useCart();
  const {
    t,
    getItemTranslation,
    getIngredientName,
    getExtraName,
    getChoiceOptionName,
    getChoiceGroupTitle,
    language,
  } = useLanguage();

  const [quantity, setQuantity] = useState(initialQuantity || 1);
  const [selectedChoiceId, setSelectedChoiceId] = useState<string | undefined>(
    initialCustomization?.selectedChoiceId !== undefined
      ? initialCustomization.selectedChoiceId
      : item.requiredChoice?.defaultOptionId
  );
  const [removedIngredientIds, setRemovedIngredientIds] = useState<string[]>(
    initialCustomization?.removedIngredientIds || []
  );
  const [extraQuantities, setExtraQuantities] = useState<Record<string, number>>(
    initialCustomization?.extraQuantities || {}
  );
  const [specialInstructions, setSpecialInstructions] = useState(
    initialCustomization?.notes || ''
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);

  const translated = getItemTranslation(item.id);
  const displayName = translated.name || item.name;
  const displayDesc = translated.longDescription || item.longDescription || item.description;
  const displayBadge = translated.badge || item.badge;
  const displayBeefWeight = translated.beefWeight || item.beefWeight;
  const displayVolume = translated.volume || item.volume;
  const displayAllergens = translated.allergens || (item.allergens ? item.allergens.join(', ') : '');

  // Handle escape key and browser back button
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    // Support phone back button navigation
    const handlePopState = () => {
      onClose();
    };
    window.history.pushState({ modalOpen: true }, '');
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [onClose]);

  // Handle swipe down to close on mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    if (scrollRef.current && scrollRef.current.scrollTop <= 10) {
      touchStartY.current = e.touches[0].clientY;
      touchStartX.current = e.touches[0].clientX;
    } else {
      touchStartY.current = null;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = endY - touchStartY.current;
    const deltaX = endX - (touchStartX.current || 0);

    // Trigger close if dragged down more than 70px with mostly vertical motion
    if (deltaY > 70 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
      onClose();
    }
    touchStartY.current = null;
  };

  // Toggle included ingredient on/off (free to remove unless required)
  const toggleIngredient = (id: string, isRequired?: boolean) => {
    if (isRequired) return;
    setRemovedIngredientIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Adjust extra count (0 to 3)
  const adjustExtraQuantity = (extraId: string, delta: number, maxQty: number = 3) => {
    setExtraQuantities((prev) => {
      const current = prev[extraId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      return { ...prev, [extraId]: next };
    });
  };

  // Immediate unit price calculation in Georgian Lari
  const extrasCost = Object.entries(extraQuantities).reduce((sum, [extraId, count]) => {
    if (count <= 0) return sum;
    const opt = item.availableExtras?.find((e) => e.id === extraId);
    return sum + (opt ? opt.price * count : 0);
  }, 0);

  const selectedChoiceOpt = item.requiredChoice?.options.find((o) => o.id === selectedChoiceId);
  const choicePriceAdj = selectedChoiceOpt?.priceAdjustment || 0;

  const unitPrice = item.price + choicePriceAdj + extrasCost;
  const totalPrice = unitPrice * quantity;

  const hasRequiredChoice = Boolean(item.requiredChoice);
  const isChoiceSelected = Boolean(selectedChoiceId);

  // Live nutrition per serving (approximate placeholder values from menu data)
  const nutrition = computeNutrition(item, {
    selectedChoiceId,
    removedIngredientIds,
    extraQuantities,
  });
  const showNutritionValues = !hasRequiredChoice || isChoiceSelected;
  const nutritionStats = [
    { key: 'calories', label: t('nutrition.calories'), value: nutrition.calories, unit: t('common.calories') },
    { key: 'netCarbs', label: t('nutrition.netCarbs'), value: nutrition.netCarbs, unit: t('nutrition.grams') },
    { key: 'fat', label: t('nutrition.fat'), value: nutrition.fat, unit: t('nutrition.grams') },
    { key: 'protein', label: t('nutrition.protein'), value: nutrition.protein, unit: t('nutrition.grams') },
  ].map((stat) => (showNutritionValues ? stat : { ...stat, value: '–' as string | number, unit: '' }));
  const canSubmit = !hasRequiredChoice || isChoiceSelected;

  const handleSubmit = () => {
    if (!canSubmit) return;

    const customization: ItemCustomization = {
      selectedChoiceId,
      removedIngredientIds,
      extraQuantities,
      notes: specialInstructions,
    };

    if (editingCartItemId) {
      updateCartItem(editingCartItemId, customization, quantity);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
        setIsCartOpen(true);
      }, 250);
    } else {
      addItem(item, quantity, customization);
      setIsSaved(true);
      setTimeout(() => {
        onClose();
        setIsCartOpen(true);
      }, 250);
    }
  };

  // Description length check for 3-line toggle
  const isLongDescription = displayDesc && displayDesc.length > 130;

  return (
    <div className={styles.overlay}>
      <div onClick={onClose} className={styles.backdrop} />

      <div
        className={styles.dialog}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
        aria-label={displayName}
      >
        {/* Swipe drag indicator bar for mobile */}
        <div className={styles.dragIndicator} aria-hidden="true" />

        {/* Scrollable Content Area */}
        <div ref={scrollRef} className={styles.scrollArea}>
          {/* 1. Full-Width Image at the top with 44px round close button */}
          <div className={styles.imageSlot}>
            {displayBadge && (
              <span className={styles.modalBadge}>{displayBadge}</span>
            )}

            {/* 44px round close button over top-right of image on dark translucent background */}
            <button
              type="button"
              onClick={onClose}
              className={styles.imageCloseButton}
              aria-label={t('common.close') || 'Close'}
            >
              <CloseIcon size={22} aria-hidden="true" />
            </button>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageSlot}
              alt={displayName}
              className={styles.modalImage}
              style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
            />
          </div>

          {/* 2. Item Name and Price */}
          <div className={styles.headerInfo}>
            <div className={styles.titleRow}>
              <h2 className={styles.itemTitle}>{displayName}</h2>
              <span className={styles.itemPrice}>{unitPrice.toFixed(2)} ₾</span>
            </div>

            {/* 3. Small line with prep time (calories live in the nutrition row below) */}
            {item.prepTime && (
              <p className={styles.prepCalLine}>
                <span>{t('common.prepTime')}: {item.prepTime}</span>
              </p>
            )}
          </div>

          {/* Nutrition per serving, recalculated live for choice, removals, and extras */}
          <div className={styles.nutritionBlock} aria-live="polite">
            <dl className={styles.nutritionGrid}>
              {nutritionStats.map((stat) => (
                <div key={stat.key} className={styles.nutritionBox}>
                  <dt className={styles.nutritionLabel}>{stat.label}</dt>
                  <dd className={styles.nutritionValue}>
                    {stat.value}
                    <span className={styles.nutritionUnit}> {stat.unit}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <p className={styles.nutritionNote}>
              {!isChoiceSelected && hasRequiredChoice
                ? t('nutrition.chooseOptionNote')
                : t('nutrition.approximateNote')}
            </p>
          </div>

          {/* 4. Short Description (3 lines clamp with "Read more / Read less" toggle if longer) */}
          <div className={styles.descWrap}>
            <p className={`${styles.description} ${!isDescExpanded ? styles.clamped : ''}`}>
              {displayDesc}
            </p>
            {isLongDescription && (
              <button
                type="button"
                onClick={() => setIsDescExpanded(!isDescExpanded)}
                className={styles.readMoreBtn}
              >
                {isDescExpanded
                  ? language === 'ka'
                    ? 'ნაკლების ჩვენება'
                    : 'Read less'
                  : language === 'ka'
                  ? 'მეტის წაკითხვა'
                  : 'Read more'}
              </button>
            )}
          </div>

          {/* Details Bar: Beef Weight, Volume & Allergens */}
          {(displayBeefWeight || displayVolume || displayAllergens) && (
            <div className={styles.metaBox}>
              {displayBeefWeight && (
                <div className={styles.metaRow}>
                  <strong style={{ color: '#FFFFFF' }}>{t('common.beefWeight')}:</strong>{' '}
                  <span>{displayBeefWeight}</span>
                </div>
              )}
              {displayVolume && (
                <div className={styles.metaRow}>
                  <strong style={{ color: '#FFFFFF' }}>{t('common.volume')}:</strong>{' '}
                  <span>{displayVolume}</span>
                </div>
              )}
              {displayAllergens && (
                <div className={styles.metaRow}>
                  <strong style={{ color: '#FFFFFF' }}>{t('common.allergens')}:</strong>{' '}
                  <span>{displayAllergens}</span>
                </div>
              )}
            </div>
          )}

          {/* 5. Required Single Choice Group (Water choice, Fresh juice flavor, etc.) */}
          {item.requiredChoice && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionHeading}>
                  {getChoiceGroupTitle(item.requiredChoice.id, item.requiredChoice.title)}
                </h4>
                <span className={styles.requiredBadge}>{t('common.required')}</span>
              </div>

              <div
                className={styles.choiceGroupList}
                role="radiogroup"
                aria-label={getChoiceGroupTitle(item.requiredChoice.id, item.requiredChoice.title)}
              >
                {item.requiredChoice.options.map((opt, _idx, allOpts) => {
                  const isSelected = selectedChoiceId === opt.id;
                  const optName = getChoiceOptionName(opt.id, opt.name);
                  // When options are priced differently (e.g. Still vs Sparkling water),
                  // show the full price of every option so they can be compared.
                  const optionsDifferInPrice = allOpts.some((o) => (o.priceAdjustment || 0) !== 0);
                  const optionPrice = item.price + (opt.priceAdjustment || 0);

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedChoiceId(opt.id)}
                      className={`${styles.choiceRow} ${isSelected ? styles.choiceSelected : ''}`}
                    >
                      <div className={styles.choiceLeft}>
                        {opt.color && (
                          <span
                            className={styles.flavorColorDot}
                            style={{ backgroundColor: opt.color }}
                            aria-hidden="true"
                          />
                        )}
                        <span className={styles.choiceName}>{optName}</span>
                        {optionsDifferInPrice && (
                          <span className={styles.choicePriceAdj}>
                            {optionPrice.toFixed(2)} ₾
                          </span>
                        )}
                      </div>

                      <div
                        className={`${styles.radioCircle} ${isSelected ? styles.radioSelected : ''}`}
                        aria-hidden="true"
                      >
                        {isSelected && <span className={styles.radioInnerDot} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Included Ingredients with Animated Check / X buttons */}
          {item.includedIngredients && item.includedIngredients.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionHeading}>{t('common.included')}</h4>
                <span className={styles.sectionSubNote}>
                  {t('modal.toggleNote')}
                </span>
              </div>

              <div className={styles.ingredientList}>
                {item.includedIngredients.map((ing) => {
                  const isRemoved = removedIngredientIds.includes(ing.id);
                  const isIncluded = !isRemoved;
                  const ingredientName = getIngredientName(ing.id, ing.name);
                  const isRequired = !!ing.isRequired;

                  const ariaLabel = isRequired
                    ? `${ingredientName} (${t('common.required')})`
                    : isIncluded
                    ? language === 'ka'
                      ? `ამოიღეთ ${ingredientName}`
                      : `Remove ${ingredientName}`
                    : language === 'ka'
                    ? `დააბრუნეთ ${ingredientName}`
                    : `Add ${ingredientName} back`;

                  if (isRequired) {
                    return (
                      <div
                        key={ing.id}
                        className={`${styles.ingredientRow} ${styles.requiredRow}`}
                        aria-label={ariaLabel}
                      >
                        <div className={styles.ingredientLeft}>
                          <span className={styles.ingredientName}>{ingredientName}</span>
                          <span className={styles.requiredBadge}>{t('common.required')}</span>
                        </div>
                        <IngredientToggleIcon isIncluded={true} isRequired={true} />
                      </div>
                    );
                  }

                  return (
                    <button
                      key={ing.id}
                      type="button"
                      onClick={() => toggleIngredient(ing.id, false)}
                      aria-pressed={isIncluded}
                      aria-label={ariaLabel}
                      className={`${styles.ingredientRow} ${
                        isRemoved ? styles.removedRow : styles.selectedRow
                      }`}
                    >
                      <div className={styles.ingredientLeft}>
                        <span
                          className={`${styles.ingredientName} ${
                            isRemoved ? styles.struckThrough : ''
                          }`}
                        >
                          {ingredientName}
                        </span>
                      </div>
                      <IngredientToggleIcon isIncluded={isIncluded} isRequired={false} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 6. Extras (Paid additions, up to 3 each) */}
          {item.availableExtras && item.availableExtras.length > 0 && (
            <div className={styles.sectionBlock}>
              <div className={styles.sectionHeader}>
                <h4 className={styles.sectionHeading}>{t('modal.extrasHeading')}</h4>
                <span className={styles.sectionSubNote}>
                  {t('modal.extrasSubNote')}
                </span>
              </div>

              <div className={styles.extrasList}>
                {item.availableExtras.map((extra) => {
                  const currentCount = extraQuantities[extra.id] || 0;
                  const maxQty = extra.maxQuantity || 3;
                  const extraName = getExtraName(extra.id, extra.name);

                  return (
                    <div
                      key={extra.id}
                      className={`${styles.extraRow} ${currentCount > 0 ? styles.hasExtra : ''}`}
                    >
                      <div className={styles.extraInfo}>
                        <span className={styles.extraName}>{extraName}</span>
                        <span className={styles.extraPrice}>
                          +{extra.price.toFixed(2)} ₾
                        </span>
                      </div>

                      <div className={styles.extraStepper}>
                        <button
                          type="button"
                          onClick={() => adjustExtraQuantity(extra.id, -1, maxQty)}
                          disabled={currentCount <= 0}
                          className={styles.stepperBtn}
                          aria-label={`Decrease ${extraName}`}
                        >
                          -
                        </button>
                        <span
                          className={`${styles.stepperQty} ${
                            currentCount > 0 ? styles.active : ''
                          }`}
                        >
                          {currentCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => adjustExtraQuantity(extra.id, 1, maxQty)}
                          disabled={currentCount >= maxQty}
                          className={styles.stepperBtn}
                          aria-label={`Increase ${extraName}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 7. Kitchen Note */}
          <div className={styles.sectionBlock}>
            <label className={styles.sectionHeading}>{t('modal.kitchenNoteLabel')}</label>
            <textarea
              rows={2}
              placeholder={t('modal.kitchenNotePlaceholder')}
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              className={styles.instructionsTextarea}
            />
            <span style={{ fontSize: '0.72rem', color: '#616F71', marginTop: '4px', display: 'block' }}>
              {t('modal.kitchenNoteDisclaimer')}
            </span>
          </div>
        </div>

        {/* Sticky Bottom Bar: Compact stepper + full-width "Add · 49.90 ₾" on one single line */}
        <div className={styles.bottomBar}>
          <div className={styles.mainQtyStepper}>
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className={styles.mainQtyBtn}
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className={styles.mainQtyDisplay}>{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(quantity + 1)}
              className={styles.mainQtyBtn}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`${styles.submitBtn} ${isSaved ? styles.saved : ''} ${!canSubmit ? styles.disabledBtn : ''}`}
          >
            {isSaved
              ? t('common.added')
              : !canSubmit
              ? t('modal.chooseFlavorFirst')
              : editingCartItemId
              ? language === 'ka'
                ? `განახლება · ${totalPrice.toFixed(2)} ₾`
                : `Update · ${totalPrice.toFixed(2)} ₾`
              : language === 'ka'
              ? `დამატება · ${totalPrice.toFixed(2)} ₾`
              : `Add · ${totalPrice.toFixed(2)} ₾`}
          </button>
        </div>
      </div>
    </div>
  );
};

export const ProductModal: React.FC<ProductModalProps> = ({
  item,
  initialCustomization,
  editingCartItemId,
  initialQuantity,
  onClose,
}) => {
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [item]);

  if (!item) return null;

  return (
    <ProductModalContent
      key={`${item.id}-${editingCartItemId || 'new'}`}
      item={item}
      initialCustomization={initialCustomization}
      editingCartItemId={editingCartItemId}
      initialQuantity={initialQuantity}
      onClose={onClose}
    />
  );
};

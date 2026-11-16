'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, CATEGORIES, MenuItem } from '@/data/menu';
import { ProductCard } from '@/components/product/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { MenuCartPanel } from '@/components/cart/MenuCartPanel';
import { Search, ArrowUpDown, Check, X, ChevronDown, SearchX } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import kaData from '@/src/locales/ka.json';
import enData from '@/src/locales/en.json';
import styles from './ShopView.module.scss';

interface SortDropdownProps {
  className: string;
  value: string;
  options: { value: string; labelKey: string }[];
  onChange: (value: string) => void;
  t: (key: string) => string;
}

const SortDropdown: React.FC<SortDropdownProps> = ({ className, value, options, onChange, t }) => {
  const [open, setOpen] = useState(false);
  const [focusIdx, setFocusIdx] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const listId = React.useId();
  const active = options.find((o) => o.value === value) || options[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open]);

  const openMenu = () => {
    setFocusIdx(Math.max(0, options.findIndex((o) => o.value === value)));
    setOpen(true);
  };

  const select = (v: string) => {
    onChange(v);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusIdx((i) => (i + 1) % options.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusIdx((i) => (i - 1 + options.length) % options.length);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      select(options[focusIdx].value);
    }
  };

  return (
    <div ref={rootRef} className={`${className} ${styles.sortDropdown}`} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={styles.sortTrigger}
        onClick={() => (open ? setOpen(false) : openMenu())}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-label={t('shop.sortLabel')}
      >
        <ArrowUpDown size={14} className={styles.sortIcon} aria-hidden="true" />
        <span className={styles.sortTriggerText}>
          {t('shop.sortPrefix')}{t(active.labelKey)}
        </span>
        <ChevronDown
          size={14}
          className={`${styles.sortChevron} ${open ? styles.sortChevronOpen : ''}`}
          aria-hidden="true"
        />
      </button>
      {open && (
        <ul id={listId} role="listbox" className={styles.sortMenu} aria-label={t('shop.sortLabel')}>
          {options.map((opt, i) => {
            const selected = opt.value === value;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={selected}
                className={`${styles.sortMenuItem} ${selected ? styles.sortMenuItemSelected : ''} ${
                  i === focusIdx ? styles.sortMenuItemFocused : ''
                }`}
                onMouseEnter={() => setFocusIdx(i)}
                onClick={() => select(opt.value)}
              >
                <span>{t(opt.labelKey)}</span>
                {selected && <Check size={14} className={styles.checkIcon} aria-hidden="true" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

interface ShopViewProps {
  onOpenProductModal: (item: MenuItem) => void;
  onNavigate?: (route: string) => void;
}

export const ShopView: React.FC<ShopViewProps> = ({ onOpenProductModal, onNavigate }) => {
  const { t, getCategoryName, language } = useLanguage();
  const { orderType, setOrderType } = useCart();
  const ka = language === 'ka';
  const reduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<string>(CATEGORIES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc'>('default');
  const [isSortSheetOpen, setIsSortSheetOpen] = useState(false);

  const categoryBtnRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const chipsScrollAreaRef = useRef<HTMLDivElement | null>(null);
  const isProgrammaticScrollRef = useRef(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeCategoryRef = useRef<string>(CATEGORIES[0]);

  // Category item counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    CATEGORIES.forEach((cat) => {
      counts[cat] = MENU_ITEMS.filter((item) => item.category === cat).length;
    });
    return counts;
  }, []);

  // Sort options definition
  const sortOptions = useMemo(
    () => [
      { value: 'default', labelKey: 'shop.sortDefault' },
      { value: 'price-asc', labelKey: 'shop.sortPriceAsc' },
      { value: 'price-desc', labelKey: 'shop.sortPriceDesc' },
    ],
    []
  );

  const activeSortOption = sortOptions.find((opt) => opt.value === sortBy) || sortOptions[0];

  // Group items by category with bilingual search & explicit sortOrder
  const filteredAndSortedItemsByCategory = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const result: Record<string, MenuItem[]> = {};

    CATEGORIES.forEach((cat) => {
      let items = MENU_ITEMS.filter((item) => item.category === cat);

      if (q) {
        items = items.filter((item) => {
          const kaItem = (kaData as any).items?.[item.id] || {};
          const enItem = (enData as any).items?.[item.id] || {};

          // Check English name, description, ingredients
          const matchEn =
            item.name.toLowerCase().includes(q) ||
            item.description.toLowerCase().includes(q) ||
            enItem.name?.toLowerCase().includes(q) ||
            enItem.description?.toLowerCase().includes(q) ||
            item.includedIngredients?.some((ing) => ing.name.toLowerCase().includes(q));

          // Check Georgian name, description, ingredients
          const matchKa =
            kaItem.name?.toLowerCase().includes(q) ||
            kaItem.description?.toLowerCase().includes(q) ||
            item.includedIngredients?.some((ing) => {
              const kaIng = (kaData as any).ingredients?.[ing.id];
              return kaIng && kaIng.toLowerCase().includes(q);
            });

          return matchEn || matchKa;
        });
      }

      // Sorting
      if (sortBy === 'price-asc') {
        items.sort((a, b) => a.price - b.price);
      } else if (sortBy === 'price-desc') {
        items.sort((a, b) => b.price - a.price);
      } else {
        // Explicit sort order (original burgers first, then new ones)
        items.sort((a, b) => a.sortOrder - b.sortOrder);
      }

      result[cat] = items;
    });

    return result;
  }, [searchQuery, sortBy]);

  // Total results count across all categories
  const totalResults = useMemo(
    () =>
      Object.values(filteredAndSortedItemsByCategory).reduce(
        (acc, arr) => acc + arr.length,
        0
      ),
    [filteredAndSortedItemsByCategory]
  );

  // Scroll active chip horizontally within the toolbar without any vertical page jump
  const scrollActiveChipHorizontally = (category: string) => {
    const container = chipsScrollAreaRef.current;
    const chip = categoryBtnRefs.current[category];
    if (!container || !chip) return;

    const targetLeft = chip.offsetLeft - container.clientWidth / 2 + chip.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  };

  // Scroll-spy using IntersectionObserver for sticky category highlighting
  useEffect(() => {
    const getTopOffset = () => {
      const headerHeight =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) ||
        (window.innerWidth >= 768 ? 80 : 62);
      const toolbarHeight =
        toolbarRef.current?.offsetHeight || (window.innerWidth >= 1024 ? 64 : 118);
      return headerHeight + toolbarHeight;
    };

    let observer: IntersectionObserver | null = null;

    const setupObserver = () => {
      if (observer) observer.disconnect();

      const topOffset = getTopOffset();
      const options: IntersectionObserverInit = {
        root: null,
        rootMargin: `-${topOffset + 4}px 0px -55% 0px`,
        threshold: [0, 0.1, 0.2],
      };

      const intersectingMap = new Map<string, IntersectionObserverEntry>();

      observer = new IntersectionObserver((entries) => {
        if (isProgrammaticScrollRef.current) return;

        entries.forEach((entry) => {
          const cat = (entry.target as HTMLElement).dataset.category;
          if (cat) {
            intersectingMap.set(cat, entry);
          }
        });

        const visibleEntries = Array.from(intersectingMap.values()).filter((e) => e.isIntersecting);

        if (visibleEntries.length > 0) {
          visibleEntries.sort(
            (a, b) =>
              Math.abs(a.boundingClientRect.top - topOffset) -
              Math.abs(b.boundingClientRect.top - topOffset)
          );
          const topVisible = visibleEntries[0];
          const cat = (topVisible.target as HTMLElement).dataset.category;
          if (cat && cat !== activeCategoryRef.current) {
            activeCategoryRef.current = cat;
            setActiveCategory(cat);
            scrollActiveChipHorizontally(cat);
          }
        }
      }, options);

      CATEGORIES.forEach((cat) => {
        const id = `section-${cat.toLowerCase().replace(/\s+/g, '-')}`;
        const el = document.getElementById(id);
        if (el) observer?.observe(el);
      });
    };

    setupObserver();

    // Edge scroll detection for top and bottom of page
    const handleScrollEdges = () => {
      if (isProgrammaticScrollRef.current) return;

      if (window.scrollY < 40) {
        if (activeCategoryRef.current !== CATEGORIES[0]) {
          activeCategoryRef.current = CATEGORIES[0];
          setActiveCategory(CATEGORIES[0]);
          scrollActiveChipHorizontally(CATEGORIES[0]);
        }
        return;
      }

      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50) {
        const lastCat = CATEGORIES[CATEGORIES.length - 1];
        if (activeCategoryRef.current !== lastCat) {
          activeCategoryRef.current = lastCat;
          setActiveCategory(lastCat);
          scrollActiveChipHorizontally(lastCat);
        }
      }
    };

    window.addEventListener('scroll', handleScrollEdges, { passive: true });
    window.addEventListener('resize', setupObserver, { passive: true });

    return () => {
      if (observer) observer.disconnect();
      window.removeEventListener('scroll', handleScrollEdges);
      window.removeEventListener('resize', setupObserver);
    };
  }, [totalResults]);

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  const scrollToCategory = (category: string) => {
    setActiveCategory(category);
    activeCategoryRef.current = category;
    scrollActiveChipHorizontally(category);

    isProgrammaticScrollRef.current = true;
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    const sectionId = `section-${category.toLowerCase().replace(/\s+/g, '-')}`;
    const el = document.getElementById(sectionId);
    if (el) {
      const headerHeight =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) ||
        (window.innerWidth >= 768 ? 80 : 62);
      const toolbarHeight =
        toolbarRef.current?.offsetHeight || (window.innerWidth >= 1024 ? 64 : 118);
      const totalOffset = headerHeight + toolbarHeight + 12;
      const targetY = el.getBoundingClientRect().top + window.scrollY - totalOffset;

      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: 'smooth',
      });

      // Update URL hash with history.replaceState only (never window.location.hash = ... to prevent browser jumps)
      if (typeof window !== 'undefined' && window.history?.replaceState) {
        window.history.replaceState(null, '', `#section-${category.toLowerCase().replace(/\s+/g, '-')}`);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 800);
    } else {
      isProgrammaticScrollRef.current = false;
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSortBy('default');
  };

  const isFiltered = searchQuery.trim().length > 0 || sortBy !== 'default';

  return (
    <div className={styles.shopWrapper}>
      {/* Page header */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>
            {ka ? `${MENU_ITEMS.length} პოზიცია · ფასები ლარში` : `${MENU_ITEMS.length} items · Prices in GEL`}
          </span>
          <h1 className={styles.heroTitle}>
            {ka ? 'მენიუ' : 'The menu'}
            <span className={styles.heroDot}>.</span>
          </h1>
        </div>
        <div className={styles.heroSide}>
          <div role="radiogroup" aria-label={ka ? 'შეკვეთის ტიპი' : 'Order type'} className={styles.modeToggle}>
            {(['pickup', 'delivery'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="radio"
                aria-checked={orderType === mode}
                onClick={() => setOrderType(mode)}
                className={`${styles.modeBtn} ${orderType === mode ? styles.modeBtnActive : ''}`}
              >
                {mode === 'pickup' ? (ka ? 'გატანა' : 'Pickup') : ka ? 'მიწოდება' : 'Delivery'}
              </button>
            ))}
          </div>
          <span className={styles.heroNote}>
            {orderType === 'pickup'
              ? ka
                ? 'მზადაა ~20 წუთში'
                : 'Ready in ~20 min'
              : ka
                ? '25–40 წთ · უფასო 50 ₾-დან'
                : '25–40 min · free over 50 ₾'}
          </span>
        </div>
      </header>

      {/* Sticky Combined Toolbar: Categories, Search, and Sort directly below header */}
      <div ref={toolbarRef} className={styles.stickyToolbar}>
        <div className={styles.toolbarContainer}>
          {/* Top Row: Category chips on left, Search (~280px) and Sort on right (Desktop) */}
          <div className={styles.toolbarMainRow}>
            {/* 1. Category Chips */}
            <div
              ref={chipsScrollAreaRef}
              className={styles.chipsScrollArea}
              role="tablist"
              aria-label="Menu categories"
            >
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    ref={(el) => {
                      categoryBtnRefs.current[cat] = el;
                    }}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => scrollToCategory(cat)}
                    className={`${styles.categoryChip} ${isActive ? styles.chipActive : ''}`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="menu-chip-pill"
                        className={styles.chipPill}
                        transition={
                          reduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 36 }
                        }
                        aria-hidden="true"
                      />
                    )}
                    <span className={styles.chipText}>{getCategoryName(cat)}</span>
                    <span className={styles.chipCount}>{categoryCounts[cat] || 0}</span>
                  </button>
                );
              })}
            </div>

            {/* 2. Desktop Search and Sort Controls (>= 1024px) */}
            <div className={styles.desktopControls}>
              <div className={styles.searchBox}>
                <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                <input
                  type="text"
                  placeholder={t('shop.searchPlaceholder') || 'Search burgers, sauces...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={styles.searchInput}
                  aria-label="Search menu"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className={styles.searchClear}
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>

              <SortDropdown
                className={styles.sortBox}
                value={sortBy}
                options={sortOptions}
                onChange={(v) => setSortBy(v as typeof sortBy)}
                t={t}
              />
            </div>
          </div>

          {/* Sub Row for Mobile and Tablet (< 1024px) */}
          <div className={styles.responsiveControlsRow}>
            {/* Search Box */}
            <div className={styles.searchBox}>
              <Search size={16} className={styles.searchIcon} aria-hidden="true" />
              <input
                type="text"
                placeholder={t('shop.searchPlaceholder') || 'Search burgers, sauces...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
                aria-label="Search menu"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className={styles.searchClear}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Tablet Sort Select (640px to 1023px) */}
            <SortDropdown
              className={styles.tabletSortBox}
              value={sortBy}
              options={sortOptions}
              onChange={(v) => setSortBy(v as typeof sortBy)}
              t={t}
            />

            {/* Phone Compact 44px Sort Icon Button (< 640px) */}
            <button
              type="button"
              onClick={() => setIsSortSheetOpen(true)}
              className={`${styles.phoneSortBtn} ${sortBy !== 'default' ? styles.phoneSortBtnActive : ''}`}
              aria-label={t('shop.sortLabel')}
              aria-haspopup="dialog"
              aria-expanded={isSortSheetOpen}
            >
              <ArrowUpDown size={18} />
              {sortBy !== 'default' && <span className={styles.sortActiveDot} />}
            </button>
          </div>

          {/* Active Filter & Results Strip (shown when search or sort is active) */}
          {isFiltered && (
            <div className={styles.activeFilterStrip}>
              <div className={styles.filterSummary}>
                <span className={styles.resultsCount}>
                  {totalResults} {t('shop.results')}
                </span>
                {searchQuery && (
                  <span className={styles.filterTag}>
                    “{searchQuery}”
                  </span>
                )}
                {sortBy !== 'default' && (
                  <span className={styles.filterTag}>
                    {t('shop.sortPrefix')}{t(activeSortOption.labelKey)}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={handleClearFilters}
                className={styles.clearFilterLink}
              >
                {t('shop.clearAll')}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Scrolling Menu Content */}
      <div className={styles.menuLayout}>
        {/* Wide screens: category column (canvas Menu board) */}
        <nav className={styles.sideNav} aria-label={ka ? 'კატეგორიები' : 'Categories'}>
          <div className={styles.sideSticky}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => scrollToCategory(cat)}
                className={`${styles.sideLink} ${activeCategory === cat ? styles.sideLinkActive : ''}`}
                aria-current={activeCategory === cat ? 'true' : undefined}
              >
                <span className={styles.sideLabel}>{getCategoryName(cat)}</span>
                <span className={styles.sideCount}>{String(categoryCounts[cat] || 0).padStart(2, '0')}</span>
              </button>
            ))}
            <label className={styles.sideSearch}>
              <span className={styles.sideSearchLabel}>{ka ? 'ძიება' : 'Search'}</span>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('shop.searchPlaceholder')}
                className={styles.sideSearchInput}
              />
            </label>
            <label className={styles.sideSearch}>
              <span className={styles.sideSearchLabel}>{t('shop.sortLabel')}</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className={styles.sideSearchInput}
              >
                {sortOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {t(o.labelKey)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </nav>

      <main className={styles.mainContent}>
        {totalResults === 0 ? (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>
              <SearchX size={24} aria-hidden="true" />
            </span>
            <p className={styles.emptyStateTitle}>{t('shop.noResultsTitle')}</p>
            <p className={styles.emptyStateDesc}>{t('shop.noResultsDesc')}</p>
            <button
              type="button"
              onClick={handleClearFilters}
              className={styles.emptyClearBtn}
            >
              {t('shop.clearSearch')}
            </button>
          </div>
        ) : (
          CATEGORIES.map((category, catIdx) => {
            const items = filteredAndSortedItemsByCategory[category];
            if (!items || items.length === 0) return null;

            const sectionId = `section-${category.toLowerCase().replace(/\s+/g, '-')}`;
            const mainItems = items.filter((item) => item.subgroup !== 'coffee');
            const coffeeItems = items.filter((item) => item.subgroup === 'coffee');

            return (
              <section
                key={category}
                id={sectionId}
                data-category={category}
                className={styles.menuSection}
              >
                <div className={styles.categoryHeader}>
                  <span className={styles.categoryIndex}>
                    {String(catIdx + 1).padStart(2, '0')}
                  </span>
                  <h2 className={styles.categoryTitle}>{getCategoryName(category)}</h2>
                  <span className={styles.categoryCount}>
                    {items.length} {ka ? 'კერძი' : items.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                {/* Unified Item Grid for ALL categories (subgroups such as Coffee follow under their own subheading) */}
                {mainItems.length > 0 && (
                  <div className={styles.productGrid}>
                    {mainItems.map((item) => (
                      <ProductCard
                        key={item.id}
                        item={item}
                        onOpenDetails={onOpenProductModal}
                      />
                    ))}
                  </div>
                )}

                {coffeeItems.length > 0 && (
                  <div className={styles.subgroup} id={`${sectionId}-coffee`}>
                    <h3 className={styles.subgroupTitle}>{t('shop.coffeeSubheading')}</h3>
                    <div className={styles.productGrid}>
                      {coffeeItems.map((item) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          onOpenDetails={onOpenProductModal}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </section>
            );
          })
        )}
      </main>

        <div className={styles.cartCol}>
          <div className={styles.sideSticky}>
            <MenuCartPanel onCheckout={() => onNavigate?.('checkout')} />
          </div>
        </div>
      </div>

      {/* Mobile Sort Bottom Sheet (< 640px) */}
      <AnimatePresence>
        {isSortSheetOpen && (
          <div
            className={styles.sortSheetBackdrop}
            onClick={() => setIsSortSheetOpen(false)}
          >
            <motion.div
              className={styles.sortSheetModal}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label={t('shop.sortLabel')}
            >
              <div className={styles.sortSheetHeader}>
                <div className={styles.sortSheetHandle} />
                <div className={styles.sortSheetTitleRow}>
                  <h3 className={styles.sortSheetTitle}>{t('shop.sortLabel')}</h3>
                  <button
                    type="button"
                    onClick={() => setIsSortSheetOpen(false)}
                    className={styles.sortSheetCloseBtn}
                    aria-label={t('common.close')}
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>
              <div className={styles.sortSheetOptions}>
                {sortOptions.map((opt) => {
                  const isSelected = sortBy === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => {
                        setSortBy(opt.value as any);
                        setIsSortSheetOpen(false);
                      }}
                      className={`${styles.sortOptionBtn} ${
                        isSelected ? styles.sortOptionSelected : ''
                      }`}
                    >
                      <span className={styles.sortOptionText}>
                        {t(opt.labelKey)}
                      </span>
                      {isSelected && <Check size={18} className={styles.checkIcon} />}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

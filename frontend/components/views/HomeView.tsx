'use client';

import React, { useEffect, useState } from 'react';
import { asset } from '@/lib/basePath';
import { motion, useReducedMotion } from 'motion/react';
import { MENU_ITEMS, MenuItem, MenuCategory, getMenuItemById } from '@/data/menu';
import { PRESS_QUOTES } from '@/data/testimonials';
import { LOCATIONS, locationStatus } from '@/data/locations';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useActiveOrders, useLiveTimestamp, calculateOrderProgress } from '@/services/orders';
import { cleanPlaceholder, cn } from '@/lib/utils';
import { ActiveOrderCard } from '@/components/home/ActiveOrderCard';
import { ArrowIcon } from '@/components/layout/Header';
import styles from './HomeView.module.scss';

interface HomeViewProps {
  onNavigate: (route: string) => void;
  onOpenProductModal: (item: MenuItem) => void;
}

const COUNT_EN = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'];
const COUNT_KA = ['', 'ერთი', 'ორი', 'სამი', 'ოთხი', 'ხუთი', 'ექვსი', 'შვიდი', 'რვა'];

const CATEGORIES: MenuCategory[] = ['Burgers', 'Side Dishes', 'Sauces', 'Desserts', 'Drinks'];

const Star = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true" className={styles.marqueeStar}>
    <path d="M12 2l2.4 7.2H22l-6 4.6 2.3 7.2L12 16.6 5.7 21l2.3-7.2-6-4.6h7.6z" fill="currentColor" />
  </svg>
);

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, onOpenProductModal }) => {
  const { getCategoryName, getItemTranslation, language, t } = useLanguage();
  const { orderType, setOrderType, addItem } = useCart();
  const activeOrders = useActiveOrders();
  const now = useLiveTimestamp();
  const ka = language === 'ka';
  const reduceMotion = useReducedMotion();

  // Opening status depends on the clock: client-only to avoid hydration mismatches.
  const [statuses, setStatuses] = useState<Record<string, { open: boolean; label: string }> | null>(null);
  useEffect(() => {
    const update = () => setStatuses(Object.fromEntries(LOCATIONS.map((l) => [l.id, locationStatus(l, ka)])));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [ka]);

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
        };

  const go = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(route);
  };

  const marquee = ka
    ? ['სმაშ', 'სტეკი', 'სოუსი', 'მზადაა 20 წუთში', 'ვერა', 'ვაკე', 'სოლოლაკი', 'ნუცუბიძე']
    : ['Smash', 'Stack', 'Sauce', 'Pickup in 20 min', 'Vera', 'Vake', 'Sololaki', 'Nutsubidze'];

  const standards = [
    {
      title: ka ? 'ხორცი' : 'Beef',
      desc: ka
        ? '28 დღით დაძველებული ანგუსის ფარფლი, მკერდი და ნეკნი — იფქვება დღეში ორჯერ. არასოდეს გაყინული.'
        : '28-day dry-aged chuck, brisket and short rib, ground fresh twice a day. Never frozen.',
      k: '80 / 20',
    },
    {
      title: ka ? 'სიცხე' : 'Heat',
      desc: ka
        ? '260°C ნახშირბადოვანი ფოლადის პლანჩა. ერთი მძლავრი დაჭყლეტა პირველ 15 წამში ქმნის ქერქს.'
        : 'A 260°C carbon-steel plancha. One hard smash in the first fifteen seconds builds the crust.',
      k: '260°C',
    },
    {
      title: ka ? 'პური' : 'Bread',
      desc: ka
        ? 'კარტოფილისა და რძის ბრიოში, 18 საათის ცივი ფერმენტაციით, შემწვარი გადამდნარ კარაქში.'
        : 'Potato-milk brioche, cold-fermented for eighteen hours and griddled in clarified butter.',
      k: ka ? '18 სთ' : '18 h',
    },
    {
      title: ka ? 'სოუსი' : 'Sauce',
      desc: ka
        ? 'ბეკონის ჯემი, საფერავის ხახვი და სახლის სოუსი — მზადდება ადგილზე, ნახევარფაბრიკატების გარეშე.'
        : 'Bacon jam, Saperavi onions and house sauce — simmered from scratch, no pre-mixes.',
      k: ka ? 'ადგილზე' : 'In-house',
    },
  ];

  const quote = PRESS_QUOTES[2] ?? PRESS_QUOTES[0];

  // ---------- Phone app home (canvas App-Home) ----------
  const liveOrder = activeOrders.find((o) => {
    const p = calculateOrderProgress(o, now || o.createdAt);
    return !p.isDeliveredOrPickedUp && !p.isCancelled;
  });
  const liveProgress = liveOrder ? calculateOrderProgress(liveOrder, now || liveOrder.createdAt) : null;
  const popular = ['bun-patty-smash', 'golden-double-classic', 'sweet-heat-jalapeno', 'parmesan-truffle-fries']
    .map((id) => getMenuItemById(id))
    .filter((m): m is MenuItem => Boolean(m));
  const quickAdd = (m: MenuItem) =>
    m.requiredChoice && !m.requiredChoice.defaultOptionId
      ? onOpenProductModal(m)
      : addItem(m, 1, {
          selectedChoiceId: m.requiredChoice?.defaultOptionId,
          removedIngredientIds: [],
          extraQuantities: {},
          notes: '',
        });
  const classic = getMenuItemById('golden-double-classic');

  const appHome = (
    <div className={styles.appHome}>
      <div role="radiogroup" aria-label={ka ? 'შეკვეთის ტიპი' : 'Order type'} className={styles.appModes}>
        {(
          [
            ['pickup', ka ? 'გატანა' : 'Pickup', ka ? '~20 წთ' : '~20 min'],
            ['delivery', ka ? 'მიწოდება' : 'Delivery', ka ? '25–40 წთ' : '25–40 min'],
          ] as const
        ).map(([id, label, eta]) => (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={orderType === id}
            onClick={() => setOrderType(id)}
            className={cn(styles.appMode, orderType === id && styles.appModeOn)}
          >
            <span className={styles.appModeLabel}>{label}</span>
            <span className={styles.appModeEta}>{eta}</span>
          </button>
        ))}
      </div>

      {liveOrder && liveProgress && (
        <a href={`#/track/${liveOrder.orderNumber}`} onClick={go(`track/${liveOrder.orderNumber}`)} className={styles.appLive}>
          <span className={styles.appLiveTop}>
            <span>
              {ka ? 'შეკვეთა' : 'Order'} {liveOrder.orderNumber}
            </span>
            <span className={styles.appLiveTag}>Live</span>
          </span>
          <span className={styles.appLiveMid}>
            <span className={styles.appLiveStatus}>{t(liveProgress.statusLabelKey)}</span>
            {liveProgress.remainingMinutes > 0 && (
              <span className={styles.appLiveEta}>
                {liveProgress.remainingMinutes} {ka ? 'წთ' : 'min'}
              </span>
            )}
          </span>
          <span className={styles.appLiveBars}>
            {liveProgress.timelineSteps.slice(0, 4).map((st) => (
              <span
                key={st.status}
                className={cn(styles.appLiveBar, st.isCompleted && styles.appLiveBarDone, st.isCurrent && styles.appLiveBarNow)}
              />
            ))}
          </span>
        </a>
      )}

      {classic && (
        <button type="button" onClick={() => onOpenProductModal(classic)} className={styles.appPromo}>
          <span className={styles.appPromoMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={asset('/images/hero-burger-table.jpg')} alt="" />
            <span className={styles.appSticker} aria-hidden="true">
              {ka ? '28 დღით დაძველებული' : (
                <>
                  28-day
                  <br />
                  dry-aged
                </>
              )}
            </span>
          </span>
          <span className={styles.appPromoBody}>
            <span className={styles.appPromoText}>
              <span className={styles.appPromoTitle}>
                {ka ? 'თხლად დაჭყლეტილი' : 'Smashed thin'}
                <span className={styles.dot}>.</span>
              </span>
              <span className={styles.appPromoSub}>
                {ka ? 'სცადე' : 'Try the'} {getItemTranslation(classic.id).name || classic.name} — {classic.price.toFixed(2)} ₾
              </span>
            </span>
            <span className={styles.appPromoArrow}>
              <ArrowIcon size={20} />
            </span>
          </span>
        </button>
      )}

      <div className={styles.appChips}>
        {CATEGORIES.map((c) => (
          <a key={c} href="#/shop" onClick={go('shop')} className={styles.appChip}>
            {getCategoryName(c)}
          </a>
        ))}
      </div>

      <div className={styles.appRowHead}>
        <h2 className={styles.appH2}>{ka ? 'პოპულარული' : 'Popular now'}</h2>
        <a href="#/shop" onClick={go('shop')} className={styles.appSeeAll}>
          {ka ? 'ყველა' : 'See all'}
        </a>
      </div>
      <div className={styles.appPopular}>
        {popular.map((m) => {
          const name = getItemTranslation(m.id).name || m.name;
          return (
            <div key={m.id} className={styles.appTile}>
              <button type="button" onClick={() => onOpenProductModal(m)} className={styles.appTileImg} aria-label={name}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={m.imageSlot} alt="" loading="lazy" />
              </button>
              <div className={styles.appTileBody}>
                <button type="button" onClick={() => onOpenProductModal(m)} className={styles.appTileText}>
                  <span className={styles.appTileName}>{name}</span>
                  <span className={styles.appTilePrice}>{m.price.toFixed(2)} ₾</span>
                </button>
                <button
                  type="button"
                  onClick={() => quickAdd(m)}
                  className={styles.appPlus}
                  aria-label={`${ka ? 'დამატება' : 'Add'} ${name}`}
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.appKitchens}>
        <h2 className={styles.appH2}>{ka ? 'ფილიალები ახლოს' : 'Kitchens near you'}</h2>
        {LOCATIONS.map((loc) => {
          const st = statuses?.[loc.id];
          return (
            <a key={loc.id} href={`#/locations/${loc.id}`} onClick={go(`locations/${loc.id}`)} className={styles.appKitchen}>
              <span className={styles.appKitchenText}>
                <span className={styles.appKitchenName}>{loc.shortName.toUpperCase()}</span>
                <span className={styles.appKitchenAddr}>{cleanPlaceholder(loc.address)}</span>
              </span>
              <span className={cn(styles.status, st && (st.open ? styles.statusOpen : styles.statusClosed))}>
                <span className={styles.statusDot} aria-hidden="true" />
                {st ? (st.open ? (ka ? 'ღიაა' : 'Open') : ka ? 'დაკეტილია' : 'Closed') : ''}
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );


  return (
    <div className={styles.home}>
      {appHome}

      <div className={styles.desktopHome}>
      {/* ---------- Hero ---------- */}
      <section className={styles.hero}>
        <motion.div {...fadeUp(0)} className={styles.heroMeta}>
          <span>{ka ? 'სმაშ-ბურგერები — თბილისი, საქართველო' : 'Smash burgers — Tbilisi, Georgia'}</span>
          <span>{LOCATIONS.map((l) => l.shortName).join(' · ')}</span>
          <span>{ka ? 'ღიაა ყოველდღე 11:30-დან' : 'Open daily from 11:30'}</span>
        </motion.div>

        <motion.h1 {...fadeUp(0.05)} className={styles.headline}>
          {ka ? 'თხლად დაჭყლეტილი' : 'Smashed thin'}
          <span className={styles.dot}>.</span>
          <br />
          {ka ? 'ხმამაღლა მორთმეული' : 'Served loud'}
          <span className={styles.dot}>.</span>
        </motion.h1>

        <div className={styles.heroGrid}>
          <motion.div {...fadeUp(0.1)} className={styles.heroMedia}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={asset('/images/hero-burger-table.jpg')}
              alt={ka ? 'ორმაგი სმაშ-ჩიზბურგერი კარტოფილით ხის მაგიდაზე' : 'Double smash cheeseburger with fries on a wooden table'}
              className={styles.heroImage}
              fetchPriority="high"
            />
            <span className={styles.sticker} aria-hidden="true">
              {ka ? (
                <>
                  28 დღით
                  <br />
                  დაძველებული
                </>
              ) : (
                <>
                  28-day
                  <br />
                  dry-aged
                  <br />
                  beef
                </>
              )}
            </span>
          </motion.div>

          <motion.div {...fadeUp(0.15)} className={styles.heroSide}>
            <div className={styles.heroCopy}>
              <p className={styles.lead}>
                {ka
                  ? 'ორი კატლეტი დაძველებული ხორცისგან, თხლად დაჭყლეტილი 260°C პლანჩაზე, სანამ კიდეები მაქმანივით არ შეიბრაწება — შემდეგ ყოველ დილით გამომცხვარ ბრიოშში.'
                  : 'Two patties of dry-aged chuck, smashed paper-thin on a 260°C plancha until the edges go lacy and dark — then stacked into potato-milk brioche we bake every morning.'}
              </p>
              <div className={styles.heroActions}>
                <button type="button" onClick={() => onNavigate('shop')} className={styles.btnRed}>
                  {ka ? 'შეკვეთა გასატანად' : 'Order for pickup'}
                  <ArrowIcon size={20} />
                </button>
                <button type="button" onClick={() => onNavigate('shop')} className={styles.btnOutline}>
                  {ka ? 'მენიუს ნახვა' : 'See the menu'}
                </button>
              </div>
              <ActiveOrderCard onNavigate={onNavigate} />
            </div>

            <dl className={styles.facts}>
              <div className={styles.fact}>
                <dt>{ka ? 'გატანა' : 'Pickup'}</dt>
                <dd>{ka ? '~20 წთ' : '~20 min'}</dd>
              </div>
              <div className={styles.fact}>
                <dt>{ka ? 'კურიერი' : 'Courier'}</dt>
                <dd>{ka ? '25–40 წთ' : '25–40 min'}</dd>
              </div>
              <div className={styles.fact}>
                <dt>{ka ? 'ფილიალები' : 'Kitchens'}</dt>
                <dd>{ka ? `${LOCATIONS.length} თბილისში` : `${LOCATIONS.length} in Tbilisi`}</dd>
              </div>
            </dl>
          </motion.div>
        </div>
      </section>

      {/* ---------- Marquee ---------- */}
      <div className={styles.marquee} aria-hidden="true">
        <div className={styles.marqueeTrack}>
          {[...marquee, ...marquee].map((w, i) => (
            <React.Fragment key={i}>
              <span className={styles.marqueeWord}>{w}</span>
              <Star />
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ---------- 01 Kitchen ---------- */}
      <section className={cn(styles.section, styles.inkSection)}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={cn(styles.kicker, styles.kickerMustard)}>01 — {ka ? 'სამზარეულო' : 'The kitchen'}</span>
            <h2 className={styles.sectionTitle}>
              {ka ? 'შორტკატების გარეშე' : 'No shortcuts'}
              <span className={styles.dot}>.</span>
              <br />
              {ka ? 'გამათბობლების გარეშე' : 'No heat lamps'}
              <span className={styles.dot}>.</span>
            </h2>
          </div>
          <p className={cn(styles.asideText, styles.asideLarge)}>
            {ka
              ? 'ყველა ბურგერი შეკვეთისას იჭყლიტება. არაფერი ელოდება ნათურის ქვეშ, არაფერია წინასწარ ჩამოსხმული, სოუსები კი ჩვენს სამზარეულოში მზადდება.'
              : 'Every burger is smashed to order. Nothing sits under a lamp, nothing is pre-formed, and the sauces are cooked in our own kitchen in Vera.'}
          </p>
        </div>

        <div className={styles.kitchenGrid}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={asset('/images/menu/the-big-one.jpg')}
            alt={ka ? 'მაღალი ბურგერი დნობადი ჩედერით' : 'A tall stack of smashed patties and melted cheddar'}
            className={styles.kitchenImage}
            loading="lazy"
          />
          <ol className={styles.standards}>
            {standards.map((s, i) => (
              <li key={s.title} className={styles.standard}>
                <span className={styles.standardNum}>0{i + 1}</span>
                <div className={styles.standardBody}>
                  <h3 className={styles.standardTitle}>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                <span className={styles.standardKey}>{s.k}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- 02 Locations ---------- */}
      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.kicker}>02 — {ka ? 'ფილიალები' : 'Locations'}</span>
            <h2 className={styles.sectionTitle}>
              {ka ? `${COUNT_KA[LOCATIONS.length] ?? LOCATIONS.length} სამზარეულო` : `${COUNT_EN[LOCATIONS.length] ?? LOCATIONS.length} kitchens`}
              <br />
              {ka ? 'თბილისში' : 'across Tbilisi'}
            </h2>
          </div>
          <a href="#/locations" onClick={go('locations')} className={styles.textLink}>
            {ka ? 'რუკის გახსნა' : 'Open the map'}
            <ArrowIcon size={20} />
          </a>
        </div>

        <div className={styles.locationList}>
          {LOCATIONS.map((loc) => {
            const st = statuses?.[loc.id];
            return (
              <div key={loc.id} className={styles.locationRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={loc.image} alt="" className={styles.locationImage} loading="lazy" />
                <div className={styles.locationName}>
                  <h3>
                    <a href={`#/locations/${loc.id}`} onClick={go(`locations/${loc.id}`)}>
                      {loc.shortName}
                    </a>
                  </h3>
                  {loc.isFlagship && <span className={styles.flagTag}>{ka ? 'ფლაგმანი' : 'Flagship'}</span>}
                </div>
                <div className={styles.locationAddr}>
                  <p className={styles.addr}>
                    {cleanPlaceholder(loc.address)}, {cleanPlaceholder(loc.cityStateZip).replace(/, Georgia$/, '')}
                  </p>
                  <p className={styles.note}>{loc.transit}</p>
                </div>
                <div className={styles.locationHours}>
                  <span className={cn(styles.status, st && (st.open ? styles.statusOpen : styles.statusClosed))}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    {st ? st.label : ' '}
                  </span>
                  <span>
                    {ka ? 'ორშ–ხუთ' : 'Mon–Thu'} {loc.hoursWeekday}
                  </span>
                  <span>
                    {ka ? 'პარ–კვი' : 'Fri–Sun'} {loc.hoursWeekend}
                  </span>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${loc.coordinates.lat},${loc.coordinates.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.btnOutline}
                >
                  {ka ? 'მარშრუტი' : 'Directions'}
                  <ArrowIcon size={20} />
                </a>
              </div>
            );
          })}
        </div>
      </section>

      {/* ---------- Quote ---------- */}
      {quote && (
        <section className={styles.quoteSection}>
          <span className={styles.kicker}>{ka ? 'რას ამბობენ' : 'What people say'}</span>
          <blockquote className={styles.quote}>“{quote.quote}”</blockquote>
          <span className={styles.quoteMeta}>
            {quote.publication} · {quote.date}
          </span>
        </section>
      )}
      </div>
    </div>
  );
};

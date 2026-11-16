'use client';

import React, { useEffect, useRef, useState } from 'react';
import { LOCATIONS, FEATURE_KA, locationStatus } from '@/data/locations';
import { ArrowIcon } from '@/components/layout/Header';
import { KitchenMap } from '@/components/map/KitchenMap';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder, cn } from '@/lib/utils';
import { ArrowUpRight } from 'lucide-react';
import styles from './LocationsView.module.scss';

interface LocationsViewProps {
  onNavigate: (route: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();
  const ka = language === 'ka';
  const [selected, setSelected] = useState(LOCATIONS[0].id);
  const [filter, setFilter] = useState<'all' | 'open'>('all');
  const listRef = useRef<HTMLDivElement>(null);

  // Picking a pin brings that kitchen into view inside the scrolling list
  useEffect(() => {
    const list = listRef.current;
    const card = list?.querySelector<HTMLElement>(`[data-kitchen="${selected}"]`);
    if (!list || !card || list.scrollHeight <= list.clientHeight) return;
    list.scrollTo({ top: card.offsetTop - list.offsetTop - 8, behavior: 'smooth' });
  }, [selected]);

  // Opening status depends on the clock: client-only to avoid hydration mismatches.
  const [statuses, setStatuses] = useState<Record<string, { open: boolean; label: string }> | null>(null);
  useEffect(() => {
    const update = () => setStatuses(Object.fromEntries(LOCATIONS.map((l) => [l.id, locationStatus(l, ka)])));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [ka]);

  const openCount = statuses ? Object.values(statuses).filter((s) => s.open).length : LOCATIONS.length;
  const shown = LOCATIONS.filter((l) => filter === 'all' || statuses?.[l.id]?.open !== false);
  const current = LOCATIONS.find((l) => l.id === selected) ?? LOCATIONS[0];

  return (
    <div className={styles.locations}>
      {/* Hero */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>
            {ka ? `${LOCATIONS.length} ფილიალი · თბილისი, საქართველო` : `${LOCATIONS.length} kitchens · Tbilisi, Georgia`}
          </span>
          <h1 className={styles.title}>
            {ka ? 'იპოვე ფილიალი' : 'Find a kitchen'}
            <span className={styles.dot}>.</span>
          </h1>
        </div>
        <div className={styles.heroSide}>
          <div role="radiogroup" aria-label={ka ? 'ფილტრი' : 'Filter kitchens'} className={styles.filter}>
            {(
              [
                ['all', ka ? 'ყველა' : 'All', LOCATIONS.length],
                ['open', ka ? 'ახლა ღიაა' : 'Open now', openCount],
              ] as const
            ).map(([id, label, n]) => (
              <button
                key={id}
                type="button"
                role="radio"
                aria-checked={filter === id}
                onClick={() => setFilter(id)}
                className={cn(styles.filterBtn, filter === id && styles.filterBtnActive)}
              >
                {label} <span className={styles.filterCount}>{n}</span>
              </button>
            ))}
          </div>
          <span className={styles.headerNote}>
            {ka
              ? 'ყველა ფილიალში: ადგილზე, გატანა და კურიერით მიწოდება.'
              : 'Every kitchen does dine-in, pickup and courier delivery.'}
          </span>
        </div>
      </header>

      {/* List + map */}
      <div className={styles.split}>
        <div ref={listRef} className={styles.list}>
          {shown.length === 0 && (
            <p className={styles.empty}>{ka ? 'ახლა ყველა ფილიალი დაკეტილია.' : 'All kitchens are closed right now.'}</p>
          )}
          {shown.map((loc) => {
            const idx = LOCATIONS.indexOf(loc);
            const st = statuses?.[loc.id];
            const on = loc.id === current.id;
            const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.coordinates.lat},${loc.coordinates.lng}`;
            return (
              <article key={loc.id} data-kitchen={loc.id} className={cn(styles.card, on && styles.cardActive)}>
                <div className={styles.cardTop}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={loc.image} alt="" className={styles.cardImage} loading="lazy" />
                  <div className={styles.cardHead}>
                    <div className={styles.cardMeta}>
                      <span className={styles.locationIndex}>0{idx + 1}</span>
                      {loc.isFlagship && <span className={styles.flagshipTag}>{ka ? 'ფლაგმანი' : 'Flagship'}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelected(loc.id)}
                      className={styles.locationName}
                      aria-pressed={on}
                    >
                      {loc.shortName.toUpperCase()}
                    </button>
                    <span className={cn(styles.status, st && (st.open ? styles.statusOpen : styles.statusClosed))}>
                      <span className={styles.statusDot} aria-hidden="true" />
                      {st ? st.label : '\u00A0'}
                    </span>
                  </div>
                </div>

                <div className={styles.cardDetails}>
                  <div className={styles.addrBlock}>
                    <p className={styles.detailPrimary}>
                      {cleanPlaceholder(loc.address)}, {cleanPlaceholder(loc.cityStateZip).replace(/, Georgia$/, '')}
                    </p>
                    <p className={styles.detailSecondary}>{loc.transit}</p>
                    <a href={`tel:${loc.phone.replace(/\s/g, '')}`} className={styles.phone}>
                      {loc.phone}
                    </a>
                  </div>
                  <div className={styles.hoursGrid}>
                    <span>{ka ? 'ორშ–ხუთ' : 'Mon–Thu'}</span>
                    <span>{loc.hoursWeekday}</span>
                    <span>{ka ? 'პარ–კვი' : 'Fri–Sun'}</span>
                    <span>{loc.hoursWeekend}</span>
                  </div>
                </div>

                {loc.features.length > 0 && (
                  <ul className={styles.chips} aria-label={t('locations.features')}>
                    {loc.features.map((f) => (
                      <li key={f} className={styles.chip}>
                        {ka ? FEATURE_KA[f] || f : f}
                      </li>
                    ))}
                  </ul>
                )}

                <div className={styles.actions}>
                  <button type="button" onClick={() => onNavigate('shop')} className={cn(styles.primaryBtn, !on && styles.primaryBtnQuiet)}>
                    {ka ? `შეკვეთა — ${loc.shortName}` : `Order from ${loc.shortName}`}
                    <ArrowIcon size={18} />
                  </button>
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.textBtn}>
                    {t('locations.getDirections')} <ArrowIcon size={16} />
                  </a>
                  <a
                    href={`#/locations/${loc.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`locations/${loc.id}`);
                    }}
                    className={styles.textBtn}
                  >
                    {ka ? 'დეტალები' : 'Details'}
                  </a>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.mapPane}>
          <div className={styles.mapSticky}>
            <KitchenMap
              selectedId={current.id}
              onSelect={setSelected}
              focus="all"
              label={ka ? 'ფილიალების რუკა' : 'Map of our kitchens'}
            />
          </div>
        </div>
      </div>

      {/* Delivery Coverage, Fee & Pickup Details */}
      <section className={styles.deliveryInfoSection}>
        <div className={styles.deliverySectionHeader}>
          <span className={styles.kicker}>{ka ? 'მიწოდება და გატანა' : 'Delivery & Pickup'}</span>
          <h2 className={styles.deliverySectionTitle}>
            {ka ? 'მიწოდების არეალი, ტარიფები და გატანა' : 'Coverage, Rates & Express Pickup'}
          </h2>
        </div>

        <div className={styles.deliveryGrid}>
          <div className={styles.deliveryCard}>
            <h3 className={styles.cardTitle}>{ka ? 'მიწოდების არეალი' : 'Delivery Coverage'}</h3>
            <p className={styles.cardText}>
              {ka
                ? 'ვერა, ვაკე, საბურთალო, ნუცუბიძის პლატო, მთაწმინდა, სოლოლაკი, ჩუღურეთი და მარჯანიშვილი. მიტანა 25–40 წუთში თერმოჩანთებით.'
                : 'Vera, Vake, Saburtalo, Nutsubidze Plateau, Mtatsminda, Sololaki, Chugureti, and Marjanishvili. Delivered in 25–40 min in thermal courier bags.'}
            </p>
          </div>

          <div className={styles.deliveryCard}>
            <h3 className={styles.cardTitle}>{ka ? 'მიწოდების საფასური' : 'Delivery Fee'}</h3>
            <p className={styles.cardText}>
              {ka
                ? 'ფიქსირებული საკურიერო ტარიფი 5.00 ₾. 50.00 ₾-ზე მეტ შეკვეთებზე მიწოდება სრულიად უფასოა!'
                : 'Flat courier fee of 5.00 ₾. Orders 50.00 ₾ and above qualify for FREE courier delivery!'}
            </p>
          </div>

          <div className={styles.deliveryCard}>
            <h3 className={styles.cardTitle}>{ka ? 'ადგილზე გატანა' : 'Counter Pickup'}</h3>
            <p className={styles.cardText}>
              {ka
                ? 'ადგილზე გატანა ყველა ლოკაციიდან ყოველთვის უფასოა და შეკვეთა მზადდება 15–20 წუთში.'
                : 'Express counter pickup at every kitchen is always completely free and ready in 15–20 minutes.'}
            </p>
          </div>
        </div>
      </section>

      {/* Group Dining & Events */}
      <section className={styles.cateringBox}>
        <div className={styles.cateringText}>
          <span className={styles.kicker}>{ka ? 'ღონისძიებები' : 'Events & Catering'}</span>
          <h3 className={styles.cateringTitle}>
            {ka ? 'ღონისძიებების და კორპორატიული ქეითერინგი' : 'Private Garden Buyouts & Office Catering'}
          </h3>
          <p className={styles.cateringNote}>
            {ka
              ? 'ვემსახურებით 20-დან 150-მდე სტუმარს თბილისის მასშტაბით (ვერა, ვაკე, სოლოლაკი, ნუცუბიძე და კერძო სივრცეები).'
              : 'We cater plancha burger bars for 20 to 150 guests across Tbilisi (Vera, Vake, Sololaki, Nutsubidze, and private venues).'}
          </p>
        </div>
        <button onClick={() => onNavigate('contact')} className={styles.cateringBtn}>
          {ka ? 'დაკავშირება სამზარეულოსთან' : 'Inquire with Kitchen'}
          <ArrowUpRight size={16} aria-hidden="true" />
        </button>
      </section>
    </div>
  );
};

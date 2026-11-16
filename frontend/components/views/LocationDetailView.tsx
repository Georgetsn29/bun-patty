'use client';

import React, { useEffect, useState } from 'react';
import {
  LOCATIONS,
  FEATURE_KA,
  hoursForDay,
  locationStatus,
  tbilisiNow,
} from '@/data/locations';
import { ArrowIcon } from '@/components/layout/Header';
import { KitchenMap } from '@/components/map/KitchenMap';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder, cn } from '@/lib/utils';
import styles from './LocationDetailView.module.scss';

interface LocationDetailViewProps {
  locationId: string;
  onNavigate: (route: string) => void;
}

// Display order Mon → Sun; values are JS day indexes (0 = Sun).
const WEEK = [1, 2, 3, 4, 5, 6, 0];
const DAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAY_KA = ['კვირა', 'ორშაბათი', 'სამშაბათი', 'ოთხშაბათი', 'ხუთშაბათი', 'პარასკევი', 'შაბათი'];

export const LocationDetailView: React.FC<LocationDetailViewProps> = ({ locationId, onNavigate }) => {
  const { t, language } = useLanguage();
  const ka = language === 'ka';

  const idx = LOCATIONS.findIndex((l) => l.id === locationId);
  const loc = LOCATIONS[idx];

  // Client-only to avoid hydration mismatches.
  const [status, setStatus] = useState<{ open: boolean; label: string } | null>(null);
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    if (!loc) return;
    const update = () => {
      setStatus(locationStatus(loc, ka));
      setToday(tbilisiNow().day);
    };
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, [loc, ka]);

  if (!loc) return null;

  const { lat, lng } = loc.coordinates;
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
  const others = LOCATIONS.filter((l) => l.id !== loc.id);
  const go = (route: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    onNavigate(route);
  };

  const stripArrow = (x: string) => x.replace(/\s*[→↗]\s*$/, '');

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <nav className={styles.breadcrumb} aria-label={ka ? 'ნავიგაცია' : 'Breadcrumb'}>
            <a href="#/locations" onClick={go('locations')}>
              ← {ka ? 'ყველა ფილიალი' : 'All kitchens'}
            </a>
            <span aria-hidden="true">/</span>
            <span aria-current="page">0{idx + 1}</span>
          </nav>
          <h1 className={styles.title}>
            {loc.shortName.toUpperCase()}
            <span className={styles.dot}>.</span>
          </h1>
          <div className={styles.metaRow}>
            {loc.isFlagship && <span className={styles.flagshipTag}>{ka ? 'ფლაგმანი' : 'Flagship'}</span>}
            <span className={cn(styles.status, status && (status.open ? styles.statusOpen : styles.statusClosed))}>
              <span className={styles.statusDot} aria-hidden="true" />
              {status ? status.label : ' '}
            </span>
          </div>
          <p className={styles.address}>
            {cleanPlaceholder(loc.address)}, {cleanPlaceholder(loc.cityStateZip)}
          </p>
          <div className={styles.heroActions}>
            <button type="button" onClick={() => onNavigate('shop')} className={styles.btnRed}>
              {ka ? `შეკვეთა — ${loc.shortName}` : `Order from ${loc.shortName}`} <ArrowIcon size={20} />
            </button>
            <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className={styles.btnOutline}>
              {stripArrow(t('locations.getDirections'))} <ArrowIcon size={20} />
            </a>
          </div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={loc.image} alt={ka ? `${loc.shortName} — დარბაზი` : `${loc.shortName} dining room`} className={styles.heroImage} />
      </section>

      <div className={styles.body}>
        <section className={styles.block}>
          <span className={styles.kickerRed}>01 — {ka ? 'სამუშაო საათები' : 'Opening hours'}</span>
          <ul className={styles.hoursList}>
            {WEEK.map((d) => (
              <li key={d} className={cn(styles.hoursRow, today === d && styles.hoursToday)}>
                <span className={styles.day}>
                  {(ka ? DAY_KA : DAY_EN)[d]}
                  {today === d && <span className={styles.todayTag}>{ka ? 'დღეს' : 'Today'}</span>}
                </span>
                <span className={styles.hoursValue}>{hoursForDay(loc, d)}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block}>
          <span className={styles.kickerRed}>02 — {ka ? 'მისვლა' : 'Getting here'}</span>
          <p className={styles.transit}>{loc.transit}</p>
          {loc.features?.length > 0 && (
            <ul className={styles.chips} aria-label={t('locations.features')}>
              {loc.features.map((f) => (
                <li key={f} className={styles.chip}>
                  {ka ? FEATURE_KA[f] ?? f : f}
                </li>
              ))}
            </ul>
          )}
          <dl className={styles.contactList}>
            <div>
              <dt>{ka ? 'ტელეფონი' : 'Phone'}</dt>
              <dd>
                <a href={`tel:${loc.phone.replace(/\s/g, '')}`}>{loc.phone}</a>
              </dd>
            </div>
            <div>
              <dt>{ka ? 'ელფოსტა' : 'Email'}</dt>
              <dd>
                <a href={`mailto:${loc.email}`}>{loc.email}</a>
              </dd>
            </div>
          </dl>
        </section>
      </div>

      <div className={styles.mapFrame}>
        <KitchenMap
          selectedId={loc.id}
          focus="selected"
          onSelect={(id) => id !== loc.id && onNavigate(`locations/${id}`)}
          label={ka ? `${loc.shortName} — რუკა` : `Map of ${loc.shortName}`}
        />
      </div>

      <section className={styles.others}>
        <h2 className={styles.othersTitle}>{ka ? 'სხვა ფილიალები' : 'Other kitchens'}</h2>
        <div className={styles.othersList}>
          {others.map((o) => (
            <a key={o.id} href={`#/locations/${o.id}`} onClick={go(`locations/${o.id}`)} className={styles.otherRow}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={o.image} alt="" className={styles.otherImage} loading="lazy" />
              <span className={styles.otherName}>{o.shortName.toUpperCase()}</span>
              <span className={styles.otherAddress}>{cleanPlaceholder(o.address)}</span>
              <ArrowIcon size={24} />
            </a>
          ))}
        </div>
      </section>
    </div>
  );
};

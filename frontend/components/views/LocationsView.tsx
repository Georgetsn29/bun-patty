'use client';

import React from 'react';
import { LOCATIONS } from '@/data/locations';
import { FoodImage } from '@/components/ui/FoodImage';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder } from '@/lib/utils';
import { MapPin, Truck, Store } from 'lucide-react';
import styles from './LocationsView.module.scss';

interface LocationsViewProps {
  onNavigate: (route: string) => void;
}

export const LocationsView: React.FC<LocationsViewProps> = ({ onNavigate }) => {
  const { t, language } = useLanguage();

  return (
    <div className={styles.locations}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.kicker}>
          {t('locations.kicker')}
        </span>
        <h1 className={styles.title}>
          {t('locations.title')}
        </h1>
        <p className={styles.headerNote}>
          {t('locations.subtitle')}
        </p>
      </div>

      {/* Locations Editorial List (3 Distinct Cards with Architecture Slots) */}
      <div className={styles.locationsList}>
        {LOCATIONS.map((loc, idx) => (
          <div key={loc.id} className={styles.locationRow}>
            {/* Number & Name (Cols 1-4) */}
            <div className={styles.nameCol}>
              <span className={styles.locationIndex}>0{idx + 1} / {loc.neighborhood}</span>
              <h2 className={styles.locationName}>
                {loc.name}
              </h2>
              {loc.isFlagship && (
                <span className={styles.flagshipTag}>
                  {language === 'ka' ? 'მთავარი სამზარეულო და ეზო' : 'Main Kitchen & Garden'}
                </span>
              )}
            </div>

            {/* Address & Hours (Cols 5-8) */}
            <div className={styles.detailsCol}>
              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{language === 'ka' ? 'მისამართი' : 'Address'}</span>
                <p className={styles.detailAddress}>{cleanPlaceholder(loc.address)}</p>
                <p>{cleanPlaceholder(loc.cityStateZip)}</p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{language === 'ka' ? 'საათები' : 'Hours'}</span>
                <p>{language === 'ka' ? 'ორშაბათი — ხუთშაბათი:' : 'Monday — Thursday:'} {loc.hoursWeekday}</p>
                <p>{language === 'ka' ? 'პარასკევი — კვირა:' : 'Friday — Sunday:'} {loc.hoursWeekend}</p>
              </div>

              <div className={styles.detailGroup}>
                <span className={styles.detailLabel}>{language === 'ka' ? 'კონტაქტი და ტრანსპორტი' : 'Contact & Transit'}</span>
                <p>{language === 'ka' ? 'ტელეფონი:' : 'Telephone:'} <a href={`tel:${loc.phone}`} style={{ textDecoration: 'underline' }}>{loc.phone}</a></p>
                <p className={styles.transitNote}>{loc.transit}</p>
              </div>
            </div>

            {/* Photo Slot & Action (Cols 9-12) */}
            <div className={styles.mediaCol}>
              <FoodImage
                src={`/images/location-${loc.id}.jpg`}
                alt={`${loc.name} exterior storefront`}
                slotLabel={`Facade and street view: ${loc.name}, cast-iron window frames, warm interior light`}
              />
              <button
                onClick={() => onNavigate('shop')}
                className={styles.orderLocationBtn}
              >
                {t('locations.orderPickupHere')}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Delivery Coverage, Fee & Pickup Details */}
      <div className={styles.deliveryInfoSection}>
        <div className={styles.deliverySectionHeader}>
          <span className={styles.kicker}>
            {language === 'ka' ? 'მიწოდება და გატანა' : 'Delivery & Pickup'}
          </span>
          <h2 className={styles.deliverySectionTitle}>
            {language === 'ka' ? 'მიწოდების არეალი, ტარიფები და გატანა' : 'Coverage, Rates & Express Pickup'}
          </h2>
        </div>

        <div className={styles.deliveryGrid}>
          <div className={styles.deliveryCard}>
            <div className={styles.deliveryCardTop}>
              <MapPin size={20} className={styles.cardIcon} aria-hidden="true" />
              <h3 className={styles.cardTitle}>
                {language === 'ka' ? 'მიწოდების არეალი' : 'Delivery Coverage'}
              </h3>
            </div>
            <p className={styles.cardText}>
              {language === 'ka'
                ? 'ვერა, ვაკე, საბურთალო, მთაწმინდა, სოლოლაკი, ჩუღურეთი და მარჯანიშვილი. მიტანა 25–40 წუთში თერმოჩანთებით.'
                : 'Vera, Vake, Saburtalo, Mtatsminda, Sololaki, Chugureti, and Marjanishvili. Delivered in 25–40 min in thermal courier bags.'}
            </p>
          </div>

          <div className={styles.deliveryCard}>
            <div className={styles.deliveryCardTop}>
              <Truck size={20} className={styles.cardIcon} aria-hidden="true" />
              <h3 className={styles.cardTitle}>
                {language === 'ka' ? 'მიწოდების საფასური' : 'Delivery Fee'}
              </h3>
            </div>
            <p className={styles.cardText}>
              {language === 'ka'
                ? 'ფიქსირებული საკურიერო ტარიფი 5.00 ₾. 50.00 ₾-ზე მეტ შეკვეთებზე მიწოდება სრულიად უფასოა!'
                : 'Flat courier fee of 5.00 ₾. Orders 50.00 ₾ and above qualify for FREE courier delivery!'}
            </p>
          </div>

          <div className={styles.deliveryCard}>
            <div className={styles.deliveryCardTop}>
              <Store size={20} className={styles.cardIcon} aria-hidden="true" />
              <h3 className={styles.cardTitle}>
                {language === 'ka' ? 'ადგილზე გატანა' : 'Counter Pickup'}
              </h3>
            </div>
            <p className={styles.cardText}>
              {language === 'ka'
                ? 'ადგილზე გატანა სამივე ლოკაციიდან ყოველთვის უფასოა და შეკვეთა მზადდება 15–20 წუთში.'
                : 'Express counter pickup at all three outposts is always completely free and ready in 15–20 minutes.'}
            </p>
          </div>
        </div>
      </div>

      {/* Group Dining & Events Note */}
      <div className={styles.cateringBox}>
        <div>
          <h3 className={styles.cateringTitle}>
            {language === 'ka' ? 'ღონისძიებების და კორპორატიული ქეითერინგი' : 'Private Garden Buyouts & Office Catering'}
          </h3>
          <p className={styles.cateringText}>
            {language === 'ka'
              ? 'ვემსახურებით 20-დან 150-მდე სტუმარს თბილისის მასშტაბით (ვერა, ვაკე, სოლოლაკი და კერძო სივრცეები).'
              : 'We cater plancha burger bars for 20 to 150 guests across Tbilisi (Vera, Vake, Sololaki, and private venues).'}
          </p>
        </div>
        <button
          onClick={() => onNavigate('contact')}
          className={styles.cateringBtn}
        >
          {language === 'ka' ? 'დაკავშირება სამზარეულოსთან' : 'Inquire with Kitchen'}
        </button>
      </div>
    </div>
  );
};


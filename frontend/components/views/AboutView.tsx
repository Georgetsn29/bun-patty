'use client';

import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { ArrowIcon } from '@/components/layout/Header';
import styles from './AboutView.module.scss';

interface AboutViewProps {
  onNavigate: (route: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onNavigate }) => {
  const { language } = useLanguage();
  const ka = language === 'ka';

  const numbers = [
    { v: '28', u: ka ? 'დღე' : 'days', label: ka ? 'დაძველებული ხორცი' : 'Dry-aged beef' },
    { v: '260', u: '°C', label: ka ? 'პლანჩის ტემპერატურა' : 'Plancha temperature' },
    { v: '18', u: ka ? 'სთ' : 'h', label: ka ? 'ბრიოშის ცივი ფერმენტაცია' : 'Brioche cold ferment' },
    { v: '0', u: '', label: ka ? 'გამათბობელი ნათურა შენობაში' : 'Heat lamps in the building' },
  ];

  const pillars = [
    {
      t: ka ? 'ბურგერები' : 'Burgers',
      d: ka
        ? 'რვა ბურგერი, ყველა ერთსა და იმავე სმაშზე აგებული. ფირმულს ემატება ორი შემწვარი კვერცხი და ბეკონი; „დიდი“ 750 გრამია და გასაყოფადაა.'
        : 'Eight burgers, all built on the same smash. The Signature adds two fried eggs and bacon; the Big One is 750 g and meant for sharing.',
      img: '/images/menu/bun-patty-signature.jpg',
    },
    {
      t: ka ? 'გარნირები' : 'Sides',
      d: ka
        ? 'ხელით დაჭრილი კარტოფილი, ორჯერ შემწვარი სუფთა ზეთში — პარმეზანით, ტრიუფელით ან ყველის სოუსითა და ბეკონით.'
        : 'Hand-cut fries double-fried in clean oil, finished with aged parmesan, truffle, or cheese sauce and bacon.',
      img: '/images/menu/parmesan-truffle-fries.jpg',
    },
    {
      t: ka ? 'შეიქები' : 'Shakes',
      d: ka
        ? 'მკვრივი გაყინული კასტარდი მთლიანი რძით, კვერცხის გულითა და ნამდვილი ვანილით. იმდენად სქელი, რომ კოვზი დაგჭირდება.'
        : 'Dense frozen custard spun with whole milk, egg yolk and real vanilla bean. Thick enough to need a spoon.',
      img: '/images/menu/roasted-vanilla-bean-shake.jpg',
    },
  ];

  return (
    <div className={styles.about}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>{ka ? 'ჩვენი სამზარეულო · ვერა, თბილისი' : 'Our kitchen · Vera, Tbilisi'}</span>
          <h1 className={styles.title}>
            {ka ? 'ერთი პლანჩის' : 'Built around'}
            <br />
            {ka ? 'გარშემო' : 'one plancha'}
            <span className={styles.dot}>.</span>
          </h1>
        </div>
        <p className={styles.lead}>
          {ka
            ? 'ერთი იდეით გავიხსენით: ბურგერი იმდენად კარგია, რამდენადაც მისი ქერქი. დანარჩენი ყველაფერი — ხორცი, პური, სოუსები — იმ პირველ თხუთმეტ წამს ემსახურება ცხელ ფოლადზე.'
            : 'We opened with one idea: a burger is only as good as its crust. Everything else — the beef, the bread, the sauces — is built to serve that first fifteen seconds on hot steel.'}
        </p>
      </section>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/about-kitchen-plancha.jpg"
        alt={ka ? 'სამზარეულოს პლანჩა' : 'The plancha in the Vera kitchen'}
        className={styles.wideImage}
      />
      <div className={styles.caption}>
        <span>{ka ? 'სურ. 01 — პლანჩა ვერაში, ბარნოვის ქ.' : 'Fig. 01 — The plancha at Vera, Barnovi St.'}</span>
      </div>

      <section className={styles.story}>
        <span className={styles.kickerRed}>01 — {ka ? 'რატომ სმაში' : 'Why smash'}</span>
        <div className={styles.storyBody}>
          <p className={styles.pull}>
            {ka
              ? 'სქელი კატლეტი ორთქლდება. თხელი, ასეთ ცხელ ფოლადზე ძლიერად დაჭერილი, იბრაწება — და ის მაქმანისებრი, მუქი კიდე ნამდვილი გემოა.'
              : 'A thick patty steams. A thin one, pressed hard onto steel that hot, sears — and the lacy, mahogany edge is where the flavour lives.'}
          </p>
          <div className={styles.storyCols}>
            <p>
              {ka
                ? 'ჩვენი ხორცი კახეთისა და ქვემო ქართლის ფერმებიდან დაძველებული ფარფლის, მკერდისა და ნეკნის ნაზავია. დღეში ორჯერ ვფქვავთ, 90 გრამიან ბურთებად ვანაწილებთ და არასოდეს ვყინავთ.'
                : 'Our beef is a blend of dry-aged chuck, brisket and short rib from farms in Kakheti and Kvemo Kartli. We grind it twice a day, portion it into 90 g balls and never freeze it.'}
            </p>
            <p>
              {ka
                ? 'პური კარტოფილისა და რძის ბრიოშია, 18 საათის ცივი ფერმენტაციით, რომ წვენი შეინარჩუნოს და არ დალბეს. სოუსები, მწნილი და ბეკონის ჯემი ყოველ დილით ვერას სამზარეულოში მზადდება.'
                : 'The bread is a potato-milk brioche, cold-fermented for eighteen hours so it holds the juices without going soggy. Sauces, pickles and the bacon jam are made in the Vera kitchen every morning.'}
            </p>
          </div>
        </div>
      </section>

      <div className={styles.numbersWrap}>
        <dl className={styles.numbers}>
          {numbers.map((n) => (
            <div key={n.label} className={styles.number}>
              <dt>{n.label}</dt>
              <dd>
                <span className={styles.numberValue}>{n.v}</span>
                {n.u && <span className={styles.numberUnit}>{n.u}</span>}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <section className={styles.pillarsSection}>
        <div className={styles.sectionHead}>
          <div className={styles.sectionTitleWrap}>
            <span className={styles.kickerRed}>02 — {ka ? 'რას ვამზადებთ' : 'What we make'}</span>
            <h2 className={styles.sectionTitle}>
              {ka ? 'სამი რამ,' : 'Three things,'}
              <br />
              {ka ? 'სწორად გაკეთებული' : 'done properly'}
            </h2>
          </div>
          <p className={styles.aside}>
            {ka
              ? 'მოკლე მენიუ ნიშნავს, რომ თითოეულ პოზიციაზე მკაცრები ვართ.'
              : 'A short menu means we can be strict about every item on it.'}
          </p>
        </div>
        <div className={styles.pillars}>
          {pillars.map((p, i) => (
            <article key={p.t} className={styles.pillar}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.img} alt={p.t} className={styles.pillarImage} loading="lazy" />
              <div className={styles.pillarHead}>
                <span className={styles.kickerRed}>0{i + 1}</span>
                <h3>{p.t}</h3>
              </div>
              <p>{p.d}</p>
            </article>
          ))}
        </div>
        <button type="button" onClick={() => onNavigate('shop')} className={styles.btnRed}>
          {ka ? 'მენიუს ნახვა' : 'See the menu'} <ArrowIcon size={20} />
        </button>
      </section>

      <section className={styles.guarantee}>
        <span className={styles.guaranteeLabel}>{ka ? 'პლანჩის გარანტია' : 'The plancha guarantee'}</span>
        <p className={styles.guaranteeText}>
          {ka
            ? 'ისე არ მოგიმზადეთ, როგორც ითხოვეთ? ხელახლა მოვამზადებთ ან სრულად დაგიბრუნებთ თანხას.'
            : 'Not made the way you asked? We recook it or refund you in full.'}
        </p>
      </section>
    </div>
  );
};

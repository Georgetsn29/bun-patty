'use client';

import React, { useEffect, useState } from 'react';
import { CONTACT_INFO, LOCATIONS, isLocationOpen } from '@/data/locations';
import { BUSINESS_CONTENT } from '@/data/businessContent';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { ArrowIcon } from '@/components/layout/Header';
import styles from './ContactView.module.scss';

interface ContactViewProps {
  onNavigate?: (route: string) => void;
}

export const ContactView: React.FC<ContactViewProps> = ({ onNavigate }) => {
  const [form, setForm] = useState({ name: '', email: '', phone: '', topic: 'dining', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { language } = useLanguage();
  const ka = language === 'ka';

  // Client-only to avoid hydration mismatches.
  const [openMap, setOpenMap] = useState<Record<string, boolean> | null>(null);
  useEffect(() => {
    const update = () =>
      setOpenMap(Object.fromEntries(LOCATIONS.map((l) => [l.id, isLocationOpen(l)])));
    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = ka ? 'სახელი სავალდებულოა' : 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = ka ? 'მიუთითეთ მოქმედი ელ-ფოსტა' : 'Valid email is required';
    if (!form.message.trim() || form.message.length < 10) errs.message = ka ? 'გთხოვთ დაწეროთ შეტყობინება (მინიმუმ 10 სიმბოლო)' : 'Please provide details (minimum 10 characters)';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSent(true);
      setForm({ name: '', email: '', phone: '', topic: 'dining', message: '' });
    }, 700);
  };

  const channels = [
    {
      k: ka ? 'დარეკე სამზარეულოში' : 'Call the kitchen',
      s: ka ? 'მიმდინარე შეკვეთები · ყველაზე სწრაფი' : 'Orders in progress · fastest',
      v: CONTACT_INFO.phone,
      href: `tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`,
      primary: true,
    },
    {
      k: ka ? 'ზოგადი' : 'General',
      s: ka ? 'შეფასებები, კითხვები, ალერგიები' : 'Feedback, questions, allergies',
      v: CONTACT_INFO.email,
      href: `mailto:${CONTACT_INFO.email}`,
    },
    {
      k: ka ? 'ღონისძიებები და ქეითერინგი' : 'Events & catering',
      s: ka ? 'დაჯავშნა, საოფისე ლანჩები, წვეულებები' : 'Buyouts, office lunches, parties',
      v: BUSINESS_CONTENT.contact.cateringEmail,
      href: `mailto:${BUSINESS_CONTENT.contact.cateringEmail}`,
    },
    {
      k: ka ? 'პრესა' : 'Press',
      s: ka ? 'ინტერვიუები და ფოტოები' : 'Interviews and images',
      v: BUSINESS_CONTENT.contact.pressEmail,
      href: `mailto:${BUSINESS_CONTENT.contact.pressEmail}`,
    },
  ];

  const field = (key: 'name' | 'email' | 'phone', label: string, type: string, placeholder: string, auto: string) => (
    <label className={styles.field}>
      <span className={styles.label}>{label}</span>
      <input
        type={type}
        autoComplete={auto}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className={cn(styles.input, errors[key] && styles.inputError)}
        aria-invalid={Boolean(errors[key])}
      />
      {errors[key] && <span className={styles.error}>{errors[key]}</span>}
    </label>
  );

  return (
    <div className={styles.contact}>
      <section className={styles.hero}>
        <div className={styles.heroText}>
          <span className={styles.kicker}>{ka ? 'კონტაქტი · ვპასუხობთ ერთ დღეში' : 'Contact · We reply within a day'}</span>
          <h1 className={styles.title}>
            {ka ? 'მოგვწერე' : 'Say hello'}
            <span className={styles.dot}>.</span>
          </h1>
        </div>
        <p className={styles.lead}>
          {ka
            ? 'მიმდინარე შეკვეთაზე პირდაპირ სამზარეულოში დარეკე — ეს ელფოსტაზე სწრაფია. დანარჩენ საკითხებზე მოგვწერე.'
            : 'For an order in progress, call the kitchen directly — it’s faster than email. For everything else, write to us.'}
        </p>
      </section>

      <div className={styles.body}>
        <div className={styles.left}>
          <div className={styles.channels}>
            {channels.map((c) => (
              <a key={c.k} href={c.href} className={styles.channel}>
                <span className={styles.channelMeta}>
                  <span className={cn(styles.channelLabel, c.primary && styles.channelLabelRed)}>{c.k}</span>
                  <span className={styles.channelSub}>{c.s}</span>
                </span>
                <span className={styles.channelValue}>{c.v}</span>
                <ArrowIcon size={24} />
              </a>
            ))}
          </div>

          <div className={styles.hours}>
            <h2 className={styles.hoursTitle}>{ka ? 'სამუშაო საათები' : 'Kitchen hours'}</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{ka ? 'ფილიალი' : 'Kitchen'}</th>
                  <th>{ka ? 'ორშ–ხუთ' : 'Mon–Thu'}</th>
                  <th>{ka ? 'პარ–კვი' : 'Fri–Sun'}</th>
                  <th aria-label={ka ? 'სტატუსი' : 'Status'} />
                </tr>
              </thead>
              <tbody>
                {LOCATIONS.map((loc) => {
                  const open = openMap?.[loc.id];
                  return (
                    <tr key={loc.id}>
                      <td className={styles.kitchenCell}>
                        <a
                          href={`#/locations/${loc.id}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate?.(`locations/${loc.id}`);
                          }}
                        >
                          {loc.shortName.toUpperCase()}
                        </a>
                      </td>
                      <td>{loc.hoursWeekday}</td>
                      <td>{loc.hoursWeekend}</td>
                      <td className={open === undefined ? '' : open ? styles.open : styles.closed}>
                        {open === undefined ? '' : open ? (ka ? 'ღიაა' : 'Open') : ka ? 'დაკეტილია' : 'Closed'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className={styles.formPanel}>
          {isSent ? (
            <div className={styles.sent} role="status">
              <span className={styles.sentLabel}>{ka ? 'შეტყობინება გაიგზავნა' : 'Message sent'}</span>
              <h2 className={styles.formTitle}>
                {ka ? 'მადლობა — მალე' : 'Thanks — we’ll'}
                <br />
                {ka ? 'დაგიკავშირდებით' : 'be in touch'}
                <span className={styles.dot}>.</span>
              </h2>
              <p className={styles.muted}>
                {ka
                  ? 'ყველა შეტყობინებას მენეჯერი კითხულობს. პასუხს ერთ სამუშაო დღეში მიიღებ.'
                  : 'A manager reads every note. Expect a reply within one working day.'}
              </p>
              <button type="button" onClick={() => setIsSent(false)} className={styles.btnOutline}>
                {ka ? 'კიდევ ერთის გაგზავნა' : 'Send another'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form} noValidate>
              <div className={styles.formHead}>
                <h2 className={styles.formTitle}>{ka ? 'მოგვწერე' : 'Send us a note'}</h2>
                <p className={styles.muted}>
                  {ka ? 'ყოველდღე კითხულობენ სამზარეულოსა და დარბაზის მენეჯერები.' : 'Read daily by our kitchen and floor managers.'}
                </p>
              </div>
              <div className={styles.row}>
                {field('name', ka ? 'სახელი და გვარი' : 'Full name', 'text', ka ? 'გიორგი ბერიძე' : 'Giorgi Beridze', 'name')}
                {field('email', ka ? 'ელფოსტა' : 'Email', 'email', 'giorgi@domain.ge', 'email')}
              </div>
              {field('phone', ka ? 'ტელეფონი (არასავალდებულო)' : 'Phone (optional)', 'tel', '+995 599 00 00 00', 'tel')}
              <label className={styles.field}>
                <span className={styles.label}>{ka ? 'თემა' : 'Subject'}</span>
                <select
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  className={styles.input}
                >
                  <option value="dining">{ka ? 'ზოგადი კითხვა' : 'General question'}</option>
                  <option value="catering">{ka ? 'ღონისძიებები და ქეითერინგი' : 'Events & catering'}</option>
                  <option value="dietary">{ka ? 'ალერგენები და ინგრედიენტები' : 'Dietary & sourcing'}</option>
                  <option value="press">{ka ? 'პრესა' : 'Press'}</option>
                </select>
              </label>
              <label className={styles.field}>
                <span className={styles.label}>{ka ? 'შეტყობინება' : 'Message'}</span>
                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder={ka ? 'სტუმრების რაოდენობა, თარიღი, დიეტური შენიშვნები…' : 'Party size, date, any dietary notes…'}
                  className={cn(styles.input, styles.textarea, errors.message && styles.inputError)}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <span className={styles.error}>{errors.message}</span>}
              </label>
              <button type="submit" disabled={isSubmitting} className={styles.submit}>
                {isSubmitting ? (ka ? 'იგზავნება…' : 'Sending…') : ka ? 'გაგზავნა' : 'Send message'}
                <ArrowIcon size={20} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

'use client';

import React, { useState } from 'react';
import { CONTACT_INFO } from '@/data/locations';
import { useLanguage } from '@/context/LanguageContext';
import { cleanPlaceholder } from '@/lib/utils';
import styles from './ContactView.module.scss';

export const ContactView: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    topic: 'dining',
    message: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const { t, language } = useLanguage();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = language === 'ka' ? 'სახელი სავალდებულოა' : 'Full name is required';
    if (!form.email.trim() || !form.email.includes('@')) errs.email = language === 'ka' ? 'მიუთითეთ მოქმედი ელ-ფოსტა' : 'Valid email is required';
    if (!form.message.trim() || form.message.length < 10) errs.message = language === 'ka' ? 'გთხოვთ დაწეროთ შეტყობინება (მინიმუმ 10 სიმბოლო)' : 'Please provide details (minimum 10 characters)';
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
      setForm({ name: '', email: '', topic: 'dining', message: '' });
    }, 700);
  };

  return (
    <div className={styles.contact}>
      {/* Header */}
      <div className={styles.header}>
        <span className={styles.kicker}>
          {t('contact.kicker')}
        </span>
        <h1 className={styles.title}>
          {t('contact.title')}
        </h1>
        <p className={styles.headerNote}>
          {t('contact.subtitle')}
        </p>
      </div>

      <div className={styles.contactGrid}>
        {/* Left Column: Direct Inquiries Directory (5 Cols) */}
        <div className={styles.directoryCol}>
          <div className={styles.dirSection}>
            <span className={styles.dirLabel}>
              {language === 'ka' ? 'მთავარი ლოკაცია' : 'Flagship Address'}
            </span>
            <div className={styles.dirBody}>
              <p style={{ fontWeight: 600 }}>{cleanPlaceholder(CONTACT_INFO.address)}</p>
              <p>{cleanPlaceholder(CONTACT_INFO.cityStateZip)}</p>
              <p className={styles.addressSub}>{language === 'ka' ? 'ვერა, რუსთაველის მეტროსთან' : 'Vera district, steps from Rustaveli Metro'}</p>
            </div>
          </div>

          <div className={styles.dirSection}>
            <span className={styles.dirLabel}>
              {language === 'ka' ? 'პირდაპირი კონტაქტი' : 'Direct Contact'}
            </span>
            <div className={styles.contactList}>
              <p>
                {language === 'ka' ? 'ტელეფონი:' : 'Telephone:'}{' '}
                <a href={`tel:${CONTACT_INFO.phone}`} className={styles.contactLink}>
                  {CONTACT_INFO.phone}
                </a>
              </p>
              <p>
                {language === 'ka' ? 'ზოგადი საკითხები:' : 'General Inquiries:'}{' '}
                <a href={`mailto:${CONTACT_INFO.email}`} className={styles.contactLink}>
                  {CONTACT_INFO.email}
                </a>
              </p>
              <p>
                {language === 'ka' ? 'მედია და პრესა:' : 'Press & Media:'}{' '}
                <a href="mailto:press@bunandpatty.ge" className={styles.contactSubLink}>
                  press@bunandpatty.ge
                </a>
              </p>
            </div>
          </div>

          <div className={styles.dirSection} style={{ borderBottom: 'none', paddingBottom: 0 }}>
            <span className={styles.dirLabel}>
              {language === 'ka' ? 'სამზარეულოს განრიგი' : 'Kitchen Operating Schedule'}
            </span>
            <div className={styles.scheduleList}>
              <p>{language === 'ka' ? 'ორშაბათი — ხუთშაბათი: 11:30 — 23:00' : 'Monday — Thursday: 11:30 — 23:00'}</p>
              <p>{language === 'ka' ? 'პარასკევი — კვირა: 11:00 — 00:00' : 'Friday — Sunday: 11:00 — 00:00'}</p>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Typographic Inquiry Form (7 Cols) */}
        <div className={styles.formCard}>
          <div className={styles.formHeader}>
            <h2 className={styles.formTitle}>
              {language === 'ka' ? 'გამოგვიგზავნეთ შეტყობინება' : 'Send a Dispatch'}
            </h2>
            <p className={styles.formNote}>
              {language === 'ka' ? 'შეტყობინებებს ჩვენი მენეჯმენტი განიხილავს ყოველდღიურად.' : 'Messages are reviewed by our floor and kitchen management daily.'}
            </p>
          </div>

          {isSent && (
            <div className={styles.successAlert}>
              {t('contact.successNotice')}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('contact.formName')} *
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ka' ? 'გიორგი ბერიძე' : 'Giorgi Beridze'}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={styles.input}
                />
                {errors.name && <p className={styles.errorText}>{errors.name}</p>}
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>
                  {t('contact.formEmail')} *
                </label>
                <input
                  type="email"
                  required
                  placeholder="giorgi@domain.ge"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={styles.input}
                />
                {errors.email && <p className={styles.errorText}>{errors.email}</p>}
              </div>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t('contact.formSubject')}
              </label>
              <select
                value={form.topic}
                onChange={(e) => setForm({ ...form, topic: e.target.value })}
                className={styles.select}
              >
                <option value="dining">{language === 'ka' ? 'სტუმრობა და დიდი მაგიდები' : 'General Dining & Large Tables'}</option>
                <option value="catering">{language === 'ka' ? 'ეზოს დაჯავშნა და ქეითერინგი' : 'Patio Buyouts & Event Catering'}</option>
                <option value="dietary">{language === 'ka' ? 'ალერგენები და ინგრედიენტები' : 'Dietary & Sourcing Questions'}</option>
                <option value="press">{language === 'ka' ? 'პრესა და მედია' : 'Press & Editorial Inquiries'}</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {t('contact.formMessage')} *
              </label>
              <textarea
                rows={4}
                required
                placeholder={language === 'ka' ? 'მიუთითეთ სტუმრების რაოდენობა, სასურველი თარიღი ან დეტალები...' : 'Include party size, requested dates, or specific dietary notes...'}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className={styles.textarea}
              />
              {errors.message && <p className={styles.errorText}>{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              {isSubmitting
                ? language === 'ka'
                  ? 'იგზავნება...'
                  : 'Sending Dispatch...'
                : t('contact.sendMessage')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};


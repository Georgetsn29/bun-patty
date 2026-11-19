import { asset } from '@/lib/basePath';
import { BUSINESS_CONTENT, BusinessLocation } from './businessContent';

export interface LocationItem extends BusinessLocation {
  coordinates: { lat: number; lng: number };
  /** Dining-room photo in /public/images */
  image: string;
  /** Short display name, e.g. "Vera" */
  shortName: string;
}

const LOCATION_IMAGES = [
  asset('/images/location-west-village-flagship.jpg'), // Vera
  asset('/images/location-soho-cast-iron.jpg'), // Vake
  asset('/images/location-cobble-hill-parlour.jpg'), // Sololaki
  asset('/images/location-brooklyn-heights.jpg'), // Nutsubidze [Placeholder photo]
];

export const CONTACT_INFO = {
  address: BUSINESS_CONTENT.locations[0].address,
  cityStateZip: BUSINESS_CONTENT.locations[0].cityStateZip,
  phone: BUSINESS_CONTENT.locations[0].phone,
  email: BUSINESS_CONTENT.contact.generalEmail,
  hours: BUSINESS_CONTENT.locations[0].hoursDisplay,
};

export const LOCATIONS: LocationItem[] = BUSINESS_CONTENT.locations.map((loc, idx) => ({
  ...loc,
  coordinates: [
    { lat: 41.7065, lng: 44.7865 }, // Vera Flagship
    { lat: 41.7102, lng: 44.7645 }, // Vake Kitchen
    { lat: 41.6912, lng: 44.8015 }, // Sololaki Parlour
    { lat: 41.72575, lng: 44.71826 }, // Nutsubidze Kitchen — 215 Shalva Nutsubidze St (OpenStreetMap)
  ][idx] || { lat: 41.7065, lng: 44.7865 },
  image: LOCATION_IMAGES[idx] || LOCATION_IMAGES[0],
  shortName: loc.name.split(' ')[0],
}));

/** "Open now · until 23:00" / "Closed · opens 11:30" for the current Tbilisi time. */
export function locationStatus(loc: BusinessLocation, ka = false): { open: boolean; label: string } {
  const open = isLocationOpen(loc);
  const { day } = tbilisiNow();
  const range = hoursForDay(loc, day).split(/\s*[–-]\s*/);
  if (open) return { open, label: ka ? `ღიაა · ${range[1]}-მდე` : `Open now · until ${range[1]}` };
  return { open, label: ka ? `დაკეტილია · იხსნება ${range[0]}` : `Closed · opens ${range[0]}` };
}

/* ---------- Opening-hours helpers (Tbilisi time) ---------- */

/** "11:30 – 23:00" -> [690, 1380]; a closing time at/before opening rolls past midnight. */
export function parseHoursRange(range: string): [number, number] | null {
  const m = range.match(/(\d{1,2}):(\d{2})\s*[–-]\s*(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const open = +m[1] * 60 + +m[2];
  let close = +m[3] * 60 + +m[4];
  if (close <= open) close += 24 * 60;
  return [open, close];
}

/** Current day-of-week (0 = Sun) and minutes since midnight in Tbilisi. */
export function tbilisiNow(): { day: number; minutes: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Tbilisi',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  const day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
  return { day, minutes: +get('hour') * 60 + +get('minute') };
}

/** Mon–Thu use weekday hours, Fri–Sun weekend hours. */
export function hoursForDay(loc: BusinessLocation, day: number): string {
  return day >= 1 && day <= 4 ? loc.hoursWeekday : loc.hoursWeekend;
}

export function isLocationOpen(loc: BusinessLocation): boolean {
  const { day, minutes } = tbilisiNow();
  const today = parseHoursRange(hoursForDay(loc, day));
  if (today && minutes >= today[0] && minutes < today[1]) return true;
  // Still inside yesterday's past-midnight window?
  const yesterday = parseHoursRange(hoursForDay(loc, (day + 6) % 7));
  return !!yesterday && yesterday[1] > 1440 && minutes < yesterday[1] - 1440;
}

export const FEATURE_KA: Record<string, string> = {
  'Garden Courtyard': 'ბაღის ეზო',
  'Plancha Show Griddle': 'ღია პლანჩა',
  'Local Craft Beers': 'ადგილობრივი ლუდი',
  'Express Pickup Counter': 'სწრაფი გატანის დახლი',
  'Modern Dining Room': 'თანამედროვე დარბაზი',
  'Late Night Kitchen': 'გვიანი სამზარეულო',
  'Full Bar': 'სრული ბარი',
  'Courier Loading Zone': 'კურიერების ზონა',
  'Historic Brick Vault Seating': 'ისტორიული აგურის თაღები',
  'Frozen Custard Window': 'ნაყინის ფანჯარა',
  'Street Patio Benches': 'ქუჩის ტერასა',
};

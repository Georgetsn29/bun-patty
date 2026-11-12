/**
 * EDITABLE BUSINESS CONTENT & COPY (LOCALIZED FOR GEORGIA)
 * 
 * Central repository for brand identity, locations, contact info,
 * hours, and culinary claims.
 * 
 * [PLACEHOLDER] flags mark details that can be replaced
 * with real operational data.
 */

export interface BusinessLocation {
  id: string;
  name: string;
  isFlagship?: boolean;
  address: string;
  cityStateZip: string;
  neighborhood: string;
  phone: string;
  email: string;
  hoursWeekday: string;
  hoursWeekend: string;
  hoursDisplay: string;
  features: string[];
  transit: string;
  isPlaceholder: boolean;
}

export const BUSINESS_CONTENT = {
  // Brand name & identity
  brandName: 'BUN & PATTY',
  brandTagline: 'Burger Bar',
  topAnnouncement: 'ORDER ONLINE FOR PICKUP OR FAST COURIER DELIVERY ACROSS TBILISI · READY IN ABOUT 20 MIN',

  // Culinary & Quality Claims
  /* [PLACEHOLDER: Replace with verified local farm names and supplier data] */
  claims: {
    beefBlend: '28-Day Dry-Aged Angus Chuck, Brisket & Short Rib',
    beefDescription: 'Whole muscle cuts from pasture-raised cattle from family farms in Kakheti and Kvemo Kartli [Placeholder: farm partners to be verified]. Ground fresh twice daily and smashed paper-thin on 260°C carbon steel plancha.',
    breadCraft: 'House Potato-Milk Brioche',
    breadDescription: 'Slow 18-hour cold fermented brioche formulated with unbleached flour, pasture eggs, and 22% European cultured butter, griddled in clarified butter.',
    condiments: 'Slow-Cooked Smoky Bourbon Bacon Jam & Saperavi Onions',
    condimentsDescription: 'Small-batch condiments simmered from scratch with caramelized sweet onions, smoked bacon, bourbon, Kakheti Saperavi wine marinade [Placeholder], and whole spices.',
    dairyCustard: 'Dense Frozen Custard Shakes',
    dairyDescription: 'Hand-spun with whole Georgian dairy milk [Placeholder], real egg yolks, and scraped Madagascar bourbon vanilla caviar.',
    isPlaceholder: true,
  },

  // Locations & Operating Hours (Tbilisi, Georgia +995 format & 24h times)
  /* [PLACEHOLDER: Replace with actual brick-and-mortar addresses, phone numbers, and operating hours] */
  locations: [
    {
      id: 'vera-flagship',
      name: 'Vera Flagship',
      isFlagship: true,
      address: '24 Barnovi St [Placeholder]',
      cityStateZip: 'Tbilisi 0179, Georgia',
      neighborhood: 'Vera',
      phone: '+995 32 255 0194',
      email: 'vera@bunandpatty.ge',
      hoursWeekday: '11:30 – 23:00',
      hoursWeekend: '11:00 – 00:00',
      hoursDisplay: 'Daily 11:30 – 23:00',
      features: ['Garden Courtyard', 'Plancha Show Griddle', 'Local Craft Beers', 'Express Pickup Counter'],
      transit: '5 min walk from Rustaveli Metro Station (Red Line)',
      isPlaceholder: true,
    },
    {
      id: 'vake-kitchen',
      name: 'Vake Kitchen',
      isFlagship: false,
      address: '49 Irakli Abashidze St [Placeholder]',
      cityStateZip: 'Tbilisi 0162, Georgia',
      neighborhood: 'Vake',
      phone: '+995 32 255 0218',
      email: 'vake@bunandpatty.ge',
      hoursWeekday: '12:00 – 22:30',
      hoursWeekend: '11:30 – 00:00',
      hoursDisplay: 'Mon–Thu til 22:30 · Fri–Sat til 00:00',
      features: ['Modern Dining Room', 'Late Night Kitchen', 'Full Bar', 'Courier Loading Zone'],
      transit: 'Steps from Vake Park, buses 301, 307, and 345',
      isPlaceholder: true,
    },
    {
      id: 'sololaki-parlour',
      name: 'Sololaki Parlour',
      isFlagship: false,
      address: '18 Lado Asatiani St [Placeholder]',
      cityStateZip: 'Tbilisi 0105, Georgia',
      neighborhood: 'Old Tbilisi / Sololaki',
      phone: '+995 32 255 0371',
      email: 'sololaki@bunandpatty.ge',
      hoursWeekday: '11:30 – 22:30',
      hoursWeekend: '11:00 – 23:00',
      hoursDisplay: 'Daily 11:30 – 22:30',
      features: ['Historic Brick Vault Seating', 'Frozen Custard Window', 'Street Patio Benches'],
      transit: '3 min walk from Liberty Square Metro Station',
      isPlaceholder: true,
    },
  ] as BusinessLocation[],

  // Primary Contact Info (Tbilisi)
  /* [PLACEHOLDER: Replace with primary business inquiries] */
  contact: {
    generalEmail: 'hello@bunandpatty.ge',
    cateringEmail: 'events@bunandpatty.ge',
    pressEmail: 'press@bunandpatty.ge',
    headquartersAddress: '24 Barnovi St, Tbilisi 0179, Georgia [Placeholder]',
    isPlaceholder: true,
  },

  // Social Links
  socials: [
    { label: 'Instagram', handle: '@bunandpatty.tbilisi', url: '#' },
    { label: 'Spotify Radio', handle: 'BUN & PATTY Kitchen Mix', url: '#' },
    { label: 'Dispatch Newsletter', handle: 'Weekly Kitchen Notes', url: '#/contact' },
  ],
};

import { BUSINESS_CONTENT, BusinessLocation } from './businessContent';

export interface LocationItem extends BusinessLocation {
  coordinates: { lat: number; lng: number };
}

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
  ][idx] || { lat: 41.7065, lng: 44.7865 },
}));

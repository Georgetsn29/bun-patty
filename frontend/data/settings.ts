/**
 * STORE & COMMERCE SETTINGS (LOCALIZED FOR GEORGIA)
 * Central configuration for fees, tax rates, currency, and checkout parameters.
 * All prices and rates are editable here.
 */

export const STORE_SETTINGS = {
  // Currency display: Georgian Lari (₾)
  currency: {
    symbol: '₾',
    code: 'GEL',
    name: 'Georgian Lari',
  },

  // Sales Tax rate (In Georgia, standard 18% VAT is already included in displayed menu prices)
  taxRate: 0.0,
  taxLabel: 'Taxes (18% VAT included)',

  // Delivery configuration across Tbilisi
  deliveryFee: 5.00, // 5.00 ₾ flat courier delivery fee
  freeDeliveryThreshold: 50.00, // Orders 50.00 ₾ and above get complimentary delivery

  // Estimated turnaround times (Georgia 24h format context)
  pickupPrepTime: '15–20 minutes',
  deliveryTurnaround: '25–40 minutes',

  // Gratuity options - Defaulted to None (0%), no automatic tip
  tipOptions: [
    { label: 'None', percent: 0 },
    { label: '5%', percent: 5 },
    { label: '10%', percent: 10 },
    { label: '15%', percent: 15 },
  ],
  defaultTipPercent: 0, // No automatic tip

  // Maximum allowed quantity per paid ingredient extra
  maxExtraQuantity: 3,
};

/**
 * Standard currency price formatter: "26.90 ₾"
 */
export function formatPrice(amount: number): string {
  return `${amount.toFixed(2)} ${STORE_SETTINGS.currency.symbol}`;
}

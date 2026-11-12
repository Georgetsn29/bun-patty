// Configuration settings for simulated order tracking

export const ORDER_TRACKING_CONFIG = {
  // Show demo tracking explanation note on the tracking page (can be toggled off)
  showDemoNotice: true,

  // Speed multiplier for testing (1 = normal real-time, 60 = 1 minute per real second)
  // Set to 1 for production, toggle higher for quick verification
  speedMultiplier: 1,

  // Optional delivery turnaround time in minutes for delivery orders (default 0)
  deliveryTimeMinutes: 0,

  // Automatically hide completed orders 2 hours after they are ready
  completedOrderHideHours: 2,

  // Restaurant contact phone numbers
  supportPhone: '+995 32 2 12 34 56',
  supportPhoneHref: 'tel:+995322123456',

  // Flagship address and Google Maps directions link
  flagshipName: 'Flagship Outpost (Vera)',
  flagshipAddress: '24 Barnovi St, Vera, Tbilisi',
  flagshipDirectionsUrl: 'https://maps.google.com/?q=24+Barnovi+St+Tbilisi',

  // Base the order tracking statuses on the same timer by percentage of time passed:
  // - Order received: 0-10%
  // - Preparing: 10-40%
  // - On the grill: 40-85%
  // - Almost ready: 85-100%
  // - Ready: 100%
  statusPercentages: {
    received: { min: 0.0, max: 0.10 },
    preparing: { min: 0.10, max: 0.40 },
    onTheGrill: { min: 0.40, max: 0.85 },
    almostReady: { min: 0.85, max: 1.00 },
    ready: { min: 1.00 },
  },

  // Maximum number of recent orders retained in localStorage
  maxRecentOrders: 10,

  // LocalStorage storage keys
  storageKey: 'bp_orders_v1',
  homeCardExpandedKey: 'bp_home_card_expanded',
  dismissedOrdersKey: 'bp_dismissed_home_orders',
};

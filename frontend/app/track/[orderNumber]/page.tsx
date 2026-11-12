'use client';

import { useEffect, use } from 'react';

export default function TrackOrderPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const unwrappedParams = use(params);
  const orderNumber = unwrappedParams.orderNumber;

  useEffect(() => {
    if (orderNumber) {
      window.location.replace(`/#/track/${orderNumber}`);
    } else {
      window.location.replace('/#/track');
    }
  }, [orderNumber]);

  return null;
}

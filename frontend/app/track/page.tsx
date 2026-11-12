'use client';

import { useEffect } from 'react';

export default function TrackPage() {
  useEffect(() => {
    window.location.replace('/#/track');
  }, []);

  return null;
}

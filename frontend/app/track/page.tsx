'use client';

import { useEffect } from 'react';
import { BASE_PATH } from '@/lib/basePath';

export default function TrackPage() {
  useEffect(() => {
    window.location.replace(`${BASE_PATH}/#/track`);
  }, []);

  return null;
}

'use client';

import { useEffect } from 'react';
import { BASE_PATH } from '@/lib/basePath';

/**
 * Static hosting can't serve /track/<orderNumber> as a real page, so it lands on 404.
 * Forward those URLs to the in-app hash route (#/track/<orderNumber>).
 */
export function TrackPathRedirect() {
  useEffect(() => {
    const path = window.location.pathname.slice(BASE_PATH.length);
    const match = path.match(/^\/track\/([^/]+)\/?$/);
    if (match) {
      window.location.replace(`${BASE_PATH}/#/track/${match[1]}`);
    }
  }, []);
  return null;
}

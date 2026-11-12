'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error boundary caught error:', error);
  }, [error]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        backgroundColor: '#0B1416',
        color: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h2 style={{ fontSize: '1.75rem', fontWeight: 700, margin: '0 0 16px 0', color: '#E27344' }}>
        Something went wrong
      </h2>
      <p style={{ color: '#8A9698', maxWidth: '420px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
        An unexpected error occurred while loading this section.
      </p>
      <button
        onClick={() => reset()}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E27344',
          color: '#FFFFFF',
          fontWeight: 700,
          padding: '12px 24px',
          borderRadius: '8px',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Try again
      </button>
    </div>
  );
}

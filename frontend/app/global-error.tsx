'use client';

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          backgroundColor: '#0B1416',
          color: '#FFFFFF',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '2rem', fontWeight: 800, color: '#E27344', marginBottom: '16px' }}>
          Application Error
        </h2>
        <p style={{ color: '#8A9698', marginBottom: '24px' }}>
          A critical error occurred. Please refresh or try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
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
      </body>
    </html>
  );
}

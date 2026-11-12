import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#0B1416',
        color: '#FFFFFF',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <h1 style={{ fontSize: '4rem', fontWeight: 800, margin: '0 0 12px 0', color: '#E27344' }}>
        404
      </h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '0 0 16px 0' }}>
        Page Not Found
      </h2>
      <p style={{ color: '#8A9698', maxWidth: '420px', lineHeight: 1.6, margin: '0 0 24px 0' }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#E27344',
          color: '#FFFFFF',
          fontWeight: 700,
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          transition: 'background-color 0.2s ease',
        }}
      >
        Return to Home
      </Link>
    </div>
  );
}

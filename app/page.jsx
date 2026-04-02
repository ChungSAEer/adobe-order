import Link from 'next/link';

export const metadata = {
  title: 'Home | Voucher Kingdom',
};

export default function HomePage() {
  return (
    <main className="page">
      <div className="card">
        <div className="logo-area">
          <div className="logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>Adobe Team</span>
          </div>
          <h1 className="card-title">Adobe Order</h1>
          <p className="card-subtitle">
            Fast &amp; secure Adobe activation system.<br/>
            Please use the link provided by your admin.
          </p>
        </div>
        <p className="footer-note" style={{ marginTop: 0 }}>
          Don&apos;t have a link? Contact your Telegram admin for assistance.
        </p>
      </div>
    </main>
  );
}

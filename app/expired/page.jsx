const LOGO_URL =
  'https://production-gameflipusercontent.fingershock.com/us-east-1:41dea0ad-0ae0-4f09-bd7f-0f9151bf5ae3/avatar/be27339f-60f3-41f2-b012-aa359da9a320/320x320.webp';

export const metadata = {
  title: 'Link không hợp lệ | Voucher Kingdom',
};

export default function ExpiredPage() {
  return (
    <main className="page">
      <div className="card">
        <div className="brand">
          <img className="brand-logo" src={LOGO_URL} alt="Voucher Kingdom" />
          <div className="brand-text">
            <h1>Voucher Kingdom</h1>
            <p>Elegant, secure Adobe activation.</p>
          </div>
        </div>
        <div className="divider" />

        <div className="status-icon warn">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p className="status-title" style={{ color: '#ef4444' }}>Link không hợp lệ</p>
        <p className="status-sub">
          Link này đã được sử dụng hoặc không còn tồn tại.<br />
          Vui lòng liên hệ admin để nhận link mới.
        </p>
        <p className="footer-note">Mỗi link chỉ sử dụng được một lần duy nhất.</p>
      </div>
    </main>
  );
}

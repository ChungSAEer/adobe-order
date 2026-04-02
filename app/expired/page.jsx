export const metadata = {
  title: 'Link không còn hiệu lực | Adobe Order',
};

export default function ExpiredPage() {
  return (
    <main className="page">
      <div className="card">
        <div className="status-icon warn">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#ff6b9d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <p className="status-title" style={{ color: 'var(--accent-2)' }}>Link không hợp lệ</p>
        <p className="status-sub">
          Link này đã được sử dụng hoặc không còn tồn tại.<br/>
          Vui lòng liên hệ admin để nhận link mới.
        </p>
        <p className="footer-note" style={{ marginTop: 32 }}>
          Adobe Order · Mỗi link chỉ dùng được một lần
        </p>
      </div>
    </main>
  );
}

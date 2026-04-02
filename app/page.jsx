import Link from 'next/link';

export const metadata = {
  title: 'Trang chủ | Adobe Order',
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
            Hệ thống đặt hàng Adobe nhanh chóng &amp; an toàn.<br/>
            Vui lòng sử dụng đường link được cấp từ admin.
          </p>
        </div>
        <p className="footer-note" style={{ marginTop: 0 }}>
          Nếu bạn chưa có link, hãy liên hệ admin Telegram để được hỗ trợ.
        </p>
      </div>
    </main>
  );
}

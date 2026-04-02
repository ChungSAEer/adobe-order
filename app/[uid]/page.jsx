import { redirect } from 'next/navigation';
import { getLink } from '@/lib/googleSheets';
import OrderForm from './OrderForm';

export async function generateMetadata({ params }) {
  return {
    title: 'Đặt hàng Adobe | Adobe Order',
    description: 'Điền thông tin để hoàn tất đặt hàng Adobe Creative Cloud.',
  };
}

export default async function OrderPage({ params }) {
  const { uid } = await params;

  let link;
  try {
    link = await getLink(uid);
  } catch {
    redirect('/expired');
  }

  if (!link || link.used) {
    redirect('/expired');
  }

  return (
    <main className="page">
      <div className="card">
        {/* Header */}
        <div className="logo-area">
          <div className="logo-badge">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <span>Adobe Team</span>
          </div>
          <h1 className="card-title">Đặt hàng nhanh</h1>
          <p className="card-subtitle">
            Gói <strong>{link.duration === '1m' ? '1 Tháng' : '3 Tháng'}</strong> · Điền email để hoàn tất
          </p>
        </div>

        {/* Form */}
        <OrderForm uid={uid} defaultDuration={link.duration} />
      </div>
    </main>
  );
}

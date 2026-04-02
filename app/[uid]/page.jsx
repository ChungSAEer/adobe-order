import { redirect } from 'next/navigation';
import { getLink } from '@/lib/googleSheets';
import OrderForm from './OrderForm';

export async function generateMetadata() {
  return {
    title: 'Kích hoạt Adobe | Voucher Kingdom',
    description: 'Kích hoạt Adobe Creative Cloud nhanh chóng và bảo mật.',
  };
}

const LOGO_URL =
  'https://production-gameflipusercontent.fingershock.com/us-east-1:41dea0ad-0ae0-4f09-bd7f-0f9151bf5ae3/avatar/be27339f-60f3-41f2-b012-aa359da9a320/320x320.webp';

export default async function OrderPage({ params }) {
  const { uid } = await params;

  let link;
  try {
    link = await getLink(uid);
  } catch {
    redirect('/expired');
  }

  if (!link || link.used) redirect('/expired');

  return (
    <main className="page">
      <div className="card">
        {/* Brand */}
        <div className="brand">
          <img className="brand-logo" src={LOGO_URL} alt="Voucher Kingdom" />
          <div className="brand-text">
            <h1>Voucher Kingdom</h1>
            <p>Elegant, secure Adobe activation.</p>
          </div>
        </div>

        <div className="divider" />

        {/* Form */}
        <OrderForm uid={uid} defaultDuration={link.duration} />
      </div>
    </main>
  );
}

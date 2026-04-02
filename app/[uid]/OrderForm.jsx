'use client';

import { useState } from 'react';

const PLAN_OPTIONS = [
  { value: '1m', label: '1 Tháng', sub: 'Adobe Team' },
  { value: '3m', label: '3 Tháng', sub: 'Adobe Team' },
];

export default function OrderForm({ uid, defaultDuration }) {
  const [email, setEmail] = useState('');
  const [plan, setPlan]   = useState(defaultDuration || '1m');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [result, setResult]   = useState(null);

  const validate = () => {
    if (!email) { setEmailErr('Vui lòng nhập email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Email không hợp lệ');
      return false;
    }
    setEmailErr('');
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, email: email.trim().toLowerCase(), plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Có lỗi xảy ra');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  /* ── Success state ── */
  if (result) {
    return (
      <div>
        <div className="success-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#22d3a0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="success-title">Đặt hàng thành công!</p>
        <p className="success-sub">Đơn hàng của bạn đã được ghi nhận.</p>

        <div className="order-box">
          <div className="order-row">
            <span className="ok">Mã đơn hàng</span>
            <span className="ov">#{result.orderNumber}</span>
          </div>
          <div className="order-row">
            <span className="ok">Email</span>
            <span className="ov">{result.email}</span>
          </div>
          <div className="order-row">
            <span className="ok">Gói</span>
            <span className="ov">Adobe Team – {result.duration === '1m' ? '1 Tháng' : '3 Tháng'}</span>
          </div>
        </div>

        <p className="footer-note">
          Chúng tôi sẽ xử lý đơn của bạn trong thời gian sớm nhất 🎉
        </p>
      </div>
    );
  }

  /* ── Form state ── */
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className="field">
        <label className="label" htmlFor="email">Email Adobe</label>
        <input
          id="email"
          type="email"
          className={`input${emailErr ? ' error' : ''}`}
          placeholder="example@gmail.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
          autoComplete="email"
          disabled={loading}
        />
        {emailErr && <span className="error-msg">{emailErr}</span>}
      </div>

      {/* Plan */}
      <div className="field">
        <label className="label">Chọn gói</label>
        <div className="plan-grid">
          {PLAN_OPTIONS.map((opt) => (
            <label className="plan-card" key={opt.value}>
              <input
                type="radio"
                name="plan"
                value={opt.value}
                checked={plan === opt.value}
                onChange={() => setPlan(opt.value)}
                disabled={loading}
              />
              <div className="plan-label">
                <span className="plan-duration">{opt.label}</span>
                <span className="plan-name">{opt.sub}</span>
              </div>
              <div className="plan-check">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <div className="alert alert-danger">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,marginTop:2}}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <span className="spinner"/>}
        {loading ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
      </button>

      <p className="footer-note">🔒 Thông tin của bạn được bảo mật tuyệt đối</p>
    </form>
  );
}

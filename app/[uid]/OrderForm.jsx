'use client';

import { useState } from 'react';

const PLAN_OPTIONS = [
  { value: '1m', label: '1 Tháng', sub: 'Adobe Team' },
  { value: '3m', label: '3 Tháng', sub: 'Adobe Team' },
];

export default function OrderForm({ uid, defaultDuration }) {
  const [email, setEmail]       = useState('');
  const [plan]                  = useState(defaultDuration || '1m'); // locked
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [result, setResult]     = useState(null);

  const validate = () => {
    if (!email) { setEmailErr('Vui lòng nhập email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Email không hợp lệ'); return false;
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

  /* ── Success ── */
  if (result) {
    const expiresDate = result.expiresAt
      ? new Date(result.expiresAt).toLocaleDateString('vi-VN', {
          day: '2-digit', month: '2-digit', year: 'numeric',
        })
      : null;

    return (
      <div style={{ textAlign: 'center' }}>
        <div className="success-icon">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="success-title">Kích hoạt thành công! 🎉</p>
        <p className="success-sub">Tài khoản Adobe của bạn đã được kích hoạt.</p>

        <div className="order-box" style={{ textAlign: 'left' }}>
          <div className="order-row">
            <span className="ok">Mã đơn hàng</span>
            <span className="ov">#{result.orderNumber}</span>
          </div>
          <div className="order-row">
            <span className="ok">Email</span>
            <span className="ov" style={{ fontSize: 13, wordBreak: 'break-all' }}>{result.email}</span>
          </div>
          <div className="order-row">
            <span className="ok">Gói</span>
            <span className="ov">Adobe Team – {result.duration === '1m' ? '1 Tháng' : '3 Tháng'}</span>
          </div>
          {expiresDate && (
            <div className="order-row">
              <span className="ok">Hết hạn</span>
              <span className="ov" style={{ color: 'var(--success)' }}>{expiresDate}</span>
            </div>
          )}
        </div>

        <p className="footer-note">Kiểm tra email để xác nhận kích hoạt ✉️</p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className="field">
        <label className="label" htmlFor="adobe-email">Adobe Email (để kích hoạt)</label>
        <input
          id="adobe-email"
          type="email"
          className={`input${emailErr ? ' error' : ''}`}
          placeholder="name@example.com"
          value={email}
          onChange={(e) => { setEmail(e.target.value); if (emailErr) setEmailErr(''); }}
          autoComplete="email"
          disabled={loading}
        />
        {emailErr && <span className="error-msg">{emailErr}</span>}
      </div>

      {/* Plan – locked to link duration */}
      <div className="field">
        <label className="label">Gói đã chọn</label>
        <div className="plan-grid">
          {PLAN_OPTIONS.map((opt) => {
            const isLocked = opt.value !== defaultDuration;
            return (
              <label
                className="plan-card"
                key={opt.value}
                style={isLocked ? { opacity: 0.3, pointerEvents: 'none' } : undefined}
              >
                <input
                  type="radio"
                  name="plan"
                  value={opt.value}
                  checked={plan === opt.value}
                  onChange={() => {}}
                  disabled={isLocked || loading}
                  readOnly
                />
                <div className="plan-label">
                  <span className="plan-duration">{opt.label}</span>
                  <span className="plan-name">{opt.sub}</span>
                </div>
                <div className="plan-check">
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="alert alert-danger">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading && <span className="spinner" />}
        {loading ? 'Đang kích hoạt...' : 'Kích hoạt ngay'}
      </button>

      <p className="footer-note">🔒 Thông tin của bạn được bảo mật tuyệt đối</p>
    </form>
  );
}

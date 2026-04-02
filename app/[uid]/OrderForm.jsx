'use client';

import { useState } from 'react';

const PLAN_OPTIONS = [
  { value: '1m', label: '1 Month', sub: 'Adobe Team' },
  { value: '3m', label: '3 Months', sub: 'Adobe Team' },
];

export default function OrderForm({ uid, defaultDuration }) {
  const [email, setEmail]       = useState('');
  const [plan]                  = useState(defaultDuration || '1m');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [result, setResult]     = useState(null);

  const validate = () => {
    if (!email) { setEmailErr('Please enter your email'); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailErr('Invalid email address'); return false;
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
      if (!res.ok) throw new Error(data.error || 'Something went wrong');
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
      ? new Date(result.expiresAt).toLocaleDateString('en-GB', {
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
        <p className="success-title">Activation Successful! 🎉</p>
        <p className="success-sub">Your Adobe account has been activated.</p>

        <div className="order-box" style={{ textAlign: 'left' }}>
          <div className="order-row">
            <span className="ok">Order #</span>
            <span className="ov">#{result.orderNumber}</span>
          </div>
          <div className="order-row">
            <span className="ok">Email</span>
            <span className="ov" style={{ fontSize: 13, wordBreak: 'break-all' }}>{result.email}</span>
          </div>
          <div className="order-row">
            <span className="ok">Plan</span>
            <span className="ov">Adobe Team – {result.duration === '1m' ? '1 Month' : '3 Months'}</span>
          </div>
          {expiresDate && (
            <div className="order-row">
              <span className="ok">Expires</span>
              <span className="ov" style={{ color: 'var(--success)' }}>{expiresDate}</span>
            </div>
          )}
        </div>

        {/* Instruction */}
        <div className="alert alert-success" style={{ marginTop: 16, textAlign: 'left' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          Your account has been successfully activated. Please log out and log back into Adobe to complete the process.
        </div>

        <p className="footer-note">Check your inbox for activation confirmation ✉️</p>
      </div>
    );
  }

  /* ── Form ── */
  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      {/* Email */}
      <div className="field">
        <label className="label" htmlFor="adobe-email">Adobe Email (to activate)</label>
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

      {/* Plan – locked */}
      <div className="field">
        <label className="label">Selected Plan</label>
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
        {loading ? 'Activating...' : 'Activate Now'}
      </button>

      <p className="footer-note">🔒 Your information is kept strictly confidential</p>
    </form>
  );
}

import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister, apiBaseUrl }) {
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanedMobile = mobile.replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      setError('Please enter a valid 10-digit login mobile number.');
      return;
    }

    if (!pin || pin.length < 4) {
      setError('Please enter your shop PIN.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_mobile: cleanedMobile, pin })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid credentials or mobile number not registered.');
      }

      onLoginSuccess(data.shop, data.token);
    } catch (err) {
      console.error('Login Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card auth-card animate-fadeIn">
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div style={{
          width: '54px',
          height: '54px',
          margin: '0 auto 14px',
          borderRadius: '50%',
          background: 'rgba(229, 193, 88, 0.12)',
          border: '1px solid rgba(229, 193, 88, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--gold-primary)'
        }}>
          <KeyRound size={28} />
        </div>
        <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Shop Login
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
          Enter your registered shop mobile & secret PIN
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="toast toast-error">
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleLogin}>
        {/* Mobile Input */}
        <div className="input-group">
          <label className="input-label">Shop Mobile Number</label>
          <div className="input-wrapper">
            <Phone className="input-icon" size={18} />
            <input
              type="tel"
              className="custom-input"
              placeholder="Enter Registered Mobile Number"
              maxLength={10}
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        {/* PIN Input */}
        <div className="input-group">
          <div className="input-label">
            <span>Shop Security PIN</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>4 to 6 Digits</span>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPin ? 'text' : 'password'}
              className="custom-input"
              placeholder="Enter Security PIN"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              required
            />
            {showPin ? (
              <EyeOff
                className="input-action-icon"
                size={18}
                onClick={() => setShowPin(false)}
              />
            ) : (
              <Eye
                className="input-action-icon"
                size={18}
                onClick={() => setShowPin(true)}
              />
            )}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-gold"
          disabled={loading}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {loading ? (
            <span>Authenticating Shop...</span>
          ) : (
            <>
              <span>Login to Girvi Portal</span>
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </form>

      {/* Switch to Register */}
      <div style={{
        marginTop: '24px',
        paddingTop: '16px',
        borderTop: '1px dashed rgba(229, 193, 88, 0.2)',
        textAlign: 'center'
      }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          New Jeweller Shop?{' '}
        </span>
        <button
          type="button"
          onClick={onSwitchToRegister}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--gold-light)',
            fontWeight: 700,
            fontSize: '0.88rem',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Register Your Shop Here
        </button>
      </div>
    </div>
  );
}

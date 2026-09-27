import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, KeyRound, X, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function Login({ onLoginSuccess, onSwitchToRegister, apiBaseUrl }) {
  const effectiveApiBaseUrl = (apiBaseUrl && apiBaseUrl.trim() !== '')
    ? apiBaseUrl
    : (import.meta.env.VITE_API_BASE_URL || 'https://pavan-jewellers-backend.onrender.com');

  const parseJsonResponse = async (response) => {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (err) {
      if (text.includes('<!DOCTYPE') || text.includes('<html')) {
        throw new Error('Backend API server is starting up or temporarily offline on Render. Please wait 10 seconds and try again.');
      }
      throw new Error('Invalid response format received from server.');
    }
  };

  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Reset PIN state
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1 = Enter Shop Mobile, 2 = Enter OTP (sent to 9880518013) & New PIN
  const [resetShopMobile, setResetShopMobile] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmNewPin, setConfirmNewPin] = useState('');
  const [showNewPin, setShowNewPin] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState('');
  const [resetSuccessMsg, setResetSuccessMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

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
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_mobile: cleanedMobile, pin })
      });

      const data = await parseJsonResponse(response);

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

  const startResendTimer = () => {
    setResendTimer(30);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendResetOtp = async (e) => {
    e.preventDefault();
    setResetError('');
    setResetSuccessMsg('');

    const cleanedMobile = resetShopMobile.replace(/\D/g, '');
    if (cleanedMobile.length < 10) {
      setResetError('Please enter a valid 10-digit registered shop mobile number.');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/reset-pin/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login_mobile: cleanedMobile })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send OTP for PIN reset.');
      }

      setResetStep(2);
      setResetSuccessMsg(`Twilio OTP sent successfully to Master Owner (+91 9880518013).`);
      startResendTimer();
    } catch (err) {
      console.error('Send Reset OTP Error:', err);
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmResetPin = async (e) => {
    e.preventDefault();
    setResetError('');

    if (!resetOtp || resetOtp.length < 4) {
      setResetError('Please enter the verification OTP sent to +91 9880518013.');
      return;
    }

    if (!newPin || newPin.length < 4) {
      setResetError('New PIN must be at least 4 digits long.');
      return;
    }

    if (newPin !== confirmNewPin) {
      setResetError('New PIN and Confirm PIN do not match.');
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/reset-pin/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login_mobile: resetShopMobile.replace(/\D/g, ''),
          otp: resetOtp,
          new_pin: newPin
        })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to reset PIN.');
      }

      setShowResetModal(false);
      setMobile(resetShopMobile);
      setPin('');
      setSuccessMsg('PIN updated successfully! Log in with your new PIN.');
    } catch (err) {
      console.error('Confirm Reset PIN Error:', err);
      setResetError(err.message);
    } finally {
      setResetLoading(false);
    }
  };

  const triggerPrewarm = () => {
    if (effectiveApiBaseUrl) {
      fetch(`${effectiveApiBaseUrl}/api/health`).catch(() => {});
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

      {/* Success Alert */}
      {successMsg && (
        <div className="toast toast-success" style={{ marginBottom: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '12px 16px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
          <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>{successMsg}</span>
        </div>
      )}

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
              onFocus={triggerPrewarm}
              onChange={(e) => {
                triggerPrewarm();
                setMobile(e.target.value.replace(/\D/g, ''));
              }}
              required
            />
          </div>
        </div>

        {/* PIN Input */}
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label className="input-label" style={{ margin: 0 }}>Shop Security PIN</label>
            <button
              type="button"
              onClick={() => {
                setShowResetModal(true);
                setResetStep(1);
                setResetError('');
                setResetSuccessMsg('');
                setResetShopMobile(mobile);
                setResetOtp('');
                setNewPin('');
                setConfirmNewPin('');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#e5c158',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                padding: 0,
                textDecoration: 'underline'
              }}
            >
              Forgot PIN?
            </button>
          </div>
          <div className="input-wrapper">
            <Lock className="input-icon" size={18} />
            <input
              type={showPin ? 'text' : 'password'}
              className="custom-input"
              placeholder="Enter Security PIN"
              maxLength={6}
              value={pin}
              onFocus={triggerPrewarm}
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

      {/* ================= RESET PIN MODAL ================= */}
      {showResetModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div className="glass-card animate-fadeIn" style={{
            width: '100%',
            maxWidth: '440px',
            borderRadius: '16px',
            border: '1px solid rgba(229, 193, 88, 0.3)',
            background: 'rgba(20, 20, 25, 0.95)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
            padding: '24px',
            position: 'relative'
          }}>
            {/* Close Button */}
            <button
              onClick={() => setShowResetModal(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>

            {/* Modal Title */}
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                width: '46px',
                height: '46px',
                margin: '0 auto 10px',
                borderRadius: '50%',
                background: 'rgba(229, 193, 88, 0.15)',
                border: '1px solid rgba(229, 193, 88, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)'
              }}>
                <KeyRound size={24} />
              </div>
              <h3 className="gold-text" style={{ fontSize: '1.4rem', fontWeight: 800 }}>
                Reset Shop PIN
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px' }}>
                {resetStep === 1
                  ? 'Enter your shop mobile number to verify shop ownership.'
                  : 'Enter OTP sent to Master Owner (+91 9880518013) & set your new PIN.'}
              </p>
            </div>

            {/* Error Message */}
            {resetError && (
              <div className="toast toast-error" style={{ marginBottom: '14px' }}>
                <ShieldCheck size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '0.84rem' }}>{resetError}</span>
              </div>
            )}

            {/* Success Message */}
            {resetSuccessMsg && (
              <div className="toast toast-success" style={{ marginBottom: '14px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#34d399', padding: '10px 14px', borderRadius: '8px', fontSize: '0.84rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
                <span>{resetSuccessMsg}</span>
              </div>
            )}

            {/* STEP 1: Enter Shop Mobile */}
            {resetStep === 1 && (
              <form onSubmit={handleSendResetOtp}>
                <div className="input-group">
                  <label className="input-label">Shop Mobile Number</label>
                  <div className="input-wrapper">
                    <Phone className="input-icon" size={18} />
                    <input
                      type="tel"
                      className="custom-input"
                      placeholder="Enter Shop Mobile Number"
                      maxLength={10}
                      value={resetShopMobile}
                      onChange={(e) => setResetShopMobile(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                <div style={{
                  padding: '10px 14px',
                  borderRadius: '10px',
                  background: 'rgba(229, 193, 88, 0.08)',
                  border: '1px dashed rgba(229, 193, 88, 0.25)',
                  color: 'var(--text-muted)',
                  fontSize: '0.78rem',
                  marginBottom: '18px',
                  lineHeight: '1.4'
                }}>
                  🔒 <strong>Security Note:</strong> Twilio will send the reset OTP code strictly to Master Owner number <strong style={{ color: '#e5c158' }}>+91 9880518013</strong> (not to the shop number).
                </div>

                <button
                  type="submit"
                  className="btn-gold"
                  disabled={resetLoading}
                  style={{ width: '100%' }}
                >
                  {resetLoading ? 'Sending OTP to Owner...' : 'Send OTP to Owner (+91 9880518013)'}
                </button>
              </form>
            )}

            {/* STEP 2: Verify OTP & Reset PIN */}
            {resetStep === 2 && (
              <form onSubmit={handleConfirmResetPin}>
                {/* OTP Input */}
                <div className="input-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <label className="input-label" style={{ margin: 0 }}>Enter 6-Digit OTP</label>
                    <span style={{ fontSize: '0.75rem', color: '#e5c158' }}>Sent to 9880518013</span>
                  </div>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="Enter OTP (e.g. 123456)"
                      maxLength={6}
                      value={resetOtp}
                      onChange={(e) => setResetOtp(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                {/* New PIN */}
                <div className="input-group">
                  <label className="input-label">New 4-Digit Security PIN</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      className="custom-input"
                      placeholder="Enter New PIN"
                      maxLength={6}
                      value={newPin}
                      onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                    {showNewPin ? (
                      <EyeOff className="input-action-icon" size={18} onClick={() => setShowNewPin(false)} />
                    ) : (
                      <Eye className="input-action-icon" size={18} onClick={() => setShowNewPin(true)} />
                    )}
                  </div>
                </div>

                {/* Confirm New PIN */}
                <div className="input-group">
                  <label className="input-label">Confirm New Security PIN</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input
                      type={showNewPin ? 'text' : 'password'}
                      className="custom-input"
                      placeholder="Re-enter New PIN"
                      maxLength={6}
                      value={confirmNewPin}
                      onChange={(e) => setConfirmNewPin(e.target.value.replace(/\D/g, ''))}
                      required
                    />
                  </div>
                </div>

                {/* Resend OTP button & timer */}
                <div style={{ textAlign: 'right', marginBottom: '14px' }}>
                  <button
                    type="button"
                    onClick={handleSendResetOtp}
                    disabled={resendTimer > 0 || resetLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: resendTimer > 0 ? 'var(--text-muted)' : '#e5c158',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: resendTimer > 0 ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : 'Resend OTP to 9880518013'}
                  </button>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setResetStep(1);
                      setResetError('');
                    }}
                    style={{ flex: 1 }}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="btn-gold"
                    disabled={resetLoading}
                    style={{ flex: 2 }}
                  >
                    {resetLoading ? 'Verifying...' : 'Verify OTP & Reset PIN'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


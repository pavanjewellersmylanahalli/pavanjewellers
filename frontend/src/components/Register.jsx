import React, { useState, useEffect, useRef } from 'react';
import { Phone, Lock, Eye, EyeOff, Building, MapPin, CheckCircle2, ArrowRight, Shield, RefreshCw, AlertCircle, Info, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export default function Register({ onRegisterSuccess, onSwitchToLogin, apiBaseUrl }) {
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

  // Wizard Steps: 1 = Registration Mobile, 2 = Verify Twilio OTP, 3 = Shop Details & Login Mobile Setup
  const [step, setStep] = useState(1);

  // Form States
  const [regMobile, setRegMobile] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [shopName, setShopName] = useState('');
  const [loginMobile, setLoginMobile] = useState('');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [address, setAddress] = useState('');

  // UI States
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [timer, setTimer] = useState(30);
  const [isDevOtp, setIsDevOtp] = useState(false);

  const otpInputRefs = useRef([]);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (step === 2 && timer > 0) {
      interval = setInterval(() => setTimer((t) => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  // STEP 1: Send Twilio OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setInfoMessage('');

    const cleaned = regMobile.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Please enter a valid 10-digit mobile number for Twilio OTP verification.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reg_mobile: cleaned })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to send verification OTP via Twilio.');
      }

      setIsDevOtp(data.isMock);
      if (data.isMock) {
        setInfoMessage(`Development mode: OTP is 123456 (or check server logs: ${data.devOtp})`);
      } else {
        setInfoMessage(`Twilio OTP sent successfully to +91 ${cleaned}`);
      }

      // Pre-fill login mobile with verification mobile by default
      setLoginMobile(cleaned);

      setStep(2);
      setTimer(30);
    } catch (err) {
      console.error('Send OTP Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP Box Digit Input Handlers
  const handleOtpDigitChange = (index, value) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const updated = [...otpDigits];
    updated[index] = digit;
    setOtpDigits(updated);

    // Auto move focus to next box
    if (digit && index < 5 && otpInputRefs.current[index + 1]) {
      otpInputRefs.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0 && otpInputRefs.current[index - 1]) {
      otpInputRefs.current[index - 1].focus();
    }
  };

  // STEP 2: Verify Twilio OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');

    const enteredOtp = otpDigits.join('');
    if (enteredOtp.length < 6) {
      setError('Please enter all 6 digits of the OTP code.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_mobile: regMobile.replace(/\D/g, ''),
          otp: enteredOtp
        })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Invalid verification OTP code.');
      }

      // Verified successfully -> proceed to Step 3 (Shop details setup)
      setStep(3);
      setInfoMessage('Mobile number verified via Twilio! Now complete your shop details below.');
    } catch (err) {
      console.error('Verify OTP Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // STEP 3: Complete Registration
  const handleRegisterShop = async (e) => {
    e.preventDefault();
    setError('');

    if (!shopName.trim()) {
      setError('Please enter your shop name.');
      return;
    }

    const cleanedLoginMobile = loginMobile.replace(/\D/g, '');
    if (cleanedLoginMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number for portal login.');
      return;
    }

    if (!pin || pin.length < 4) {
      setError('Please enter a 4-digit or 6-digit security PIN for login.');
      return;
    }

    if (pin !== confirmPin) {
      setError('Create PIN and Confirm PIN do not match.');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${effectiveApiBaseUrl}/api/auth/register-shop`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reg_mobile: regMobile.replace(/\D/g, ''),
          shop_name: shopName,
          login_mobile: cleanedLoginMobile,
          pin,
          address
        })
      });

      const data = await parseJsonResponse(response);

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to register shop.');
      }

      // Celebrate success!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onRegisterSuccess(data.shop, data.token);
    } catch (err) {
      console.error('Registration Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card auth-card animate-fadeIn" style={{ maxWidth: '520px' }}>
      {/* Wizard Header & Step Indicator */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
          Shop Registration
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
          Pavan Jewellers Girvi Management Setup
        </p>
      </div>

      {/* Step Indicator Circles */}
      <div className="step-indicator">
        <div className={`step-circle ${step === 1 ? 'active' : step > 1 ? 'completed' : ''}`}>
          {step > 1 ? <CheckCircle2 size={20} /> : '1'}
        </div>
        <div className={`step-line ${step > 1 ? 'active' : ''}`} />
        <div className={`step-circle ${step === 2 ? 'active' : step > 2 ? 'completed' : ''}`}>
          {step > 2 ? <CheckCircle2 size={20} /> : '2'}
        </div>
        <div className={`step-line ${step > 2 ? 'active' : ''}`} />
        <div className={`step-circle ${step === 3 ? 'active' : ''}`}>
          3
        </div>
      </div>

      {/* Error / Info Alert */}
      {error && (
        <div className="toast toast-error">
          <AlertCircle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="toast toast-success">
          <Info size={18} style={{ flexShrink: 0 }} />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* ================= STEP 1: Registration Mobile Input ================= */}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <div style={{ background: 'rgba(229, 193, 88, 0.06)', border: '1px solid rgba(229, 193, 88, 0.2)', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.9rem' }}>
              <Shield size={18} color="var(--gold-primary)" />
              Step 1: Identity Verification
            </div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Enter your mobile number to receive a Twilio OTP verification code.
            </p>
          </div>

          <div className="input-group">
            <label className="input-label">Verification Mobile Number (Twilio OTP)</label>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                className="custom-input"
                placeholder="e.g. 9876543210"
                maxLength={10}
                value={regMobile}
                onChange={(e) => setRegMobile(e.target.value.replace(/\D/g, ''))}
                required
                autoFocus
              />
            </div>
          </div>

          <button type="submit" className="btn-gold" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Sending Twilio OTP...' : 'Send Twilio Verification OTP'}
          </button>
        </form>
      )}

      {/* ================= STEP 2: Twilio OTP Verification ================= */}
      {step === 2 && (
        <form onSubmit={handleVerifyOtp}>
          <div style={{ background: 'rgba(229, 193, 88, 0.06)', border: '1px solid rgba(229, 193, 88, 0.2)', padding: '14px', borderRadius: '12px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--gold-light)', fontWeight: 700, fontSize: '0.9rem' }}>
                OTP Sent to +91 {regMobile}
              </span>
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--gold-primary)', fontSize: '0.8rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Change Number
              </button>
            </div>
          </div>

          {/* 6-Digit OTP Boxes */}
          <div className="input-group">
            <label className="input-label" style={{ justifyContent: 'center', marginBottom: '8px' }}>
              Enter 6-Digit Twilio Verification Code
            </label>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', margin: '8px 0 16px' }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (otpInputRefs.current[idx] = el)}
                  type="text"
                  className="pin-digit-box"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  autoFocus={idx === 0}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn-gold" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Verifying OTP...' : 'Verify OTP & Continue'}
          </button>

          {/* Resend OTP button */}
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={timer > 0 || loading}
              style={{
                background: 'none',
                border: 'none',
                color: timer > 0 ? 'var(--text-muted)' : 'var(--gold-primary)',
                fontSize: '0.85rem',
                cursor: timer > 0 ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {timer > 0 ? `Resend Twilio OTP in ${timer}s` : 'Resend Twilio OTP'}
            </button>
          </div>
        </form>
      )}

      {/* ================= STEP 3: Shop Details & Login Credentials Setup ================= */}
      {step === 3 && (
        <form onSubmit={handleRegisterShop}>
          {/* Information box explaining Twilio OTP vs Login Number */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '12px',
            padding: '12px 14px',
            marginBottom: '20px',
            fontSize: '0.82rem',
            color: '#a7f3d0'
          }}>
            <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#34d399', marginBottom: '4px' }}>
              <CheckCircle2 size={16} /> Identity Verified (+91 {regMobile})
            </div>
            <div>
              Twilio number was used for registration verification. Now specify your shop details & <strong>Mobile Number for Login</strong> below.
            </div>
          </div>

          {/* Shop Name */}
          <div className="input-group">
            <label className="input-label">Shop Name *</label>
            <div className="input-wrapper">
              <Building className="input-icon" size={18} />
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Pavan Jewellers & Mortgage"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                required
                autoFocus
              />
            </div>
          </div>

          {/* Mobile Number for Login */}
          <div className="input-group">
            <div className="input-label">
              <span>Mobile Number for Login *</span>
              <span className="badge-gold">Used to Sign In</span>
            </div>
            <div className="input-wrapper">
              <Phone className="input-icon" size={18} />
              <input
                type="tel"
                className="custom-input"
                placeholder="Mobile number for login"
                maxLength={10}
                value={loginMobile}
                onChange={(e) => setLoginMobile(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              You will use this mobile number whenever you sign into your shop portal.
            </span>
          </div>

          {/* Create PIN */}
          <div className="input-group">
            <label className="input-label">Create Shop Login PIN *</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPin ? 'text' : 'password'}
                className="custom-input"
                placeholder="Enter 4 to 6 digit PIN (e.g. 1234)"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                required
              />
              {showPin ? (
                <EyeOff className="input-action-icon" size={18} onClick={() => setShowPin(false)} />
              ) : (
                <Eye className="input-action-icon" size={18} onClick={() => setShowPin(true)} />
              )}
            </div>
          </div>

          {/* Confirm PIN */}
          <div className="input-group">
            <label className="input-label">Confirm Shop Login PIN *</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                type={showPin ? 'text' : 'password'}
                className="custom-input"
                placeholder="Re-enter PIN to confirm"
                maxLength={6}
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                required
              />
            </div>
          </div>

          {/* Shop Address */}
          <div className="input-group">
            <label className="input-label">Shop Address</label>
            <div className="input-wrapper">
              <MapPin className="input-icon" size={18} />
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Jewelers Market, Mylanahalli"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-gold" disabled={loading} style={{ width: '100%', marginTop: '14px' }}>
            {loading ? 'Registering Shop in Database...' : 'Register Shop & Proceed to Portal'}
          </button>
        </form>
      )}

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px dashed rgba(229, 193, 88, 0.2)' }}>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          Already registered your shop?{' '}
        </span>
        <button
          type="button"
          onClick={onSwitchToLogin}
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
          Back to Login
        </button>
      </div>
    </div>
  );
}

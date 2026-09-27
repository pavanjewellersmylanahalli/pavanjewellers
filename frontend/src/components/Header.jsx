import React, { useState, useEffect } from 'react';
import { Gem, LogOut, Store, Menu, RefreshCw } from 'lucide-react';

export default function Header({ shop, onLogout, onToggleSidebar }) {
  const [rates, setRates] = useState({ gold24k: 14798, gold22k: 13565, silver: 228 });
  const [loadingRates, setLoadingRates] = useState(false);

  const fetchRates = async () => {
    setLoadingRates(true);
    try {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      const res = await fetch(`${apiBaseUrl}/api/metal-rates`);
      const data = await res.json();
      if (data.success && data.gold24k && data.silver) {
        setRates({
          gold24k: data.gold24k,
          gold22k: data.gold22k,
          silver: data.silver
        });
      }
    } catch (err) {
      console.error('Failed to fetch live metal rates:', err);
    } finally {
      setLoadingRates(false);
    }
  };

  useEffect(() => {
    fetchRates();
    const interval = setInterval(fetchRates, 5 * 60 * 1000); // auto-refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  return (
    <header style={{
      background: 'rgba(20, 7, 13, 0.88)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '12px 20px'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Sidebar Toggle & Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {shop && (
            <button
              onClick={onToggleSidebar}
              className="btn-outline"
              style={{ padding: '8px 10px', minHeight: '40px', borderRadius: '10px' }}
              title="Toggle Sidebar Menu"
            >
              <Menu size={20} color="var(--gold-primary)" />
            </button>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fceaa7 0%, #e5c158 50%, #996c14 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(229, 193, 88, 0.35)',
              color: '#1a080c'
            }}>
              <Gem size={24} strokeWidth={2.2} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 className="gold-text" style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                  PAVAN JEWELLERS
                </h1>
                <span className="badge-gold">Girvi v1.0</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
                Girvi & Pawn Management Portal
              </p>
            </div>
          </div>
        </div>

        {/* Live Rates Ticker */}
        <div className="header-ticker" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'rgba(10, 3, 6, 0.65)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(229, 193, 88, 0.25)',
          fontSize: '0.82rem',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#10b981', fontWeight: 700, fontSize: '0.75rem' }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span>LIVE</span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Gold (24K): </span>
            <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>₹{rates.gold24k.toLocaleString('en-IN')}/g</span>
          </div>

          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }} />

          <div>
            <span style={{ color: 'var(--text-muted)' }}>Silver: </span>
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>₹{rates.silver.toLocaleString('en-IN')}/g</span>
          </div>

          <button
            onClick={fetchRates}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--gold-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              opacity: loadingRates ? 0.5 : 1
            }}
            title="Refresh Live Gold & Silver Rates"
          >
            <RefreshCw size={14} className={loadingRates ? 'spin' : ''} />
          </button>
        </div>

        {/* User / Shop Info */}
        {shop && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
                <Store size={14} color="var(--gold-primary)" />
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.88rem' }}>{shop.shop_name}</span>
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-gold)' }}>
                Login: +91 {shop.login_mobile}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="btn-outline"
              style={{ padding: '6px 12px', fontSize: '0.82rem', minHeight: '38px' }}
              title="Logout Shop Session"
            >
              <LogOut size={15} />
              <span className="logout-text">Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}


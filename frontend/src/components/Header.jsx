import React from 'react';
import { Gem, LogOut, Store, Menu } from 'lucide-react';

export default function Header({ shop, onLogout, onToggleSidebar }) {
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

        {/* Live Rates Ticker Preview */}
        <div className="header-ticker" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          background: 'rgba(10, 3, 6, 0.5)',
          padding: '6px 14px',
          borderRadius: '20px',
          border: '1px solid rgba(229, 193, 88, 0.15)',
          fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Gold (24K): </span>
            <span style={{ color: 'var(--gold-light)', fontWeight: 700 }}>₹7,850/g</span>
          </div>
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.15)' }}></div>
          <div>
            <span style={{ color: 'var(--text-muted)' }}>Silver: </span>
            <span style={{ color: '#e2e8f0', fontWeight: 700 }}>₹94/g</span>
          </div>
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

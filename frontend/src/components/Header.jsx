import React from 'react';
import { Gem, LogOut, Store } from 'lucide-react';

export default function Header({ shop, onLogout }) {
  return (
    <header style={{
      background: 'rgba(20, 7, 13, 0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(229, 193, 88, 0.2)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '14px 24px'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px'
      }}>
        {/* Brand Logo & Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #fceaa7 0%, #e5c158 50%, #996c14 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(229, 193, 88, 0.35)',
            color: '#1a080c'
          }}>
            <Gem size={26} strokeWidth={2.2} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h1 className="gold-text" style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.5px', lineHeight: 1.1 }}>
                PAVAN JEWELLERS
              </h1>
              <span className="badge-gold">Girvi v1.0</span>
            </div>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              Girvi & Pawn Management Portal
            </p>
          </div>
        </div>

        {/* Live Rates Ticker Preview */}
        <div style={{
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
                <span style={{ color: '#ffffff', fontWeight: 700, fontSize: '0.92rem' }}>{shop.shop_name}</span>
              </div>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-gold)' }}>
                Login Mob: +91 {shop.login_mobile}
              </span>
            </div>
            <button 
              onClick={onLogout}
              className="btn-outline"
              style={{ padding: '8px 14px', fontSize: '0.82rem' }}
              title="Logout Shop Session"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

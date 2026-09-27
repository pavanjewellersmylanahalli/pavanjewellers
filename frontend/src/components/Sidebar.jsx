import React from 'react';
import { 
  PlusCircle, Award, Coins, BookOpen, CheckCircle, PackageCheck, 
  X, ChevronRight, Gem, Store 
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, isOpen, onClose, shop }) {
  const menuItems = [
    { id: 'NEW_GIRVI', label: 'New Girvi', icon: PlusCircle, badge: 'Add Entry', highlight: true },
    { id: 'GOLD_DASHBOARD', label: 'Gold Girvi Dashboard', icon: Award, color: 'var(--gold-primary)' },
    { id: 'SILVER_DASHBOARD', label: 'Silver Girvi Dashboard', icon: Coins, color: '#e2e8f0' },
    { id: 'TOTAL_LEDGER', label: 'Total Ledger', icon: BookOpen },
    { id: 'RELEASE_LEDGER', label: 'Release Ledger', icon: CheckCircle },
    { id: 'STOCK_CHECK', label: 'Girvi Stock Check', icon: PackageCheck }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
            zIndex: 90
          }}
          className="sidebar-backdrop"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside className={`sidebar-panel ${isOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: '1px solid rgba(229, 193, 88, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'var(--gold-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#1a080c',
              boxShadow: '0 4px 12px rgba(229, 193, 88, 0.3)'
            }}>
              <Gem size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                PAVAN GIRVI
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Portal Navigation
              </div>
            </div>
          </div>

          {/* Close button on mobile */}
          <button 
            onClick={onClose}
            className="sidebar-close-btn"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  onClose();
                }}
                className={`sidebar-item ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid rgba(229, 193, 88, 0.4)' : '1px solid transparent',
                  background: isActive 
                    ? 'linear-gradient(135deg, rgba(229, 193, 88, 0.2) 0%, rgba(153, 108, 20, 0.1) 100%)' 
                    : 'transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon 
                    size={18} 
                    color={isActive ? 'var(--gold-primary)' : item.color || 'var(--text-muted)'} 
                  />
                  <span>{item.label}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {item.badge && (
                    <span className="badge-gold" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight size={14} color="var(--gold-primary)" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer Shop Badge */}
        {shop && (
          <div style={{
            marginTop: 'auto',
            padding: '16px',
            borderTop: '1px solid rgba(229, 193, 88, 0.15)',
            background: 'rgba(10, 3, 6, 0.4)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'rgba(229, 193, 88, 0.12)',
                border: '1px solid rgba(229, 193, 88, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--gold-primary)'
              }}>
                <Store size={18} />
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#ffffff', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                  {shop.shop_name}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-gold)' }}>
                  +91 {shop.login_mobile}
                </div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

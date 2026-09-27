import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [shop, setShop] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'DASHBOARD'

  // Dynamic API Base URL (Uses current domain or Vite proxy in dev)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

  // Load saved session on mount
  useEffect(() => {
    try {
      const savedShop = localStorage.getItem('pavan_jewellers_shop');
      const savedToken = localStorage.getItem('pavan_jewellers_token');
      if (savedShop && savedToken) {
        setShop(JSON.parse(savedShop));
        setToken(savedToken);
        setView('DASHBOARD');
      }
    } catch (err) {
      console.error('Session load error:', err);
    }
  }, []);

  const handleLoginSuccess = (shopData, tokenData) => {
    setShop(shopData);
    setToken(tokenData);
    localStorage.setItem('pavan_jewellers_shop', JSON.stringify(shopData));
    localStorage.setItem('pavan_jewellers_token', tokenData);
    setView('DASHBOARD');
  };

  const handleRegisterSuccess = (shopData, tokenData) => {
    setShop(shopData);
    setToken(tokenData);
    localStorage.setItem('pavan_jewellers_shop', JSON.stringify(shopData));
    localStorage.setItem('pavan_jewellers_token', tokenData);
    setView('DASHBOARD');
  };

  const handleLogout = () => {
    setShop(null);
    setToken(null);
    localStorage.removeItem('pavan_jewellers_shop');
    localStorage.removeItem('pavan_jewellers_token');
    setView('LOGIN');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header shop={shop} onLogout={handleLogout} />

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {view === 'DASHBOARD' && shop ? (
          <Dashboard shop={shop} />
        ) : (
          <div className="auth-container">
            {view === 'LOGIN' && (
              <Login
                onLoginSuccess={handleLoginSuccess}
                onSwitchToRegister={() => setView('REGISTER')}
                apiBaseUrl={apiBaseUrl}
              />
            )}

            {view === 'REGISTER' && (
              <Register
                onRegisterSuccess={handleRegisterSuccess}
                onSwitchToLogin={() => setView('LOGIN')}
                apiBaseUrl={apiBaseUrl}
              />
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '16px',
        borderTop: '1px solid rgba(229, 193, 88, 0.1)',
        color: 'var(--text-muted)',
        fontSize: '0.82rem',
        marginTop: 'auto'
      }}>
        © 2026 Pavan Jewellers Girvi Management Portal. Built for Render (Backend) + Vercel (Frontend) + Supabase (Database).
      </footer>
    </div>
  );
}

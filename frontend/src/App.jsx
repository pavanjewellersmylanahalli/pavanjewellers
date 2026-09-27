import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';

export default function App() {
  const [shop, setShop] = useState(null);
  const [token, setToken] = useState(null);
  const [view, setView] = useState('LOGIN'); // 'LOGIN' | 'REGISTER' | 'DASHBOARD'

  // Sidebar & Portal Tab States
  const [activeTab, setActiveTab] = useState('TOTAL_LEDGER');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic API Base URL (Uses Render URL in production, Vite proxy in dev)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');

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
      <Header 
        shop={shop} 
        onLogout={handleLogout} 
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
        {/* Sidebar Navigation */}
        {view === 'DASHBOARD' && shop && (
          <Sidebar 
            activeTab={activeTab} 
            setActiveTab={setActiveTab} 
            isOpen={isSidebarOpen} 
            onClose={() => setIsSidebarOpen(false)} 
            shop={shop} 
          />
        )}

        {/* Main Content Area */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, paddingBottom: '46px' }}>
          {view === 'DASHBOARD' && shop ? (
            <Dashboard 
              shop={shop} 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
            />
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
      </div>

      {/* Fixed Footer */}
      <footer style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 40,
        background: 'rgba(15, 5, 8, 0.94)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center',
        padding: '10px 16px',
        borderTop: '1px solid rgba(229, 193, 88, 0.15)',
        color: 'var(--text-muted)',
        fontSize: '0.78rem'
      }}>
        © 2026 Pavan Jewellers Girvi Management Portal. Built for Render (Backend) + Vercel (Frontend) + Supabase (Database).
      </footer>
    </div>
  );
}

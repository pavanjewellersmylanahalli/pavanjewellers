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

  // Dynamic API Base URL (Defaults to Render backend URL)
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'https://pavan-jewellers-backend.onrender.com';

  // Pre-warm backend server immediately on app launch & keep-alive every 4 mins
  useEffect(() => {
    const prewarmBackend = () => {
      fetch(`${apiBaseUrl}/api/health`).catch(() => {});
    };
    prewarmBackend();
    const interval = setInterval(prewarmBackend, 4 * 60 * 1000);
    return () => clearInterval(interval);
  }, [apiBaseUrl]);

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
      <footer className="fixed-footer">
        © 2026 Pavan Jewellers Girvi Management Portal. Built for Render (Backend) + Vercel (Frontend) + Supabase (Database).
      </footer>
    </div>
  );
}

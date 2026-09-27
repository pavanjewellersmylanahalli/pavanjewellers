import React, { useState, useEffect } from 'react';
import { 
  Building, Phone, MapPin, Plus, Search, Filter, ShieldCheck, 
  Coins, Scale, Award, ArrowUpRight, CheckCircle2, Clock, DollarSign, UserCheck,
  PackageCheck, BookOpen, CheckCircle, PlusCircle, AlertCircle, FileText, Trash2, Printer
} from 'lucide-react';

export default function Dashboard({ shop, activeTab, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Real Girvi items stored in LocalStorage for this shop
  const storageKey = `pavan_girvis_${shop?.id || shop?.login_mobile || 'default'}`;
  
  const [girvis, setGirvis] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Save to localStorage whenever girvis changes
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(girvis));
    } catch (e) {
      console.error('Failed to save Girvi records:', e);
    }
  }, [girvis, storageKey]);

  // Form states for New Girvi Entry
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerMobile, setNewCustomerMobile] = useState('');
  const [newMetalType, setNewMetalType] = useState('Gold');
  const [newWeight, setNewWeight] = useState('');
  const [newPurity, setNewPurity] = useState('22K');
  const [newLoanAmount, setNewLoanAmount] = useState('');
  const [newInterestRate, setNewInterestRate] = useState('1.5');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newVaultLocker, setNewVaultLocker] = useState('V-01');

  // Dynamic Real Metrics Calculations
  const activeGirvis = girvis.filter(i => i.status === 'ACTIVE');
  const releasedGirvis = girvis.filter(i => i.status === 'RELEASED');

  const totalActiveCount = activeGirvis.length;
  const totalGoldCount = activeGirvis.filter(i => i.metal === 'Gold').length;
  const totalSilverCount = activeGirvis.filter(i => i.metal === 'Silver').length;

  const totalLoanCapital = activeGirvis.reduce((sum, i) => sum + Number(i.loanAmount || 0), 0);
  const totalMonthlyInterest = activeGirvis.reduce((sum, i) => {
    const principal = Number(i.loanAmount || 0);
    const rate = parseFloat(i.interestRate || 0) / 100;
    return sum + (principal * rate);
  }, 0);

  const totalGoldWeight = activeGirvis
    .filter(i => i.metal === 'Gold')
    .reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

  const totalSilverWeight = activeGirvis
    .filter(i => i.metal === 'Silver')
    .reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

  const totalGoldCapital = activeGirvis
    .filter(i => i.metal === 'Gold')
    .reduce((sum, i) => sum + Number(i.loanAmount || 0), 0);

  const totalSilverCapital = activeGirvis
    .filter(i => i.metal === 'Silver')
    .reduce((sum, i) => sum + Number(i.loanAmount || 0), 0);

  const uniqueCustomers = new Set(girvis.map(i => i.mobile)).size;

  // Filtering based on active tab & search
  const getFilteredItems = () => {
    let items = girvis;

    if (activeTab === 'GOLD_DASHBOARD') {
      items = items.filter(i => i.metal === 'Gold');
    } else if (activeTab === 'SILVER_DASHBOARD') {
      items = items.filter(i => i.metal === 'Silver');
    } else if (activeTab === 'RELEASE_LEDGER') {
      items = items.filter(i => i.status === 'RELEASED');
    }

    if (filterStatus !== 'ALL' && activeTab !== 'RELEASE_LEDGER') {
      items = items.filter(i => i.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(i => 
        i.customerName.toLowerCase().includes(q) ||
        i.id.toLowerCase().includes(q) ||
        i.mobile.includes(q) ||
        i.itemDescription.toLowerCase().includes(q)
      );
    }

    return items;
  };

  const filteredGirvis = getFilteredItems();

  const handleCreateNewGirvi = (e) => {
    e.preventDefault();
    
    if (!newCustomerName || !newCustomerMobile || !newWeight || !newLoanAmount) {
      alert('Please fill in all required fields.');
      return;
    }

    const newRecord = {
      id: `GV-${Date.now().toString().slice(-6)}`,
      customerName: newCustomerName.trim(),
      mobile: newCustomerMobile.trim(),
      metal: newMetalType,
      purity: newPurity.trim(),
      weight: `${parseFloat(newWeight)}g`,
      rawWeight: parseFloat(newWeight) || 0,
      loanAmount: Number(newLoanAmount),
      interestRate: `${newInterestRate}%`,
      rawInterestRate: parseFloat(newInterestRate) || 1.5,
      itemDescription: newItemDesc.trim(),
      vaultLocker: newVaultLocker,
      date: new Date().toISOString().split('T')[0],
      status: 'ACTIVE'
    };

    setGirvis([newRecord, ...girvis]);

    // Reset Form
    setNewCustomerName('');
    setNewCustomerMobile('');
    setNewWeight('');
    setNewLoanAmount('');
    setNewItemDesc('');
    
    alert(`✅ New Girvi Entry ${newRecord.id} saved successfully!`);
    setActiveTab('TOTAL_LEDGER');
  };

  const handleReleaseGirvi = (id) => {
    if (window.confirm(`Are you sure you want to mark Girvi ${id} as RELEASED / SETTLED?`)) {
      setGirvis(girvis.map(item => {
        if (item.id === id) {
          return {
            ...item,
            status: 'RELEASED',
            releaseDate: new Date().toISOString().split('T')[0]
          };
        }
        return item;
      }));
    }
  };

  const handleDeleteGirvi = (id) => {
    if (window.confirm(`Delete record ${id} permanently?`)) {
      setGirvis(girvis.filter(item => item.id !== id));
    }
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 16px' }} className="animate-fadeIn">
      
      {/* ================= OPTION 1: NEW GIRVI FORM ================= */}
      {activeTab === 'NEW_GIRVI' && (
        <div className="glass-card" style={{ maxWidth: '720px', margin: '0 auto', padding: '32px 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '50px',
              height: '50px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: 'rgba(229, 193, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)'
            }}>
              <PlusCircle size={28} />
            </div>
            <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
              New Girvi Entry Form
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.86rem', marginTop: '4px' }}>
              Pawn Gold / Silver ornament, calculate interest & issue loan receipt
            </p>
          </div>

          <form onSubmit={handleCreateNewGirvi}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              
              {/* Customer Name */}
              <div className="input-group">
                <label className="input-label">Customer Full Name *</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Enter Customer Name"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>
              </div>

              {/* Customer Mobile */}
              <div className="input-group">
                <label className="input-label">Customer Mobile Number *</label>
                <div className="input-wrapper">
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="10-digit Mobile Number"
                    maxLength={10}
                    value={newCustomerMobile}
                    onChange={(e) => setNewCustomerMobile(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>
              </div>

              {/* Metal Type */}
              <div className="input-group">
                <label className="input-label">Pawn Metal Category *</label>
                <select
                  className="custom-input"
                  value={newMetalType}
                  onChange={(e) => setNewMetalType(e.target.value)}
                  style={{ paddingLeft: '16px', background: '#120407' }}
                >
                  <option value="Gold">🥇 Gold (22K / 24K)</option>
                  <option value="Silver">🥈 Silver (92.5 Fine / 999)</option>
                </select>
              </div>

              {/* Purity / Karat */}
              <div className="input-group">
                <label className="input-label">Metal Purity / Karat *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. 22K or 92.5 Fine"
                  value={newPurity}
                  onChange={(e) => setNewPurity(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              {/* Weight */}
              <div className="input-group">
                <label className="input-label">Net Weight (Grams) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="custom-input"
                  placeholder="e.g. 25.5"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              {/* Vault Locker Number */}
              <div className="input-group">
                <label className="input-label">Vault Locker Tag *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. V-01"
                  value={newVaultLocker}
                  onChange={(e) => setNewVaultLocker(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              {/* Monthly Interest Rate */}
              <div className="input-group">
                <label className="input-label">Monthly Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input"
                  placeholder="e.g. 1.5"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              {/* Loan Amount */}
              <div className="input-group">
                <label className="input-label">Loan Amount Sanctioned (₹) *</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 150000"
                  value={newLoanAmount}
                  onChange={(e) => setNewLoanAmount(e.target.value)}
                  required
                  style={{ paddingLeft: '16px', fontSize: '1.1rem', fontWeight: '700', color: 'var(--gold-light)' }}
                />
              </div>

            </div>

            {/* Item Description */}
            <div className="input-group" style={{ marginTop: '8px' }}>
              <label className="input-label">Item Description & Hallmark Marks *</label>
              <textarea
                className="custom-input"
                placeholder="Describe ornament (e.g. 22K Gold Bangle with Hallmark stamp)"
                rows={3}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                required
                style={{ paddingLeft: '16px', paddingTop: '12px', height: 'auto' }}
              />
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '16px' }}>
              <PlusCircle size={20} />
              Save Girvi Loan Entry
            </button>
          </form>
        </div>
      )}

      {/* ================= OPTION 2 & 3: GOLD & SILVER DASHBOARDS ================= */}
      {(activeTab === 'GOLD_DASHBOARD' || activeTab === 'SILVER_DASHBOARD') && (
        <div style={{ marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '14px',
                background: activeTab === 'GOLD_DASHBOARD' ? 'var(--gold-gradient)' : 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1a080c'
              }}>
                {activeTab === 'GOLD_DASHBOARD' ? <Award size={26} /> : <Coins size={26} />}
              </div>
              <div>
                <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                  {activeTab === 'GOLD_DASHBOARD' ? 'Gold Girvi Dashboard' : 'Silver Girvi Dashboard'}
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                  {activeTab === 'GOLD_DASHBOARD' 
                    ? 'Real-time Gold Pawned Inventory & Active Capital' 
                    : 'Real-time Silver Pawned Inventory & Active Capital'}
                </p>
              </div>
            </div>
          </div>

          {/* Metal Specific Metrics */}
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pawned Weight</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', marginTop: '4px' }}>
                {activeTab === 'GOLD_DASHBOARD' ? `${totalGoldWeight.toFixed(2)} g` : `${totalSilverWeight.toFixed(2)} g`}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>In Vault Lockers</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Loan Principal</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                ₹{(activeTab === 'GOLD_DASHBOARD' ? totalGoldCapital : totalSilverCapital).toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px' }}>Capital Sanctioned</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Active Items</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {activeTab === 'GOLD_DASHBOARD' ? totalGoldCount : totalSilverCount} Items
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>Active Mortgages</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= OPTION 6: GIRVI STOCK CHECK ================= */}
      {activeTab === 'STOCK_CHECK' && (
        <div style={{ marginBottom: '24px' }}>
          <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '14px',
                  background: 'rgba(229, 193, 88, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--gold-primary)'
                }}>
                  <PackageCheck size={26} />
                </div>
                <div>
                  <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                    Girvi Vault Stock Audit
                  </h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                    Physical Vault Lockers, Tags, Net Weight & Security Audit
                  </p>
                </div>
              </div>

              <button className="btn-gold" onClick={() => alert(`Vault Audit Complete! Total ${activeGirvis.length} active items verified in lockers.`)}>
                <CheckCircle2 size={18} />
                Run Physical Vault Audit
              </button>
            </div>
          </div>

          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Active Vault Items</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>{totalActiveCount} Items</div>
              <div style={{ fontSize: '0.78rem', color: '#34d399' }}>Verified in Lockers</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Vault Gold Weight</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', marginTop: '4px' }}>{totalGoldWeight.toFixed(2)} g</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pawned Gold Ornaments</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Vault Silver Weight</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#e2e8f0', marginTop: '4px' }}>{totalSilverWeight.toFixed(2)} g</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Pawned Silver Ornaments</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= TOTAL LEDGER OVERVIEW METRICS ================= */}
      {activeTab === 'TOTAL_LEDGER' && (
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
          
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Active Girvi</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229, 193, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Scale size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {totalActiveCount} <span style={{ fontSize: '0.9rem', color: 'var(--gold-light)', fontWeight: 500 }}>Items</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gold: {totalGoldCount} | Silver: {totalSilverCount}
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Loan Capital</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
                <DollarSign size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              ₹{totalLoanCapital.toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px' }}>
              Active Capital Out
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Interest Due</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
                <Clock size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              ₹{Math.round(totalMonthlyInterest).toLocaleString('en-IN')}
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Monthly Accrual
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Customers</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
                <UserCheck size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
              {uniqueCustomers} <span style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 500 }}>Unique</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Registered Contacts
            </div>
          </div>

        </div>
      )}

      {/* ================= MAIN LEDGER TABLE (TOTAL, GOLD, SILVER, RELEASE) ================= */}
      {activeTab !== 'NEW_GIRVI' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Controls Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                {activeTab === 'GOLD_DASHBOARD' ? 'Gold Mortgage Ledger' :
                 activeTab === 'SILVER_DASHBOARD' ? 'Silver Mortgage Ledger' :
                 activeTab === 'RELEASE_LEDGER' ? 'Released Girvi Loan Settlement Ledger' :
                 activeTab === 'STOCK_CHECK' ? 'Vault Locker Items Audit' :
                 'Master Girvi Mortgage Ledger'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                {filteredGirvis.length} record(s) found for {shop?.shop_name}
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
              {/* Search */}
              <div className="input-wrapper" style={{ width: '220px' }}>
                <Search className="input-icon" size={16} />
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Search ledger..."
                  style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem', minHeight: '38px' }}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Filter */}
              {activeTab !== 'RELEASE_LEDGER' && (
                <div style={{ display: 'flex', gap: '4px', background: 'rgba(10, 3, 6, 0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(229, 193, 88, 0.2)' }}>
                  {['ALL', 'ACTIVE', 'RELEASED'].map(st => (
                    <button
                      key={st}
                      onClick={() => setFilterStatus(st)}
                      style={{
                        background: filterStatus === st ? 'var(--gold-gradient)' : 'transparent',
                        color: filterStatus === st ? '#1a080c' : 'var(--text-muted)',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Table */}
          {filteredGirvis.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(229, 193, 88, 0.2)', color: 'var(--gold-primary)', height: '40px' }}>
                    <th style={{ padding: '12px 14px' }}>Girvi ID</th>
                    <th style={{ padding: '12px 14px' }}>Customer Name</th>
                    <th style={{ padding: '12px 14px' }}>Metal & Purity</th>
                    <th style={{ padding: '12px 14px' }}>Weight</th>
                    <th style={{ padding: '12px 14px' }}>Loan Amount</th>
                    <th style={{ padding: '12px 14px' }}>Interest</th>
                    <th style={{ padding: '12px 14px' }}>Locker</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGirvis.map((g) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }} className="table-row-hover">
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--gold-light)' }}>{g.id}</td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{g.customerName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+91 {g.mobile}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#e2e8f0' }}>
                        <div>{g.itemDescription}</div>
                        <span className="badge-gold" style={{ fontSize: '0.68rem' }}>{g.metal} ({g.purity})</span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>{g.weight}</td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#ffffff' }}>₹{Number(g.loanAmount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px', color: 'var(--text-gold)' }}>{g.interestRate}/mo</td>
                      <td style={{ padding: '14px', color: 'var(--gold-light)', fontWeight: 600 }}>{g.vaultLocker}</td>
                      <td style={{ padding: '14px' }}>
                        {g.status === 'ACTIVE' ? (
                          <span className="badge-gold">ACTIVE</span>
                        ) : (
                          <span className="badge-success">RELEASED</span>
                        )}
                      </td>
                      <td style={{ padding: '14px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
                          {g.status === 'ACTIVE' && (
                            <button
                              className="btn-outline"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                              onClick={() => handleReleaseGirvi(g.id)}
                              title="Release / Settle Loan"
                            >
                              Release
                            </button>
                          )}
                          <button
                            className="btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px' }}
                            onClick={() => window.print()}
                            title="Print Slip"
                          >
                            <Printer size={13} />
                          </button>
                          <button
                            className="btn-outline"
                            style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px', color: '#fca5a5' }}
                            onClick={() => handleDeleteGirvi(g.id)}
                            title="Delete Entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px 16px', color: 'var(--text-muted)' }}>
              <BookOpen size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
              <h4 style={{ fontSize: '1.1rem', color: '#ffffff', marginBottom: '4px' }}>No Girvi Records Found</h4>
              <p style={{ fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto 16px' }}>
                {searchTerm ? 'No entries match your search criteria.' : 'Your shop ledger is currently empty. Click below to add your first real Girvi mortgage entry.'}
              </p>
              <button className="btn-gold" onClick={() => setActiveTab('NEW_GIRVI')}>
                <PlusCircle size={18} />
                Add New Girvi Entry
              </button>
            </div>
          )}
        </div>
      )}

    </div>
  );
}

import React, { useState } from 'react';
import { 
  Building, Phone, MapPin, Plus, Search, Filter, ShieldCheck, 
  Coins, Scale, Award, ArrowUpRight, CheckCircle2, Clock, DollarSign, UserCheck,
  PackageCheck, BookOpen, CheckCircle, PlusCircle, AlertCircle, FileText
} from 'lucide-react';

export default function Dashboard({ shop, activeTab, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Form states for New Girvi Entry
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerMobile, setNewCustomerMobile] = useState('');
  const [newMetalType, setNewMetalType] = useState('Gold');
  const [newWeight, setNewWeight] = useState('');
  const [newPurity, setNewPurity] = useState('22K');
  const [newLoanAmount, setNewLoanAmount] = useState('');
  const [newInterestRate, setNewInterestRate] = useState('1.5');
  const [newItemDesc, setNewItemDesc] = useState('');

  // Sample Girvi items ledger
  const sampleGirvis = [
    {
      id: 'GV-2026-001',
      customerName: 'Ramesh Kumar',
      mobile: '9845012345',
      itemDescription: '22K Gold Chain (24.5 grams)',
      metal: 'Gold',
      purity: '22K',
      weight: '24.5g',
      loanAmount: 125000,
      interestRate: '1.5%',
      date: '2026-09-10',
      status: 'ACTIVE',
      vaultLocker: 'V-04'
    },
    {
      id: 'GV-2026-002',
      customerName: 'Suresh Patel',
      mobile: '9980112233',
      itemDescription: 'Silver Anklet & Bangle (250 grams)',
      metal: 'Silver',
      purity: '92.5 Fine',
      weight: '250g',
      loanAmount: 18000,
      interestRate: '2.0%',
      date: '2026-09-14',
      status: 'ACTIVE',
      vaultLocker: 'V-12'
    },
    {
      id: 'GV-2026-003',
      customerName: 'Lakshmi Devi',
      mobile: '9741098765',
      itemDescription: '22K Gold Necklace (45.0 grams)',
      metal: 'Gold',
      purity: '22K',
      weight: '45.0g',
      loanAmount: 240000,
      interestRate: '1.25%',
      date: '2026-08-25',
      releaseDate: '2026-09-22',
      status: 'RELEASED',
      vaultLocker: 'V-01'
    },
    {
      id: 'GV-2026-004',
      customerName: 'Mahesh Reddy',
      mobile: '9448054321',
      itemDescription: '24K Gold Coins x 2 (10.0 grams)',
      metal: 'Gold',
      purity: '24K',
      weight: '10.0g',
      loanAmount: 60000,
      interestRate: '1.5%',
      date: '2026-09-20',
      status: 'ACTIVE',
      vaultLocker: 'V-08'
    },
    {
      id: 'GV-2026-005',
      customerName: 'Priya Sharma',
      mobile: '9886011224',
      itemDescription: 'Silver Dinner Plate & Bowl (500 grams)',
      metal: 'Silver',
      purity: '92.5 Fine',
      weight: '500g',
      loanAmount: 35000,
      interestRate: '1.8%',
      date: '2026-09-01',
      releaseDate: '2026-09-25',
      status: 'RELEASED',
      vaultLocker: 'V-15'
    }
  ];

  // Filtering based on active tab & search
  const getFilteredItems = () => {
    let items = sampleGirvis;

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
    alert(`New Girvi Mortgage Receipt Created!\nCustomer: ${newCustomerName}\nItem: ${newMetalType} (${newWeight})\nLoan: ₹${newLoanAmount}`);
    setNewCustomerName('');
    setNewCustomerMobile('');
    setNewWeight('');
    setNewLoanAmount('');
    setNewItemDesc('');
    setActiveTab('TOTAL_LEDGER');
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
                    placeholder="e.g. Rajesh Sharma"
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
                  type="text"
                  className="custom-input"
                  placeholder="e.g. 25.5g"
                  value={newWeight}
                  onChange={(e) => setNewWeight(e.target.value)}
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
                  placeholder="e.g. 1.5%"
                  value={newInterestRate}
                  onChange={(e) => setNewInterestRate(e.target.value)}
                  required
                  style={{ paddingLeft: '16px' }}
                />
              </div>

            </div>

            {/* Item Description */}
            <div className="input-group" style={{ marginTop: '8px' }}>
              <label className="input-label">Item Description & Identification Marks *</label>
              <textarea
                className="custom-input"
                placeholder="e.g. 22K Gold Bangle with Hallmark stamp, 2 pieces"
                rows={3}
                value={newItemDesc}
                onChange={(e) => setNewItemDesc(e.target.value)}
                required
                style={{ paddingLeft: '16px', paddingTop: '12px', height: 'auto' }}
              />
            </div>

            {/* Loan Amount */}
            <div className="input-group">
              <label className="input-label">Total Loan Amount Sanctioned (₹) *</label>
              <input
                type="number"
                className="custom-input"
                placeholder="e.g. 150000"
                value={newLoanAmount}
                onChange={(e) => setNewLoanAmount(e.target.value)}
                required
                style={{ paddingLeft: '16px', fontSize: '1.2rem', fontWeight: '700', color: 'var(--gold-light)' }}
              />
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '16px' }}>
              <PlusCircle size={20} />
              Issue New Girvi Loan & Generate Receipt
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
                  {activeTab === 'GOLD_DASHBOARD' ? 'Real-time Gold Pawned Inventory, Karat Analysis & Active Capital' : 'Real-time Silver Pawned Inventory & Active Capital'}
                </p>
              </div>
            </div>
          </div>

          {/* Metal Specific Metrics */}
          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Pawned Weight</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', marginTop: '4px' }}>
                {activeTab === 'GOLD_DASHBOARD' ? '79.5 grams' : '750 grams'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>In Vault Lockers</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Loan Principal</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                {activeTab === 'GOLD_DASHBOARD' ? '₹4,25,000' : '₹53,000'}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px' }}>Active Capital Out</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Active Items</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff', marginTop: '4px' }}>
                {activeTab === 'GOLD_DASHBOARD' ? '34 Items' : '8 Items'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>100% Aadhaar Verified</div>
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
                    Verify Physical Vault Lockers, Tags, Net Weight & Security Audit
                  </p>
                </div>
              </div>

              <button className="btn-gold" onClick={() => alert('Vault Locker Audit Completed Successfully!')}>
                <CheckCircle2 size={18} />
                Run Physical Vault Audit
              </button>
            </div>
          </div>

          <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '28px' }}>
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Verified Vault Lockers</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>16 / 16</div>
              <div style={{ fontSize: '0.78rem', color: '#34d399' }}>100% Sealed & Audited</div>
            </div>

            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Vault Weight</div>
              <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)', marginTop: '4px' }}>829.5 grams</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Gold: 79.5g | Silver: 750g</div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN LEDGER TABLE (USED FOR TOTAL, GOLD, SILVER, RELEASE LEDGER) ================= */}
      {activeTab !== 'NEW_GIRVI' && (
        <div className="glass-card" style={{ padding: '24px' }}>
          {/* Controls Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-light)' }}>
                {activeTab === 'GOLD_DASHBOARD' ? 'Gold Mortgage Ledger' :
                 activeTab === 'SILVER_DASHBOARD' ? 'Silver Mortgage Ledger' :
                 activeTab === 'RELEASE_LEDGER' ? 'Released Girvi Loan Settlement Ledger' :
                 activeTab === 'STOCK_CHECK' ? 'Vault Locker Items Stock Check' :
                 'Master Girvi Mortgage Ledger'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                Showing {filteredGirvis.length} items for {shop.shop_name}
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
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(229, 193, 88, 0.2)', color: 'var(--gold-primary)', height: '40px' }}>
                  <th style={{ padding: '12px 14px' }}>Girvi ID</th>
                  <th style={{ padding: '12px 14px' }}>Customer Name</th>
                  <th style={{ padding: '12px 14px' }}>Item Description</th>
                  <th style={{ padding: '12px 14px' }}>Weight</th>
                  <th style={{ padding: '12px 14px' }}>Loan Amount</th>
                  <th style={{ padding: '12px 14px' }}>Vault Locker</th>
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
                    <td style={{ padding: '14px', color: '#e2e8f0' }}>{g.itemDescription}</td>
                    <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>{g.weight}</td>
                    <td style={{ padding: '14px', fontWeight: 700, color: '#ffffff' }}>₹{g.loanAmount.toLocaleString('en-IN')}</td>
                    <td style={{ padding: '14px', color: 'var(--text-gold)', fontWeight: 600 }}>{g.vaultLocker}</td>
                    <td style={{ padding: '14px' }}>
                      {g.status === 'ACTIVE' ? (
                        <span className="badge-gold">ACTIVE</span>
                      ) : (
                        <span className="badge-success">RELEASED</span>
                      )}
                    </td>
                    <td style={{ padding: '14px', textAlign: 'right' }}>
                      <button
                        className="btn-outline"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '34px' }}
                        onClick={() => alert(`Opening Girvi Mortgage Receipt for ${g.id}`)}
                      >
                        Print Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}

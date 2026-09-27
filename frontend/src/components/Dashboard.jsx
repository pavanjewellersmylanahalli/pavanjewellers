import React, { useState } from 'react';
import { 
  Building, Phone, MapPin, Plus, Search, Filter, ShieldCheck, 
  Coins, Scale, Award, ArrowUpRight, CheckCircle2, Clock, DollarSign, UserCheck
} from 'lucide-react';

export default function Dashboard({ shop }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showNewModal, setShowNewModal] = useState(false);

  // Sample Girvi items for Pavan Jewellers demo ledger
  const sampleGirvis = [
    {
      id: 'GV-2026-001',
      customerName: 'Ramesh Kumar',
      mobile: '9845012345',
      itemDescription: '22K Gold Chain (24.5 grams)',
      metal: 'Gold',
      weight: '24.5g',
      loanAmount: 125000,
      interestRate: '1.5%',
      date: '2026-09-10',
      status: 'ACTIVE'
    },
    {
      id: 'GV-2026-002',
      customerName: 'Suresh Patel',
      mobile: '9980112233',
      itemDescription: 'Silver Anklet & Bangle (250 grams)',
      metal: 'Silver',
      weight: '250g',
      loanAmount: 18000,
      interestRate: '2.0%',
      date: '2026-09-14',
      status: 'ACTIVE'
    },
    {
      id: 'GV-2026-003',
      customerName: 'Lakshmi Devi',
      mobile: '9741098765',
      itemDescription: '22K Gold Necklace (45.0 grams)',
      metal: 'Gold',
      weight: '45.0g',
      loanAmount: 240000,
      interestRate: '1.25%',
      date: '2026-08-25',
      status: 'RELEASED'
    },
    {
      id: 'GV-2026-004',
      customerName: 'Mahesh Reddy',
      mobile: '9448054321',
      itemDescription: '24K Gold Coins x 2 (10.0 grams)',
      metal: 'Gold',
      weight: '10.0g',
      loanAmount: 60000,
      interestRate: '1.5%',
      date: '2026-09-20',
      status: 'ACTIVE'
    }
  ];

  const filteredGirvis = sampleGirvis.filter(item => {
    const matchesSearch = item.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.mobile.includes(searchTerm);
    const matchesFilter = filterStatus === 'ALL' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }} className="animate-fadeIn">
      {/* Welcome Banner */}
      <div className="glass-card" style={{ padding: '24px 28px', marginBottom: '28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.08, pointerEvents: 'none' }}>
          <Coins size={220} color="var(--gold-primary)" />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <span className="badge-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <CheckCircle2 size={13} /> Active Shop Portal
              </span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Registered Login Mobile: +91 {shop.login_mobile}
              </span>
            </div>

            <h2 className="gold-text" style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1.2 }}>
              {shop.shop_name}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={15} color="var(--gold-primary)" />
              {shop.address || 'Mylanahalli Jewellers Market'}
            </p>
          </div>

          {/* Quick Action Button */}
          <button 
            className="btn-gold" 
            onClick={() => alert('New Girvi Loan Calculator & Customer Entry Modal opened!')}
            style={{ padding: '12px 20px' }}
          >
            <Plus size={18} />
            New Girvi Entry
          </button>
        </div>
      </div>

      {/* Analytics Summary Cards */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '18px', marginBottom: '32px' }}>
        
        {/* Card 1 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Active Girvi</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229, 193, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <Scale size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            42 <span style={{ fontSize: '0.9rem', color: 'var(--gold-light)', fontWeight: 500 }}>Items</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Gold: 34 | Silver: 8
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Loan Capital</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#34d399' }}>
              <DollarSign size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            ₹18,45,000
          </div>
          <div style={{ fontSize: '0.78rem', color: '#34d399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <ArrowUpRight size={14} /> +₹1.2L this month
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Monthly Interest Due</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(234, 179, 8, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#facc15' }}>
              <Clock size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            ₹27,675
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Avg Interest: 1.5% / month
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Customers</span>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#c084fc' }}>
              <UserCheck size={20} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#ffffff' }}>
            38 <span style={{ fontSize: '0.9rem', color: '#c084fc', fontWeight: 500 }}>Verified</span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            100% Aadhaar Verified
          </div>
        </div>

      </div>

      {/* Girvi Table Section */}
      <div className="glass-card" style={{ padding: '24px' }}>
        {/* Table Header Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--gold-light)' }}>
              Recent Girvi Mortgage Ledger
            </h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              Manage customer pawned items, interest collection and releases
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div className="input-wrapper" style={{ width: '220px' }}>
              <Search className="input-icon" size={16} />
              <input
                type="text"
                className="custom-input"
                placeholder="Search customer / ID..."
                style={{ padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Filter Buttons */}
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
          </div>
        </div>

        {/* Data Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(229, 193, 88, 0.2)', color: 'var(--gold-primary)', height: '40px' }}>
                <th style={{ padding: '12px 14px' }}>Girvi ID</th>
                <th style={{ padding: '12px 14px' }}>Customer Name</th>
                <th style={{ padding: '12px 14px' }}>Item Description</th>
                <th style={{ padding: '12px 14px' }}>Weight</th>
                <th style={{ padding: '12px 14px' }}>Loan Amount</th>
                <th style={{ padding: '12px 14px' }}>Interest</th>
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
                  <td style={{ padding: '14px', color: 'var(--text-gold)' }}>{g.interestRate}/mo</td>
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
                      style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                      onClick={() => alert(`Viewing Girvi slip for ${g.id} (${g.customerName})`)}
                    >
                      View Slip
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { 
  Building, Phone, MapPin, Plus, Search, Filter, ShieldCheck, 
  Coins, Scale, Award, ArrowUpRight, CheckCircle2, Clock, DollarSign, UserCheck,
  PackageCheck, BookOpen, CheckCircle, PlusCircle, AlertCircle, FileText, Trash2, Printer,
  Camera, Upload, Calendar, User, FileText as DetailsIcon
} from 'lucide-react';

// Helper function to convert Indian Currency numbers to Words
function numberToWordsINR(num) {
  if (!num || isNaN(num) || num <= 0) return '';
  const n = Math.floor(num);
  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(val) {
    if (val < 20) return a[val];
    if (val < 100) return b[Math.floor(val / 10)] + (val % 10 ? ' ' + a[val % 10] : '');
    if (val < 1000) return a[Math.floor(val / 100)] + ' Hundred' + (val % 100 ? ' ' + inWords(val % 100) : '');
    if (val < 100000) return inWords(Math.floor(val / 1000)) + ' Thousand' + (val % 1000 ? ' ' + inWords(val % 1000) : '');
    if (val < 10000000) return inWords(Math.floor(val / 100000)) + ' Lakh' + (val % 100000 ? ' ' + inWords(val % 100000) : '');
    return inWords(Math.floor(val / 10000000)) + ' Crore' + (val % 10000000 ? ' ' + inWords(val % 10000000) : '');
  }
  return inWords(n) + ' Rupees Only';
}

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

  // Prevent mouse wheel scrolling from accidentally changing number inputs
  useEffect(() => {
    const handleWheel = () => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };
    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Form states for New Girvi Entry
  const todayStr = new Date().toISOString().split('T')[0];
  const nextYearStr = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [pledgeNumber, setPledgeNumber] = useState(`GV-${Date.now().toString().slice(-6)}`);
  const [pledgeDate, setPledgeDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(nextYearStr);
  
  const [customerName, setCustomerName] = useState('');
  const [relationType, setRelationType] = useState('S/O');
  const [relationName, setRelationName] = useState('');
  const [mobile, setMobile] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [address, setAddress] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState(null);

  // Article Details
  const [metal, setMetal] = useState('Gold');
  const [articleName, setArticleName] = useState('');
  const [grossWt, setGrossWt] = useState('');
  const [lessWt, setLessWt] = useState('0');
  const [quantity, setQuantity] = useState('1');
  const [presentValue, setPresentValue] = useState('');

  // Financials
  const [loanAmount, setLoanAmount] = useState('');
  const [monthlyInterestRate, setMonthlyInterestRate] = useState('1.5');
  const [itemPhoto, setItemPhoto] = useState(null);

  // Auto calculate Net Wt: Gross Wt - Less Wt
  const grossNum = parseFloat(grossWt) || 0;
  const lessNum = parseFloat(lessWt) || 0;
  const netWt = Math.max(0, grossNum - lessNum).toFixed(2);

  // Auto calculate Loan Amount in Words
  const loanNum = parseFloat(loanAmount) || 0;
  const loanAmountInWords = numberToWordsINR(loanNum);

  // Dynamic Real Metrics Calculations
  const activeGirvis = girvis.filter(i => i.status === 'ACTIVE');
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

  // Image Upload Handlers
  const handlePhotoUpload = (e, setPhotoState) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoState(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

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
        (i.articleName && i.articleName.toLowerCase().includes(q))
      );
    }

    return items;
  };

  const filteredGirvis = getFilteredItems();

  const handleCreateNewGirvi = (e) => {
    e.preventDefault();
    
    if (!customerName || !mobile || !address || !articleName || !grossWt || !loanAmount) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    const newRecord = {
      id: pledgeNumber || `GV-${Date.now().toString().slice(-6)}`,
      pledgeDate,
      dueDate,
      customerName: customerName.trim(),
      relationType,
      relationName: relationName.trim(),
      mobile: mobile.trim(),
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      address: address.trim(),
      customerPhoto,
      
      metal,
      articleName: articleName.trim(),
      grossWt: parseFloat(grossWt) || 0,
      lessWt: parseFloat(lessWt) || 0,
      weight: `${netWt}g`,
      rawWeight: parseFloat(netWt) || 0,
      quantity: Number(quantity) || 1,
      presentValue: presentValue ? Number(presentValue) : 0,

      loanAmount: Number(loanAmount),
      loanAmountInWords,
      interestRate: `${monthlyInterestRate}%`,
      itemPhoto,
      status: 'ACTIVE'
    };

    setGirvis([newRecord, ...girvis]);

    // Reset Form
    setPledgeNumber(`GV-${Date.now().toString().slice(-6)}`);
    setCustomerName('');
    setRelationName('');
    setMobile('');
    setMonthlyIncome('');
    setAddress('');
    setCustomerPhoto(null);
    setArticleName('');
    setGrossWt('');
    setLessWt('0');
    setQuantity('1');
    setPresentValue('');
    setLoanAmount('');
    setItemPhoto(null);
    
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
        <div className="glass-card" style={{ maxWidth: '840px', margin: '0 auto', padding: '32px 28px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              margin: '0 auto 12px',
              borderRadius: '50%',
              background: 'rgba(229, 193, 88, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--gold-primary)'
            }}>
              <PlusCircle size={30} />
            </div>
            <h2 className="gold-text" style={{ fontSize: '1.85rem', fontWeight: 800 }}>
              New Girvi Entry Form
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginTop: '4px' }}>
              Issue new pawn mortgage loan & generate customer slip
            </p>
          </div>

          <form onSubmit={handleCreateNewGirvi}>
            
            {/* SECTION 1: PLEDGE & CUSTOMER DETAILS */}
            <div style={{
              background: 'rgba(10, 3, 6, 0.4)',
              border: '1px solid rgba(229, 193, 88, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} /> Section 1: Pledge & Customer Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Pledge Number */}
                <div className="input-group">
                  <label className="input-label">Pledge Number *</label>
                  <input
                    type="text"
                    className="custom-input"
                    value={pledgeNumber}
                    onChange={(e) => setPledgeNumber(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Pledge Date */}
                <div className="input-group">
                  <label className="input-label">Pledge Date *</label>
                  <input
                    type="date"
                    className="custom-input"
                    value={pledgeDate}
                    onChange={(e) => setPledgeDate(e.target.value)}
                    required
                    style={{ paddingLeft: '16px', background: '#120407' }}
                  />
                </div>

                {/* Due Date */}
                <div className="input-group">
                  <label className="input-label">Due Date *</label>
                  <input
                    type="date"
                    className="custom-input"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    style={{ paddingLeft: '16px', background: '#120407' }}
                  />
                </div>

                {/* Customer Name */}
                <div className="input-group">
                  <label className="input-label">Customer Name *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Enter Customer Full Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Relation Type */}
                <div className="input-group">
                  <label className="input-label">Relation Type</label>
                  <select
                    className="custom-input"
                    value={relationType}
                    onChange={(e) => setRelationType(e.target.value)}
                    style={{ paddingLeft: '16px', background: '#120407' }}
                  >
                    <option value="S/O">S/O (Son of)</option>
                    <option value="D/O">D/O (Daughter of)</option>
                    <option value="W/O">W/O (Wife of)</option>
                    <option value="C/O">C/O (Care of)</option>
                  </select>
                </div>

                {/* Relation Name */}
                <div className="input-group">
                  <label className="input-label">Relation Name</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Father / Husband / Relative Name"
                    value={relationName}
                    onChange={(e) => setRelationName(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Mobile Number */}
                <div className="input-group">
                  <label className="input-label">Mobile Number *</label>
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="10-digit Mobile Number"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ''))}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Monthly Income */}
                <div className="input-group">
                  <label className="input-label">Monthly Income (₹) *</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="e.g. 50000"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>
              </div>

              {/* Address */}
              <div className="input-group" style={{ marginTop: '12px' }}>
                <label className="input-label">Full Address *</label>
                <textarea
                  className="custom-input"
                  placeholder="Enter complete house address & area"
                  rows={2}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  style={{ paddingLeft: '16px', paddingTop: '10px', height: 'auto' }}
                />
              </div>

              {/* Customer Photo Upload */}
              <div style={{ marginTop: '14px' }}>
                <label className="input-label">Customer Photo (Select from Gallery or Camera)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                  <label className="btn-outline" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem' }}>
                    <Camera size={16} />
                    <span>Upload / Capture Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, setCustomerPhoto)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {customerPhoto && (
                    <img 
                      src={customerPhoto} 
                      alt="Customer Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gold-primary)' }} 
                    />
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: ARTICLE DETAILS */}
            <div style={{
              background: 'rgba(10, 3, 6, 0.4)',
              border: '1px solid rgba(229, 193, 88, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DetailsIcon size={18} /> Section 2: Article Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Gold or Silver */}
                <div className="input-group">
                  <label className="input-label">Category *</label>
                  <select
                    className="custom-input"
                    value={metal}
                    onChange={(e) => setMetal(e.target.value)}
                    style={{ paddingLeft: '16px', background: '#120407' }}
                  >
                    <option value="Gold">🥇 Gold</option>
                    <option value="Silver">🥈 Silver</option>
                  </select>
                </div>

                {/* Article Name */}
                <div className="input-group">
                  <label className="input-label">Article Name *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. Bangle, Chain, Ring, Necklace"
                    value={articleName}
                    onChange={(e) => setArticleName(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Gross Weight */}
                <div className="input-group">
                  <label className="input-label">Gross Wt (grams) *</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    placeholder="e.g. 26.50"
                    value={grossWt}
                    onChange={(e) => setGrossWt(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Less Weight */}
                <div className="input-group">
                  <label className="input-label">Less Wt (stones/dross g)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="custom-input"
                    placeholder="e.g. 1.50"
                    value={lessWt}
                    onChange={(e) => setLessWt(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Net Weight (Auto-calculated) */}
                <div className="input-group">
                  <div className="input-label">
                    <span>Net Wt (Auto-calculated)</span>
                    <span className="badge-gold">Gross - Less</span>
                  </div>
                  <input
                    type="text"
                    className="custom-input"
                    value={`${netWt} g`}
                    readOnly
                    style={{ paddingLeft: '16px', background: 'rgba(229, 193, 88, 0.1)', fontWeight: 700, color: 'var(--gold-light)' }}
                  />
                </div>

                {/* Quantity */}
                <div className="input-group">
                  <label className="input-label">Quantity</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Present Value */}
                <div className="input-group">
                  <label className="input-label">Present Value (₹)</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="e.g. 200000"
                    value={presentValue}
                    onChange={(e) => setPresentValue(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  />
                </div>
              </div>
            </div>

            {/* SECTION 3: FINANCIALS & LOAN DETAILS */}
            <div style={{
              background: 'rgba(10, 3, 6, 0.4)',
              border: '1px solid rgba(229, 193, 88, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} /> Section 3: Financials & Loan Details
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                {/* Loan Amount */}
                <div className="input-group">
                  <label className="input-label">Loan Amount Sanctioned (₹) *</label>
                  <input
                    type="number"
                    className="custom-input"
                    placeholder="e.g. 150000"
                    value={loanAmount}
                    onChange={(e) => setLoanAmount(e.target.value)}
                    required
                    style={{ paddingLeft: '16px', fontSize: '1.2rem', fontWeight: '800', color: 'var(--gold-light)' }}
                  />
                </div>

              </div>

              {/* Loan Amount in Words (Auto-filled) */}
              <div className="input-group" style={{ marginTop: '12px' }}>
                <div className="input-label">
                  <span>Loan Amount in Words (Auto-filled)</span>
                  <span className="badge-gold">INR Words</span>
                </div>
                <input
                  type="text"
                  className="custom-input"
                  value={loanAmountInWords || 'Enter loan amount above...'}
                  readOnly
                  style={{ paddingLeft: '16px', background: 'rgba(16, 185, 129, 0.1)', color: '#6ee7b7', fontWeight: 700 }}
                />
              </div>

              {/* Item Photo Upload */}
              <div style={{ marginTop: '14px' }}>
                <label className="input-label">Item Photo (Select from Gallery or Camera)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                  <label className="btn-outline" style={{ cursor: 'pointer', padding: '10px 16px', fontSize: '0.85rem' }}>
                    <Camera size={16} />
                    <span>Upload / Capture Item Photo</span>
                    <input
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handlePhotoUpload(e, setItemPhoto)}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {itemPhoto && (
                    <img 
                      src={itemPhoto} 
                      alt="Item Preview" 
                      style={{ width: '48px', height: '48px', borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--gold-primary)' }} 
                    />
                  )}
                </div>
              </div>
            </div>

            <button type="submit" className="btn-gold" style={{ width: '100%', marginTop: '10px' }}>
              <PlusCircle size={20} />
              Save Girvi Loan Entry & Generate Receipt
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
                    <th style={{ padding: '12px 14px' }}>Pledge ID</th>
                    <th style={{ padding: '12px 14px' }}>Customer Name</th>
                    <th style={{ padding: '12px 14px' }}>Article & Wt</th>
                    <th style={{ padding: '12px 14px' }}>Net Wt</th>
                    <th style={{ padding: '12px 14px' }}>Loan Amount</th>
                    <th style={{ padding: '12px 14px' }}>Loan in Words</th>
                    <th style={{ padding: '12px 14px' }}>Status</th>
                    <th style={{ padding: '12px 14px', textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGirvis.map((g) => (
                    <tr key={g.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)', transition: 'background 0.2s ease' }} className="table-row-hover">
                      <td style={{ padding: '14px', fontWeight: 700, color: 'var(--gold-light)' }}>
                        <div>{g.id}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{g.pledgeDate || g.date}</div>
                      </td>
                      <td style={{ padding: '14px' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>
                          {g.customerName} {g.relationType && g.relationName ? `(${g.relationType} ${g.relationName})` : ''}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>+91 {g.mobile}</div>
                      </td>
                      <td style={{ padding: '14px', color: '#e2e8f0' }}>
                        <div>{g.articleName || g.itemDescription}</div>
                        <span className="badge-gold" style={{ fontSize: '0.68rem' }}>{g.metal} ({g.quantity || 1} Pcs)</span>
                      </td>
                      <td style={{ padding: '14px', fontWeight: 600, color: 'var(--gold-primary)' }}>{g.weight}</td>
                      <td style={{ padding: '14px', fontWeight: 700, color: '#ffffff' }}>₹{Number(g.loanAmount).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '14px', color: '#6ee7b7', fontSize: '0.78rem', maxWidth: '180px' }}>
                        {g.loanAmountInWords || numberToWordsINR(g.loanAmount)}
                      </td>
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

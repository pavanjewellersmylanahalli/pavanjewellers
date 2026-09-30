import React, { useState, useRef } from 'react';
import { 
  X, Save, Edit3, Camera, Upload, User, Coins, Scale, DollarSign, Calendar
} from 'lucide-react';
import { calculateDueDate, numberToWordsINR, toIsoDate } from '../utils/dateUtils';
import CustomDatePicker from './CustomDatePicker';

export default function EditGirviModal({ girvi, onClose, onSave }) {
  if (!girvi) return null;

  const initialPledgeDate = toIsoDate(girvi.pledgeDate || girvi.date);
  const initialDueDate = toIsoDate(girvi.dueDate || calculateDueDate(initialPledgeDate));

  const [pledgeNumber, setPledgeNumber] = useState(girvi.id || '');
  const [pledgeDate, setPledgeDate] = useState(initialPledgeDate);
  const [dueDate, setDueDate] = useState(initialDueDate);
  
  const [customerName, setCustomerName] = useState(girvi.customerName || '');
  const [relationType, setRelationType] = useState(girvi.relationType || 'S/O');
  const [relationName, setRelationName] = useState(girvi.relationName || '');
  const [mobile, setMobile] = useState(girvi.mobile || '');
  const [monthlyIncome, setMonthlyIncome] = useState(girvi.monthlyIncome !== undefined ? String(girvi.monthlyIncome) : '');
  const [address, setAddress] = useState(girvi.address || '');
  const [customerPhoto, setCustomerPhoto] = useState(girvi.customerPhoto || null);

  const [metal, setMetal] = useState(girvi.metal || 'Gold');
  const [articleName, setArticleName] = useState(girvi.articleName || girvi.itemDescription || '');
  const [grossWt, setGrossWt] = useState(girvi.grossWt !== undefined ? String(girvi.grossWt) : '');
  const [lessWt, setLessWt] = useState(girvi.lessWt !== undefined ? String(girvi.lessWt) : '0');
  const [quantity, setQuantity] = useState(girvi.quantity !== undefined ? String(girvi.quantity) : '1');
  const [presentValue, setPresentValue] = useState(girvi.presentValue !== undefined ? String(girvi.presentValue) : '');
  const [itemPhoto, setItemPhoto] = useState(girvi.itemPhoto || null);

  const [loanAmount, setLoanAmount] = useState(girvi.loanAmount !== undefined ? String(girvi.loanAmount) : '');
  const initialRate = girvi.interestRate ? String(girvi.interestRate).replace('%', '') : (girvi.monthlyInterestRate || '1.5');
  const [monthlyInterestRate, setMonthlyInterestRate] = useState(initialRate);

  // Camera state inside modal
  const [activeCameraTarget, setActiveCameraTarget] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handlePledgeDateChange = (val) => {
    setPledgeDate(val);
    setDueDate(calculateDueDate(val));
  };

  const grossNum = parseFloat(grossWt) || 0;
  const lessNum = parseFloat(lessWt) || 0;
  const netWt = Math.max(0, grossNum - lessNum).toFixed(2);
  const loanNum = parseFloat(loanAmount) || 0;
  const loanAmountInWords = numberToWordsINR(loanNum);

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

  const startCamera = async (target) => {
    setActiveCameraTarget(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      alert('Could not access camera. Please allow camera permissions or upload image from gallery.');
      setActiveCameraTarget(null);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveCameraTarget(null);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

    if (activeCameraTarget === 'CUSTOMER') {
      setCustomerPhoto(dataUrl);
    } else if (activeCameraTarget === 'ITEM') {
      setItemPhoto(dataUrl);
    }
    stopCamera();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!pledgeNumber.trim() || !customerName || !address || !articleName || !grossWt || !loanAmount) {
      alert('Please fill in all required fields marked with *');
      return;
    }

    const updatedRecord = {
      ...girvi,
      id: pledgeNumber.trim(),
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
      monthlyInterestRate,
      itemPhoto
    };

    onSave(updatedRecord);
  };

  return (
    <div className="receipt-modal-backdrop" style={{ zIndex: 1100 }}>
      <div className="glass-card" style={{ maxWidth: '840px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px 24px', position: 'relative' }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(229, 193, 88, 0.25)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '42px', height: '42px', borderRadius: '50%', background: 'rgba(229, 193, 88, 0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)'
            }}>
              <Edit3 size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                Edit Girvi Bill Entry (Pledge No. {girvi.id})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Modify bill details, dates, weights, customer info, or loan amount
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '6px 10px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.35)' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          
          {/* SECTION 1: PLEDGE & CUSTOMER DETAILS */}
          <div style={{ background: 'rgba(10, 3, 6, 0.4)', border: '1px solid rgba(229, 193, 88, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={16} /> Section 1: Pledge & Customer Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              
              {/* Pledge Number */}
              <div className="input-group">
                <label className="input-label">Pledge Number *</label>
                <input
                  type="text"
                  className="custom-input"
                  value={pledgeNumber}
                  onChange={(e) => setPledgeNumber(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Mobile Number (Optional - No asterisk) */}
              <div className="input-group">
                <label className="input-label">Mobile Number (Optional)</label>
                <input
                  type="tel"
                  className="custom-input"
                  placeholder="10-digit Mobile Number"
                  maxLength={10}
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Pledge Date */}
              <CustomDatePicker
                label="Pledge Date *"
                value={pledgeDate}
                onChange={(val) => handlePledgeDateChange(val)}
                required
              />

              {/* Due Date */}
              <CustomDatePicker
                label="Due Date * (Auto 1Yr + 1Mo)"
                value={dueDate}
                onChange={(val) => setDueDate(val)}
                required
              />

              {/* Customer Name */}
              <div className="input-group">
                <label className="input-label">Customer Name *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Customer Full Name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Relation Type */}
              <div className="input-group">
                <label className="input-label">Relation Type</label>
                <select
                  className="custom-input"
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value)}
                  style={{ paddingLeft: '14px', background: '#120407' }}
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
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Monthly Income */}
              <div className="input-group">
                <label className="input-label">Monthly Income (₹)</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 50000"
                  value={monthlyIncome}
                  onChange={(e) => setMonthlyIncome(e.target.value)}
                  style={{ paddingLeft: '14px' }}
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
                style={{ paddingLeft: '14px', paddingTop: '10px', height: 'auto' }}
              />
            </div>

            {/* Monthly Income */}
            <div className="input-group" style={{ marginTop: '12px' }}>
              <label className="input-label">Monthly Income (₹)</label>
              <input
                type="number"
                className="custom-input"
                placeholder="e.g. 50000"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(e.target.value)}
                style={{ paddingLeft: '14px' }}
              />
            </div>

            {/* Customer Photo Upload & Camera */}
            <div style={{ marginTop: '12px' }}>
              <label className="input-label">Customer Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <label className="btn-outline" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Upload size={14} />
                  <span>Choose Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, setCustomerPhoto)}
                    style={{ display: 'none' }}
                  />
                </label>

                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => startCamera('CUSTOMER')}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                >
                  <Camera size={14} />
                  <span>Click Camera</span>
                </button>

                {customerPhoto && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={customerPhoto} 
                      alt="Customer Preview" 
                      style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setCustomerPhoto(null)}
                      style={{
                        position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff',
                        border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px'
                      }}
                    >✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 2: FINANCIAL & LOAN DETAILS */}
          <div style={{ background: 'rgba(10, 3, 6, 0.4)', border: '1px solid rgba(229, 193, 88, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarSign size={16} /> Section 2: Financial & Loan Details
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
              {/* Loan Amount */}
              <div className="input-group">
                <label className="input-label">Principal Loan Amount (₹) *</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 50000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Monthly Interest Rate */}
              <div className="input-group">
                <label className="input-label">Monthly Interest Rate (%) *</label>
                <input
                  type="number"
                  step="0.1"
                  className="custom-input"
                  value={monthlyInterestRate}
                  onChange={(e) => setMonthlyInterestRate(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>
            </div>

            {/* Loan in Words preview */}
            {loanAmountInWords && (
              <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', color: '#6ee7b7', fontSize: '0.85rem', fontWeight: 700 }}>
                💵 Loan Amount in Words: {loanAmountInWords}
              </div>
            )}
          </div>

          {/* SECTION 3: ARTICLE & ORNAMENT DETAILS */}
          <div style={{ background: 'rgba(10, 3, 6, 0.4)', border: '1px solid rgba(229, 193, 88, 0.2)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Coins size={16} /> Section 3: Article & Ornament Details
            </h4>

            {/* Metal Selector */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              <button
                type="button"
                onClick={() => setMetal('Gold')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  border: metal === 'Gold' ? '2px solid var(--gold-primary)' : '1px solid rgba(255,255,255,0.15)',
                  background: metal === 'Gold' ? 'rgba(229, 193, 88, 0.15)' : 'rgba(0,0,0,0.3)',
                  color: metal === 'Gold' ? 'var(--gold-light)' : 'var(--text-muted)'
                }}
              >
                🥇 Gold (ಬಂಗಾರ)
              </button>
              <button
                type="button"
                onClick={() => setMetal('Silver')}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', fontWeight: 800, fontSize: '0.9rem', cursor: 'pointer',
                  border: metal === 'Silver' ? '2px solid #e2e8f0' : '1px solid rgba(255,255,255,0.15)',
                  background: metal === 'Silver' ? 'rgba(226, 232, 240, 0.15)' : 'rgba(0,0,0,0.3)',
                  color: metal === 'Silver' ? '#ffffff' : 'var(--text-muted)'
                }}
              >
                🥈 Silver (ಬೆಳ್ಳಿ)
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
              {/* Article Name */}
              <div className="input-group">
                <label className="input-label">Article Description *</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. Gold Chain 916 KDM"
                  value={articleName}
                  onChange={(e) => setArticleName(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Gross Wt */}
              <div className="input-group">
                <label className="input-label">Gross Weight (Grams) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="custom-input"
                  placeholder="e.g. 15.50"
                  value={grossWt}
                  onChange={(e) => setGrossWt(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Less Wt */}
              <div className="input-group">
                <label className="input-label">Less / Stone Weight (Grams)</label>
                <input
                  type="number"
                  step="0.01"
                  className="custom-input"
                  placeholder="0.00"
                  value={lessWt}
                  onChange={(e) => setLessWt(e.target.value)}
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Net Wt */}
              <div className="input-group">
                <label className="input-label">Calculated Net Weight</label>
                <input
                  type="text"
                  className="custom-input"
                  value={`${netWt} Grams`}
                  readOnly
                  style={{ paddingLeft: '14px', background: 'rgba(229, 193, 88, 0.1)', color: 'var(--gold-primary)', fontWeight: 800 }}
                />
              </div>

              {/* Quantity */}
              <div className="input-group">
                <label className="input-label">Quantity / Pieces *</label>
                <input
                  type="number"
                  className="custom-input"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                  style={{ paddingLeft: '14px' }}
                />
              </div>

              {/* Present Value */}
              <div className="input-group">
                <label className="input-label">Present Market Value (₹)</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 95000"
                  value={presentValue}
                  onChange={(e) => setPresentValue(e.target.value)}
                  style={{ paddingLeft: '14px' }}
                />
              </div>
            </div>

            {/* Item Photo Upload & Camera */}
            <div style={{ marginTop: '12px' }}>
              <label className="input-label">Item / Ornament Photo</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                <label className="btn-outline" style={{ cursor: 'pointer', padding: '6px 12px', fontSize: '0.8rem' }}>
                  <Upload size={14} />
                  <span>Choose Gallery</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(e, setItemPhoto)}
                    style={{ display: 'none' }}
                  />
                </label>

                <button
                  type="button"
                  className="btn-gold"
                  onClick={() => startCamera('ITEM')}
                  style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '34px' }}
                >
                  <Camera size={14} />
                  <span>Click Camera</span>
                </button>

                {itemPhoto && (
                  <div style={{ position: 'relative', display: 'inline-block' }}>
                    <img 
                      src={itemPhoto} 
                      alt="Item Preview" 
                      style={{ width: '44px', height: '44px', borderRadius: '6px', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setItemPhoto(null)}
                      style={{
                        position: 'absolute', top: '-6px', right: '-6px', background: '#ef4444', color: '#fff',
                        border: 'none', borderRadius: '50%', width: '16px', height: '16px', cursor: 'pointer', fontSize: '10px'
                      }}
                    >✕</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <button
              type="button"
              className="btn-outline"
              onClick={onClose}
              style={{ padding: '10px 20px', fontSize: '0.9rem' }}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="btn-gold"
              style={{ padding: '10px 24px', fontSize: '0.92rem' }}
            >
              <Save size={18} />
              <span>Save Changes</span>
            </button>
          </div>

        </form>

        {/* Live Camera Stream Capture Overlay Modal */}
        {activeCameraTarget && (
          <div className="receipt-modal-backdrop" style={{ zIndex: 1200 }}>
            <div className="glass-card" style={{ maxWidth: '500px', width: '100%', padding: '20px', textAlign: 'center' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                  Capture {activeCameraTarget === 'CUSTOMER' ? 'Customer' : 'Item'} Photo
                </h4>
                <button onClick={stopCamera} className="btn-outline" style={{ padding: '4px 8px', color: '#fca5a5' }}>✕</button>
              </div>

              <div style={{ position: 'relative', background: '#000', borderRadius: '10px', overflow: 'hidden', minHeight: '260px', border: '1px solid var(--card-border)' }}>
                <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px', justifyContent: 'center' }}>
                <button type="button" className="btn-gold" onClick={capturePhotoFromCamera} style={{ padding: '10px 20px', flex: 1 }}>
                  Snap Photo
                </button>
                <button type="button" className="btn-outline" onClick={stopCamera} style={{ padding: '10px 16px' }}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

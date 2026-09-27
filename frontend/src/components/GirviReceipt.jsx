import React from 'react';
import { X, Printer } from 'lucide-react';

function formatDate(dateStr) {
  if (!dateStr) return new Date().toLocaleDateString('en-GB');
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (e) {
    return dateStr;
  }
}

export default function GirviReceipt({ girvi, shop, onClose }) {
  if (!girvi) return null;

  const shopName = shop?.shop_name || 'PAVAN JEWELLERS';
  const shopMobile = shop?.login_mobile || shop?.reg_mobile || '9876543210';
  const shopAddress = shop?.address || 'Main Bazaar, Jewelers Market, Mylanahalli';
  const initials = shopName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'PJB';

  const grossNum = parseFloat(girvi.grossWt) || 0;
  const grossGms = Math.floor(grossNum);
  const grossMgs = Math.round((grossNum - grossGms) * 1000);

  const handlePrint = () => {
    window.print();
  };

  const renderSingleTicket = (copyType) => (
    <div className="pawn-ticket">
      {/* Top Bar */}
      <div className="ticket-top-bar">
        <span className="form-f-text">FORM 'F' (SEE RULE 12) | PAWN TICKET | PBL NO. ...............</span>
        <span className="copy-type-label">{copyType}</span>
      </div>

      {/* Shop Header Banner */}
      <div className="ticket-shop-banner">
        <div className="shop-logo-badge">{initials}</div>
        <div className="shop-info-center">
          <h2 className="shop-title">{shopName.toUpperCase()}</h2>
          <div className="shop-subtitle">PAWN BROKERS</div>
          <div className="shop-address">{shopAddress}</div>
        </div>
      </div>

      {/* Meta Bar */}
      <div className="ticket-meta-bar">
        <div><strong>No.</strong> <span className="underline-text">{girvi.id}</span></div>
        <div><strong>Date:</strong> <span className="underline-text">{formatDate(girvi.pledgeDate)}</span></div>
      </div>

      {/* Pawner Info Grid */}
      <div className="pawner-grid-container">
        <div className="pawner-details">
          <div className="pawner-row">
            <span className="lbl">NAME OF PAWNER</span>
            <span className="val">: <strong>{girvi.customerName}</strong></span>
          </div>
          <div className="pawner-row">
            <span className="lbl">S/O | W/O | D/O</span>
            <span className="val">: <strong>{girvi.relationType || 'S/O'} {girvi.relationName || '—'}</strong></span>
          </div>
          <div className="pawner-row">
            <span className="lbl">RESIDENCE</span>
            <span className="val">: <strong>{girvi.address}</strong></span>
          </div>
          <div className="pawner-row">
            <span className="lbl">OCCUPATION</span>
            <span className="val">: <strong>—</strong></span>
          </div>
          <div className="pawner-row split-row">
            <span><span className="lbl">MOB:</span> <strong>{girvi.mobile}</strong></span>
            <span><span className="lbl">INC:</span> <strong>{girvi.monthlyIncome || '30000'}</strong></span>
          </div>
        </div>

        <div className="photo-container-box">
          <div className="photo-sub-box">
            {girvi.customerPhoto ? (
              <img src={girvi.customerPhoto} alt="Customer" className="photo-img" />
            ) : (
              <span className="photo-lbl">Customer Photo</span>
            )}
          </div>
          <div className="photo-sub-box">
            {girvi.itemPhoto ? (
              <img src={girvi.itemPhoto} alt="Item" className="photo-img" />
            ) : (
              <span className="photo-lbl">Item Photo</span>
            )}
          </div>
        </div>
      </div>

      {/* Financial Box */}
      <div className="financial-grid-box">
        <div className="fin-box-left">
          <div className="fin-lbl">PRINCIPAL LOAN AMOUNT</div>
          <div className="fin-val">₹{Number(girvi.loanAmount || 0).toLocaleString('en-IN')}</div>
        </div>
        <div className="fin-box-right">
          <div className="fin-lbl">RUPEES IN WORDS</div>
          <div className="fin-words">{girvi.loanAmountInWords || 'Seven Thousand Only'}</div>
        </div>
      </div>

      {/* Statutory Notice */}
      <div className="statutory-notice-wrapper">
        <div className="statutory-notice">
          <div>Rate of interest: <em>Fourteen percent per annum</em></div>
          <div>Time of redemption: <em>12 months</em></div>
        </div>
        <div className="clause-text">
          <em>The following article / articles is / are pawned with me / us</em>
        </div>
      </div>

      {/* Articles Table */}
      <table className="pawn-articles-table">
        <thead>
          <tr>
            <th style={{ width: '6%' }}>SL</th>
            <th style={{ width: '42%' }}>DESCRIPTION OF ARTICLES PLEDGED</th>
            <th style={{ width: '20%' }}>
              GROSS WT
              <div className="sub-th"><span>GMS.</span><span>MGS.</span></div>
            </th>
            <th style={{ width: '10%' }}>LESS WT</th>
            <th style={{ width: '10%' }}>NET WT</th>
            <th style={{ width: '12%' }}>VALUE (₹)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="center-txt">1</td>
            <td className="bold-txt">{girvi.articleName} ({girvi.metal || 'Gold'})</td>
            <td>
              <div className="wt-cell">
                <span>{grossGms}</span>
                <span>{grossMgs}</span>
              </div>
            </td>
            <td className="center-txt">{girvi.lessWt || '0'}</td>
            <td className="center-txt bold-txt">{girvi.weight || `${girvi.grossWt - girvi.lessWt}g`}</td>
            <td className="center-txt">{girvi.presentValue ? `₹${girvi.presentValue}` : '—'}</td>
          </tr>
          <tr><td className="center-txt">2</td><td></td><td></td><td></td><td></td><td></td></tr>
          <tr><td className="center-txt">3</td><td></td><td></td><td></td><td></td><td></td></tr>
        </tbody>
      </table>

      {/* Kannada Note */}
      <div className="kannada-note-box">
        (ಪ್ರತಿ ಮೂರು ತಿಂಗಳಿಗೊಮ್ಮೆ ಬಡ್ಡಿ ಹಣ ಕಟ್ಟಬೇಕು)
      </div>

      {/* Summary Bar */}
      <div className="summary-bar-grid">
        <div>Rs. {Number(girvi.loanAmount || 0).toFixed(2)}</div>
        <div>Date: {formatDate(girvi.pledgeDate)}</div>
        <div>Pieces: {girvi.quantity || 1}</div>
      </div>

      {/* Signatures Grid */}
      <div className="signatures-grid-box">
        <div className="sig-box-left">
          <div className="sig-header">For {shopName.toUpperCase()}</div>
          <div className="sig-footer-line">SIGNATURE OF P.B. OR HIS AGENT</div>
        </div>
        <div className="sig-box-right">
          <div className="sig-dec-text">
            I declare that the above articles are my own property. The above statement is true to the best of my knowledge and belief.
          </div>
          <div className="sig-footer-line">SIGNATURE / LTI OF PAWNER</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="receipt-modal-backdrop">
      {/* Modal Actions Header (Screen only) */}
      <div className="receipt-modal-actions no-print">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Printer color="var(--gold-primary)" size={22} />
          <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-light)' }}>
            Official Pawn Ticket Slip (Form 'F')
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
            <Printer size={16} />
            <span>Print Receipt</span>
          </button>
          <button onClick={onClose} className="btn-outline" style={{ padding: '8px 12px', color: '#fca5a5' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Printable Dual Ticket Wrapper */}
      <div className="receipt-dual-wrapper">
        {renderSingleTicket('BRANCH COPY')}

        {/* Separator */}
        <div className="ticket-tear-line">
          <div className="dashed-line" />
          <div className="tear-icon">✂ TEAR HERE</div>
          <div className="dashed-line" />
        </div>

        {renderSingleTicket('CUSTOMER COPY')}
      </div>
    </div>
  );
}

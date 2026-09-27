import React from 'react';
import { X, Printer, FileText } from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function LedgerPrintPdfModal({ items, shop, title, onClose }) {
  if (!Array.isArray(items)) return null;

  const shopName = shop?.shop_name || 'PAVAN JEWELLERS';
  const shopMobile = shop?.login_mobile || shop?.reg_mobile || '9876543210';
  const shopAddress = shop?.address || 'Main Bazaar, Jewelers Market, Mylanahalli';
  const todayFormatted = formatDate(new Date().toISOString().split('T')[0]);

  const totalCapital = items.reduce((sum, i) => sum + Number(i.loanAmount || 0), 0);
  const totalGoldWeight = items.filter(i => i.metal === 'Gold').reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);
  const totalSilverWeight = items.filter(i => i.metal === 'Silver').reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="receipt-modal-backdrop" style={{ zIndex: 1100 }}>
      {/* Modal Header Controls (Screen only - hidden when printing) */}
      <div className="receipt-modal-actions no-print" style={{ maxWidth: '1100px', width: '100%', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FileText color="var(--gold-primary)" size={22} />
          <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--gold-light)' }}>
            Print / Export PDF Ledger Report
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button onClick={handlePrint} className="btn-gold" style={{ padding: '8px 18px', fontSize: '0.9rem' }}>
            <Printer size={16} />
            <span>Print / Save as PDF</span>
          </button>
          
          <button onClick={onClose} className="btn-outline" style={{ padding: '8px 12px', color: '#fca5a5' }}>
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Printable Report Paper */}
      <div className="glass-card printable-ledger-paper" style={{
        maxWidth: '1100px', width: '100%', maxHeight: '85vh', overflowY: 'auto',
        background: '#ffffff', color: '#000000', padding: '32px 36px', borderRadius: '12px', boxSizing: 'border-box'
      }}>
        
        {/* Printable Shop Header */}
        <div style={{ textAlign: 'center', borderBottom: '2px solid #000000', paddingBottom: '14px', marginBottom: '18px' }}>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, letterSpacing: '1px', margin: 0, textTransform: 'uppercase' }}>
            {shopName}
          </h1>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, marginTop: '2px' }}>
            PAWN BROKERS & JEWELLERS | MORTGAGE LEDGER REPORT
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '2px', color: '#333333' }}>
            {shopAddress} | Contact: +91 {shopMobile}
          </div>
        </div>

        {/* Report Meta Info */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', fontSize: '0.85rem', fontWeight: 700 }}>
          <div style={{ textTransform: 'uppercase', fontSize: '1rem', color: '#000000', textDecoration: 'underline' }}>
            {title || 'GIRVI MORTGAGE LEDGER REPORT'}
          </div>
          <div>
            Report Date: {todayFormatted}
          </div>
        </div>

        {/* Financial Summary Metric Bar */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px',
          background: '#f8fafc', border: '1px solid #cbd5e1', padding: '10px 14px', borderRadius: '8px', marginBottom: '18px', fontSize: '0.82rem'
        }}>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>TOTAL ENTRIES</span>
            <strong>{items.length} Records</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>TOTAL LOAN CAPITAL</span>
            <strong>₹{totalCapital.toLocaleString('en-IN')}</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>GOLD VAULT WEIGHT</span>
            <strong>{totalGoldWeight.toFixed(2)} g</strong>
          </div>
          <div>
            <span style={{ color: '#64748b', display: 'block', fontSize: '0.72rem' }}>SILVER VAULT WEIGHT</span>
            <strong>{totalSilverWeight.toFixed(2)} g</strong>
          </div>
        </div>

        {/* Report Data Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left', border: '1px solid #000000' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '1.5px solid #000000', textAlign: 'left' }}>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '4%' }}>#</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '9%' }}>Pledge No</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '10%' }}>Pledge Date</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '10%' }}>Due Date</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '18%' }}>Customer Name</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '11%' }}>Mobile</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '18%' }}>Article Description</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '9%', textAlign: 'right' }}>Net Wt</th>
              <th style={{ padding: '8px 6px', borderRight: '1px solid #cbd5e1', width: '11%', textAlign: 'right' }}>Loan (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id || idx} style={{ borderBottom: '1px solid #cbd5e1', background: idx % 2 === 0 ? '#ffffff' : '#f8fafc' }}>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'center' }}>{idx + 1}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', fontWeight: 800 }}>{item.id}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>{formatDate(item.pledgeDate || item.date)}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>{formatDate(item.dueDate)}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>
                  <strong>{item.customerName}</strong>
                  {item.relationType && item.relationName ? <div style={{ fontSize: '0.72rem', color: '#475569' }}>({item.relationType} {item.relationName})</div> : ''}
                </td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>{item.mobile ? item.mobile : '—'}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1' }}>
                  {item.articleName || item.itemDescription} ({item.metal || 'Gold'})
                </td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 700 }}>{item.weight}</td>
                <td style={{ padding: '6px', borderRight: '1px solid #cbd5e1', textAlign: 'right', fontWeight: 800 }}>₹{Number(item.loanAmount || 0).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Footer Signature */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '36px', paddingTop: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
            System Generated Report | {shopName}
          </div>
          <div style={{ textAlign: 'center', borderTop: '1px dashed #000000', paddingTop: '6px', width: '220px', fontSize: '0.8rem', fontWeight: 700 }}>
            Authorized Signature / Stamp
          </div>
        </div>

      </div>
    </div>
  );
}

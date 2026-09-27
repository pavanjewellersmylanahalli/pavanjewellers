import React, { useState } from 'react';
import { 
  X, BookOpen, Plus, DollarSign, Calendar, FileText, ArrowDownRight, 
  ArrowUpRight, Coins, Printer, Trash2, CheckCircle2, AlertCircle, Scale, User, Save
} from 'lucide-react';
import { formatDate } from '../utils/dateUtils';

export default function GirviPassbookModal({ girvi, onClose, onUpdateGirvi }) {
  if (!girvi) return null;

  // Initial transactions array from girvi or empty
  const [transactions, setTransactions] = useState(girvi.transactions || []);
  
  // Transaction form state
  const [transType, setTransType] = useState('INTEREST'); // 'INTEREST' | 'TOPUP' | 'PRINCIPAL_PAYMENT'
  const [amount, setAmount] = useState('');
  const [transDate, setTransDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [periodMonths, setPeriodMonths] = useState('1');

  // Compute financial totals
  const initialPrincipal = parseFloat(girvi.originalLoanAmount || girvi.loanAmount || 0);

  let totalTopups = 0;
  let totalPrincipalPaid = 0;
  let totalInterestCollected = 0;

  transactions.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'TOPUP') totalTopups += amt;
    else if (t.type === 'PRINCIPAL_PAYMENT') totalPrincipalPaid += amt;
    else if (t.type === 'INTEREST') totalInterestCollected += amt;
  });

  const currentPrincipal = initialPrincipal + totalTopups - totalPrincipalPaid;

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const parsedAmt = parseFloat(amount);
    if (isNaN(parsedAmt) || parsedAmt <= 0) {
      alert('Please enter a valid transaction amount');
      return;
    }

    const newTx = {
      id: Date.now().toString(),
      type: transType,
      amount: parsedAmt,
      date: transDate,
      remarks: remarks.trim() || (transType === 'INTEREST' ? `Interest received for ${periodMonths} month(s)` : transType === 'TOPUP' ? 'Loan Top-up amount cash given' : 'Partial principal payment received'),
      periodMonths: transType === 'INTEREST' ? periodMonths : null,
      createdAt: new Date().toISOString()
    };

    const updatedTxs = [newTx, ...transactions];
    setTransactions(updatedTxs);

    // Calculate new loan amount
    let newLoanAmount = currentPrincipal;
    if (transType === 'TOPUP') {
      newLoanAmount = currentPrincipal + parsedAmt;
    } else if (transType === 'PRINCIPAL_PAYMENT') {
      newLoanAmount = Math.max(0, currentPrincipal - parsedAmt);
    }

    // Update parent girvi record
    const updatedGirvi = {
      ...girvi,
      loanAmount: newLoanAmount,
      transactions: updatedTxs
    };

    onUpdateGirvi(updatedGirvi);

    // Reset form
    setAmount('');
    setRemarks('');
  };

  const handleDeleteTransaction = (txId) => {
    if (!window.confirm('Are you sure you want to delete this transaction entry?')) return;

    const filtered = transactions.filter(t => t.id !== txId);
    setTransactions(filtered);

    // Recalculate loan amount
    let newTopups = 0;
    let newPrincipalPaid = 0;
    filtered.forEach(t => {
      const amt = parseFloat(t.amount) || 0;
      if (t.type === 'TOPUP') newTopups += amt;
      else if (t.type === 'PRINCIPAL_PAYMENT') newPrincipalPaid += amt;
    });

    const newLoanAmount = Math.max(0, initialPrincipal + newTopups - newPrincipalPaid);
    const updatedGirvi = {
      ...girvi,
      loanAmount: newLoanAmount,
      transactions: filtered
    };

    onUpdateGirvi(updatedGirvi);
  };

  const handlePrintPassbook = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 2, 4, 0.88)',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 8px'
    }}>
      {/* Print-specific style override */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .passbook-modal-container, .passbook-modal-container * { visibility: visible; }
          .passbook-modal-container { 
            position: absolute; 
            left: 0; 
            top: 0; 
            width: 100% !important; 
            max-width: 100% !important;
            box-shadow: none !important;
            background: #ffffff !important;
            color: #000000 !important;
            padding: 0 !important;
          }
          .no-print { display: none !important; }
          .print-dark-text { color: #000000 !important; }
        }
      `}</style>

      <div className="glass-card passbook-modal-container" style={{
        width: '100%',
        maxWidth: '860px',
        maxHeight: '94vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '18px 16px',
        border: '1.5px solid rgba(229, 193, 88, 0.4)',
        background: 'rgba(15, 5, 8, 0.96)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)'
      }}>
        
        {/* Header Bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(229, 193, 88, 0.2)', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(229, 193, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)', flexShrink: 0 }}>
              <BookOpen size={20} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <h3 className="gold-text" style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>Pledge Passbook</h3>
                <span className="badge-gold" style={{ fontSize: '0.7rem' }}>No. {girvi.id}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '2px 0 0 0' }}>Transaction Ledger & History Book</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }} className="no-print">
            <button
              className="btn-gold"
              onClick={handlePrintPassbook}
              style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '36px' }}
            >
              <Printer size={14} />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#ffffff', cursor: 'pointer', padding: '6px 10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Customer & Article Info Banner */}
        <div style={{ background: 'rgba(229, 193, 88, 0.08)', borderRadius: '14px', padding: '12px 14px', marginBottom: '16px', border: '1px solid rgba(229, 193, 88, 0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px', fontSize: '0.82rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>CUSTOMER NAME</div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '0.94rem', marginTop: '1px' }}>
                {girvi.customerName} {girvi.relationType && girvi.relationName ? `(${girvi.relationType} ${girvi.relationName})` : ''}
              </div>
              <div style={{ color: 'var(--text-gold)', fontSize: '0.78rem', marginTop: '1px' }}>📞 {girvi.mobile ? `+91 ${girvi.mobile}` : 'No Mobile'}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>ARTICLE & WEIGHT</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '1px' }}>{girvi.articleName || girvi.itemDescription}</div>
              <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.78rem', marginTop: '1px' }}>
                {girvi.metal} | Net Wt: {girvi.weight}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}>PLEDGE DATE & DUE DATE</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '1px' }}>
                {formatDate(girvi.pledgeDate || girvi.date)} {girvi.dueDate ? `| Due: ${formatDate(girvi.dueDate)}` : ''}
              </div>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.78rem', marginTop: '1px' }}>
                Rate: {girvi.monthlyInterestRate || '1.5'}% Monthly
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Metric Cards (Responsive 2x2 on Mobile) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '10px', marginBottom: '18px' }}>
          <div style={{ background: 'rgba(10, 3, 6, 0.6)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600 }}>Sanctioned Loan</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              ₹{initialPrincipal.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px 12px', borderRadius: '12px', border: '1.5px solid rgba(16, 185, 129, 0.35)' }}>
            <div style={{ fontSize: '0.7rem', color: '#6ee7b7', fontWeight: 700 }}>Outstanding Loan</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
              ₹{currentPrincipal.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(229, 193, 88, 0.1)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(229, 193, 88, 0.25)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--gold-light)', fontWeight: 600 }}>Interest Paid</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '2px' }}>
              ₹{totalInterestCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.1)', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <div style={{ fontSize: '0.7rem', color: '#c084fc', fontWeight: 600 }}>Top-Ups Given</div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#c084fc', marginTop: '2px' }}>
              +₹{totalTopups.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Add New Transaction Entry Section (No Print) */}
        <div className="no-print" style={{ background: 'rgba(10, 3, 6, 0.8)', padding: '14px', borderRadius: '14px', marginBottom: '18px', border: '1px solid rgba(229, 193, 88, 0.3)' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--gold-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Plus size={16} color="var(--gold-primary)" /> Record Transaction Entry
          </h4>

          <form onSubmit={handleAddTransaction}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', marginBottom: '10px' }}>
              {/* Type Select */}
              <div style={{ gridColumn: '1 / -1' }}>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Transaction Type</label>
                <select
                  className="custom-input"
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  style={{ padding: '8px 10px', fontSize: '0.85rem', width: '100%', minHeight: '40px' }}
                >
                  <option value="INTEREST">💸 Interest Payment Received</option>
                  <option value="TOPUP">➕ Top-Up Loan Cash Given (+Principal)</option>
                  <option value="PRINCIPAL_PAYMENT">➖ Partial Principal Payment (-Principal)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Amount (₹)</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ padding: '8px 10px', fontSize: '0.85rem', width: '100%', minHeight: '40px' }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="input-label" style={{ fontSize: '0.75rem' }}>Transaction Date</label>
                <input
                  type="date"
                  className="custom-input"
                  value={transDate}
                  onChange={(e) => setTransDate(e.target.value)}
                  required
                  style={{ padding: '8px 10px', fontSize: '0.85rem', width: '100%', minHeight: '40px' }}
                />
              </div>

              {/* Interest Months (if INTEREST type) */}
              {transType === 'INTEREST' && (
                <div>
                  <label className="input-label" style={{ fontSize: '0.75rem' }}>Interest Period</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. 2 months"
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(e.target.value)}
                    style={{ padding: '8px 10px', fontSize: '0.85rem', width: '100%', minHeight: '40px' }}
                  />
                </div>
              )}
            </div>

            {/* Remarks / Notes */}
            <div style={{ marginBottom: '12px' }}>
              <label className="input-label" style={{ fontSize: '0.75rem' }}>Remarks / Notes (Optional)</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Received via PhonePe, interest paid till Sept 2026..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ padding: '8px 10px', fontSize: '0.85rem', width: '100%', minHeight: '40px' }}
              />
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', minHeight: '42px', fontSize: '0.88rem', fontWeight: 800 }}
            >
              <Save size={16} /> Save Transaction to Passbook
            </button>
          </form>
        </div>

        {/* Transaction History Ledger Section */}
        <div>
          <h4 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--gold-light)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BookOpen size={16} color="var(--gold-primary)" /> Passbook Statement History
          </h4>

          {/* DESKTOP TABLE VIEW (Visible >= 768px) */}
          <div className="passbook-desktop-view" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(229, 193, 88, 0.3)', color: 'var(--gold-primary)' }}>
                  <th style={{ padding: '10px' }}>Date</th>
                  <th style={{ padding: '10px' }}>Transaction Type</th>
                  <th style={{ padding: '10px' }}>Particulars / Remarks</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Amount (₹)</th>
                  <th style={{ padding: '10px', textAlign: 'right' }}>Balance Principal</th>
                  <th style={{ padding: '10px', textAlign: 'center' }} className="no-print">Action</th>
                </tr>
              </thead>
              <tbody>
                {/* Initial Creation Row */}
                <tr style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.06)', background: 'rgba(255,255,255,0.02)' }}>
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{formatDate(girvi.pledgeDate || girvi.date)}</td>
                  <td style={{ padding: '10px' }}>
                    <span className="badge-gold" style={{ fontSize: '0.68rem' }}>PLEDGE CREATED</span>
                  </td>
                  <td style={{ padding: '10px', color: '#ffffff' }}>Original Mortgage Loan Issued</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: '#ffffff' }}>+₹{initialPrincipal.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>₹{initialPrincipal.toLocaleString('en-IN')}</td>
                  <td style={{ padding: '10px', textAlign: 'center', color: 'var(--text-muted)' }} className="no-print">-</td>
                </tr>

                {/* Dynamic Transactions Rows */}
                {transactions.length > 0 ? (
                  transactions.map((tx) => (
                    <tr key={tx.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{formatDate(tx.date)}</td>
                      <td style={{ padding: '10px' }}>
                        {tx.type === 'INTEREST' && (
                          <span className="badge-success" style={{ fontSize: '0.68rem', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                            INTEREST PAID
                          </span>
                        )}
                        {tx.type === 'TOPUP' && (
                          <span className="badge-gold" style={{ fontSize: '0.68rem', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
                            LOAN TOP-UP
                          </span>
                        )}
                        {tx.type === 'PRINCIPAL_PAYMENT' && (
                          <span className="badge-gold" style={{ fontSize: '0.68rem', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                            PRINCIPAL PAID
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '10px', color: '#e2e8f0' }}>{tx.remarks}</td>
                      <td style={{
                        padding: '10px',
                        textAlign: 'right',
                        fontWeight: 700,
                        color: tx.type === 'INTEREST' ? '#34d399' : tx.type === 'TOPUP' ? '#c084fc' : '#60a5fa'
                      }}>
                        {tx.type === 'TOPUP' ? `+₹${parseFloat(tx.amount).toLocaleString('en-IN')}` : `₹${parseFloat(tx.amount).toLocaleString('en-IN')}`}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'right', fontWeight: 800, color: '#34d399' }}>
                        ₹{currentPrincipal.toLocaleString('en-IN')}
                      </td>
                      <td style={{ padding: '10px', textAlign: 'center' }} className="no-print">
                        <button
                          onClick={() => handleDeleteTransaction(tx.id)}
                          style={{ background: 'none', border: 'none', color: '#fca5a5', cursor: 'pointer', padding: '4px' }}
                          title="Delete entry"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : null}
              </tbody>
            </table>
          </div>

          {/* MOBILE CARDS VIEW (Visible < 768px - Touch Friendly Timeline Cards) */}
          <div className="passbook-mobile-view" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            
            {/* Initial Loan Creation Mobile Card */}
            <div style={{ background: 'rgba(10, 3, 6, 0.7)', borderRadius: '12px', border: '1px solid rgba(229, 193, 88, 0.3)', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)' }}>{formatDate(girvi.pledgeDate || girvi.date)}</span>
                <span className="badge-gold" style={{ fontSize: '0.66rem' }}>PLEDGE CREATED</span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#ffffff', marginBottom: '8px' }}>
                Original Mortgage Loan Sanctioned
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loan Issued</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#ffffff' }}>+₹{initialPrincipal.toLocaleString('en-IN')}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance Loan</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 900, color: '#34d399' }}>₹{initialPrincipal.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Dynamic Transactions Mobile Cards */}
            {transactions.map((tx) => (
              <div key={tx.id} style={{
                background: 'rgba(10, 3, 6, 0.7)',
                borderRadius: '12px',
                border: tx.type === 'INTEREST' ? '1px solid rgba(16, 185, 129, 0.35)' : tx.type === 'TOPUP' ? '1px solid rgba(168, 85, 247, 0.35)' : '1px solid rgba(59, 130, 246, 0.35)',
                padding: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#ffffff' }}>{formatDate(tx.date)}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {tx.type === 'INTEREST' && (
                      <span className="badge-success" style={{ fontSize: '0.66rem' }}>INTEREST PAID</span>
                    )}
                    {tx.type === 'TOPUP' && (
                      <span className="badge-gold" style={{ fontSize: '0.66rem', background: 'rgba(168, 85, 247, 0.2)', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.4)' }}>LOAN TOP-UP</span>
                    )}
                    {tx.type === 'PRINCIPAL_PAYMENT' && (
                      <span className="badge-gold" style={{ fontSize: '0.66rem', background: 'rgba(59, 130, 246, 0.2)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}>PRINCIPAL PAID</span>
                    )}
                    
                    <button
                      onClick={() => handleDeleteTransaction(tx.id)}
                      style={{ background: 'rgba(239, 68, 68, 0.15)', border: 'none', borderRadius: '6px', color: '#fca5a5', cursor: 'pointer', padding: '4px 6px' }}
                      title="Delete entry"
                      className="no-print"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.84rem', color: '#e2e8f0', marginBottom: '8px' }}>
                  {tx.remarks}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.04)', padding: '8px 10px', borderRadius: '8px' }}>
                  <div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Transaction Cash</div>
                    <div style={{
                      fontSize: '0.98rem',
                      fontWeight: 800,
                      color: tx.type === 'INTEREST' ? '#34d399' : tx.type === 'TOPUP' ? '#c084fc' : '#60a5fa'
                    }}>
                      {tx.type === 'TOPUP' ? `+₹${parseFloat(tx.amount).toLocaleString('en-IN')}` : `₹${parseFloat(tx.amount).toLocaleString('en-IN')}`}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Balance Loan</div>
                    <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#34d399' }}>₹{currentPrincipal.toLocaleString('en-IN')}</div>
                  </div>
                </div>
              </div>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}

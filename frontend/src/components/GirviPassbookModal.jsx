import React, { useState } from 'react';
import { 
  X, BookOpen, Plus, DollarSign, Calendar, FileText, ArrowDownRight, 
  ArrowUpRight, Coins, Printer, Trash2, CheckCircle2, AlertCircle, Scale, User
} from 'lucide-react';

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
      alert('Please enter a valid valid transaction amount');
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
      background: 'rgba(5, 2, 4, 0.85)',
      backdropFilter: 'blur(8px)',
      zIndex: 1100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px'
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
          }
          .no-print { display: none !important; }
          .print-dark-text { color: #000000 !important; }
        }
      `}</style>

      <div className="glass-card passbook-modal-container" style={{
        width: '100%',
        maxWidth: '840px',
        maxHeight: '92vh',
        overflowY: 'auto',
        borderRadius: '20px',
        padding: '24px',
        border: '1.5px solid rgba(229, 193, 88, 0.4)',
        background: 'rgba(15, 5, 8, 0.96)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(229, 193, 88, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(229, 193, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
              <BookOpen size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 className="gold-text" style={{ fontSize: '1.4rem', fontWeight: 800 }}>Pledge Passbook Ledger</h3>
                <span className="badge-gold">No. {girvi.id}</span>
              </div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>Detailed Transaction & Payment History Book</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }} className="no-print">
            <button
              className="btn-gold"
              onClick={handlePrintPassbook}
              style={{ padding: '6px 14px', fontSize: '0.82rem', minHeight: '36px' }}
            >
              <Printer size={15} />
              <span>Print Book</span>
            </button>
            <button
              onClick={onClose}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '6px' }}
            >
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Customer & Article Info Banner */}
        <div style={{ background: 'rgba(229, 193, 88, 0.08)', borderRadius: '14px', padding: '16px 20px', marginBottom: '20px', border: '1px solid rgba(229, 193, 88, 0.2)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', fontSize: '0.86rem' }}>
            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>CUSTOMER NAME</div>
              <div style={{ fontWeight: 800, color: '#ffffff', fontSize: '1rem', marginTop: '2px' }}>
                {girvi.customerName} {girvi.relationType && girvi.relationName ? `(${girvi.relationType} ${girvi.relationName})` : ''}
              </div>
              <div style={{ color: 'var(--text-gold)', fontSize: '0.8rem', marginTop: '2px' }}>📞 +91 {girvi.mobile}</div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>ARTICLE & WEIGHT</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{girvi.articleName || girvi.itemDescription}</div>
              <div style={{ color: 'var(--gold-primary)', fontWeight: 700, fontSize: '0.82rem', marginTop: '2px' }}>
                {girvi.metal} | Net Wt: {girvi.weight}
              </div>
            </div>

            <div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>PLEDGE DATE & INTEREST RATE</div>
              <div style={{ fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>{girvi.pledgeDate || girvi.date}</div>
              <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.82rem', marginTop: '2px' }}>
                Rate: {girvi.monthlyInterestRate || '2'}% Monthly
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(10, 3, 6, 0.6)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Original Sanctioned</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
              ₹{initialPrincipal.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#6ee7b7' }}>Current Outstanding Principal</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34d399', marginTop: '2px' }}>
              ₹{currentPrincipal.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(229, 193, 88, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(229, 193, 88, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--gold-light)' }}>Total Interest Collected</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gold-primary)', marginTop: '2px' }}>
              ₹{totalInterestCollected.toLocaleString('en-IN')}
            </div>
          </div>

          <div style={{ background: 'rgba(168, 85, 247, 0.08)', padding: '12px 14px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.25)' }}>
            <div style={{ fontSize: '0.75rem', color: '#c084fc' }}>Total Top-Ups Given</div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#c084fc', marginTop: '2px' }}>
              +₹{totalTopups.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        {/* Add New Transaction Entry Section (No Print) */}
        <div className="no-print" style={{ background: 'rgba(10, 3, 6, 0.8)', padding: '18px', borderRadius: '16px', marginBottom: '24px', border: '1px solid rgba(229, 193, 88, 0.3)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-light)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={18} color="var(--gold-primary)" /> Record New Transaction Entry
          </h4>

          <form onSubmit={handleAddTransaction}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginBottom: '14px' }}>
              {/* Type Select */}
              <div>
                <label className="input-label" style={{ fontSize: '0.78rem' }}>Transaction Type</label>
                <select
                  className="custom-input"
                  value={transType}
                  onChange={(e) => setTransType(e.target.value)}
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                >
                  <option value="INTEREST">💸 Interest Payment Received</option>
                  <option value="TOPUP">➕ Top-Up Loan Cash Given (+Principal)</option>
                  <option value="PRINCIPAL_PAYMENT">➖ Partial Principal Payment (-Principal)</option>
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="input-label" style={{ fontSize: '0.78rem' }}>Amount (₹)</label>
                <input
                  type="number"
                  className="custom-input"
                  placeholder="e.g. 1500"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Date */}
              <div>
                <label className="input-label" style={{ fontSize: '0.78rem' }}>Transaction Date</label>
                <input
                  type="date"
                  className="custom-input"
                  value={transDate}
                  onChange={(e) => setTransDate(e.target.value)}
                  required
                  style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                />
              </div>

              {/* Interest Months (if INTEREST type) */}
              {transType === 'INTEREST' && (
                <div>
                  <label className="input-label" style={{ fontSize: '0.78rem' }}>Interest Months</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="e.g. 2 months"
                    value={periodMonths}
                    onChange={(e) => setPeriodMonths(e.target.value)}
                    style={{ padding: '8px 12px', fontSize: '0.85rem' }}
                  />
                </div>
              )}
            </div>

            {/* Remarks / Notes */}
            <div style={{ marginBottom: '14px' }}>
              <label className="input-label" style={{ fontSize: '0.78rem' }}>Remarks / Notes (Optional)</label>
              <input
                type="text"
                className="custom-input"
                placeholder="e.g. Received via UPI / Cash, paid interest up to Sept 2026..."
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }}
              />
            </div>

            <button
              type="submit"
              className="btn-gold"
              style={{ width: '100%', minHeight: '40px', fontSize: '0.88rem', fontWeight: 700 }}
            >
              <Plus size={16} /> Save Transaction to Passbook
            </button>
          </form>
        </div>

        {/* Transaction History Ledger Table */}
        <div>
          <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--gold-light)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={18} color="var(--gold-primary)" /> Passbook Statement History
          </h4>

          <div style={{ overflowX: 'auto' }}>
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
                  <td style={{ padding: '10px', fontWeight: 700, color: 'var(--text-muted)' }}>{girvi.pledgeDate || girvi.date}</td>
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
                      <td style={{ padding: '10px', fontWeight: 700, color: '#ffffff' }}>{tx.date}</td>
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
                ) : (
                  <tr>
                    <td colSpan="6" style={{ padding: '16px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                      No interest or top-up payment transactions recorded yet. Use the form above to log transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

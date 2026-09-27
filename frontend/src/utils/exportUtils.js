import { formatDate } from './dateUtils';

/**
 * Exports any array of Girvi records to a formatted Excel/CSV file (.csv)
 * @param {Array} items - List of Girvi items to export
 * @param {string} ledgerName - Name of the ledger (e.g. Total_Ledger, Released_Ledger)
 */
export function exportLedgerToCSV(items, ledgerName = 'Pavan_Jewellers_Girvi_Ledger') {
  if (!Array.isArray(items) || items.length === 0) {
    alert('No ledger records available to export.');
    return;
  }

  const headers = [
    'Pledge No',
    'Pledge Date',
    'Due Date',
    'Release Date',
    'Customer Name',
    'Relation',
    'Mobile Number',
    'Address',
    'Metal',
    'Article Description',
    'Gross Wt (g)',
    'Less Wt (g)',
    'Net Weight',
    'Quantity',
    'Loan Amount (Rs)',
    'Loan in Words',
    'Interest Rate',
    'Status'
  ];

  const rows = items.map(item => {
    const relationStr = item.relationType && item.relationName ? `${item.relationType} ${item.relationName}` : '';
    return [
      `"${String(item.id || '').replace(/"/g, '""')}"`,
      `"${formatDate(item.pledgeDate || item.date)}"`,
      `"${formatDate(item.dueDate)}"`,
      `"${item.releaseDate ? formatDate(item.releaseDate) : '—'}"`,
      `"${String(item.customerName || '').replace(/"/g, '""')}"`,
      `"${String(relationStr).replace(/"/g, '""')}"`,
      `"${item.mobile ? item.mobile : 'N/A'}"`,
      `"${String(item.address || '').replace(/"/g, '""')}"`,
      `"${String(item.metal || 'Gold').replace(/"/g, '""')}"`,
      `"${String(item.articleName || item.itemDescription || '').replace(/"/g, '""')}"`,
      `"${item.grossWt || 0}"`,
      `"${item.lessWt || 0}"`,
      `"${String(item.weight || '').replace(/"/g, '""')}"`,
      `"${item.quantity || 1}"`,
      `"${item.loanAmount || 0}"`,
      `"${String(item.loanAmountInWords || '').replace(/"/g, '""')}"`,
      `"${String(item.interestRate || '1.5%').replace(/"/g, '""')}"`,
      `"${String(item.status || 'ACTIVE').replace(/"/g, '""')}"`
    ];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  // Prepend UTF-8 BOM so Excel opens Indian names & numbers cleanly
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const todayStr = new Date().toISOString().split('T')[0];
  const sanitizedName = ledgerName.replace(/[^a-zA-Z0-9_\-]/g, '_');
  link.setAttribute('href', url);
  link.setAttribute('download', `${sanitizedName}_${todayStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

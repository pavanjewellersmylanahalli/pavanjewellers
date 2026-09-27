/**
 * Utility functions for date formatting and due date calculation
 */

/**
 * Formats any date string (YYYY-MM-DD, ISO string, etc.) into DD/MM/YYYY format strictly.
 * @param {string|Date} dateStr 
 * @returns {string} Date formatted as DD/MM/YYYY
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const str = String(dateStr).trim();
  if (!str) return '';

  // If already in DD/MM/YYYY format
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(str)) {
    return str;
  }

  // If YYYY-MM-DD format (or ISO string starting with YYYY-MM-DD)
  const ymdMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    const [_, yyyy, mm, dd] = ymdMatch;
    return `${dd}/${mm}/${yyyy}`;
  }

  try {
    const d = new Date(str);
    if (isNaN(d.getTime())) return str;
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  } catch (e) {
    return str;
  }
}

/**
 * Calculates the due date automatically as exactly 1 year and 1 month from the pledge date.
 * Returns ISO date format YYYY-MM-DD suitable for HTML <input type="date"> value.
 * @param {string} pledgeDateStr (YYYY-MM-DD)
 * @returns {string} Due date in YYYY-MM-DD format
 */
export function calculateDueDate(pledgeDateStr) {
  if (!pledgeDateStr) return '';

  let yyyy, mm, dd;
  const ymdMatch = String(pledgeDateStr).match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (ymdMatch) {
    yyyy = parseInt(ymdMatch[1], 10);
    mm = parseInt(ymdMatch[2], 10) - 1; // 0-indexed month
    dd = parseInt(ymdMatch[3], 10);
  } else {
    const d = new Date(pledgeDateStr);
    if (isNaN(d.getTime())) return '';
    yyyy = d.getFullYear();
    mm = d.getMonth();
    dd = d.getDate();
  }

  // 1 year and 1 month = 13 months
  let targetYear = yyyy + 1;
  let targetMonth = mm + 1;

  if (targetMonth > 11) {
    targetYear += Math.floor(targetMonth / 12);
    targetMonth = targetMonth % 12;
  }

  // Handle month length overflow (e.g., Jan 31 -> Feb 28/29)
  const daysInTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const targetDay = Math.min(dd, daysInTargetMonth);

  const resYyyy = targetYear;
  const resMm = String(targetMonth + 1).padStart(2, '0');
  const resDd = String(targetDay).padStart(2, '0');

  return `${resYyyy}-${resMm}-${resDd}`;
}

/**
 * Helper function to convert Indian Currency numbers to Words
 */
export function numberToWordsINR(num) {
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

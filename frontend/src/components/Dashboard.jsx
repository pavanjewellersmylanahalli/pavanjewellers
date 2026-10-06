import React, { useState, useEffect, useRef } from 'react';
import { 
  Building, Phone, MapPin, Plus, Search, Filter, ShieldCheck, 
  Coins, Scale, Award, ArrowUpRight, CheckCircle2, Clock, DollarSign, UserCheck,
  PackageCheck, BookOpen, CheckCircle, PlusCircle, AlertCircle, FileText, Trash2, Printer,
  Camera, Upload, Calendar, User, RefreshCw, Pause, Play, RotateCcw, Save, FileText as DetailsIcon, Edit3, Download
} from 'lucide-react';

import GirviReceipt from './GirviReceipt';
import GirviPassbookModal from './GirviPassbookModal';
import EditGirviModal from './EditGirviModal';
import LedgerPrintPdfModal from './LedgerPrintPdfModal';
import CustomDatePicker from './CustomDatePicker';
import { formatDate, calculateDueDate } from '../utils/dateUtils';
import { exportLedgerToCSV } from '../utils/exportUtils';

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

// Helper functions for Pledge Number Box Series Range matching (e.g. B2000 to B2800)
function parsePledgeId(str) {
  if (!str) return { prefix: '', num: null };
  const s = String(str).trim();
  const match = s.match(/^([A-Za-z\s\-_]*?)(\d+)$/);
  if (match) {
    return {
      prefix: match[1].toUpperCase(),
      num: parseInt(match[2], 10)
    };
  }
  const numOnly = parseInt(s.replace(/\D/g, ''), 10);
  return {
    prefix: '',
    num: isNaN(numOnly) ? null : numOnly
  };
}

function isPledgeIdInRange(itemId, fromStr, toStr) {
  if (!itemId) return false;
  if (!fromStr && !toStr) return true;

  const itemParsed = parsePledgeId(itemId);
  const fromParsed = fromStr ? parsePledgeId(fromStr) : null;
  const toParsed = toStr ? parsePledgeId(toStr) : null;

  if (itemParsed.num === null) {
    const itemUpper = String(itemId).toUpperCase();
    if (fromStr && itemUpper < String(fromStr).toUpperCase()) return false;
    if (toStr && itemUpper > String(toStr).toUpperCase()) return false;
    return true;
  }

  if (fromParsed && fromParsed.prefix && itemParsed.prefix && fromParsed.prefix !== itemParsed.prefix) {
    return false;
  }
  if (toParsed && toParsed.prefix && itemParsed.prefix && toParsed.prefix !== itemParsed.prefix) {
    return false;
  }

  if (fromParsed && fromParsed.num !== null) {
    if (itemParsed.num < fromParsed.num) return false;
  }
  if (toParsed && toParsed.num !== null) {
    if (itemParsed.num > toParsed.num) return false;
  }

  return true;
}

export default function Dashboard({ shop, activeTab, setActiveTab }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState('ID_ASC'); // Options: 'ID_ASC', 'ID_DESC', 'DATE_DESC', 'DATE_ASC'
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedGirviForPrint, setSelectedGirviForPrint] = useState(null);
  const [selectedGirviForPassbook, setSelectedGirviForPassbook] = useState(null);
  const [selectedGirviForEdit, setSelectedGirviForEdit] = useState(null);
  const [selectedGirvisForPdfReport, setSelectedGirvisForPdfReport] = useState(null);

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

  // Physical Vault Audit States
  const auditStorageKey = `pavan_audit_checked_${shop?.id || shop?.login_mobile || 'default'}`;
  const [checkedGirviIds, setCheckedGirviIds] = useState(() => {
    try {
      const saved = localStorage.getItem(auditStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const [auditMetalFilter, setAuditMetalFilter] = useState('Gold');
  const [auditRangeFrom, setAuditRangeFrom] = useState('');
  const [auditRangeTo, setAuditRangeTo] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem(auditStorageKey, JSON.stringify(checkedGirviIds));
    } catch (e) {
      console.error('Failed to save audit checked state:', e);
    }
  }, [checkedGirviIds, auditStorageKey]);

  const toggleCheckGirvi = (id) => {
    if (!id) return;
    const strId = String(id);
    setCheckedGirviIds(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return arr.includes(strId) ? arr.filter(item => item !== strId) : [...arr, strId];
    });
  };

  const markAllAudit = (itemsToMark) => {
    if (!Array.isArray(itemsToMark)) return;
    const idsToMark = itemsToMark.map(i => String(i.id)).filter(Boolean);
    setCheckedGirviIds(prev => {
      const arr = Array.isArray(prev) ? prev : [];
      return Array.from(new Set([...arr, ...idsToMark]));
    });
  };

  const resetAuditSession = () => {
    if (window.confirm('Reset current physical vault audit progress for all items?')) {
      setCheckedGirviIds([]);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  const syncDatabase = () => {
    if (!shop?.id) return;
    setIsSyncing(true);
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
    fetch(`${apiBaseUrl}/api/girvis/${shop.id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.girvis)) {
          setGirvis(data.girvis);
        }
      })
      .catch(err => console.error('Sync DB error:', err))
      .finally(() => setIsSyncing(false));
  };

  // Real-time background sync with Supabase / Backend database (8s live polling + visibility change)
  useEffect(() => {
    if (!shop?.id) return;
    syncDatabase();

    const interval = setInterval(() => {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      fetch(`${apiBaseUrl}/api/girvis/${shop.id}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && Array.isArray(data.girvis)) {
            setGirvis(data.girvis);
          }
        })
        .catch(() => {});
    }, 8000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        syncDatabase();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [shop?.id]);


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

  // Live Camera Capture States & Stream Handlers
  const [activeCameraTarget, setActiveCameraTarget] = useState(null); // 'CUSTOMER' | 'ITEM' | null
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);

  const startCamera = async (target) => {
    setActiveCameraTarget(target);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setCameraStream(stream);
    } catch (err) {
      console.error('Camera Access Error:', err);
      alert('Camera access error: ' + (err.message || 'Permission denied') + '. Please grant camera permission or use Gallery upload.');
      setActiveCameraTarget(null);
    }
  };

  useEffect(() => {
    if (activeCameraTarget && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [activeCameraTarget, cameraStream]);

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setActiveCameraTarget(null);
  };

  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
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

  // Form states for New Girvi Entry
  const todayStr = new Date().toISOString().split('T')[0];

  const [pledgeNumber, setPledgeNumber] = useState('');
  const [pledgeDate, setPledgeDate] = useState(todayStr);
  const [dueDate, setDueDate] = useState(() => calculateDueDate(todayStr));
  
  const handlePledgeDateChange = (val) => {
    setPledgeDate(val);
    setDueDate(calculateDueDate(val));
  };
  
  const [customerName, setCustomerName] = useState('');
  const [relationType, setRelationType] = useState('S/O');
  const [relationName, setRelationName] = useState('');
  const [mobile, setMobile] = useState('');
  const [monthlyIncome, setMonthlyIncome] = useState('');
  const [aadharNumber, setAadharNumber] = useState('');
  const [address, setAddress] = useState('');
  const [customerPhoto, setCustomerPhoto] = useState(null);
  const [isRegularCustomerFound, setIsRegularCustomerFound] = useState(false);

  // Auto-fill regular customer details when 10-digit mobile number is entered
  const handleMobileChange = (val) => {
    const cleanVal = val.replace(/\D/g, '').slice(0, 10);
    setMobile(cleanVal);

    if (cleanVal.length === 10) {
      const existing = girvis.find(g => g.mobile === cleanVal && g.customerName);
      if (existing) {
        if (existing.customerName) setCustomerName(existing.customerName);
        if (existing.relationType) setRelationType(existing.relationType);
        if (existing.relationName) setRelationName(existing.relationName);
        if (existing.address) setAddress(existing.address);
        if (existing.monthlyIncome) setMonthlyIncome(existing.monthlyIncome);
        if (existing.aadharNumber) setAadharNumber(existing.aadharNumber);
        if (existing.customerPhoto) setCustomerPhoto(existing.customerPhoto);

        setIsRegularCustomerFound(true);
      } else {
        setIsRegularCustomerFound(false);
      }
    } else {
      setIsRegularCustomerFound(false);
    }
  };

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

  const uniqueCustomers = new Set(girvis.map(i => i.mobile).filter(Boolean)).size;

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
      items = items.filter(i => i.metal === 'Gold' && i.status === 'ACTIVE');
    } else if (activeTab === 'SILVER_DASHBOARD') {
      items = items.filter(i => i.metal === 'Silver' && i.status === 'ACTIVE');
    } else if (activeTab === 'RELEASE_LEDGER') {
      items = items.filter(i => i.status === 'RELEASED');
    } else {
      items = items.filter(i => i.status === 'ACTIVE');
    }

    if (filterStatus !== 'ALL' && activeTab !== 'RELEASE_LEDGER') {
      items = items.filter(i => i.status === filterStatus);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      items = items.filter(i => i && (
        (i.customerName && String(i.customerName).toLowerCase().includes(q)) ||
        (i.id && String(i.id).toLowerCase().includes(q)) ||
        (i.mobile && String(i.mobile).includes(q)) ||
        (i.articleName && String(i.articleName).toLowerCase().includes(q))
      ));
    }

    // Sort items naturally based on sortOrder (Pledge ID Ascending / Descending or Date)
    items = [...items].sort((a, b) => {
      const idA = String(a?.id || '').trim();
      const idB = String(b?.id || '').trim();

      if (sortOrder === 'ID_ASC') {
        return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortOrder === 'ID_DESC') {
        return idB.localeCompare(idA, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortOrder === 'DATE_DESC') {
        return new Date(b.pledgeDate || b.date || 0) - new Date(a.pledgeDate || a.date || 0);
      } else if (sortOrder === 'DATE_ASC') {
        return new Date(a.pledgeDate || a.date || 0) - new Date(b.pledgeDate || b.date || 0);
      }
      return 0;
    });

    return items;
  };

  const filteredGirvis = getFilteredItems();

  const handleCreateNewGirvi = (e) => {
    e.preventDefault();
    
    if (!pledgeNumber.trim() || !customerName || !address || !articleName || !grossWt || !loanAmount) {
      alert('Please fill in all required fields marked with * (including Pledge Number)');
      return;
    }

    const newRecord = {
      id: pledgeNumber.trim(),
      pledgeDate,
      dueDate,
      customerName: customerName.trim(),
      relationType,
      relationName: relationName.trim(),
      mobile: mobile.trim(),
      monthlyIncome: monthlyIncome ? Number(monthlyIncome) : 0,
      aadharNumber: aadharNumber.trim(),
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

    // Async background sync with Supabase backend (non-blocking)
    if (shop?.id) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      fetch(`${apiBaseUrl}/api/girvis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, girvi: newRecord })
      }).catch(() => {});
    }

    // Reset Form
    setPledgeNumber('');
    setPledgeDate(todayStr);
    setDueDate(calculateDueDate(todayStr));
    setCustomerName('');
    setRelationName('');
    setMobile('');
    setMonthlyIncome('');
    setAadharNumber('');
    setAddress('');
    setCustomerPhoto(null);
    setIsRegularCustomerFound(false);
    setArticleName('');
    setGrossWt('');
    setLessWt('0');
    setQuantity('1');
    setPresentValue('');
    setLoanAmount('');
    setItemPhoto(null);
    
    // Automatically open Form 'F' Pawn Ticket receipt modal for printing
    setSelectedGirviForPrint(newRecord);
    setActiveTab('TOTAL_LEDGER');
  };


  const handleReleaseGirvi = (id) => {
    if (window.confirm(`Are you sure you want to mark Girvi ${id} as RELEASED / SETTLED?`)) {
      const targetItem = girvis.find(item => item.id === id);
      if (!targetItem) return;

      const updatedRecord = {
        ...targetItem,
        status: 'RELEASED',
        releaseDate: new Date().toISOString().split('T')[0]
      };

      setGirvis(girvis.map(item => item.id === id ? updatedRecord : item));

      // Sync status update to Supabase DB
      if (shop?.id) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
        fetch(`${apiBaseUrl}/api/girvis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId: shop.id, girvi: updatedRecord })
        }).catch(() => {});
      }
    }
  };

  const handleUndoReleaseGirvi = (id) => {
    if (window.confirm(`Undo release for Girvi No. ${id}? This will reactivate the mortgage and move it back to Active / Total Ledger.`)) {
      const targetItem = girvis.find(item => item.id === id);
      if (!targetItem) return;

      const updatedRecord = {
        ...targetItem,
        status: 'ACTIVE',
        releaseDate: null
      };

      setGirvis(girvis.map(item => item.id === id ? updatedRecord : item));

      // Sync status update to Supabase DB
      if (shop?.id) {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
        fetch(`${apiBaseUrl}/api/girvis`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ shopId: shop.id, girvi: updatedRecord })
        }).catch(() => {});
      }
    }
  };

  const handleUpdateGirvi = (updatedRecord) => {
    if (!updatedRecord || !updatedRecord.id) return;
    setGirvis(prev => prev.map(item => item.id === updatedRecord.id ? updatedRecord : item));
    setSelectedGirviForPassbook(updatedRecord);

    // Sync updated record to Supabase DB
    if (shop?.id) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      fetch(`${apiBaseUrl}/api/girvis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, girvi: updatedRecord })
      }).catch(() => {});
    }
  };

  const handleDeleteGirvi = (id) => {
    if (window.confirm(`Delete Girvi entry ${id} permanently from local ledger & Supabase database?`)) {
      setGirvis(girvis.filter(item => item.id !== id));

      // Async deletion from Supabase DB
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      fetch(`${apiBaseUrl}/api/girvis/${encodeURIComponent(id)}`, {
        method: 'DELETE'
      }).catch(err => console.error('Failed to delete from Supabase DB:', err));
    }
  };

  const handleSaveEditedGirvi = (updatedRecord) => {
    if (!updatedRecord || !updatedRecord.id) return;
    setGirvis(prev => prev.map(item => item.id === updatedRecord.id ? updatedRecord : item));
    setSelectedGirviForEdit(null);

    // Sync updated record to Supabase DB
    if (shop?.id) {
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? 'https://pavan-jewellers-backend.onrender.com' : '');
      fetch(`${apiBaseUrl}/api/girvis`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shopId: shop.id, girvi: updatedRecord })
      }).catch(() => {});
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

              {/* Regular Customer Auto-fill Banner */}
              {isRegularCustomerFound && (
                <div style={{
                  background: 'rgba(16, 185, 129, 0.15)',
                  border: '1.5px solid rgba(16, 185, 129, 0.4)',
                  borderRadius: '12px',
                  padding: '10px 14px',
                  marginBottom: '18px',
                  color: '#6ee7b7',
                  fontSize: '0.86rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <CheckCircle2 size={20} color="#34d399" />
                  <span>✨ Regular Customer Found! Details (Name, Relation, Address/Village, Income & Photo) auto-filled from previous records.</span>
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
                {/* Pledge Number */}
                <div className="input-group">
                  <label className="input-label">Pledge Number *</label>
                  <input
                    type="text"
                    className="custom-input"
                    placeholder="Enter Pledge Number"
                    value={pledgeNumber}
                    onChange={(e) => setPledgeNumber(e.target.value)}
                    required
                    style={{ paddingLeft: '16px' }}
                  />
                </div>

                {/* Mobile Number (Moved to top for instant auto-fill) */}
                <div className="input-group">
                  <div className="input-label">
                    <span>Mobile Number</span>
                    {isRegularCustomerFound && <span className="badge-success">REGULAR CUSTOMER</span>}
                  </div>
                  <input
                    type="tel"
                    className="custom-input"
                    placeholder="10-digit Mobile Number (Optional)"
                    maxLength={10}
                    value={mobile}
                    onChange={(e) => handleMobileChange(e.target.value)}
                    style={{ paddingLeft: '16px', borderColor: isRegularCustomerFound ? '#34d399' : undefined }}
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

              {/* Monthly Income */}
              <div className="input-group" style={{ marginTop: '12px' }}>
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

              {/* Aadhar Card Number (Optional) */}
              <div className="input-group" style={{ marginTop: '12px' }}>
                <label className="input-label">Aadhar Card Number (Optional)</label>
                <input
                  type="text"
                  className="custom-input"
                  placeholder="e.g. 1234 5678 9012"
                  maxLength={14}
                  value={aadharNumber}
                  onChange={(e) => setAadharNumber(e.target.value)}
                  style={{ paddingLeft: '16px' }}
                />
              </div>

              {/* Customer Photo Upload & Live Camera */}
              <div style={{ marginTop: '14px' }}>
                <label className="input-label">Customer Photo (Select from Gallery or Click Camera)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {/* Gallery File Picker */}
                  <label className="btn-outline" style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '0.84rem' }}>
                    <Upload size={16} />
                    <span>Choose from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setCustomerPhoto)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Live Camera Button */}
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => startCamera('CUSTOMER')}
                    style={{ padding: '8px 14px', fontSize: '0.84rem', minHeight: '38px' }}
                  >
                    <Camera size={16} />
                    <span>Click Photo (Camera)</span>
                  </button>

                  {customerPhoto && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={customerPhoto} 
                        alt="Customer Preview" 
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setCustomerPhoto(null)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: FINANCIALS & LOAN DETAILS */}
            <div style={{
              background: 'rgba(10, 3, 6, 0.4)',
              border: '1px solid rgba(229, 193, 88, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DollarSign size={18} /> Section 2: Financials & Loan Details
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
            </div>

            {/* SECTION 3: ARTICLE DETAILS */}
            <div style={{
              background: 'rgba(10, 3, 6, 0.4)',
              border: '1px solid rgba(229, 193, 88, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '24px'
            }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--gold-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <DetailsIcon size={18} /> Section 3: Article Details
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

              {/* Item Photo Upload & Live Camera */}
              <div style={{ marginTop: '14px' }}>
                <label className="input-label">Item Photo (Select from Gallery or Click Camera)</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px', flexWrap: 'wrap' }}>
                  {/* Gallery File Picker */}
                  <label className="btn-outline" style={{ cursor: 'pointer', padding: '8px 14px', fontSize: '0.84rem' }}>
                    <Upload size={16} />
                    <span>Choose from Gallery</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(e, setItemPhoto)}
                      style={{ display: 'none' }}
                    />
                  </label>

                  {/* Live Camera Button */}
                  <button
                    type="button"
                    className="btn-gold"
                    onClick={() => startCamera('ITEM')}
                    style={{ padding: '8px 14px', fontSize: '0.84rem', minHeight: '38px' }}
                  >
                    <Camera size={16} />
                    <span>Click Photo (Camera)</span>
                  </button>

                  {itemPhoto && (
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={itemPhoto} 
                        alt="Item Preview" 
                        style={{ width: '50px', height: '50px', borderRadius: '8px', objectFit: 'cover', border: '1.5px solid var(--gold-primary)' }} 
                      />
                      <button
                        type="button"
                        onClick={() => setItemPhoto(null)}
                        style={{
                          position: 'absolute',
                          top: '-6px',
                          right: '-6px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          cursor: 'pointer',
                          fontSize: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        title="Remove photo"
                      >
                        ✕
                      </button>
                    </div>
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

      {/* ================= OPTION 6: GIRVI STOCK CHECK (PHYSICAL VAULT AUDIT) ================= */}
      {activeTab === 'STOCK_CHECK' && (() => {
        // Filter active vault items by metal tab
        const safeGirvis = Array.isArray(activeGirvis) ? activeGirvis : [];
        let auditBaseItems = safeGirvis;
        if (auditMetalFilter === 'Gold') {
          auditBaseItems = safeGirvis.filter(i => i && i.metal === 'Gold');
        } else if (auditMetalFilter === 'Silver') {
          auditBaseItems = safeGirvis.filter(i => i && i.metal === 'Silver');
        }

        // Filter by Vault Box / Series Range (e.g., B2000 to B2800)
        if (auditRangeFrom.trim() || auditRangeTo.trim()) {
          auditBaseItems = auditBaseItems.filter(i => i && isPledgeIdInRange(i.id, auditRangeFrom, auditRangeTo));
        }

        // Apply Search filter safely
        if (auditSearch.trim()) {
          const q = auditSearch.toLowerCase();
          auditBaseItems = auditBaseItems.filter(i => i && (
            (i.id && String(i.id).toLowerCase().includes(q)) ||
            (i.customerName && String(i.customerName).toLowerCase().includes(q)) ||
            (i.mobile && String(i.mobile).includes(q)) ||
            (i.articleName && String(i.articleName).toLowerCase().includes(q))
          ));
        }

        const safeCheckedIds = Array.isArray(checkedGirviIds) ? checkedGirviIds.map(String) : [];
        const uncheckedList = auditBaseItems.filter(i => i && !safeCheckedIds.includes(String(i.id)));
        const checkedList = auditBaseItems.filter(i => i && safeCheckedIds.includes(String(i.id)));

        const totalAuditCount = auditBaseItems.length;
        const checkedCount = checkedList.length;
        const uncheckedCount = uncheckedList.length;

        const checkedWeight = checkedList.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);
        const uncheckedWeight = uncheckedList.reduce((sum, i) => sum + (parseFloat(i.weight) || 0), 0);

        const auditPercent = totalAuditCount > 0 ? Math.round((checkedCount / totalAuditCount) * 100) : 0;

        return (
          <div style={{ marginBottom: '24px' }}>
            {/* Header Banner */}
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h2 className="gold-text" style={{ fontSize: '1.75rem', fontWeight: 800 }}>
                        Girvi Vault Stock Audit
                      </h2>
                      <span className="badge-success" style={{ fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Save size={12} /> Auto-Saved
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                      Interactive Physical Locker Verification (Gold & Silver Audit)
                    </p>
                  </div>
                </div>

                {/* Metal Selection Tabs & Actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', gap: '4px', background: 'rgba(10, 3, 6, 0.6)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(229, 193, 88, 0.25)' }}>
                    <button
                      onClick={() => setAuditMetalFilter('Gold')}
                      style={{
                        background: auditMetalFilter === 'Gold' ? 'var(--gold-gradient)' : 'transparent',
                        color: auditMetalFilter === 'Gold' ? '#1a080c' : 'var(--text-muted)',
                        border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🥇 Gold Vault
                    </button>
                    <button
                      onClick={() => setAuditMetalFilter('Silver')}
                      style={{
                        background: auditMetalFilter === 'Silver' ? 'linear-gradient(135deg, #e2e8f0 0%, #94a3b8 100%)' : 'transparent',
                        color: auditMetalFilter === 'Silver' ? '#1a080c' : 'var(--text-muted)',
                        border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      🥈 Silver Vault
                    </button>
                    <button
                      onClick={() => setAuditMetalFilter('ALL')}
                      style={{
                        background: auditMetalFilter === 'ALL' ? 'rgba(255,255,255,0.2)' : 'transparent',
                        color: auditMetalFilter === 'ALL' ? '#ffffff' : 'var(--text-muted)',
                        border: 'none', borderRadius: '8px', padding: '6px 14px', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer'
                      }}
                    >
                      📦 All Vault Items
                    </button>
                  </div>

                  <button
                    className="btn-gold"
                    onClick={() => setActiveTab('NEW_GIRVI')}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px' }}
                    title="Pause audit progress & open New Girvi entry form"
                  >
                    <Pause size={14} />
                    <span>Pause & New Girvi</span>
                  </button>

                  <button
                    className="btn-outline"
                    onClick={() => markAllAudit(uncheckedList)}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                    title="Mark all pending items as checked"
                  >
                    <CheckCircle2 size={16} />
                    <span>Check All</span>
                  </button>

                  <button
                    className="btn-outline"
                    onClick={resetAuditSession}
                    style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '36px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                    title="Reset audit checklist and restart stock audit"
                  >
                    <RotateCcw size={14} />
                    <span>Restart Audit</span>
                  </button>
                </div>
              </div>

              {/* Pause & Resume Info Card */}
              <div style={{
                marginTop: '16px',
                padding: '10px 14px',
                borderRadius: '10px',
                background: 'rgba(229, 193, 88, 0.08)',
                border: '1px solid rgba(229, 193, 88, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '10px',
                fontSize: '0.82rem',
                color: 'var(--gold-light)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Save size={16} color="var(--gold-primary)" />
                  <span>
                    <strong>Auto-Pause Active:</strong> Your verified checkmarks are saved instantly. If a customer comes, click <strong>"Pause & New Girvi"</strong> or any sidebar tab. When you return, your audit will resume right where you left off!
                  </span>
                </div>
                {checkedCount > 0 && (
                  <button
                    onClick={resetAuditSession}
                    style={{
                      background: 'rgba(239, 68, 68, 0.2)',
                      color: '#fca5a5',
                      border: '1px solid rgba(239, 68, 68, 0.4)',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer'
                    }}
                  >
                    Clear & Start Fresh
                  </button>
                )}
              </div>

              {/* Audit Progress Bar */}
              <div style={{ marginTop: '16px', background: 'rgba(10, 3, 6, 0.5)', padding: '14px 18px', borderRadius: '14px', border: '1px solid rgba(229, 193, 88, 0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '0.88rem', fontWeight: 700, flexWrap: 'wrap', gap: '8px' }}>
                  <span style={{ color: 'var(--gold-light)' }}>
                    Physical Audit Progress: <strong style={{ color: '#34d399' }}>{checkedCount} / {totalAuditCount}</strong> items verified ({auditPercent}%)
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Verified Weight: <strong style={{ color: 'var(--gold-primary)' }}>{checkedWeight.toFixed(2)}g</strong> | Remaining: <strong style={{ color: '#fca5a5' }}>{uncheckedWeight.toFixed(2)}g</strong>
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${auditPercent}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, #10b981 0%, #34d399 50%, #e5c158 100%)',
                    transition: 'width 0.4s ease'
                  }} />
                </div>
              </div>

              {/* Vault Box Series Range Audit Filter */}
              <div style={{
                background: 'rgba(10, 3, 6, 0.6)',
                border: '1.5px solid rgba(229, 193, 88, 0.35)',
                borderRadius: '16px',
                padding: '16px 20px',
                marginTop: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '14px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '10px',
                    background: 'rgba(229, 193, 88, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--gold-primary)'
                  }}>
                    <Filter size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--gold-light)' }}>
                      📦 Vault Box / Series Range Audit Filter
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Filter vault items by Box series range (e.g. From <strong>B2000</strong> To <strong>B2800</strong>) to audit box by box
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>From:</span>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. B2000"
                      value={auditRangeFrom}
                      onChange={(e) => setAuditRangeFrom(e.target.value.toUpperCase())}
                      style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem', minHeight: '36px', textAlign: 'center', fontWeight: 700, background: '#120407' }}
                    />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>To:</span>
                    <input
                      type="text"
                      className="custom-input"
                      placeholder="e.g. B2800"
                      value={auditRangeTo}
                      onChange={(e) => setAuditRangeTo(e.target.value.toUpperCase())}
                      style={{ width: '110px', padding: '6px 10px', fontSize: '0.85rem', minHeight: '36px', textAlign: 'center', fontWeight: 700, background: '#120407' }}
                    />
                  </div>

                  {(auditRangeFrom || auditRangeTo) && (
                    <button
                      type="button"
                      onClick={() => { setAuditRangeFrom(''); setAuditRangeTo(''); }}
                      className="btn-outline"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                      title="Clear box series range filter"
                    >
                      ✕ Clear Range
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Search Control */}
            <div className="glass-card" style={{ padding: '14px 20px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Search size={18} color="var(--gold-primary)" />
                <input
                  type="text"
                  className="custom-input"
                  placeholder="Type or Scan Pledge Number (e.g. 1234), Customer Name, or Phone to filter..."
                  value={auditSearch}
                  onChange={(e) => setAuditSearch(e.target.value)}
                  style={{ border: 'none', background: 'transparent', padding: 0, fontSize: '0.95rem', minHeight: 'auto' }}
                />
                {auditSearch && (
                  <button onClick={() => setAuditSearch('')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
                )}
              </div>
            </div>

            {/* TWO AUDIT TABLES (UNCHECKED vs CHECKED) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>

              {/* TABLE 1: UNCHECKED / PENDING AUDIT ITEMS */}
              <div className="glass-card" style={{ padding: '20px', border: '1.5px solid rgba(239, 68, 68, 0.35)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(239, 68, 68, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', boxShadow: '0 0 8px #ef4444' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fca5a5' }}>
                      Unchecked / Pending ({uncheckedCount})
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {uncheckedWeight.toFixed(2)}g remaining
                  </span>
                </div>

                {uncheckedList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {uncheckedList.map((item) => (
                      <div key={item.id} style={{
                        background: 'rgba(10, 3, 6, 0.6)',
                        border: '1px solid rgba(239, 68, 68, 0.25)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={false}
                            onChange={() => toggleCheckGirvi(item.id)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gold-light)' }}>No. {item.id}</span>
                              <span className="badge-gold" style={{ fontSize: '0.65rem' }}>{item.metal}</span>
                            </div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                              {item.customerName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {item.articleName} ({item.weight})
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn-gold"
                          onClick={() => toggleCheckGirvi(item.id)}
                          style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '34px' }}
                        >
                          <CheckCircle size={14} />
                          <span>Verify</span>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                    <CheckCircle2 size={36} color="#34d399" style={{ opacity: 0.8, marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.95rem', color: '#6ee7b7', fontWeight: 700 }}>All Vault Items Verified!</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>Zero pending items remaining in unchecked table.</div>
                  </div>
                )}
              </div>

              {/* TABLE 2: CHECKED / VERIFIED AUDIT ITEMS */}
              <div className="glass-card" style={{ padding: '20px', border: '1.5px solid rgba(16, 185, 129, 0.4)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '10px', borderBottom: '1px solid rgba(16, 185, 129, 0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6ee7b7' }}>
                      Checked / Verified ({checkedCount})
                    </h3>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 700 }}>
                    {checkedWeight.toFixed(2)}g verified
                  </span>
                </div>

                {checkedList.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {checkedList.map((item) => (
                      <div key={item.id} style={{
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '12px',
                        padding: '12px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                        transition: 'all 0.2s ease'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={true}
                            onChange={() => toggleCheckGirvi(item.id)}
                            style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#10b981' }}
                          />
                          <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--gold-light)' }}>No. {item.id}</span>
                              <span className="badge-success" style={{ fontSize: '0.65rem' }}>VERIFIED</span>
                            </div>
                            <div style={{ fontSize: '0.86rem', fontWeight: 700, color: '#ffffff', marginTop: '2px' }}>
                              {item.customerName}
                            </div>
                            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                              {item.articleName} ({item.weight})
                            </div>
                          </div>
                        </div>

                        <button
                          className="btn-outline"
                          onClick={() => toggleCheckGirvi(item.id)}
                          style={{ padding: '6px 10px', fontSize: '0.75rem', minHeight: '34px', color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.4)' }}
                          title="Uncheck and return to pending list"
                        >
                          Undo
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
                    <AlertCircle size={36} style={{ opacity: 0.3, marginBottom: '8px' }} />
                    <div style={{ fontSize: '0.9rem', color: '#ffffff' }}>No Checked Items Yet</div>
                    <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>Select gold/silver vault and check items from the left table to verify locker stock.</div>
                  </div>
                )}
              </div>

            </div>
          </div>
        );
      })()}

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
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Vault Weight</span>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'rgba(229, 193, 88, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-primary)' }}>
                <Coins size={20} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-light)' }}>
              {(totalGoldWeight + totalSilverWeight).toFixed(2)} <span style={{ fontSize: '0.9rem', color: '#ffffff', fontWeight: 500 }}>g</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Gold: {totalGoldWeight.toFixed(2)} g | Silver: {totalSilverWeight.toFixed(2)} g
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
      {activeTab !== 'NEW_GIRVI' && activeTab !== 'STOCK_CHECK' && (
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

              {/* Sync DB Button */}
              <button
                className="btn-outline"
                onClick={syncDatabase}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '38px', color: 'var(--gold-primary)', borderColor: 'rgba(229, 193, 88, 0.35)' }}
                title="Sync latest live records from database"
              >
                <RefreshCw size={14} className={isSyncing ? 'spin' : ''} />
                <span>{isSyncing ? 'Syncing...' : 'Sync DB'}</span>
              </button>

              {/* Export Excel / CSV Button */}
              <button
                className="btn-gold"
                onClick={() => {
                  const titleName = activeTab === 'GOLD_DASHBOARD' ? 'Gold_Mortgage_Ledger' :
                                   activeTab === 'SILVER_DASHBOARD' ? 'Silver_Mortgage_Ledger' :
                                   activeTab === 'RELEASE_LEDGER' ? 'Released_Girvi_Loan_Ledger' :
                                   'Master_Girvi_Ledger';
                  exportLedgerToCSV(filteredGirvis, `${shop?.shop_name || 'Pavan_Jewellers'}_${titleName}`);
                }}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '38px' }}
                title="Download structured Excel / CSV spreadsheet"
              >
                <Download size={14} />
                <span>Excel / CSV</span>
              </button>

              {/* PDF / Printable Report Button */}
              <button
                className="btn-outline"
                onClick={() => {
                  const titleName = activeTab === 'GOLD_DASHBOARD' ? 'Gold Mortgage Ledger Report' :
                                   activeTab === 'SILVER_DASHBOARD' ? 'Silver Mortgage Ledger Report' :
                                   activeTab === 'RELEASE_LEDGER' ? 'Released Girvi Settlement Ledger Report' :
                                   'Master Girvi Mortgage Ledger Report';
                  setSelectedGirvisForPdfReport({ items: filteredGirvis, title: titleName });
                }}
                style={{ padding: '6px 12px', fontSize: '0.8rem', minHeight: '38px', color: '#c084fc', borderColor: 'rgba(168, 85, 247, 0.4)' }}
                title="View and Print / Save PDF Ledger Report"
              >
                <Printer size={14} />
                <span>PDF Report</span>
              </button>

              {/* Pledge ID Ascending / Descending Sort Filter */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(10, 3, 6, 0.5)', padding: '4px', borderRadius: '10px', border: '1px solid rgba(229, 193, 88, 0.2)' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--gold-light)', fontWeight: 700, paddingLeft: '6px', paddingRight: '2px' }}>Pledge ID:</span>
                <button
                  type="button"
                  onClick={() => setSortOrder('ID_ASC')}
                  style={{
                    background: sortOrder === 'ID_ASC' ? 'var(--gold-gradient)' : 'transparent',
                    color: sortOrder === 'ID_ASC' ? '#1a080c' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Sort by Pledge ID in Ascending order (Lowest → Highest)"
                >
                  Ascending (ASC ↑)
                </button>
                <button
                  type="button"
                  onClick={() => setSortOrder('ID_DESC')}
                  style={{
                    background: sortOrder === 'ID_DESC' ? 'var(--gold-gradient)' : 'transparent',
                    color: sortOrder === 'ID_DESC' ? '#1a080c' : 'var(--text-muted)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '6px 10px',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px'
                  }}
                  title="Sort by Pledge ID in Descending order (Highest → Lowest)"
                >
                  Descending (DESC ↓)
                </button>
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

          {/* Table (Desktop View) & Cards (Mobile View) */}
          {filteredGirvis.length > 0 ? (
            <>
              {/* Desktop Table View */}
              <div className="ledger-desktop-view" style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.88rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(229, 193, 88, 0.2)', color: 'var(--gold-primary)', height: '40px' }}>
                      <th 
                        onClick={() => setSortOrder(prev => prev === 'ID_ASC' ? 'ID_DESC' : 'ID_ASC')}
                        style={{ padding: '12px 14px', cursor: 'pointer', userSelect: 'none' }}
                        title="Click to toggle Pledge ID Ascending / Descending order"
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>Pledge ID</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--gold-primary)', fontWeight: 800 }}>
                            {sortOrder === 'ID_ASC' ? '▲ (ASC)' : sortOrder === 'ID_DESC' ? '▼ (DESC)' : '↕'}
                          </span>
                        </div>
                      </th>
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
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(g.pledgeDate || g.date)}</div>
                        </td>
                        <td style={{ padding: '14px' }}>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>
                            {g.customerName} {g.relationType && g.relationName ? `(${g.relationType} ${g.relationName})` : ''}
                          </div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{g.mobile ? `+91 ${g.mobile}` : 'No Mobile'}</div>
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
                            <button
                              className="btn-gold"
                              style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px' }}
                              onClick={() => setSelectedGirviForPassbook(g)}
                              title="Open Pledge Transaction Passbook"
                            >
                              <BookOpen size={13} />
                              <span>Book</span>
                            </button>
                            {g.status === 'ACTIVE' ? (
                              <button
                                className="btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                                onClick={() => handleReleaseGirvi(g.id)}
                                title="Release / Settle Loan"
                              >
                                Release
                              </button>
                            ) : (
                              <button
                                className="btn-outline"
                                style={{ padding: '4px 10px', fontSize: '0.75rem', minHeight: '32px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                                onClick={() => handleUndoReleaseGirvi(g.id)}
                                title="Undo Release & Move Back to Active Ledger"
                              >
                                <RotateCcw size={13} />
                                <span>Undo Release</span>
                              </button>
                            )}
                            <button
                              className="btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                              onClick={() => setSelectedGirviForEdit(g)}
                              title="Edit Girvi Bill Entry"
                            >
                              <Edit3 size={13} />
                              <span>Edit</span>
                            </button>
                            <button
                              className="btn-outline"
                              style={{ padding: '4px 8px', fontSize: '0.75rem', minHeight: '32px' }}
                              onClick={() => setSelectedGirviForPrint(g)}
                              title="Print Pawn Ticket (Form 'F')"
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

              {/* Mobile Card List View (Visible < 768px - No Horizontal Scrolling) */}
              <div className="ledger-mobile-view">
                {filteredGirvis.map((g) => (
                  <div key={g.id} className="glass-card" style={{ padding: '16px', marginBottom: '14px', background: 'rgba(15, 5, 8, 0.92)', border: '1.5px solid rgba(229, 193, 88, 0.3)', borderRadius: '16px' }}>
                    {/* Top Row: Pledge ID & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', paddingBottom: '8px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div>
                        <span style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--gold-light)' }}>No. {g.id}</span>
                        <span style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginLeft: '10px' }}>{formatDate(g.pledgeDate || g.date)}</span>
                      </div>
                      {g.status === 'ACTIVE' ? (
                        <span className="badge-gold">ACTIVE</span>
                      ) : (
                        <span className="badge-success">RELEASED</span>
                      )}
                    </div>

                    {/* Customer Info */}
                    <div style={{ marginBottom: '10px' }}>
                      <div style={{ fontSize: '0.98rem', fontWeight: 700, color: '#ffffff' }}>
                        {g.customerName} {g.relationType && g.relationName ? `(${g.relationType} ${g.relationName})` : ''}
                      </div>
                      <div style={{ fontSize: '0.82rem', color: 'var(--text-gold)', marginTop: '2px' }}>
                        📞 {g.mobile ? `+91 ${g.mobile}` : 'No Mobile'}
                      </div>
                    </div>

                    {/* Article & Net Weight Box */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(229, 193, 88, 0.08)', padding: '10px 14px', borderRadius: '10px', marginBottom: '12px', border: '1px solid rgba(229, 193, 88, 0.15)' }}>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>{g.articleName || g.itemDescription}</div>
                        <span className="badge-gold" style={{ fontSize: '0.66rem', marginTop: '3px', display: 'inline-block' }}>{g.metal} ({g.quantity || 1} Pcs)</span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Weight</div>
                        <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--gold-primary)' }}>{g.weight}</div>
                      </div>
                    </div>

                    {/* Footer: Loan Amount & Touch Actions */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Loan Sanctioned</div>
                        <div style={{ fontSize: '1.28rem', fontWeight: 900, color: '#34d399' }}>₹{Number(g.loanAmount).toLocaleString('en-IN')}</div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          className="btn-gold"
                          style={{ padding: '6px 12px', fontSize: '0.78rem', minHeight: '36px' }}
                          onClick={() => setSelectedGirviForPassbook(g)}
                          title="Pledge Passbook Ledger"
                        >
                          <BookOpen size={14} />
                          <span>Book</span>
                        </button>
                        {g.status === 'ACTIVE' ? (
                          <button
                            className="btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                            onClick={() => handleReleaseGirvi(g.id)}
                          >
                            Release
                          </button>
                        ) : (
                          <button
                            className="btn-outline"
                            style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.4)' }}
                            onClick={() => handleUndoReleaseGirvi(g.id)}
                            title="Undo release and return to active ledger"
                          >
                            <RotateCcw size={14} />
                            <span>Undo Release</span>
                          </button>
                        )}
                        <button
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.4)' }}
                          onClick={() => setSelectedGirviForEdit(g)}
                          title="Edit Bill Entry"
                        >
                          <Edit3 size={14} />
                          <span>Edit</span>
                        </button>
                        <button
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px' }}
                          onClick={() => setSelectedGirviForPrint(g)}
                          title="Print Receipt"
                        >
                          <Printer size={14} />
                        </button>
                        <button
                          className="btn-outline"
                          style={{ padding: '6px 10px', fontSize: '0.78rem', minHeight: '36px', color: '#fca5a5' }}
                          onClick={() => handleDeleteGirvi(g.id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
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

      {/* Interactive Girvi Passbook / Transaction History Ledger Modal */}
      {selectedGirviForPassbook && (
        <GirviPassbookModal
          girvi={selectedGirviForPassbook}
          onClose={() => setSelectedGirviForPassbook(null)}
          onUpdateGirvi={handleUpdateGirvi}
        />
      )}

      {/* Official Form 'F' Pawn Ticket Print Modal */}
      {selectedGirviForPrint && (
        <GirviReceipt
          girvi={selectedGirviForPrint}
          shop={shop}
          onClose={() => setSelectedGirviForPrint(null)}
        />
      )}

      {/* Edit Girvi Bill Entry Modal */}
      {selectedGirviForEdit && (
        <EditGirviModal
          girvi={selectedGirviForEdit}
          onClose={() => setSelectedGirviForEdit(null)}
          onSave={handleSaveEditedGirvi}
        />
      )}

      {/* PDF / Printable Ledger Report Modal */}
      {selectedGirvisForPdfReport && (
        <LedgerPrintPdfModal
          items={selectedGirvisForPdfReport.items}
          shop={shop}
          title={selectedGirvisForPdfReport.title}
          onClose={() => setSelectedGirvisForPdfReport(null)}
        />
      )}

      {/* Live Camera Stream Capture Overlay Modal */}
      {activeCameraTarget && (
        <div className="receipt-modal-backdrop" style={{ zIndex: 1000 }}>
          <div className="glass-card" style={{ maxWidth: '560px', width: '100%', padding: '24px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--gold-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} color="var(--gold-primary)" />
                <span>Capture {activeCameraTarget === 'CUSTOMER' ? 'Customer' : 'Item'} Photo</span>
              </h3>
              <button onClick={stopCamera} className="btn-outline" style={{ padding: '4px 8px', color: '#fca5a5' }}>
                <Trash2 size={16} />
              </button>
            </div>

            <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--card-border)' }}>
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-gold"
                onClick={capturePhotoFromCamera}
                style={{ padding: '12px 24px', fontSize: '1rem', flex: 1 }}
              >
                <Camera size={20} />
                <span>Snap & Save Photo</span>
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={stopCamera}
                style={{ padding: '12px 20px', fontSize: '0.9rem' }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

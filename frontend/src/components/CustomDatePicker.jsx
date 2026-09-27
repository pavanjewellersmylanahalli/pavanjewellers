import React, { useRef } from 'react';
import { Calendar } from 'lucide-react';
import { formatDate, toIsoDate } from '../utils/dateUtils';

/**
 * Custom Date Picker Input component that strictly displays dates as DD/MM/YYYY
 * across all browsers, mobile devices, and OS locales!
 */
export default function CustomDatePicker({ value, onChange, label, required, placeholder = 'DD/MM/YYYY', style = {} }) {
  const hiddenNativeInputRef = useRef(null);

  // Display value strictly formatted as DD/MM/YYYY
  const displayValue = formatDate(value);
  const isoValue = toIsoDate(value);

  // When user picks a date from calendar popup
  const handleNativeChange = (e) => {
    const newIso = e.target.value; // YYYY-MM-DD
    if (newIso) {
      onChange(newIso);
    }
  };

  // When user types into the text field (DD/MM/YYYY)
  const handleTextChange = (e) => {
    let val = e.target.value;
    // Allow digits and slashes
    const cleanDigits = val.replace(/\D/g, '').slice(0, 8);
    let formatted = val;

    if (cleanDigits.length <= 2) {
      formatted = cleanDigits;
    } else if (cleanDigits.length <= 4) {
      formatted = `${cleanDigits.slice(0, 2)}/${cleanDigits.slice(2)}`;
    } else {
      formatted = `${cleanDigits.slice(0, 2)}/${cleanDigits.slice(2, 4)}/${cleanDigits.slice(4)}`;
    }

    if (cleanDigits.length === 8) {
      const dd = cleanDigits.slice(0, 2);
      const mm = cleanDigits.slice(2, 4);
      const yyyy = cleanDigits.slice(4, 8);
      const isoStr = `${yyyy}-${mm}-${dd}`;
      onChange(isoStr);
    } else {
      onChange(formatted);
    }
  };

  const openCalendar = () => {
    if (hiddenNativeInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          hiddenNativeInputRef.current.showPicker();
        } catch (err) {
          hiddenNativeInputRef.current.focus();
          hiddenNativeInputRef.current.click();
        }
      } else {
        hiddenNativeInputRef.current.focus();
        hiddenNativeInputRef.current.click();
      }
    }
  };

  return (
    <div className="input-group" style={{ width: '100%', margin: 0 }}>
      {label && <label className="input-label">{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <input
          type="text"
          className="custom-input"
          placeholder={placeholder}
          value={displayValue}
          onChange={handleTextChange}
          required={required}
          maxLength={10}
          style={{ paddingLeft: '14px', paddingRight: '40px', background: '#120407', ...style }}
        />
        <button
          type="button"
          onClick={openCalendar}
          style={{
            position: 'absolute',
            right: '8px',
            background: 'transparent',
            border: 'none',
            color: 'var(--gold-primary)',
            cursor: 'pointer',
            padding: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2
          }}
          title="Open Calendar Date Picker"
        >
          <Calendar size={18} />
        </button>
        {/* Hidden native input used strictly to invoke OS calendar picker */}
        <input
          ref={hiddenNativeInputRef}
          type="date"
          value={isoValue}
          onChange={handleNativeChange}
          tabIndex={-1}
          aria-hidden="true"
          style={{
            position: 'absolute',
            opacity: 0,
            width: '1px',
            height: '1px',
            pointerEvents: 'none',
            bottom: 0,
            right: 0
          }}
        />
      </div>
    </div>
  );
}

import { useRef } from 'react';
import { useStore } from '../store/useStore';
import { formatUSDPrice, formatTimestamp } from '../utils/formatters';
import { exportToJSON, importFromFile } from '../utils/exportImport';

export function Header() {
  const bitcoinPrice = useStore((s) => s.bitcoinPrice);
  const lastBTCUpdate = useStore((s) => s.lastBTCUpdate);
  const btcApiStatus = useStore((s) => s.btcApiStatus);
  const stockApiStatus = useStore((s) => s.stockApiStatus);
  const companies = useStore((s) => s.companies);
  const importData = useStore((s) => s.importData);
  const resetToDefaults = useStore((s) => s.resetToDefaults);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    exportToJSON(companies);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const data = await importFromFile(file);
    if (data) {
      importData(data);
      alert('Data imported successfully!');
    } else {
      alert('Invalid file format. Please select a valid JSON export.');
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all data to defaults? This cannot be undone.')) {
      resetToDefaults();
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#22c55e';
      case 'loading': return '#eab308';
      case 'error': return '#ef4444';
      default: return '#9ca3af';
    }
  };

  return (
    <header className="header">
      <div className="header-left">
        <h1>DAT mNAV Dashboard</h1>
        <p className="subtitle">Digital Asset Treasury Companies</p>
      </div>
      
      <div className="header-center">
        <div className="price-display">
          <span className="price-label">Bitcoin Price</span>
          <span className="price-value">{formatUSDPrice(bitcoinPrice)}</span>
          <span className="price-updated">Updated: {formatTimestamp(lastBTCUpdate)}</span>
        </div>
        
        <div className="status-indicators">
          <div className="status-item">
            <span 
              className="status-dot" 
              style={{ backgroundColor: getStatusColor(btcApiStatus) }}
            />
            <span>BTC</span>
          </div>
          <div className="status-item">
            <span 
              className="status-dot" 
              style={{ backgroundColor: getStatusColor(stockApiStatus) }}
            />
            <span>Stocks</span>
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <button onClick={handleExport} className="btn btn-secondary">
          Export JSON
        </button>
        <button onClick={handleImportClick} className="btn btn-secondary">
          Import JSON
        </button>
        <button onClick={handleReset} className="btn btn-danger">
          Reset
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>
    </header>
  );
}

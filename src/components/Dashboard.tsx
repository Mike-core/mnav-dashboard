import { useMemo, useCallback } from 'react';
import { useStore, getEffectiveStockPrice } from '../store/useStore';
import { calculateAll } from '../utils/calculations';
import { formatUSD, formatUSDPrice, formatRatio, formatBTC, formatShares } from '../utils/formatters';
import { EditableCell } from './EditableCell';
import { CompanyWithCalculations, SortDirection } from '../types';

// mNAV color thresholds
function getMNavColor(mnav: number | null): string {
  if (mnav === null) return '';
  if (mnav < 1.0) return 'mnav-green';
  if (mnav <= 1.5) return 'mnav-yellow';
  return 'mnav-red';
}

// Column definitions
const columns = [
  { key: 'name', label: 'Name', frozen: true },
  { key: 'ticker', label: 'Ticker', frozen: true },
  { key: 'mNAV', label: 'mNAV', type: 'mnav' },
  { key: 'marketCapToAssets', label: 'Mkt Cap/Assets', type: 'ratio' },
  { key: 'equilibriumBTCPrice', label: 'Equilibrium BTC', type: 'usd' },
  { key: 'stockPrice', label: 'Stock Price', type: 'price' },
  { key: 'fairStockPrice', label: 'Fair Stock Price', type: 'ratio' },
  { key: 'fairBTCStockPrice', label: 'Fair BTC Stock', type: 'ratio' },
  { key: 'marketCap', label: 'Market Cap', type: 'usd-compact' },
  { key: 'enterpriseValue', label: 'Enterprise Value', type: 'usd-compact' },
  { key: 'assets', label: 'Assets', type: 'usd-compact' },
  { key: 'bitcoinAssets', label: 'Bitcoin Assets', type: 'usd-compact' },
  { key: 'cash', label: 'Cash', type: 'editable-usd' },
  { key: 'otherAssets', label: 'Other Assets', type: 'editable-usd' },
  { key: 'bitcoin', label: 'Bitcoin (BTC)', type: 'editable-btc' },
  { key: 'debt', label: 'Debt', type: 'usd-compact' },
  { key: 'longTermDebt', label: 'Long Term Debt', type: 'editable-usd' },
  { key: 'otherDebt', label: 'Other Debt', type: 'editable-usd' },
  { key: 'preferredStock', label: 'Preferred Stock', type: 'editable-usd' },
  { key: 'commonSharesOutstanding', label: 'Shares Outstanding', type: 'editable-shares' },
] as const;

export function Dashboard() {
  const companies = useStore((s) => s.companies);
  const bitcoinPrice = useStore((s) => s.bitcoinPrice);
  const stockPrices = useStore((s) => s.stockPrices);
  const manualStockPrices = useStore((s) => s.manualStockPrices);
  const sortConfig = useStore((s) => s.sortConfig);
  const updateCompany = useStore((s) => s.updateCompany);
  const setManualStockPrice = useStore((s) => s.setManualStockPrice);
  const setSortConfig = useStore((s) => s.setSortConfig);

  // Calculate all derived values
  const companiesWithCalcs: CompanyWithCalculations[] = useMemo(() => {
    return companies.map((company) => {
      const stockPrice = getEffectiveStockPrice(
        company.ticker,
        stockPrices,
        manualStockPrices
      );

      const calculations = calculateAll({
        ...company,
        stockPrice,
        bitcoinPrice,
      });

      return {
        ...company,
        stockPrice,
        ...calculations,
      };
    });
  }, [companies, bitcoinPrice, stockPrices, manualStockPrices]);

  // Sort companies
  const sortedCompanies = useMemo(() => {
    if (!sortConfig.key || !sortConfig.direction) {
      return companiesWithCalcs;
    }

    return [...companiesWithCalcs].sort((a, b) => {
      const aVal = a[sortConfig.key as keyof CompanyWithCalculations];
      const bVal = b[sortConfig.key as keyof CompanyWithCalculations];

      // Handle nulls - push to end
      if (aVal === null && bVal === null) return 0;
      if (aVal === null) return 1;
      if (bVal === null) return -1;

      // String comparison for name/ticker
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortConfig.direction === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      // Numeric comparison
      const numA = Number(aVal);
      const numB = Number(bVal);
      return sortConfig.direction === 'asc' ? numA - numB : numB - numA;
    });
  }, [companiesWithCalcs, sortConfig]);

  // Handle column header click for sorting
  const handleSort = useCallback(
    (key: string) => {
      let direction: SortDirection = 'asc';
      if (sortConfig.key === key) {
        if (sortConfig.direction === 'asc') direction = 'desc';
        else if (sortConfig.direction === 'desc') direction = null;
      }
      setSortConfig({ key, direction });
    },
    [sortConfig, setSortConfig]
  );

  // Get sort indicator
  const getSortIndicator = (key: string) => {
    if (sortConfig.key !== key) return '';
    if (sortConfig.direction === 'asc') return ' ▲';
    if (sortConfig.direction === 'desc') return ' ▼';
    return '';
  };

  // Render cell based on type
  const renderCell = (
    company: CompanyWithCalculations,
    columnKey: string,
    columnType?: string
  ) => {
    const value = company[columnKey as keyof CompanyWithCalculations];

    switch (columnType) {
      case 'mnav':
        return (
          <span className={getMNavColor(value as number | null)}>
            {formatRatio(value as number | null)}
          </span>
        );

      case 'ratio':
        return formatRatio(value as number | null);

      case 'usd':
        return formatUSDPrice(value as number | null);

      case 'usd-compact':
        return formatUSD(value as number | null, true);

      case 'price': {
        const isManual = manualStockPrices[company.ticker] !== undefined && 
                         manualStockPrices[company.ticker] !== null;
        const apiPrice = stockPrices[company.ticker];
        
        return (
          <div className="price-cell">
            <EditableCell
              value={value as number | null}
              onChange={(newVal) => setManualStockPrice(company.ticker, newVal)}
              placeholder={apiPrice !== null ? formatUSDPrice(apiPrice) : '—'}
            />
            {isManual && <span className="manual-badge">M</span>}
          </div>
        );
      }

      case 'editable-usd':
        return (
          <EditableCell
            value={value as number | null}
            onChange={(newVal) =>
              updateCompany(company.id, columnKey as keyof typeof company, newVal)
            }
          />
        );

      case 'editable-btc':
        return (
          <EditableCell
            value={value as number | null}
            onChange={(newVal) =>
              updateCompany(company.id, columnKey as keyof typeof company, newVal)
            }
          />
        );

      case 'editable-shares':
        return (
          <EditableCell
            value={value as number | null}
            onChange={(newVal) =>
              updateCompany(company.id, columnKey as keyof typeof company, newVal)
            }
          />
        );

      default:
        // Text fields (name, ticker)
        if (columnKey === 'name' || columnKey === 'ticker') {
          return (
            <input
              type="text"
              value={value as string}
              onChange={(e) =>
                updateCompany(
                  company.id,
                  columnKey as keyof typeof company,
                  e.target.value
                )
              }
              className="text-cell"
            />
          );
        }
        return String(value ?? '—');
    }
  };

  return (
    <div className="dashboard">
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className={`${col.frozen ? 'frozen' : ''} ${
                    index === 0 ? 'frozen-first' : ''
                  } ${index === 1 ? 'frozen-second' : ''}`}
                >
                  {col.label}
                  {getSortIndicator(col.key)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedCompanies.map((company) => (
              <tr key={company.id}>
                {columns.map((col, index) => (
                  <td
                    key={col.key}
                    className={`${col.frozen ? 'frozen' : ''} ${
                      index === 0 ? 'frozen-first' : ''
                    } ${index === 1 ? 'frozen-second' : ''}`}
                  >
                    {renderCell(company, col.key, col.type)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="legend">
        <span className="legend-title">mNAV Legend:</span>
        <span className="legend-item">
          <span className="legend-dot mnav-green-bg"></span>
          &lt; 1.0 (Discount)
        </span>
        <span className="legend-item">
          <span className="legend-dot mnav-yellow-bg"></span>
          1.0 - 1.5 (Slight Premium)
        </span>
        <span className="legend-item">
          <span className="legend-dot mnav-red-bg"></span>
          &gt; 1.5 (Premium)
        </span>
        <span className="legend-item manual-legend">
          <span className="manual-badge">M</span>
          Manual Override
        </span>
      </div>
    </div>
  );
}

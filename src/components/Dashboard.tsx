import { useMemo, useCallback } from 'react';
import { useStore, getEffectiveStockPrice } from '../store/useStore';
import { calculateAll } from '../utils/calculations';
import { formatUSD, formatUSDPrice, formatRatio } from '../utils/formatters';
import { EditableCell } from './EditableCell';
import { Company, CompanyWithCalculations, SortDirection } from '../types';


// mNAV color thresholds
function getMNavColor(mnav: number | null): string {
  if (mnav === null) return '';
  if (mnav < 1.0) return 'mnav-green';
  if (mnav <= 1.5) return 'mnav-yellow';
  return 'mnav-red';
}


// Column definition type
type ColumnDef = {
  key: string;
  label: string;
  frozen?: boolean;
  type?: string;
};


// Column definitions
const columns: ColumnDef[] = [
  { key: 'name', label: 'Name', frozen: true },
  { key: 'ticker', label: 'Ticker', frozen: true },
  { key: 'mNAV', label: 'mNAV', type: 'mnav' },
  { key: 'marketCapToAssets', label: 'Mkt Cap/Assets', type: 'ratio' },
  { key: 'equilibriumBTCPrice', label: 'Equilibrium BTC', type: 'usd' },
  { key: 'stockPrice', label: 'Stock Price', type: 'price' },
  { key: 'fairStockPrice', label: 'Fair Stock Price', type: 'ratio' },
  { key: 'marketCap', label: 'Market Cap', type: 'usd-compact' },
  { key: 'enterpriseValue', label: 'Enterprise Value', type: 'usd-compact' },
  { key: 'assets', label: 'Assets', type: 'usd-compact' },
  { key: 'cash', label: 'Cash', type: 'editable-usd' },
  
  { key: 'bitcoin', label: 'Bitcoin (BTC)', type: 'editable-btc' },
  { key: 'debt', label: 'Debt', type: 'usd-compact' },
  { key: 'longTermDebt', label: 'Long Term Debt', type: 'editable-usd' },
  { key: 'otherDebt', label: 'Other Debt', type: 'editable-usd' },
  { key: 'preferredStock', label: 'Preferred Stock', type: 'editable-usd' },
  { key: 'commonSharesOutstanding', label: 'Shares Outstanding', type: 'editable-shares' },
];


export function Dashboard() {
  const companies = useStore((s) => s.companies);
  const bitcoinPrice = useStore((s) => s.bitcoinPrice);
  const stockPrices = useStore((s) => s.stockPrices);
  const manualStockPrices = useStore((s) => s.manualStockPrices);
  const sortConfig = useStore((s) => s.sortConfig);
  const updateCompany = useStore((s) => s.updateCompany);
  const setManualStockPrice = useStore((s) => s.setManualStockPrice);
  const setSortConfig = useStore((s) => s.setSortConfig);


h  const companiesWithCalcs: CompanyWithCalculations[] = useMemo(() => {
    return companies.map((company) => {
      const stockPrice = getEffectiveStockPrice({
        ticker: company.ticker,
        stockPrices,
        manualStockPrices,
      });


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


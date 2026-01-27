export interface Company {
  id: string;
  name: string;
  ticker: string;
  // Manual inputs
  commonSharesOutstanding: number | null;
  bitcoin: number | null;
  cash: number | null;
  otherAssets: number | null;
  longTermDebt: number | null;
  otherDebt: number | null;
  preferredStock: number | null;
}

export interface CalculatedFields {
  marketCap: number | null;
  bitcoinAssets: number | null;
  assets: number | null;
  debt: number | null;
  enterpriseValue: number | null;
  mNAV: number | null;
  marketCapToAssets: number | null;
  fairStockPrice: number | null;
  equilibriumBTCPrice: number | null;
}

export interface CompanyWithCalculations extends Company, CalculatedFields {
  stockPrice: number | null;
}

export type SortDirection = 'asc' | 'desc' | null;

export interface SortConfig {
  key: string;
  direction: SortDirection;
}

export type ApiStatus = 'idle' | 'loading' | 'success' | 'error';

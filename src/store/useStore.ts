import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, ApiStatus, SortConfig } from '../types';
import { initialCompanies } from '../data/initialCompanies';

interface StoreState {
  // Data
  companies: Company[];
  bitcoinPrice: number | null;
  stockPrices: Record<string, number | null>;
  manualStockPrices: Record<string, number | null>;
  apiSharesOutstanding: Record<string, number | null>; // NEW: API-fetched shares

  // Timestamps
  lastBTCUpdate: string | null;
  lastStockUpdate: string | null;
  lastSharesUpdate: string | null; // NEW

  // API Status
  btcApiStatus: ApiStatus;
  stockApiStatus: ApiStatus;
  sharesOutstandingApiStatus: ApiStatus; // NEW

  // UI State
  sortConfig: SortConfig;

  // Actions
  updateCompany: <K extends keyof Company>(id: string, field: K, value: Company[K]) => void;
  setBitcoinPrice: (price: number) => void;
  setStockPrice: (ticker: string, price: number) => void;
  setManualStockPrice: (ticker: string, price: number | null) => void;
  setApiSharesOutstanding: (ticker: string, shares: number | null) => void; // NEW
  setBtcApiStatus: (status: ApiStatus) => void;
  setStockApiStatus: (status: ApiStatus) => void;
  setSharesOutstandingApiStatus: (status: ApiStatus) => void; // NEW
  setSortConfig: (config: SortConfig) => void;
  importData: (companies: Company[]) => void;
  resetToDefaults: () => void;
}

export const useStore = create<StoreState>()(
  persist(
    (set) => ({
      // Initial state
      companies: initialCompanies,
      bitcoinPrice: null,
      stockPrices: {},
      manualStockPrices: {},
      apiSharesOutstanding: {}, // NEW
      lastBTCUpdate: null,
      lastStockUpdate: null,
      lastSharesUpdate: null, // NEW
      btcApiStatus: 'idle',
      stockApiStatus: 'idle',
      sharesOutstandingApiStatus: 'idle', // NEW
      sortConfig: { key: '', direction: null },

      // Actions
      updateCompany: (id, field, value) =>
        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === id ? { ...c, [field]: value } : c
          ),
        })),

      setBitcoinPrice: (price) =>
        set({
          bitcoinPrice: price,
          lastBTCUpdate: new Date().toISOString(),
          btcApiStatus: 'success',
        }),

      setStockPrice: (ticker, price) =>
        set((state) => ({
          stockPrices: { ...state.stockPrices, [ticker]: price },
          lastStockUpdate: new Date().toISOString(),
        })),

      setManualStockPrice: (ticker, price) =>
        set((state) => ({
          manualStockPrices: { ...state.manualStockPrices, [ticker]: price },
        })),

      // NEW: Set API-fetched shares outstanding
      setApiSharesOutstanding: (ticker, shares) =>
        set((state) => ({
          apiSharesOutstanding: { ...state.apiSharesOutstanding, [ticker]: shares },
          lastSharesUpdate: new Date().toISOString(),
        })),

      setBtcApiStatus: (status) => set({ btcApiStatus: status }),

      setStockApiStatus: (status) => set({ stockApiStatus: status }),

      // NEW: Set shares outstanding API status
      setSharesOutstandingApiStatus: (status) => set({ sharesOutstandingApiStatus: status }),

      setSortConfig: (config) => set({ sortConfig: config }),

      importData: (companies) => set({ companies }),

      resetToDefaults: () =>
        set({
          companies: initialCompanies,
          stockPrices: {},
          manualStockPrices: {},
          apiSharesOutstanding: {}, // NEW
          sortConfig: { key: '', direction: null },
        }),
    }),
    {
      name: 'mnav-dashboard-storage',
      partialize: (state) => ({
        companies: state.companies,
        manualStockPrices: state.manualStockPrices,
        // Note: We don't persist apiSharesOutstanding - it's fetched fresh on load
      }),
    }
  )
);

// Selector to get effective stock price (manual override or API)
export const getEffectiveStockPrice = ({
  ticker,
  stockPrices,
  manualStockPrices,
}: {
  ticker: string;
  stockPrices: Record<string, number | null>;
  manualStockPrices: Record<string, number | null>;
}): number | null => {
  // Manual price takes precedence
  if (manualStockPrices[ticker] !== undefined && manualStockPrices[ticker] !== null) {
    return manualStockPrices[ticker];
  }
  return stockPrices[ticker] ?? null;
};

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
  
  // Timestamps
  lastBTCUpdate: string | null;
  lastStockUpdate: string | null;
  
  // API Status
  btcApiStatus: ApiStatus;
  stockApiStatus: ApiStatus;
  
  // UI State
  sortConfig: SortConfig;
  
  // Actions
  updateCompany: <K extends keyof Company>(id: string, field: K, value: Company[K]) => void;
  setBitcoinPrice: (price: number) => void;
  setStockPrice: (ticker: string, price: number) => void;
  setManualStockPrice: (ticker: string, price: number | null) => void;
  setBtcApiStatus: (status: ApiStatus) => void;
  setStockApiStatus: (status: ApiStatus) => void;
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
      lastBTCUpdate: null,
      lastStockUpdate: null,
      btcApiStatus: 'idle',
      stockApiStatus: 'idle',
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

      setBtcApiStatus: (status) => set({ btcApiStatus: status }),

      setStockApiStatus: (status) => set({ stockApiStatus: status }),

      setSortConfig: (config) => set({ sortConfig: config }),

      importData: (companies) => set({ companies }),

      resetToDefaults: () =>
        set({
          companies: initialCompanies,
          stockPrices: {},
          manualStockPrices: {},
          sortConfig: { key: '', direction: null },
        }),
    }),
    {
      name: 'mnav-dashboard-storage',
      partialize: (state) => ({
        companies: state.companies,
        manualStockPrices: state.manualStockPrices,
      }),
    }
  )
);

// Selector to get effective stock price (manual override or API)
export const getEffectiveStockPrice = (
  ticker: string,
  stockPrices: Record<string, number | null>,
  manualStockPrices: Record<string, number | null>
): number | null => {
  // Manual price takes precedence
  if (manualStockPrices[ticker] !== undefined && manualStockPrices[ticker] !== null) {
    return manualStockPrices[ticker];
  }
  return stockPrices[ticker] ?? null;
};

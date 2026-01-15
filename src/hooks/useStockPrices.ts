import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

// List of CORS proxies to try in order
const CORS_PROXIES = [
  'https://corsproxy.io/?',
  'https://api.allorigins.win/raw?url=',
];

const YAHOO_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/';
const REFRESH_INTERVAL = 60000; // 1 minute

export function useStockPrices() {
  const companies = useStore((s) => s.companies);
  const setStockPrice = useStore((s) => s.setStockPrice);
  const setStockApiStatus = useStore((s) => s.setStockApiStatus);
  const proxyIndexRef = useRef(0);

  const fetchStockPrice = useCallback(
    async (ticker: string): Promise<boolean> => {
      for (let i = 0; i < CORS_PROXIES.length; i++) {
        const proxyIndex = (proxyIndexRef.current + i) % CORS_PROXIES.length;
        const proxy = CORS_PROXIES[proxyIndex];
        
        try {
          const url = `${proxy}${encodeURIComponent(YAHOO_BASE_URL + ticker)}`;
          const res = await fetch(url);
          
          if (!res.ok) continue;
          
          const data = await res.json();
          const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
          
          if (typeof price === 'number') {
            setStockPrice(ticker, price);
            proxyIndexRef.current = proxyIndex; // Remember working proxy
            return true;
          }
        } catch {
          // Try next proxy
          continue;
        }
      }
      return false;
    },
    [setStockPrice]
  );

  const fetchAll = useCallback(async () => {
    setStockApiStatus('loading');
    let successCount = 0;
    
    // Fetch in batches to avoid overwhelming the proxy
    const tickers = companies.map((c) => c.ticker);
    
    for (const ticker of tickers) {
      const success = await fetchStockPrice(ticker);
      if (success) successCount++;
      // Small delay between requests to be nice to the proxy
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    
    setStockApiStatus(successCount > 0 ? 'success' : 'error');
  }, [companies, fetchStockPrice, setStockApiStatus]);

  useEffect(() => {
    fetchAll(); // Initial fetch
    const interval = setInterval(fetchAll, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchAll]);

  return { refetch: fetchAll };
}

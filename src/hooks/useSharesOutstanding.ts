import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

// List of CORS proxies to try in order
const CORS_PROXIES = [
    'https://corsproxy.io/?',
    'https://api.allorigins.win/raw?url=',
  ];

// Yahoo Finance quoteSummary endpoint for key statistics
const YAHOO_SUMMARY_URL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/';

// Refresh interval: 10 minutes (600,000 ms)
const REFRESH_INTERVAL = 600000;

export function useSharesOutstanding() {
    const companies = useStore((s) => s.companies);
    const setApiSharesOutstanding = useStore((s) => s.setApiSharesOutstanding);
    const setSharesOutstandingApiStatus = useStore((s) => s.setSharesOutstandingApiStatus);
    const proxyIndexRef = useRef(0);

  const fetchSharesForTicker = useCallback(
        async (ticker: string): Promise<boolean> => {
                // Try each proxy until one works
          for (let i = 0; i < CORS_PROXIES.length; i++) {
                    const proxyIndex = (proxyIndexRef.current + i) % CORS_PROXIES.length;
                    const proxy = CORS_PROXIES[proxyIndex];

                  try {
                              const url = `${proxy}${encodeURIComponent(
                                            YAHOO_SUMMARY_URL + ticker + '?modules=defaultKeyStatistics'
                                          )}`;
                              const res = await fetch(url);

                      if (!res.ok) continue;

                      const data = await res.json();
                              const keyStats = data?.quoteSummary?.result?.[0]?.defaultKeyStatistics;

                      // Extract sharesOutstanding - Yahoo returns it as a raw number
                      // Sometimes it's nested in an object with 'raw' and 'fmt' keys
                      let shares = keyStats?.sharesOutstanding;
                              if (shares && typeof shares === 'object' && 'raw' in shares) {
                                            shares = shares.raw;
                              }

                      if (typeof shares === 'number' && shares > 0) {
                                    setApiSharesOutstanding(ticker, shares);
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
        [setApiSharesOutstanding]
      );

  const fetchAll = useCallback(async () => {
        setSharesOutstandingApiStatus('loading');
        let successCount = 0;

                                   const tickers = companies.map((c) => c.ticker);

                                   for (const ticker of tickers) {
                                           const success = await fetchSharesForTicker(ticker);
                                           if (success) successCount++;
                                           // Small delay between requests to be nice to the proxy
          await new Promise((resolve) => setTimeout(resolve, 150));
                                   }

                                   setSharesOutstandingApiStatus(successCount > 0 ? 'success' : 'error');
  }, [companies, fetchSharesForTicker, setSharesOutstandingApiStatus]);

  useEffect(() => {
        fetchAll(); // Initial fetch
                const interval = setInterval(fetchAll, REFRESH_INTERVAL);
        return () => clearInterval(interval);
  }, [fetchAll]);

  return { refetch: fetchAll };
}

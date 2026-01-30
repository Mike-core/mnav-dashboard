import { useEffect, useCallback, useRef } from 'react';
import { useStore } from '../store/useStore';

// List of CORS proxies to try in order
const CORS_PROXIES = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
    ];

// Yahoo Finance quoteSummary endpoint for key statistics
const YAHOO_SUMMARY_URL = 'https://query1.finance.yahoo.com/v10/finance/quoteSummary/';

// Refresh interval: 24 hours (86,400,000 ms)
const REFRESH_INTERVAL = 86400000;

export function useSharesOutstanding() {
      const companies = useStore((s) => s.companies);
      const manualSharesOutstanding = useStore((s) => s.manualSharesOutstanding);
      const setApiSharesOutstanding = useStore((s) => s.setApiSharesOutstanding);
      const setSharesOutstandingApiStatus = useStore((s) => s.setSharesOutstandingApiStatus);
      const setSharesOutstandingError = useStore((s) => s.setSharesOutstandingError);
      const clearSharesOutstandingError = useStore((s) => s.clearSharesOutstandingError);
      const proxyIndexRef = useRef(0);

  const fetchSharesForTicker = useCallback(
          async (ticker: string): Promise<boolean> => {
                    // Skip if there's a manual override for this ticker
            if (manualSharesOutstanding[ticker] !== undefined && manualSharesOutstanding[ticker] !== null) {
                        return true; // Consider it a success since we don't need API data
            }

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
                                          clearSharesOutstandingError(ticker); // Clear any previous error
                                      proxyIndexRef.current = proxyIndex; // Remember working proxy
                                      return true;
                          }
                      } catch {
                                    // Try next proxy
                          continue;
                      }
            }

            // All proxies failed - set error state for this ticker
            setSharesOutstandingError(ticker, true);
                    return false;
          },
          [manualSharesOutstanding, setApiSharesOutstanding, setSharesOutstandingError, clearSharesOutstandingError]
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

  // NEW: Fetch shares for a single ticker (used when adding new companies)
  const fetchForTicker = useCallback(
          async (ticker: string) => {
                    setSharesOutstandingApiStatus('loading');
                    const success = await fetchSharesForTicker(ticker);
                    setSharesOutstandingApiStatus(success ? 'success' : 'error');
                    return success;
          },
          [fetchSharesForTicker, setSharesOutstandingApiStatus]
        );

  // NEW: Retry fetching for a specific ticker (used for error retry)
  const retryForTicker = useCallback(
          async (ticker: string) => {
                    // Clear the error state before retrying
            clearSharesOutstandingError(ticker);
                    return fetchForTicker(ticker);
          },
          [clearSharesOutstandingError, fetchForTicker]
        );

  useEffect(() => {
          fetchAll(); // Initial fetch
                const interval = setInterval(fetchAll, REFRESH_INTERVAL);
          return () => clearInterval(interval);
  }, [fetchAll]);

  return { 
          refetch: fetchAll,
          fetchForTicker,    // NEW: Fetch for a single ticker
          retryForTicker,    // NEW: Retry after error
  };
}

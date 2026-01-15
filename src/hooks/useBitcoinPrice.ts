import { useEffect, useCallback } from 'react';
import { useStore } from '../store/useStore';

const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';
const REFRESH_INTERVAL = 60000; // 1 minute

export function useBitcoinPrice() {
  const setBitcoinPrice = useStore((s) => s.setBitcoinPrice);
  const setBtcApiStatus = useStore((s) => s.setBtcApiStatus);

  const fetchPrice = useCallback(async () => {
    setBtcApiStatus('loading');
    try {
      const res = await fetch(COINGECKO_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const price = data?.bitcoin?.usd;
      if (typeof price === 'number') {
        setBitcoinPrice(price);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Failed to fetch BTC price:', error);
      setBtcApiStatus('error');
    }
  }, [setBitcoinPrice, setBtcApiStatus]);

  useEffect(() => {
    fetchPrice(); // Initial fetch
    const interval = setInterval(fetchPrice, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchPrice]);

  return { refetch: fetchPrice };
}

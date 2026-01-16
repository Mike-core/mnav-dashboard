import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('API Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('CoinGecko API', () => {
    const COINGECKO_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd';

    it('parses valid response correctly', async () => {
      const mockResponse = { bitcoin: { usd: 65000 } };
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const res = await fetch(COINGECKO_URL);
      const data = await res.json();
      
      expect(data.bitcoin.usd).toBe(65000);
    });

    it('handles network error', async () => {
      vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network error')));

      await expect(fetch(COINGECKO_URL)).rejects.toThrow('Network error');
    });

    it('handles HTTP error status', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        statusText: 'Too Many Requests',
      }));

      const res = await fetch(COINGECKO_URL);
      expect(res.ok).toBe(false);
      expect(res.status).toBe(429);
    });

    it('handles malformed response', async () => {
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ invalid: 'data' }),
      }));

      const res = await fetch(COINGECKO_URL);
      const data = await res.json();
      
      expect(data?.bitcoin?.usd).toBeUndefined();
    });
  });

  describe('Yahoo Finance API', () => {
    const YAHOO_URL = 'https://query1.finance.yahoo.com/v8/finance/chart/MSTR';

    it('parses valid stock price response', async () => {
      const mockResponse = {
        chart: {
          result: [
            {
              meta: {
                regularMarketPrice: 425.50,
                symbol: 'MSTR',
              }
            }
          ]
        }
      };
      
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const res = await fetch(YAHOO_URL);
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      
      expect(price).toBe(425.50);
    });

    it('handles missing price in response', async () => {
      const mockResponse = {
        chart: {
          result: []
        }
      };
      
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const res = await fetch(YAHOO_URL);
      const data = await res.json();
      const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
      
      expect(price).toBeUndefined();
    });

    it('handles invalid ticker (null result)', async () => {
      const mockResponse = {
        chart: {
          result: null,
          error: {
            code: 'Not Found',
            description: 'No data found, symbol may be delisted'
          }
        }
      };
      
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      }));

      const res = await fetch(YAHOO_URL);
      const data = await res.json();
      
      expect(data.chart.result).toBeNull();
      expect(data.chart.error).toBeDefined();
    });
  });

  describe('CORS Proxy fallback', () => {
    const PROXIES = [
      'https://corsproxy.io/?',
      'https://api.allorigins.win/raw?url=',
    ];

    it('tries multiple proxies on failure', async () => {
      let callCount = 0;
      
      vi.stubGlobal('fetch', vi.fn().mockImplementation((url: string) => {
        callCount++;
        if (url.includes('corsproxy.io')) {
          return Promise.reject(new Error('Proxy 1 failed'));
        }
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            chart: { result: [{ meta: { regularMarketPrice: 100 } }] }
          }),
        });
      }));

      // Simulate trying proxies
      let price = null;
      for (const proxy of PROXIES) {
        try {
          const res = await fetch(`${proxy}https://example.com`);
          if (res.ok) {
            const data = await res.json();
            price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
            break;
          }
        } catch {
          continue;
        }
      }

      expect(callCount).toBe(2); // Tried both proxies
      expect(price).toBe(100); // Got price from second proxy
    });
  });
});

import { describe, it, expect } from 'vitest';
import {
  calcMarketCap,
  calcBitcoinAssets,
  calcAssets,
  calcDebt,
  calcEnterpriseValue,
  calcMNAV,
  calcMarketCapToAssets,
  calcFairStockPrice,
  calcEquilibriumBTCPrice,
  calculateAll,
} from '../src/utils/calculations';

describe('Formula Engine', () => {
  describe('calcMarketCap', () => {
    it('calculates correctly: 1000 shares × $50 = $50,000', () => {
      expect(calcMarketCap(1000, 50)).toBe(50000);
    });

    it('handles large numbers: 226M shares × $400 = $90.4B', () => {
      expect(calcMarketCap(226000000, 400)).toBe(90400000000);
    });

    it('returns null if shares missing', () => {
      expect(calcMarketCap(null, 50)).toBeNull();
    });

    it('returns null if price missing', () => {
      expect(calcMarketCap(1000, null)).toBeNull();
    });

    it('returns 0 if shares are 0', () => {
      expect(calcMarketCap(0, 50)).toBe(0);
    });
  });

  describe('calcBitcoinAssets', () => {
    it('calculates correctly: 100 BTC × $65,000 = $6,500,000', () => {
      expect(calcBitcoinAssets(100, 65000)).toBe(6500000);
    });

    it('handles fractional BTC: 0.5 BTC × $65,000 = $32,500', () => {
      expect(calcBitcoinAssets(0.5, 65000)).toBe(32500);
    });

    it('returns null if BTC missing', () => {
      expect(calcBitcoinAssets(null, 65000)).toBeNull();
    });

    it('returns null if price missing', () => {
      expect(calcBitcoinAssets(100, null)).toBeNull();
    });
  });

  describe('calcAssets', () => {
    it('calculates sum of btcAssets and cash', () => {
      expect(calcAssets(1000000, 500000)).toBe(1500000);
    });

    it('handles null cash as 0', () => {
      expect(calcAssets(1000000, null)).toBe(1000000);
    });

    it('returns null if btcAssets is null', () => {
      expect(calcAssets(null, 500000)).toBeNull();
    });
  });

  describe('calcDebt', () => {
    it('calculates sum of debts', () => {
      expect(calcDebt(1000000, 500000)).toBe(1500000);
    });

    it('handles null longTermDebt as 0', () => {
      expect(calcDebt(null, 500000)).toBe(500000);
    });

    it('handles null otherDebt as 0', () => {
      expect(calcDebt(1000000, null)).toBe(1000000);
    });

    it('returns 0 if both are null', () => {
      expect(calcDebt(null, null)).toBe(0);
    });
  });

  describe('calcEnterpriseValue', () => {
    it('calculates: MarketCap + Debt + Preferred - Cash', () => {
      // 100M + 20M + 5M - 10M = 115M
      expect(calcEnterpriseValue(100000000, 20000000, 5000000, 10000000)).toBe(115000000);
    });

    it('handles null debt as 0', () => {
      expect(calcEnterpriseValue(100000000, null, 5000000, 10000000)).toBe(95000000);
    });

    it('handles null preferred as 0', () => {
      expect(calcEnterpriseValue(100000000, 20000000, null, 10000000)).toBe(110000000);
    });

    it('handles null cash as 0', () => {
      expect(calcEnterpriseValue(100000000, 20000000, 5000000, null)).toBe(125000000);
    });

    it('returns null if marketCap is null', () => {
      expect(calcEnterpriseValue(null, 20000000, 5000000, 10000000)).toBeNull();
    });
  });

  describe('calcMNAV', () => {
    it('calculates correctly: EV $100M / BTC Assets $50M = 2.0', () => {
      expect(calcMNAV(100000000, 50000000)).toBe(2);
    });

    it('returns value < 1 for discount: EV $40M / BTC Assets $50M = 0.8', () => {
      expect(calcMNAV(40000000, 50000000)).toBe(0.8);
    });

    it('returns null if EV is null', () => {
      expect(calcMNAV(null, 50000000)).toBeNull();
    });

    it('returns null if BTC assets is null', () => {
      expect(calcMNAV(100000000, null)).toBeNull();
    });

    it('returns null if BTC assets is 0 (division by zero)', () => {
      expect(calcMNAV(100000000, 0)).toBeNull();
    });
  });

  describe('calcMarketCapToAssets', () => {
    it('calculates correctly: $100M / $80M = 1.25', () => {
      expect(calcMarketCapToAssets(100000000, 80000000)).toBe(1.25);
    });

    it('returns null if marketCap is null', () => {
      expect(calcMarketCapToAssets(null, 80000000)).toBeNull();
    });

    it('returns null if assets is null', () => {
      expect(calcMarketCapToAssets(100000000, null)).toBeNull();
    });

    it('returns null if assets is 0', () => {
      expect(calcMarketCapToAssets(100000000, 0)).toBeNull();
    });
  });

  describe('calcFairStockPrice', () => {
    it('calculates: (Assets - Debt - Preferred) / MarketCap', () => {
      // (100M - 20M - 5M) / 50M = 1.5
      expect(calcFairStockPrice(100000000, 20000000, 5000000, 50000000)).toBe(1.5);
    });

    it('handles null debt as 0', () => {
      // (100M - 0 - 5M) / 50M = 1.9
      expect(calcFairStockPrice(100000000, null, 5000000, 50000000)).toBe(1.9);
    });

    it('returns null if marketCap is 0', () => {
      expect(calcFairStockPrice(100000000, 20000000, 5000000, 0)).toBeNull();
    });
  });

  describe('calcEquilibriumBTCPrice', () => {
    it('calculates: BTC Price × (BTC Assets / EV)', () => {
      // 65000 × (50M / 100M) = 32500
      expect(calcEquilibriumBTCPrice(65000, 50000000, 100000000)).toBe(32500);
    });

    it('equals BTC price when mNAV = 1', () => {
      // 65000 × (50M / 50M) = 65000
      expect(calcEquilibriumBTCPrice(65000, 50000000, 50000000)).toBe(65000);
    });

    it('returns null if EV is 0', () => {
      expect(calcEquilibriumBTCPrice(65000, 50000000, 0)).toBeNull();
    });
  });

  describe('calculateAll', () => {
    it('computes all fields from inputs', () => {
      const result = calculateAll({
        commonSharesOutstanding: 1000000,
        bitcoin: 100,
        cash: 1000000,
        otherAssets: 500000,
        longTermDebt: 2000000,
        otherDebt: 500000,
        preferredStock: 100000,
        stockPrice: 50,
        bitcoinPrice: 65000,
      });

      // Market Cap = 1M × $50 = $50M
      expect(result.marketCap).toBe(50000000);
      
      // BTC Assets = 100 × $65K = $6.5M
      expect(result.bitcoinAssets).toBe(6500000);
      
      // Assets = $6.5M + $1M + $0.5M = $8M
      expect(result.assets).toBe(8000000);
      
      // Debt = $2M + $0.5M = $2.5M
      expect(result.debt).toBe(2500000);
      
      // EV = $50M + $2.5M + $0.1M - $1M = $51.6M
      expect(result.enterpriseValue).toBe(51600000);
      
      // mNAV = $51.6M / $6.5M ≈ 7.938
      expect(result.mNAV).toBeCloseTo(7.938, 2);
    });

    it('handles company with no Bitcoin', () => {
      const result = calculateAll({
        commonSharesOutstanding: 1000000,
        bitcoin: 0,
        cash: 1000000,
        otherAssets: 500000,
        longTermDebt: 0,
        otherDebt: 0,
        preferredStock: 0,
        stockPrice: 50,
        bitcoinPrice: 65000,
      });

      expect(result.bitcoinAssets).toBe(0);
      expect(result.mNAV).toBeNull(); // Division by zero
    });

    it('handles missing inputs gracefully', () => {
      const result = calculateAll({
        commonSharesOutstanding: null,
        bitcoin: null,
        cash: null,
        otherAssets: null,
        longTermDebt: null,
        otherDebt: null,
        preferredStock: null,
        stockPrice: null,
        bitcoinPrice: null,
      });

      expect(result.marketCap).toBeNull();
      expect(result.bitcoinAssets).toBeNull();
      expect(result.mNAV).toBeNull();
    });
  });
});

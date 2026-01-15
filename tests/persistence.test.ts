import { describe, it, expect } from 'vitest';
import { validateImport } from '../src/utils/exportImport';
import { initialCompanies } from '../src/data/initialCompanies';

describe('Data Persistence & Export/Import', () => {
  describe('initialCompanies', () => {
    it('contains exactly 19 companies', () => {
      expect(initialCompanies).toHaveLength(19);
    });

    it('has all required tickers', () => {
      const expectedTickers = [
        'MSTR', 'XXI', 'CEPO', 'BLSH', 'ASST', 'GDC', 'NXTT', 'ABTC',
        'NAKA', 'SMLR', 'BRR', 'EMPD', 'HOLO', 'EXOD', 'FLD', 'DDC',
        'KULR', 'NA', 'USBC'
      ];
      const actualTickers = initialCompanies.map(c => c.ticker);
      expect(actualTickers).toEqual(expect.arrayContaining(expectedTickers));
    });

    it('has unique IDs for all companies', () => {
      const ids = initialCompanies.map(c => c.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('has all numeric fields initialized to null', () => {
      const numericFields = [
        'commonSharesOutstanding', 'bitcoin', 'cash', 'otherAssets',
        'longTermDebt', 'otherDebt', 'preferredStock'
      ];
      
      for (const company of initialCompanies) {
        for (const field of numericFields) {
          expect(company[field as keyof typeof company]).toBeNull();
        }
      }
    });
  });

  describe('validateImport', () => {
    it('accepts valid company array', () => {
      const validData = [
        {
          id: '1',
          name: 'Test Company',
          ticker: 'TEST',
          commonSharesOutstanding: 1000000,
          bitcoin: 100,
          cash: 500000,
          otherAssets: 200000,
          longTermDebt: 100000,
          otherDebt: 50000,
          preferredStock: 0,
        }
      ];
      
      expect(validateImport(validData)).not.toBeNull();
    });

    it('accepts null values for numeric fields', () => {
      const validData = [
        {
          id: '1',
          name: 'Test',
          ticker: 'TST',
          commonSharesOutstanding: null,
          bitcoin: null,
          cash: null,
          otherAssets: null,
          longTermDebt: null,
          otherDebt: null,
          preferredStock: null,
        }
      ];
      
      expect(validateImport(validData)).not.toBeNull();
    });

    it('rejects non-array input', () => {
      expect(validateImport({ bad: 'data' })).toBeNull();
      expect(validateImport('string')).toBeNull();
      expect(validateImport(123)).toBeNull();
      expect(validateImport(null)).toBeNull();
    });

    it('rejects array with missing required fields', () => {
      const missingId = [{ name: 'Test', ticker: 'TST' }];
      expect(validateImport(missingId)).toBeNull();

      const missingName = [{ id: '1', ticker: 'TST' }];
      expect(validateImport(missingName)).toBeNull();

      const missingBitcoin = [
        {
          id: '1',
          name: 'Test',
          ticker: 'TST',
          commonSharesOutstanding: null,
          // bitcoin missing
          cash: null,
          otherAssets: null,
          longTermDebt: null,
          otherDebt: null,
          preferredStock: null,
        }
      ];
      expect(validateImport(missingBitcoin)).toBeNull();
    });

    it('rejects invalid field types', () => {
      const stringInsteadOfNumber = [
        {
          id: '1',
          name: 'Test',
          ticker: 'TST',
          commonSharesOutstanding: 'invalid', // should be number or null
          bitcoin: null,
          cash: null,
          otherAssets: null,
          longTermDebt: null,
          otherDebt: null,
          preferredStock: null,
        }
      ];
      expect(validateImport(stringInsteadOfNumber)).toBeNull();
    });

    it('validates the initialCompanies data', () => {
      expect(validateImport(initialCompanies)).not.toBeNull();
    });
  });
});

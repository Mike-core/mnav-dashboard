import { describe, it, expect } from 'vitest';
import {
    formatSharesOutstanding,
    parseSharesInput,
    getSharesSourceTooltip,
    getSharesSourceClass,
    validateSharesInput,
    getSharesSourceIcon,
} from '../src/utils/sharesOutstanding';
import {
    getEffectiveSharesOutstanding,
    getSharesDataSource,
} from '../src/store/useStore';
import { validateImport, getNewTickers } from '../src/utils/exportImport';

describe('Shares Outstanding Utilities', () => {
    describe('formatSharesOutstanding', () => {
          it('formats billions correctly', () => {
                  expect(formatSharesOutstanding(1500000000)).toBe('1.50B');
                  expect(formatSharesOutstanding(2000000000)).toBe('2.00B');
          });

                 it('formats millions correctly', () => {
                         expect(formatSharesOutstanding(250000000)).toBe('250.00M');
                         expect(formatSharesOutstanding(1500000)).toBe('1.50M');
                 });

                 it('formats thousands correctly', () => {
                         expect(formatSharesOutstanding(50000)).toBe('50.00K');
                         expect(formatSharesOutstanding(1500)).toBe('1.50K');
                 });

                 it('formats small numbers with locale string', () => {
                         expect(formatSharesOutstanding(500)).toBe('500');
                 });

                 it('returns dash for null or undefined', () => {
                         expect(formatSharesOutstanding(null)).toBe('—');
                         expect(formatSharesOutstanding(undefined)).toBe('—');
                 });
    });

           describe('parseSharesInput', () => {
                 it('parses billions suffix', () => {
                         expect(parseSharesInput('1.5B')).toBe(1500000000);
                         expect(parseSharesInput('2b')).toBe(2000000000);
                 });

                        it('parses millions suffix', () => {
                                expect(parseSharesInput('250M')).toBe(250000000);
                                expect(parseSharesInput('1.5m')).toBe(1500000);
                        });

                        it('parses thousands suffix', () => {
                                expect(parseSharesInput('50K')).toBe(50000);
                                expect(parseSharesInput('1.5k')).toBe(1500);
                        });

                        it('parses plain numbers', () => {
                                expect(parseSharesInput('1000000')).toBe(1000000);
                                expect(parseSharesInput('500')).toBe(500);
                        });

                        it('handles commas in numbers', () => {
                                expect(parseSharesInput('1,000,000')).toBe(1000000);
                        });

                        it('returns null for empty or invalid input', () => {
                                expect(parseSharesInput('')).toBe(null);
                                expect(parseSharesInput('—')).toBe(null);
                                expect(parseSharesInput('invalid')).toBe(null);
                        });
           });

           describe('validateSharesInput', () => {
                 it('returns true for valid inputs', () => {
                         expect(validateSharesInput('1.5B')).toBe(true);
                         expect(validateSharesInput('250M')).toBe(true);
                         expect(validateSharesInput('1000000')).toBe(true);
                 });

                        it('returns true for empty input (reset)', () => {
                                expect(validateSharesInput('')).toBe(true);
                                expect(validateSharesInput('  ')).toBe(true);
                        });

                        it('returns false for invalid inputs', () => {
                                expect(validateSharesInput('invalid')).toBe(false);
                                expect(validateSharesInput('-100')).toBe(false);
                        });
           });

           describe('getSharesSourceTooltip', () => {
                 it('returns correct tooltips for each source', () => {
                         expect(getSharesSourceTooltip('api')).toBe('Data from Yahoo Finance API');
                         expect(getSharesSourceTooltip('manual')).toContain('Manually entered');
                         expect(getSharesSourceTooltip('error')).toContain('Failed to fetch');
                         expect(getSharesSourceTooltip('loading')).toContain('Loading');
                 });
           });

           describe('getSharesSourceClass', () => {
                 it('returns correct CSS classes', () => {
                         expect(getSharesSourceClass('api')).toBe('shares-source-api');
                         expect(getSharesSourceClass('manual')).toBe('shares-source-manual');
                         expect(getSharesSourceClass('error')).toBe('shares-source-error');
                         expect(getSharesSourceClass('loading')).toBe('shares-source-loading');
                 });
           });

           describe('getSharesSourceIcon', () => {
                 it('returns correct icons', () => {
                         expect(getSharesSourceIcon('api')).toBe('');
                         expect(getSharesSourceIcon('manual')).toBe('✏️');
                         expect(getSharesSourceIcon('error')).toBe('⚠️');
                         expect(getSharesSourceIcon('loading')).toBe('⏳');
                 });
           });
});

describe('Store Selectors', () => {
    describe('getEffectiveSharesOutstanding', () => {
          it('returns manual value when set', () => {
                  const result = getEffectiveSharesOutstanding({
                            ticker: 'MSTR',
                            apiSharesOutstanding: { MSTR: 1000000 },
                            manualSharesOutstanding: { MSTR: 2000000 },
                  });
                  expect(result).toBe(2000000);
          });

                 it('returns API value when no manual override', () => {
                         const result = getEffectiveSharesOutstanding({
                                   ticker: 'MSTR',
                                   apiSharesOutstanding: { MSTR: 1000000 },
                                   manualSharesOutstanding: {},
                         });
                         expect(result).toBe(1000000);
                 });

                 it('returns null when no data available', () => {
                         const result = getEffectiveSharesOutstanding({
                                   ticker: 'MSTR',
                                   apiSharesOutstanding: {},
                                   manualSharesOutstanding: {},
                         });
                         expect(result).toBe(null);
                 });
    });

           describe('getSharesDataSource', () => {
                 it('returns manual when manual override exists', () => {
                         const result = getSharesDataSource({
                                   ticker: 'MSTR',
                                   apiSharesOutstanding: { MSTR: 1000000 },
                                   manualSharesOutstanding: { MSTR: 2000000 },
                                   sharesOutstandingErrors: {},
                                   sharesOutstandingApiStatus: 'success',
                         });
                         expect(result).toBe('manual');
                 });

                        it('returns error when ticker has error', () => {
                                const result = getSharesDataSource({
                                          ticker: 'MSTR',
                                          apiSharesOutstanding: {},
                                          manualSharesOutstanding: {},
                                          sharesOutstandingErrors: { MSTR: true },
                                          sharesOutstandingApiStatus: 'error',
                                });
                                expect(result).toBe('error');
                        });

                        it('returns loading when API is loading and no value', () => {
                                const result = getSharesDataSource({
                                          ticker: 'MSTR',
                                          apiSharesOutstanding: {},
                                          manualSharesOutstanding: {},
                                          sharesOutstandingErrors: {},
                                          sharesOutstandingApiStatus: 'loading',
                                });
                                expect(result).toBe('loading');
                        });

                        it('returns api as default', () => {
                                const result = getSharesDataSource({
                                          ticker: 'MSTR',
                                          apiSharesOutstanding: { MSTR: 1000000 },
                                          manualSharesOutstanding: {},
                                          sharesOutstandingErrors: {},
                                          sharesOutstandingApiStatus: 'success',
                                });
                                expect(result).toBe('api');
                        });
           });
});

describe('Export/Import', () => {
    describe('validateImport', () => {
          it('validates v1 format (plain array)', () => {
                  const data = [
                    {
                                id: '1',
                                name: 'Test Company',
                                ticker: 'TEST',
                                commonSharesOutstanding: 1000000,
                                bitcoin: 100,
                                cash: 50000,
                                longTermDebt: 10000,
                                otherDebt: 5000,
                                preferredStock: 0,
                    },
                          ];
                  const result = validateImport(data);
                  expect(result).not.toBe(null);
                  expect(result?.companies).toHaveLength(1);
                  expect(result?.manualSharesOutstanding).toBeUndefined();
          });

                 it('validates v2 format (object with metadata)', () => {
                         const data = {
                                   version: 2,
                                   exportedAt: '2026-01-29T00:00:00.000Z',
                                   companies: [
                                     {
                                                   id: '1',
                                                   name: 'Test Company',
                                                   ticker: 'TEST',
                                                   commonSharesOutstanding: 1000000,
                                                   bitcoin: 100,
                                                   cash: 50000,
                                                   longTermDebt: 10000,
                                                   otherDebt: 5000,
                                                   preferredStock: 0,
                                     },
                                             ],
                                   manualSharesOutstanding: { TEST: 2000000 },
                                   manualStockPrices: { TEST: 100.5 },
                         };
                         const result = validateImport(data);
                         expect(result).not.toBe(null);
                         expect(result?.companies).toHaveLength(1);
                         expect(result?.manualSharesOutstanding).toEqual({ TEST: 2000000 });
                         expect(result?.manualStockPrices).toEqual({ TEST: 100.5 });
                 });

                 it('returns null for invalid data', () => {
                         expect(validateImport(null)).toBe(null);
                         expect(validateImport('invalid')).toBe(null);
                         expect(validateImport({ invalid: true })).toBe(null);
                 });
    });

           describe('getNewTickers', () => {
                 it('identifies new tickers', () => {
                         const importedCompanies = [
                           { id: '1', ticker: 'NEW1', name: 'New 1', commonSharesOutstanding: 1000, bitcoin: 0, cash: 0, longTermDebt: 0, otherDebt: 0, preferredStock: 0 },
                           { id: '2', ticker: 'NEW2', name: 'New 2', commonSharesOutstanding: 1000, bitcoin: 0, cash: 0, longTermDebt: 0, otherDebt: 0, preferredStock: 0 },
                                 ];
                         const existingCompanies = [
                           { id: '3', ticker: 'EXISTING', name: 'Existing', commonSharesOutstanding: 1000, bitcoin: 0, cash: 0, longTermDebt: 0, otherDebt: 0, preferredStock: 0 },
                                 ];
                         const apiSharesOutstanding = { EXISTING: 1000000 };

                          const result = getNewTickers(importedCompanies, existingCompanies, apiSharesOutstanding);
                         expect(result).toContain('NEW1');
                         expect(result).toContain('NEW2');
                         expect(result).not.toContain('EXISTING');
                 });

                        it('includes existing tickers without shares data', () => {
                                const importedCompanies = [
                                  { id: '1', ticker: 'MSTR', name: 'MicroStrategy', commonSharesOutstanding: 1000, bitcoin: 0, cash: 0, longTermDebt: 0, otherDebt: 0, preferredStock: 0 },
                                        ];
                                const existingCompanies = [
                                  { id: '1', ticker: 'MSTR', name: 'MicroStrategy', commonSharesOutstanding: 1000, bitcoin: 0, cash: 0, longTermDebt: 0, otherDebt: 0, preferredStock: 0 },
                                        ];
                                const apiSharesOutstanding = {}; // No shares data yet

                                 const result = getNewTickers(importedCompanies, existingCompanies, apiSharesOutstanding);
                                expect(result).toContain('MSTR');
                        });
           });
});

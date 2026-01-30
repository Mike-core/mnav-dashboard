import { SharesDataSource } from '../types';

/**
 * Format shares outstanding for display
 * Converts large numbers to human-readable format (e.g., 1.5B, 250M)
 */
export function formatSharesOutstanding(shares: number | null | undefined): string {
    if (shares === null || shares === undefined) {
          return '—';
    }

  if (shares >= 1_000_000_000) {
        return `${(shares / 1_000_000_000).toFixed(2)}B`;
  }

  if (shares >= 1_000_000) {
        return `${(shares / 1_000_000).toFixed(2)}M`;
  }

  if (shares >= 1_000) {
        return `${(shares / 1_000).toFixed(2)}K`;
  }

  return shares.toLocaleString();
}

/**
 * Parse a formatted shares string back to a number
 * Handles B (billions), M (millions), K (thousands) suffixes
 */
export function parseSharesInput(input: string): number | null {
    if (!input || input.trim() === '' || input.trim() === '—') {
          return null;
    }

  const trimmed = input.trim().toUpperCase();

  // Remove commas for plain number parsing
  const withoutCommas = trimmed.replace(/,/g, '');

  // Check for suffix multipliers
  if (withoutCommas.endsWith('B')) {
        const num = parseFloat(withoutCommas.slice(0, -1));
        return isNaN(num) ? null : num * 1_000_000_000;
  }

  if (withoutCommas.endsWith('M')) {
        const num = parseFloat(withoutCommas.slice(0, -1));
        return isNaN(num) ? null : num * 1_000_000;
  }

  if (withoutCommas.endsWith('K')) {
        const num = parseFloat(withoutCommas.slice(0, -1));
        return isNaN(num) ? null : num * 1_000;
  }

  // Plain number
  const num = parseFloat(withoutCommas);
    return isNaN(num) ? null : num;
}

/**
 * Get tooltip text based on data source
 */
export function getSharesSourceTooltip(source: SharesDataSource): string {
    switch (source) {
      case 'api':
              return 'Data from Yahoo Finance API';
      case 'manual':
              return 'Manually entered value (click to reset to API)';
      case 'error':
              return 'Failed to fetch from API. Click to retry.';
      case 'loading':
              return 'Loading from Yahoo Finance...';
      default:
              return '';
    }
}

/**
 * Get CSS class name based on data source for styling
 */
export function getSharesSourceClass(source: SharesDataSource): string {
    switch (source) {
      case 'api':
              return 'shares-source-api';
      case 'manual':
              return 'shares-source-manual';
      case 'error':
              return 'shares-source-error';
      case 'loading':
              return 'shares-source-loading';
      default:
              return '';
    }
}

/**
 * Validate shares outstanding input
 * Returns true if the input is valid, false otherwise
 */
export function validateSharesInput(input: string): boolean {
    if (!input || input.trim() === '') {
          return true; // Empty is valid (will be treated as null/reset)
    }

  const parsed = parseSharesInput(input);

  // Must be a valid positive number
  return parsed !== null && parsed > 0;
}

/**
 * Get the icon/indicator for the shares source
 */
export function getSharesSourceIcon(source: SharesDataSource): string {
    switch (source) {
      case 'api':
              return ''; // No icon for API data
      case 'manual':
              return '✏️'; // Pencil for manual entry
      case 'error':
              return '⚠️'; // Warning for error
      case 'loading':
              return '⏳'; // Hourglass for loading
      default:
              return '';
    }
}

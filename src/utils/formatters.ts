/**
 * Formatting utilities for displaying values in the dashboard
 */

export function formatUSD(value: number | null, compact: boolean = false): string {
  if (value === null) return '—';
  
  if (compact && Math.abs(value) >= 1e9) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  if (compact && Math.abs(value) >= 1e6) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      notation: 'compact',
      maximumFractionDigits: 2,
    }).format(value);
  }
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatUSDPrice(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatBTC(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatRatio(value: number | null): string {
  if (value === null) return '—';
  return value.toFixed(2);
}

export function formatShares(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatNumber(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatTimestamp(isoString: string | null): string {
  if (!isoString) return 'Never';
  const date = new Date(isoString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

// Parse string input to number, handling commas and empty strings
export function parseNumericInput(value: string): number | null {
  if (!value || value.trim() === '') return null;
  const cleaned = value.replace(/,/g, '').replace(/\$/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? null : num;
}

import { Company } from '../types';

// Export data structure that includes manual overrides
export interface ExportData {
    version: number;
    exportedAt: string;
    companies: Company[];
    manualSharesOutstanding?: Record<string, number | null>;
    manualStockPrices?: Record<string, number | null>;
}

// Export companies to JSON file
export function exportToJSON(
    companies: Company[],
    manualSharesOutstanding?: Record<string, number | null>,
    manualStockPrices?: Record<string, number | null>
  ): void {
    const exportData: ExportData = {
          version: 2, // Version 2 includes manual shares outstanding
          exportedAt: new Date().toISOString(),
          companies,
          manualSharesOutstanding,
          manualStockPrices,
    };

  const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mnav-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Validate imported data - supports both v1 (array) and v2 (object with metadata)
export function validateImport(data: unknown): { 
    companies: Company[]; 
    manualSharesOutstanding?: Record<string, number | null>;
    manualStockPrices?: Record<string, number | null>;
} | null {
    // Handle v2 format (object with metadata)
  if (data && typeof data === 'object' && !Array.isArray(data)) {
        const exportData = data as ExportData;

      // Check if it has the expected structure
      if (exportData.companies && Array.isArray(exportData.companies)) {
              const validatedCompanies = validateCompaniesArray(exportData.companies);
              if (!validatedCompanies) return null;

          return {
                    companies: validatedCompanies,
                    manualSharesOutstanding: exportData.manualSharesOutstanding,
                    manualStockPrices: exportData.manualStockPrices,
          };
      }
  }

  // Handle v1 format (plain array) - backward compatibility
  if (Array.isArray(data)) {
        const validatedCompanies = validateCompaniesArray(data);
        if (!validatedCompanies) return null;

      return { companies: validatedCompanies };
  }

  return null;
}

// Validate an array of companies
function validateCompaniesArray(data: unknown[]): Company[] | null {
    const requiredFields: (keyof Company)[] = [
          'id',
          'name',
          'ticker',
          'commonSharesOutstanding',
          'bitcoin',
          'cash',
          'longTermDebt',
          'otherDebt',
          'preferredStock',
        ];

  for (const item of data) {
        if (typeof item !== 'object' || item === null) return null;

      for (const field of requiredFields) {
              if (!(field in item)) return null;
      }

      // Validate field types
      if (typeof (item as Company).id !== 'string') return null;
        if (typeof (item as Company).name !== 'string') return null;
        if (typeof (item as Company).ticker !== 'string') return null;

      const numericFields: (keyof Company)[] = [
              'commonSharesOutstanding',
              'bitcoin',
              'cash',
              'longTermDebt',
              'otherDebt',
              'preferredStock',
            ];

      for (const field of numericFields) {
              const value = (item as Company)[field];
              if (value !== null && typeof value !== 'number') return null;
      }
  }

  return data as Company[];
}

// Import from file - returns promise with validated data
export function importFromFile(file: File): Promise<{
    companies: Company[];
    manualSharesOutstanding?: Record<string, number | null>;
    manualStockPrices?: Record<string, number | null>;
} | null> {
    return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => {
                  try {
                            const text = event.target?.result as string;
                            const data = JSON.parse(text);
                            const validated = validateImport(data);
                            resolve(validated);
                  } catch {
                            resolve(null);
                  }
          };
          reader.onerror = () => resolve(null);
          reader.readAsText(file);
    });
}

// Get list of new tickers that need shares fetched
export function getNewTickers(
    importedCompanies: Company[],
    existingCompanies: Company[],
    apiSharesOutstanding: Record<string, number | null>
  ): string[] {
    const existingTickers = new Set(existingCompanies.map(c => c.ticker));
    const tickersWithShares = new Set(Object.keys(apiSharesOutstanding));

  return importedCompanies
      .filter(c => !existingTickers.has(c.ticker) || !tickersWithShares.has(c.ticker))
      .map(c => c.ticker);
}

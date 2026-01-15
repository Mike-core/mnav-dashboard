import { Company } from '../types';

export function exportToJSON(companies: Company[]): void {
  const data = JSON.stringify(companies, null, 2);
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

export function validateImport(data: unknown): Company[] | null {
  if (!Array.isArray(data)) return null;

  const requiredFields: (keyof Company)[] = [
    'id',
    'name',
    'ticker',
    'commonSharesOutstanding',
    'bitcoin',
    'cash',
    'otherAssets',
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
    if (typeof item.id !== 'string') return null;
    if (typeof item.name !== 'string') return null;
    if (typeof item.ticker !== 'string') return null;

    const numericFields: (keyof Company)[] = [
      'commonSharesOutstanding',
      'bitcoin',
      'cash',
      'otherAssets',
      'longTermDebt',
      'otherDebt',
      'preferredStock',
    ];

    for (const field of numericFields) {
      const value = item[field];
      if (value !== null && typeof value !== 'number') return null;
    }
  }

  return data as Company[];
}

export function importFromFile(file: File): Promise<Company[] | null> {
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

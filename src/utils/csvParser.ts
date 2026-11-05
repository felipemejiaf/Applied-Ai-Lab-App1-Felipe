import { SalesOrder } from '../types';

export interface ParseResult {
  orders: SalesOrder[];
  errors: string[];
  warnings: string[];
  headersFound: string[];
  totalRowsProcessed: number;
}

// Parse a single CSV line properly respecting quotes
function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Clean and normalize quarter values: "Q1", "2024-Q2", "Quarter 3", "Q4 2024", "1", "2"
export function normalizeQuarter(raw: string): string {
  const clean = raw.trim().toUpperCase();
  if (clean.includes('Q1') || clean === '1' || clean === 'QUARTER 1' || clean === 'FIRST QUARTER') return 'Q1';
  if (clean.includes('Q2') || clean === '2' || clean === 'QUARTER 2' || clean === 'SECOND QUARTER') return 'Q2';
  if (clean.includes('Q3') || clean === '3' || clean === 'QUARTER 3' || clean === 'THIRD QUARTER') return 'Q3';
  if (clean.includes('Q4') || clean === '4' || clean === 'QUARTER 4' || clean === 'FOURTH QUARTER') return 'Q4';

  const match = clean.match(/Q([1-4])/i);
  if (match) return `Q${match[1]}`;
  return clean || 'Unknown';
}

// Clean numeric strings: removes $, commas, %, etc.
function cleanNumber(val: any, isPercentage: boolean = false): number {
  if (val === undefined || val === null) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;

  let str = String(val).trim();
  const hasPctSign = str.includes('%');
  str = str.replace(/[\$,\s]/g, '');

  if (hasPctSign) {
    str = str.replace('%', '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num / 100;
  }

  const num = parseFloat(str);
  if (isNaN(num)) return 0;

  // If expected percentage and value is greater than 1, e.g. 15 -> 0.15
  if (isPercentage && num > 1) {
    return num / 100;
  }
  return num;
}

export function parseSalesCsv(csvText: string): ParseResult {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const errors: string[] = [];
  const warnings: string[] = [];
  const orders: SalesOrder[] = [];

  if (lines.length === 0) {
    return {
      orders: [],
      errors: ['The uploaded CSV file is empty.'],
      warnings: [],
      headersFound: [],
      totalRowsProcessed: 0,
    };
  }

  const headerLine = lines[0];
  const rawHeaders = parseCsvLine(headerLine);
  const normalizedHeaders = rawHeaders.map((h) =>
    h.toLowerCase().replace(/[^a-z0-9_]/g, '_')
  );

  // Column mapping index lookup
  const findCol = (candidates: string[]): number => {
    return normalizedHeaders.findIndex((h) =>
      candidates.some((cand) => h === cand || h.includes(cand))
    );
  };

  const quarterIdx = findCol(['quarter', 'qtr', 'period']);
  const regionIdx = findCol(['region', 'territory', 'area', 'geo']);
  const channelIdx = findCol(['channel', 'sales_channel', 'distribution']);
  const productIdx = findCol(['product', 'item', 'product_name', 'sku']);
  const unitsIdx = findCol(['units', 'quantity', 'qty', 'volume']);
  const discountIdx = findCol(['discount_pct', 'discount', 'disc', 'discount_rate']);
  const revenueIdx = findCol(['revenue', 'sales', 'sales_amount', 'total_revenue', 'amount']);

  const missingColumns: string[] = [];
  if (quarterIdx === -1) missingColumns.push('quarter');
  if (regionIdx === -1) missingColumns.push('region');
  if (channelIdx === -1) missingColumns.push('channel');
  if (productIdx === -1) missingColumns.push('product');
  if (unitsIdx === -1) missingColumns.push('units');
  if (discountIdx === -1) missingColumns.push('discount_pct');
  if (revenueIdx === -1) missingColumns.push('revenue');

  if (missingColumns.length > 0) {
    errors.push(
      `Missing required column(s): ${missingColumns.join(', ')}. Found columns: ${rawHeaders.join(', ')}`
    );
    return {
      orders: [],
      errors,
      warnings,
      headersFound: rawHeaders,
      totalRowsProcessed: 0,
    };
  }

  let rowCount = 0;
  for (let i = 1; i < lines.length; i++) {
    const row = parseCsvLine(lines[i]);
    // Skip empty lines or malformed rows with far too few cells
    if (row.length === 1 && !row[0]) continue;

    rowCount++;
    const rawQuarter = row[quarterIdx] || '';
    const quarter = normalizeQuarter(rawQuarter);
    const region = (row[regionIdx] || 'Unknown').trim();
    const channel = (row[channelIdx] || 'Direct').trim();
    const product = (row[productIdx] || 'General Product').trim();
    const units = Math.max(0, Math.round(cleanNumber(row[unitsIdx])));
    const discount_pct = Math.max(0, cleanNumber(row[discountIdx], true));
    const revenue = Math.max(0, cleanNumber(row[revenueIdx]));

    if (!region || revenue === 0 && units === 0) {
      warnings.push(`Row ${i + 1}: Skipped row due to missing region or zero revenue/units.`);
      continue;
    }

    orders.push({
      id: `ord-${i}-${Math.random().toString(36).substring(2, 7)}`,
      quarter,
      rawQuarter,
      region,
      channel,
      product,
      units,
      discount_pct,
      revenue,
    });
  }

  if (orders.length === 0) {
    errors.push('No valid order records could be extracted from the file.');
  }

  return {
    orders,
    errors,
    warnings,
    headersFound: rawHeaders,
    totalRowsProcessed: rowCount,
  };
}

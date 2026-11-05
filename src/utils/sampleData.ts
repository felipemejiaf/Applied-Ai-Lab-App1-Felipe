import { SalesOrder } from '../types';

export const SAMPLE_SALES_ORDERS: SalesOrder[] = [
  // --- ASIA PACIFIC (APAC) ---
  // Q1
  { id: 'ap-1', quarter: 'Q1', region: 'Asia Pacific', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 140, discount_pct: 0.12, revenue: 490000 },
  { id: 'ap-2', quarter: 'Q1', region: 'Asia Pacific', channel: 'Partner Network', product: 'Analytics Pro', units: 210, discount_pct: 0.15, revenue: 380000 },
  { id: 'ap-3', quarter: 'Q1', region: 'Asia Pacific', channel: 'Online Portal', product: 'Security Shield', units: 350, discount_pct: 0.10, revenue: 310000 },
  { id: 'ap-4', quarter: 'Q1', region: 'Asia Pacific', channel: 'Key Accounts', product: 'Hardware Hub', units: 80, discount_pct: 0.08, revenue: 240000 },
  // Q2 (Total: $1,850,000)
  { id: 'ap-5', quarter: 'Q2', region: 'Asia Pacific', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 180, discount_pct: 0.12, revenue: 620000 },
  { id: 'ap-6', quarter: 'Q2', region: 'Asia Pacific', channel: 'Partner Network', product: 'Analytics Pro', units: 240, discount_pct: 0.14, revenue: 420000 },
  { id: 'ap-7', quarter: 'Q2', region: 'Asia Pacific', channel: 'Online Portal', product: 'Security Shield', units: 390, discount_pct: 0.10, revenue: 340000 },
  { id: 'ap-8', quarter: 'Q2', region: 'Asia Pacific', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 90, discount_pct: 0.15, revenue: 270000 },
  { id: 'ap-9', quarter: 'Q2', region: 'Asia Pacific', channel: 'Key Accounts', product: 'Hardware Hub', units: 70, discount_pct: 0.09, revenue: 200000 },
  // Q3 (Total: $3,275,000 -> Delta: +$1,425,000 or +77.0%)
  { id: 'ap-10', quarter: 'Q3', region: 'Asia Pacific', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 480, discount_pct: 0.07, revenue: 1580000 },
  { id: 'ap-11', quarter: 'Q3', region: 'Asia Pacific', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 210, discount_pct: 0.08, revenue: 710000 },
  { id: 'ap-12', quarter: 'Q3', region: 'Asia Pacific', channel: 'Partner Network', product: 'Analytics Pro', units: 290, discount_pct: 0.09, revenue: 485000 },
  { id: 'ap-13', quarter: 'Q3', region: 'Asia Pacific', channel: 'Online Portal', product: 'Security Shield', units: 380, discount_pct: 0.08, revenue: 320000 },
  { id: 'ap-14', quarter: 'Q3', region: 'Asia Pacific', channel: 'Key Accounts', product: 'Hardware Hub', units: 60, discount_pct: 0.07, revenue: 180000 },
  // Q4
  { id: 'ap-15', quarter: 'Q4', region: 'Asia Pacific', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 510, discount_pct: 0.08, revenue: 1680000 },
  { id: 'ap-16', quarter: 'Q4', region: 'Asia Pacific', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 230, discount_pct: 0.09, revenue: 770000 },
  { id: 'ap-17', quarter: 'Q4', region: 'Asia Pacific', channel: 'Online Portal', product: 'Security Shield', units: 420, discount_pct: 0.10, revenue: 360000 },
  { id: 'ap-18', quarter: 'Q4', region: 'Asia Pacific', channel: 'Partner Network', product: 'Analytics Pro', units: 310, discount_pct: 0.10, revenue: 520000 },

  // --- NORTH AMERICA (NA) ---
  // Q1
  { id: 'na-1', quarter: 'Q1', region: 'North America', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 450, discount_pct: 0.15, revenue: 1550000 },
  { id: 'na-2', quarter: 'Q1', region: 'North America', channel: 'Direct Sales', product: 'Analytics Pro', units: 580, discount_pct: 0.12, revenue: 1120000 },
  { id: 'na-3', quarter: 'Q1', region: 'North America', channel: 'Online Portal', product: 'Security Shield', units: 750, discount_pct: 0.05, revenue: 750000 },
  { id: 'na-4', quarter: 'Q1', region: 'North America', channel: 'Partner Network', product: 'Hardware Hub', units: 190, discount_pct: 0.10, revenue: 530000 },
  // Q2 (Total: $4,120,000)
  { id: 'na-5', quarter: 'Q2', region: 'North America', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 480, discount_pct: 0.14, revenue: 1650000 },
  { id: 'na-6', quarter: 'Q2', region: 'North America', channel: 'Direct Sales', product: 'Analytics Pro', units: 620, discount_pct: 0.12, revenue: 1190000 },
  { id: 'na-7', quarter: 'Q2', region: 'North America', channel: 'Online Portal', product: 'Security Shield', units: 720, discount_pct: 0.05, revenue: 720000 },
  { id: 'na-8', quarter: 'Q2', region: 'North America', channel: 'Partner Network', product: 'Hardware Hub', units: 200, discount_pct: 0.10, revenue: 560000 },
  // Q3 (Total: $4,580,000 -> Delta: +$460,000 or +11.2%)
  { id: 'na-9', quarter: 'Q3', region: 'North America', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 540, discount_pct: 0.12, revenue: 1880000 },
  { id: 'na-10', quarter: 'Q3', region: 'North America', channel: 'Direct Sales', product: 'Analytics Pro', units: 660, discount_pct: 0.10, revenue: 1310000 },
  { id: 'na-11', quarter: 'Q3', region: 'North America', channel: 'Online Portal', product: 'Security Shield', units: 790, discount_pct: 0.05, revenue: 790000 },
  { id: 'na-12', quarter: 'Q3', region: 'North America', channel: 'Partner Network', product: 'Hardware Hub', units: 210, discount_pct: 0.10, revenue: 600000 },
  // Q4
  { id: 'na-13', quarter: 'Q4', region: 'North America', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 610, discount_pct: 0.11, revenue: 2120000 },
  { id: 'na-14', quarter: 'Q4', region: 'North America', channel: 'Direct Sales', product: 'Analytics Pro', units: 710, discount_pct: 0.10, revenue: 1420000 },
  { id: 'na-15', quarter: 'Q4', region: 'North America', channel: 'Online Portal', product: 'Security Shield', units: 850, discount_pct: 0.05, revenue: 850000 },
  { id: 'na-16', quarter: 'Q4', region: 'North America', channel: 'Partner Network', product: 'Hardware Hub', units: 240, discount_pct: 0.09, revenue: 680000 },

  // --- EUROPE (EMEA) ---
  // Q1
  { id: 'eu-1', quarter: 'Q1', region: 'Europe', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 310, discount_pct: 0.10, revenue: 1100000 },
  { id: 'eu-2', quarter: 'Q1', region: 'Europe', channel: 'Partner Network', product: 'Analytics Pro', units: 420, discount_pct: 0.12, revenue: 840000 },
  { id: 'eu-3', quarter: 'Q1', region: 'Europe', channel: 'Online Portal', product: 'Security Shield', units: 510, discount_pct: 0.08, revenue: 490000 },
  { id: 'eu-4', quarter: 'Q1', region: 'Europe', channel: 'Key Accounts', product: 'Hardware Hub', units: 140, discount_pct: 0.07, revenue: 390000 },
  // Q2 (Total: $2,840,000)
  { id: 'eu-5', quarter: 'Q2', region: 'Europe', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 320, discount_pct: 0.10, revenue: 1120000 },
  { id: 'eu-6', quarter: 'Q2', region: 'Europe', channel: 'Partner Network', product: 'Analytics Pro', units: 430, discount_pct: 0.12, revenue: 860000 },
  { id: 'eu-7', quarter: 'Q2', region: 'Europe', channel: 'Online Portal', product: 'Security Shield', units: 490, discount_pct: 0.08, revenue: 480000 },
  { id: 'eu-8', quarter: 'Q2', region: 'Europe', channel: 'Key Accounts', product: 'Hardware Hub', units: 130, discount_pct: 0.08, revenue: 380000 },
  // Q3 (Total: $2,610,000 -> Delta: -$230,000 or -8.1%)
  { id: 'eu-9', quarter: 'Q3', region: 'Europe', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 290, discount_pct: 0.12, revenue: 1010000 },
  { id: 'eu-10', quarter: 'Q3', region: 'Europe', channel: 'Partner Network', product: 'Analytics Pro', units: 390, discount_pct: 0.14, revenue: 790000 },
  { id: 'eu-11', quarter: 'Q3', region: 'Europe', channel: 'Online Portal', product: 'Security Shield', units: 480, discount_pct: 0.08, revenue: 470000 },
  { id: 'eu-12', quarter: 'Q3', region: 'Europe', channel: 'Key Accounts', product: 'Hardware Hub', units: 120, discount_pct: 0.09, revenue: 340000 },
  // Q4
  { id: 'eu-13', quarter: 'Q4', region: 'Europe', channel: 'Direct Sales', product: 'Enterprise Cloud Suite', units: 360, discount_pct: 0.10, revenue: 1260000 },
  { id: 'eu-14', quarter: 'Q4', region: 'Europe', channel: 'Partner Network', product: 'Analytics Pro', units: 470, discount_pct: 0.11, revenue: 950000 },
  { id: 'eu-15', quarter: 'Q4', region: 'Europe', channel: 'Online Portal', product: 'Security Shield', units: 530, discount_pct: 0.08, revenue: 520000 },
  { id: 'eu-16', quarter: 'Q4', region: 'Europe', channel: 'Key Accounts', product: 'Hardware Hub', units: 150, discount_pct: 0.07, revenue: 420000 },

  // --- LATIN AMERICA (LATAM) ---
  // Q1
  { id: 'la-1', quarter: 'Q1', region: 'Latin America', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 90, discount_pct: 0.18, revenue: 320000 },
  { id: 'la-2', quarter: 'Q1', region: 'Latin America', channel: 'Direct Sales', product: 'Analytics Pro', units: 140, discount_pct: 0.16, revenue: 260000 },
  { id: 'la-3', quarter: 'Q1', region: 'Latin America', channel: 'Online Portal', product: 'Security Shield', units: 280, discount_pct: 0.12, revenue: 250000 },
  // Q2 (Total: $920,000)
  { id: 'la-4', quarter: 'Q2', region: 'Latin America', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 110, discount_pct: 0.18, revenue: 380000 },
  { id: 'la-5', quarter: 'Q2', region: 'Latin America', channel: 'Direct Sales', product: 'Analytics Pro', units: 150, discount_pct: 0.15, revenue: 275000 },
  { id: 'la-6', quarter: 'Q2', region: 'Latin America', channel: 'Online Portal', product: 'Security Shield', units: 300, discount_pct: 0.11, revenue: 265000 },
  // Q3 (Total: $1,150,000 -> Delta: +$230,000 or +25.0%)
  { id: 'la-7', quarter: 'Q3', region: 'Latin America', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 150, discount_pct: 0.16, revenue: 520000 },
  { id: 'la-8', quarter: 'Q3', region: 'Latin America', channel: 'Direct Sales', product: 'Analytics Pro', units: 180, discount_pct: 0.14, revenue: 330000 },
  { id: 'la-9', quarter: 'Q3', region: 'Latin America', channel: 'Online Portal', product: 'Security Shield', units: 330, discount_pct: 0.10, revenue: 300000 },
  // Q4
  { id: 'la-10', quarter: 'Q4', region: 'Latin America', channel: 'Partner Network', product: 'Enterprise Cloud Suite', units: 170, discount_pct: 0.15, revenue: 590000 },
  { id: 'la-11', quarter: 'Q4', region: 'Latin America', channel: 'Direct Sales', product: 'Analytics Pro', units: 200, discount_pct: 0.13, revenue: 370000 },
  { id: 'la-12', quarter: 'Q4', region: 'Latin America', channel: 'Online Portal', product: 'Security Shield', units: 360, discount_pct: 0.09, revenue: 330000 },

  // --- MIDDLE EAST & AFRICA (MEA) ---
  // Q1
  { id: 'me-1', quarter: 'Q1', region: 'Middle East', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 60, discount_pct: 0.15, revenue: 230000 },
  { id: 'me-2', quarter: 'Q1', region: 'Middle East', channel: 'Direct Sales', product: 'Analytics Pro', units: 80, discount_pct: 0.14, revenue: 160000 },
  { id: 'me-3', quarter: 'Q1', region: 'Middle East', channel: 'Online Portal', product: 'Security Shield', units: 150, discount_pct: 0.10, revenue: 140000 },
  // Q2 (Total: $580,000)
  { id: 'me-4', quarter: 'Q2', region: 'Middle East', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 70, discount_pct: 0.15, revenue: 260000 },
  { id: 'me-5', quarter: 'Q2', region: 'Middle East', channel: 'Direct Sales', product: 'Analytics Pro', units: 90, discount_pct: 0.14, revenue: 175000 },
  { id: 'me-6', quarter: 'Q2', region: 'Middle East', channel: 'Online Portal', product: 'Security Shield', units: 160, discount_pct: 0.10, revenue: 145000 },
  // Q3 (Total: $710,000 -> Delta: +$130,000 or +22.4%)
  { id: 'me-7', quarter: 'Q3', region: 'Middle East', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 90, discount_pct: 0.14, revenue: 330000 },
  { id: 'me-8', quarter: 'Q3', region: 'Middle East', channel: 'Direct Sales', product: 'Analytics Pro', units: 110, discount_pct: 0.12, revenue: 215000 },
  { id: 'me-9', quarter: 'Q3', region: 'Middle East', channel: 'Online Portal', product: 'Security Shield', units: 180, discount_pct: 0.09, revenue: 165000 },
  // Q4
  { id: 'me-10', quarter: 'Q4', region: 'Middle East', channel: 'Key Accounts', product: 'Enterprise Cloud Suite', units: 100, discount_pct: 0.13, revenue: 370000 },
  { id: 'me-11', quarter: 'Q4', region: 'Middle East', channel: 'Direct Sales', product: 'Analytics Pro', units: 130, discount_pct: 0.11, revenue: 250000 },
  { id: 'me-12', quarter: 'Q4', region: 'Middle East', channel: 'Online Portal', product: 'Security Shield', units: 210, discount_pct: 0.09, revenue: 190000 },
];

export function generateCsvString(orders: SalesOrder[]): string {
  const headers = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];
  const rows = orders.map((o) => [
    `"${o.quarter}"`,
    `"${o.region}"`,
    `"${o.channel}"`,
    `"${o.product}"`,
    o.units,
    (o.discount_pct * 100).toFixed(1) + '%',
    o.revenue.toFixed(2),
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

export function downloadSampleCsvFile(orders: SalesOrder[] = SAMPLE_SALES_ORDERS, filename = 'sales_orders_dataset.csv') {
  const csvContent = generateCsvString(orders);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export interface SalesOrder {
  id: string;
  quarter: string; // 'Q1', 'Q2', 'Q3', 'Q4' (normalized)
  region: string;
  channel: string;
  product: string;
  units: number;
  discount_pct: number; // 0.15 = 15%
  revenue: number;
  rawQuarter?: string;
}

export interface ProductDriver {
  product: string;
  q2Rev: number;
  q3Rev: number;
  delta: number;
  pctDelta: number;
  unitsQ2: number;
  unitsQ3: number;
}

export interface ChannelDriver {
  channel: string;
  q2Rev: number;
  q3Rev: number;
  delta: number;
  pctDelta: number;
  unitsQ2: number;
  unitsQ3: number;
}

export interface RegionQuarterStats {
  region: string;
  q1: number;
  q2: number;
  q3: number;
  q4: number;
  totalRevenue: number;
  q2ToQ3Delta: number;
  q2ToQ3PctDelta: number;
  unitsQ1: number;
  unitsQ2: number;
  unitsQ3: number;
  unitsQ4: number;
  totalUnits: number;
  avgDiscountQ1: number;
  avgDiscountQ2: number;
  avgDiscountQ3: number;
  avgDiscountQ4: number;
  productDrivers: ProductDriver[];
  channelDrivers: ChannelDriver[];
}

export interface AnalysisCalculations {
  quartersPresent: string[];
  regions: string[];
  regionStats: RegionQuarterStats[];
  totalCompany: {
    q1Rev: number;
    q2Rev: number;
    q3Rev: number;
    q4Rev: number;
    totalRev: number;
    q2ToQ3Delta: number;
    q2ToQ3PctDelta: number;
    totalUnits: number;
    avgDiscount: number;
  };
  mostChangedByAbsolute: {
    region: string;
    q2Revenue: number;
    q3Revenue: number;
    delta: number;
    pctDelta: number;
    unitsQ2: number;
    unitsQ3: number;
    avgDiscountQ2: number;
    avgDiscountQ3: number;
    topProductDrivers: ProductDriver[];
    topChannelDrivers: ChannelDriver[];
  } | null;
  mostChangedByPercentage: {
    region: string;
    q2Revenue: number;
    q3Revenue: number;
    delta: number;
    pctDelta: number;
    unitsQ2: number;
    unitsQ3: number;
    avgDiscountQ2: number;
    avgDiscountQ3: number;
    topProductDrivers: ProductDriver[];
    topChannelDrivers: ChannelDriver[];
  } | null;
}

export interface AISummaryResponse {
  summary: string;
  source: string;
  error?: string;
  usedData?: any;
}

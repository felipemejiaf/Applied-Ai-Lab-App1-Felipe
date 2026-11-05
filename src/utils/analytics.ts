import { AnalysisCalculations, ChannelDriver, ProductDriver, RegionQuarterStats, SalesOrder } from '../types';

export function calculateSalesAnalytics(orders: SalesOrder[]): AnalysisCalculations {
  const regionsSet = new Set<string>();
  const quartersSet = new Set<string>();

  orders.forEach((o) => {
    if (o.region) regionsSet.add(o.region);
    if (o.quarter) quartersSet.add(o.quarter);
  });

  const regions = Array.from(regionsSet).sort();
  // Sort quarters in natural order Q1 -> Q2 -> Q3 -> Q4
  const quarterOrder = ['Q1', 'Q2', 'Q3', 'Q4'];
  const quartersPresent = Array.from(quartersSet).sort((a, b) => {
    const idxA = quarterOrder.indexOf(a);
    const idxB = quarterOrder.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
  });

  const regionStatsMap = new Map<string, RegionQuarterStats>();

  regions.forEach((reg) => {
    regionStatsMap.set(reg, {
      region: reg,
      q1: 0,
      q2: 0,
      q3: 0,
      q4: 0,
      totalRevenue: 0,
      q2ToQ3Delta: 0,
      q2ToQ3PctDelta: 0,
      unitsQ1: 0,
      unitsQ2: 0,
      unitsQ3: 0,
      unitsQ4: 0,
      totalUnits: 0,
      avgDiscountQ1: 0,
      avgDiscountQ2: 0,
      avgDiscountQ3: 0,
      avgDiscountQ4: 0,
      productDrivers: [],
      channelDrivers: [],
    });
  });

  // Track discounts for weighted averages
  const discountTrackers = new Map<
    string,
    {
      q1Revenue: number;
      q1DiscSum: number;
      q2Revenue: number;
      q2DiscSum: number;
      q3Revenue: number;
      q3DiscSum: number;
      q4Revenue: number;
      q4DiscSum: number;
    }
  >();

  regions.forEach((r) => {
    discountTrackers.set(r, {
      q1Revenue: 0,
      q1DiscSum: 0,
      q2Revenue: 0,
      q2DiscSum: 0,
      q3Revenue: 0,
      q3DiscSum: 0,
      q4Revenue: 0,
      q4DiscSum: 0,
    });
  });

  // Region x Product and Region x Channel trackers for Q2 vs Q3
  const regionProductMap = new Map<string, Map<string, { q2Rev: number; q3Rev: number; u2: number; u3: number }>>();
  const regionChannelMap = new Map<string, Map<string, { q2Rev: number; q3Rev: number; u2: number; u3: number }>>();

  regions.forEach((r) => {
    regionProductMap.set(r, new Map());
    regionChannelMap.set(r, new Map());
  });

  orders.forEach((o) => {
    const stats = regionStatsMap.get(o.region);
    const disc = discountTrackers.get(o.region);
    if (!stats || !disc) return;

    stats.totalRevenue += o.revenue;
    stats.totalUnits += o.units;

    if (o.quarter === 'Q1') {
      stats.q1 += o.revenue;
      stats.unitsQ1 += o.units;
      disc.q1Revenue += o.revenue;
      disc.q1DiscSum += o.discount_pct * o.revenue;
    } else if (o.quarter === 'Q2') {
      stats.q2 += o.revenue;
      stats.unitsQ2 += o.units;
      disc.q2Revenue += o.revenue;
      disc.q2DiscSum += o.discount_pct * o.revenue;

      // Track Q2 product
      const prodMap = regionProductMap.get(o.region)!;
      const pEntry = prodMap.get(o.product) || { q2Rev: 0, q3Rev: 0, u2: 0, u3: 0 };
      pEntry.q2Rev += o.revenue;
      pEntry.u2 += o.units;
      prodMap.set(o.product, pEntry);

      // Track Q2 channel
      const chanMap = regionChannelMap.get(o.region)!;
      const cEntry = chanMap.get(o.channel) || { q2Rev: 0, q3Rev: 0, u2: 0, u3: 0 };
      cEntry.q2Rev += o.revenue;
      cEntry.u2 += o.units;
      chanMap.set(o.channel, cEntry);
    } else if (o.quarter === 'Q3') {
      stats.q3 += o.revenue;
      stats.unitsQ3 += o.units;
      disc.q3Revenue += o.revenue;
      disc.q3DiscSum += o.discount_pct * o.revenue;

      // Track Q3 product
      const prodMap = regionProductMap.get(o.region)!;
      const pEntry = prodMap.get(o.product) || { q2Rev: 0, q3Rev: 0, u2: 0, u3: 0 };
      pEntry.q3Rev += o.revenue;
      pEntry.u3 += o.units;
      prodMap.set(o.product, pEntry);

      // Track Q3 channel
      const chanMap = regionChannelMap.get(o.region)!;
      const cEntry = chanMap.get(o.channel) || { q2Rev: 0, q3Rev: 0, u2: 0, u3: 0 };
      cEntry.q3Rev += o.revenue;
      cEntry.u3 += o.units;
      chanMap.set(o.channel, cEntry);
    } else if (o.quarter === 'Q4') {
      stats.q4 += o.revenue;
      stats.unitsQ4 += o.units;
      disc.q4Revenue += o.revenue;
      disc.q4DiscSum += o.discount_pct * o.revenue;
    }
  });

  const regionStats: RegionQuarterStats[] = [];

  regions.forEach((r) => {
    const stats = regionStatsMap.get(r)!;
    const disc = discountTrackers.get(r)!;

    stats.avgDiscountQ1 = disc.q1Revenue > 0 ? (disc.q1DiscSum / disc.q1Revenue) * 100 : 0;
    stats.avgDiscountQ2 = disc.q2Revenue > 0 ? (disc.q2DiscSum / disc.q2Revenue) * 100 : 0;
    stats.avgDiscountQ3 = disc.q3Revenue > 0 ? (disc.q3DiscSum / disc.q3Revenue) * 100 : 0;
    stats.avgDiscountQ4 = disc.q4Revenue > 0 ? (disc.q4DiscSum / disc.q4Revenue) * 100 : 0;

    stats.q2ToQ3Delta = stats.q3 - stats.q2;
    stats.q2ToQ3PctDelta = stats.q2 > 0 ? ((stats.q3 - stats.q2) / stats.q2) * 100 : 0;

    // Build Product Drivers
    const prodMap = regionProductMap.get(r)!;
    const productDrivers: ProductDriver[] = [];
    prodMap.forEach((val, prodName) => {
      const delta = val.q3Rev - val.q2Rev;
      const pctDelta = val.q2Rev > 0 ? ((val.q3Rev - val.q2Rev) / val.q2Rev) * 100 : 0;
      productDrivers.push({
        product: prodName,
        q2Rev: val.q2Rev,
        q3Rev: val.q3Rev,
        delta,
        pctDelta,
        unitsQ2: val.u2,
        unitsQ3: val.u3,
      });
    });
    // Sort products by absolute dollar delta descending
    productDrivers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    stats.productDrivers = productDrivers;

    // Build Channel Drivers
    const chanMap = regionChannelMap.get(r)!;
    const channelDrivers: ChannelDriver[] = [];
    chanMap.forEach((val, chanName) => {
      const delta = val.q3Rev - val.q2Rev;
      const pctDelta = val.q2Rev > 0 ? ((val.q3Rev - val.q2Rev) / val.q2Rev) * 100 : 0;
      channelDrivers.push({
        channel: chanName,
        q2Rev: val.q2Rev,
        q3Rev: val.q3Rev,
        delta,
        pctDelta,
        unitsQ2: val.u2,
        unitsQ3: val.u3,
      });
    });
    // Sort channels by absolute dollar delta descending
    channelDrivers.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    stats.channelDrivers = channelDrivers;

    regionStats.push(stats);
  });

  // Calculate Company Totals
  const totalCompany = {
    q1Rev: regionStats.reduce((sum, r) => sum + r.q1, 0),
    q2Rev: regionStats.reduce((sum, r) => sum + r.q2, 0),
    q3Rev: regionStats.reduce((sum, r) => sum + r.q3, 0),
    q4Rev: regionStats.reduce((sum, r) => sum + r.q4, 0),
    totalRev: regionStats.reduce((sum, r) => sum + r.totalRevenue, 0),
    q2ToQ3Delta: 0,
    q2ToQ3PctDelta: 0,
    totalUnits: regionStats.reduce((sum, r) => sum + r.totalUnits, 0),
    avgDiscount: 0,
  };
  totalCompany.q2ToQ3Delta = totalCompany.q3Rev - totalCompany.q2Rev;
  totalCompany.q2ToQ3PctDelta =
    totalCompany.q2Rev > 0
      ? ((totalCompany.q3Rev - totalCompany.q2Rev) / totalCompany.q2Rev) * 100
      : 0;

  let totalRevenueForDisc = 0;
  let totalDiscWeightedSum = 0;
  orders.forEach((o) => {
    totalRevenueForDisc += o.revenue;
    totalDiscWeightedSum += o.discount_pct * o.revenue;
  });
  totalCompany.avgDiscount =
    totalRevenueForDisc > 0 ? (totalDiscWeightedSum / totalRevenueForDisc) * 100 : 0;

  // Determine Most Changed Region by Absolute Dollar Amount
  let mostChangedByAbsolute: AnalysisCalculations['mostChangedByAbsolute'] = null;
  let maxAbsDelta = -1;

  regionStats.forEach((r) => {
    const absDelta = Math.abs(r.q2ToQ3Delta);
    if (absDelta > maxAbsDelta) {
      maxAbsDelta = absDelta;
      mostChangedByAbsolute = {
        region: r.region,
        q2Revenue: r.q2,
        q3Revenue: r.q3,
        delta: r.q2ToQ3Delta,
        pctDelta: r.q2ToQ3PctDelta,
        unitsQ2: r.unitsQ2,
        unitsQ3: r.unitsQ3,
        avgDiscountQ2: r.avgDiscountQ2,
        avgDiscountQ3: r.avgDiscountQ3,
        topProductDrivers: r.productDrivers.slice(0, 3),
        topChannelDrivers: r.channelDrivers.slice(0, 3),
      };
    }
  });

  // Determine Most Changed Region by Percentage
  let mostChangedByPercentage: AnalysisCalculations['mostChangedByPercentage'] = null;
  let maxAbsPctDelta = -1;

  regionStats.forEach((r) => {
    // Only consider regions with non-trivial base revenue in Q2 to avoid division anomalies
    if (r.q2 > 0) {
      const absPct = Math.abs(r.q2ToQ3PctDelta);
      if (absPct > maxAbsPctDelta) {
        maxAbsPctDelta = absPct;
        mostChangedByPercentage = {
          region: r.region,
          q2Revenue: r.q2,
          q3Revenue: r.q3,
          delta: r.q2ToQ3Delta,
          pctDelta: r.q2ToQ3PctDelta,
          unitsQ2: r.unitsQ2,
          unitsQ3: r.unitsQ3,
          avgDiscountQ2: r.avgDiscountQ2,
          avgDiscountQ3: r.avgDiscountQ3,
          topProductDrivers: r.productDrivers.slice(0, 3),
          topChannelDrivers: r.channelDrivers.slice(0, 3),
        };
      }
    }
  });

  return {
    quartersPresent,
    regions,
    regionStats,
    totalCompany,
    mostChangedByAbsolute,
    mostChangedByPercentage,
  };
}

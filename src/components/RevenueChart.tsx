import React, { useState } from 'react';
import { AnalysisCalculations, RegionQuarterStats } from '../types';
import { BarChart3, TrendingUp, Layers, ArrowRight, Check } from 'lucide-react';

interface RevenueChartProps {
  calculations: AnalysisCalculations;
  highlightedRegion?: string;
  onSelectRegion?: (region: string) => void;
}

const REGION_COLORS: Record<string, { bg: string; border: string; hex: string; fillClass: string }> = {
  'North America': { bg: 'bg-blue-500', border: 'border-blue-400', hex: '#3b82f6', fillClass: 'fill-blue-500' },
  'Europe': { bg: 'bg-emerald-500', border: 'border-emerald-400', hex: '#10b981', fillClass: 'fill-emerald-500' },
  'Asia Pacific': { bg: 'bg-violet-500', border: 'border-violet-400', hex: '#8b5cf6', fillClass: 'fill-violet-500' },
  'Latin America': { bg: 'bg-amber-500', border: 'border-amber-400', hex: '#f59e0b', fillClass: 'fill-amber-500' },
  'Middle East': { bg: 'bg-rose-500', border: 'border-rose-400', hex: '#f43f5e', fillClass: 'fill-rose-500' },
};

const DEFAULT_COLOR_PALETTE = ['#06b6d4', '#ec4899', '#84cc16', '#a855f7', '#14b8a6'];

export function getColorForRegion(region: string, idx = 0) {
  if (REGION_COLORS[region]) return REGION_COLORS[region];
  const hex = DEFAULT_COLOR_PALETTE[idx % DEFAULT_COLOR_PALETTE.length];
  return { bg: 'bg-indigo-500', border: 'border-indigo-400', hex, fillClass: 'fill-indigo-500' };
}

export function formatCurrencyShort(val: number): string {
  if (Math.abs(val) >= 1_000_000) {
    return `$${(val / 1_000_000).toFixed(2)}M`;
  }
  if (Math.abs(val) >= 1_000) {
    return `$${(val / 1_000).toFixed(0)}k`;
  }
  return `$${val.toFixed(0)}`;
}

export function formatCurrencyFull(val: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
}

export const RevenueChart: React.FC<RevenueChartProps> = ({
  calculations,
  highlightedRegion,
  onSelectRegion,
}) => {
  const [chartMode, setChartMode] = useState<'grouped' | 'q2q3focus' | 'stacked'>('grouped');
  const [hoveredData, setHoveredData] = useState<{
    title: string;
    items: { label: string; value: number; color: string; note?: string }[];
  } | null>(null);

  const { quartersPresent, regionStats } = calculations;

  // Calculate maximum values for scale
  const maxQuarterRev = Math.max(
    ...regionStats.flatMap((r) => [r.q1, r.q2, r.q3, r.q4]),
    1000
  );

  // For stacked mode: max total revenue per quarter
  const quarterTotals = quartersPresent.map((q) => {
    const key = q.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
    const sum = regionStats.reduce((acc, r) => acc + (r[key] || 0), 0);
    return { quarter: q, total: sum };
  });
  const maxStackedTotal = Math.max(...quarterTotals.map((qt) => qt.total), 1000);

  // For Q2 vs Q3 comparison mode: find max delta or max Q2/Q3
  const maxQ2Q3 = Math.max(
    ...regionStats.flatMap((r) => [r.q2, r.q3]),
    1000
  );

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative flex flex-col">
      {/* Top Header & Chart Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-semibold text-slate-100">
              Total Revenue by Region &amp; Quarter
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare regional volume trends across quarters with direct emphasis on Q2 &rarr; Q3 movements
          </p>
        </div>

        {/* View Switcher Buttons */}
        <div className="inline-flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setChartMode('grouped')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'grouped'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Quarterly Comparison
          </button>
          <button
            type="button"
            onClick={() => setChartMode('q2q3focus')}
            className={`px-3 py-1.5 rounded-md font-medium flex items-center gap-1.5 transition-all ${
              chartMode === 'q2q3focus'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>Q2 &rarr; Q3 Shift Focus</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          </button>
          <button
            type="button"
            onClick={() => setChartMode('stacked')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              chartMode === 'stacked'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Stacked Mix
          </button>
        </div>
      </div>

      {/* Chart Canvas Area */}
      <div className="relative min-h-[340px] flex-1 flex flex-col justify-end pt-4 pb-2">
        {/* Hover Tooltip Popup */}
        {hoveredData && (
          <div className="absolute top-2 right-4 z-20 bg-slate-950/95 backdrop-blur border border-slate-700 p-3 rounded-lg shadow-xl text-xs max-w-xs animate-in fade-in duration-150 pointer-events-none">
            <div className="font-semibold text-slate-200 pb-1.5 mb-1.5 border-b border-slate-800">
              {hoveredData.title}
            </div>
            <div className="space-y-1">
              {hoveredData.items.map((it, idx) => (
                <div key={idx} className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2.5 h-2.5 rounded-sm inline-block shrink-0"
                      style={{ backgroundColor: it.color }}
                    />
                    <span className="text-slate-300 truncate max-w-[120px]">{it.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-medium text-slate-100">
                      {formatCurrencyFull(it.value)}
                    </span>
                    {it.note && <span className="text-[10px] text-slate-400 ml-1.5">({it.note})</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 1: GROUPED BAR CHART (Quarter groups on X-axis, Region bars within) --- */}
        {chartMode === 'grouped' && (
          <div className="w-full flex flex-col justify-end h-[300px]">
            {/* Gridlines */}
            <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between pointer-events-none opacity-20">
              <div className="border-b border-slate-600 w-full flex justify-between text-[10px] text-slate-400 px-1">
                <span>{formatCurrencyShort(maxQuarterRev)}</span>
              </div>
              <div className="border-b border-slate-600 w-full flex justify-between text-[10px] text-slate-400 px-1">
                <span>{formatCurrencyShort(maxQuarterRev * 0.75)}</span>
              </div>
              <div className="border-b border-slate-600 w-full flex justify-between text-[10px] text-slate-400 px-1">
                <span>{formatCurrencyShort(maxQuarterRev * 0.5)}</span>
              </div>
              <div className="border-b border-slate-600 w-full flex justify-between text-[10px] text-slate-400 px-1">
                <span>{formatCurrencyShort(maxQuarterRev * 0.25)}</span>
              </div>
              <div className="border-b border-slate-600 w-full" />
            </div>

            {/* Bars container */}
            <div className="grid grid-cols-4 gap-4 h-[240px] items-end px-2 z-10">
              {quartersPresent.map((quarter) => {
                const qKey = quarter.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
                const isQ2orQ3 = quarter === 'Q2' || quarter === 'Q3';

                return (
                  <div
                    key={quarter}
                    className={`flex flex-col items-center h-full justify-end rounded-lg p-2 transition-colors ${
                      isQ2orQ3 ? 'bg-slate-800/40 border border-slate-700/50' : 'bg-transparent'
                    }`}
                  >
                    {/* Bar Cluster */}
                    <div className="flex items-end justify-center gap-1.5 w-full h-[200px]">
                      {regionStats.map((r, rIdx) => {
                        const val = r[qKey] || 0;
                        const heightPct = Math.max(2, (val / maxQuarterRev) * 100);
                        const colorInfo = getColorForRegion(r.region, rIdx);
                        const isHighlighted = highlightedRegion === r.region;

                        return (
                          <div
                            key={r.region}
                            className="relative flex-1 max-w-[28px] h-full flex items-end group cursor-pointer"
                            onClick={() => onSelectRegion?.(r.region)}
                            onMouseEnter={() =>
                              setHoveredData({
                                title: `${r.region} • ${quarter}`,
                                items: [
                                  {
                                    label: 'Revenue',
                                    value: val,
                                    color: colorInfo.hex,
                                  },
                                  {
                                    label: 'Total Units',
                                    value: r[`units${quarter}` as keyof RegionQuarterStats] as number || 0,
                                    color: '#94a3b8',
                                    note: 'units',
                                  },
                                ],
                              })
                            }
                            onMouseLeave={() => setHoveredData(null)}
                          >
                            <div
                              style={{
                                height: `${heightPct}%`,
                                backgroundColor: colorInfo.hex,
                              }}
                              className={`w-full rounded-t transition-all duration-300 group-hover:brightness-125 ${
                                isHighlighted ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900' : ''
                              }`}
                            />
                          </div>
                        );
                      })}
                    </div>

                    {/* Quarter Label */}
                    <div className="mt-2 text-center">
                      <span className={`text-xs font-semibold ${isQ2orQ3 ? 'text-amber-400' : 'text-slate-300'}`}>
                        {quarter}
                      </span>
                      {quarter === 'Q2' && <span className="block text-[9px] text-slate-400">Baseline</span>}
                      {quarter === 'Q3' && <span className="block text-[9px] text-amber-300 font-medium">Comparison</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 2: Q2 vs Q3 COMPARISON FOCUS --- */}
        {chartMode === 'q2q3focus' && (
          <div className="w-full flex flex-col justify-end h-[300px]">
            <div className="text-xs text-amber-400/90 bg-amber-950/30 border border-amber-800/40 rounded-lg p-2.5 mb-3 flex items-center justify-between">
              <span>Comparing Q2 Revenue (Baseline) directly against Q3 Revenue (Target) for all regions:</span>
              <span className="font-semibold text-slate-200">
                Most Changed Region: {calculations.mostChangedByAbsolute?.region}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-3 h-[220px] items-end px-2 z-10">
              {regionStats.map((r, rIdx) => {
                const colorInfo = getColorForRegion(r.region, rIdx);
                const q2Height = Math.max(3, (r.q2 / maxQ2Q3) * 100);
                const q3Height = Math.max(3, (r.q3 / maxQ2Q3) * 100);
                const delta = r.q2ToQ3Delta;
                const isPositive = delta >= 0;
                const isMostChanged = calculations.mostChangedByAbsolute?.region === r.region;

                return (
                  <div
                    key={r.region}
                    className={`flex flex-col items-center h-full justify-end rounded-lg p-2 transition-all cursor-pointer ${
                      isMostChanged
                        ? 'bg-indigo-950/40 border-2 border-indigo-500 shadow-lg shadow-indigo-950/50'
                        : 'bg-slate-800/30 border border-slate-700/50 hover:bg-slate-800/60'
                    }`}
                    onClick={() => onSelectRegion?.(r.region)}
                    onMouseEnter={() =>
                      setHoveredData({
                        title: `${r.region} • Q2 vs Q3 Shift`,
                        items: [
                          { label: 'Q2 Revenue', value: r.q2, color: '#64748b' },
                          { label: 'Q3 Revenue', value: r.q3, color: colorInfo.hex },
                          {
                            label: 'Net Delta',
                            value: delta,
                            color: isPositive ? '#10b981' : '#f43f5e',
                            note: `${isPositive ? '+' : ''}${r.q2ToQ3PctDelta.toFixed(1)}%`,
                          },
                        ],
                      })
                    }
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    {/* Delta Badge at top */}
                    <div
                      className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded mb-1.5 ${
                        isPositive
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                          : 'bg-rose-950/80 text-rose-400 border border-rose-800/60'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {formatCurrencyShort(delta)}
                    </div>

                    {/* Side-by-side Q2 (gray) vs Q3 (colored) bars */}
                    <div className="flex items-end justify-center gap-2 w-full h-[140px]">
                      {/* Q2 Bar */}
                      <div className="flex-1 max-w-[20px] h-full flex flex-col justify-end items-center">
                        <div
                          style={{ height: `${q2Height}%` }}
                          className="w-full bg-slate-600 rounded-t hover:bg-slate-500 transition-all"
                        />
                        <span className="text-[9px] text-slate-400 mt-1">Q2</span>
                      </div>

                      {/* Q3 Bar */}
                      <div className="flex-1 max-w-[20px] h-full flex flex-col justify-end items-center">
                        <div
                          style={{
                            height: `${q3Height}%`,
                            backgroundColor: colorInfo.hex,
                          }}
                          className="w-full rounded-t hover:brightness-125 transition-all shadow-sm"
                        />
                        <span className="text-[9px] font-semibold text-slate-200 mt-1">Q3</span>
                      </div>
                    </div>

                    {/* Region Name */}
                    <div className="mt-2 text-center">
                      <span className="text-[11px] font-medium text-slate-200 line-clamp-1">
                        {r.region}
                      </span>
                      {isMostChanged && (
                        <span className="inline-block text-[8px] uppercase tracking-wider text-amber-300 font-bold px-1 bg-amber-950/80 rounded border border-amber-800/60">
                          Largest Shift
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 3: STACKED MIX --- */}
        {chartMode === 'stacked' && (
          <div className="w-full flex flex-col justify-end h-[300px]">
            <div className="grid grid-cols-4 gap-6 h-[240px] items-end px-4 z-10">
              {quartersPresent.map((quarter) => {
                const qKey = quarter.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
                const totalForQuarter = regionStats.reduce((sum, r) => sum + (r[qKey] || 0), 0);
                const heightPct = Math.max(5, (totalForQuarter / maxStackedTotal) * 100);

                return (
                  <div
                    key={quarter}
                    className="flex flex-col items-center h-full justify-end"
                    onMouseEnter={() =>
                      setHoveredData({
                        title: `${quarter} Regional Breakdown (Total: ${formatCurrencyFull(totalForQuarter)})`,
                        items: regionStats.map((r, rIdx) => ({
                          label: r.region,
                          value: r[qKey] || 0,
                          color: getColorForRegion(r.region, rIdx).hex,
                          note: `${totalForQuarter > 0 ? (((r[qKey] || 0) / totalForQuarter) * 100).toFixed(1) : 0}%`,
                        })),
                      })
                    }
                    onMouseLeave={() => setHoveredData(null)}
                  >
                    <div className="text-[11px] font-mono text-slate-300 mb-1">
                      {formatCurrencyShort(totalForQuarter)}
                    </div>
                    {/* Stacked Bar Column */}
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-16 rounded-t overflow-hidden flex flex-col-reverse shadow-md border border-slate-700/60"
                    >
                      {regionStats.map((r, rIdx) => {
                        const val = r[qKey] || 0;
                        const segPct = totalForQuarter > 0 ? (val / totalForQuarter) * 100 : 0;
                        const colorInfo = getColorForRegion(r.region, rIdx);

                        return (
                          <div
                            key={r.region}
                            style={{
                              height: `${segPct}%`,
                              backgroundColor: colorInfo.hex,
                            }}
                            className="w-full hover:brightness-125 transition-all"
                            title={`${r.region}: ${formatCurrencyFull(val)}`}
                          />
                        );
                      })}
                    </div>
                    <span className="text-xs font-semibold text-slate-300 mt-2">{quarter}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend & Quick Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-2 border-t border-slate-800 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-slate-400 font-medium">Regions:</span>
          {regionStats.map((r, idx) => {
            const colorInfo = getColorForRegion(r.region, idx);
            const isHighlighted = highlightedRegion === r.region;

            return (
              <button
                key={r.region}
                type="button"
                onClick={() => onSelectRegion?.(r.region)}
                className={`inline-flex items-center gap-1.5 px-2 py-1 rounded transition-all ${
                  isHighlighted
                    ? 'bg-slate-700 text-white font-medium ring-1 ring-slate-400'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-sm"
                  style={{ backgroundColor: colorInfo.hex }}
                />
                <span>{r.region}</span>
              </button>
            );
          })}
        </div>

        {calculations.mostChangedByAbsolute && (
          <div className="text-slate-400 flex items-center gap-1.5 text-[11px]">
            <span className="text-slate-300 font-medium">Biggest Q2 &rarr; Q3 Delta:</span>
            <span className="font-semibold text-amber-400">
              {calculations.mostChangedByAbsolute.region} (
              {calculations.mostChangedByAbsolute.delta >= 0 ? '+' : ''}
              {formatCurrencyShort(calculations.mostChangedByAbsolute.delta)})
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

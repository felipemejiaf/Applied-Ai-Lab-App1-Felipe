import React, { useState } from 'react';
import { AnalysisCalculations, RegionQuarterStats } from '../types';
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  ChevronRight,
  Download,
  Flame,
  HelpCircle,
  Package,
  Share2,
} from 'lucide-react';
import { formatCurrencyFull, formatCurrencyShort, getColorForRegion } from './RevenueChart';

interface RevenuePivotTableProps {
  calculations: AnalysisCalculations;
  selectedRegion?: string;
  onSelectRegion?: (region: string) => void;
}

type SortField = 'region' | 'q1' | 'q2' | 'q3' | 'q4' | 'totalRevenue' | 'q2ToQ3Delta' | 'q2ToQ3PctDelta' | 'totalUnits';

export const RevenuePivotTable: React.FC<RevenuePivotTableProps> = ({
  calculations,
  selectedRegion,
  onSelectRegion,
}) => {
  const [sortField, setSortField] = useState<SortField>('q2ToQ3Delta');
  const [sortAsc, setSortAsc] = useState<boolean>(false); // default descending (largest delta first)
  const [expandedRegions, setExpandedRegions] = useState<Set<string>>(new Set());

  const { quartersPresent, regionStats, totalCompany } = calculations;

  const toggleExpand = (region: string) => {
    const next = new Set(expandedRegions);
    if (next.has(region)) {
      next.delete(region);
    } else {
      next.add(region);
    }
    setExpandedRegions(next);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      // default descending for numeric fields, ascending for text
      setSortAsc(field === 'region');
    }
  };

  const sortedStats = [...regionStats].sort((a, b) => {
    let aVal = a[sortField];
    let bVal = b[sortField];

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    const numA = (aVal as number) || 0;
    const numB = (bVal as number) || 0;
    return sortAsc ? numA - numB : numB - numA;
  });

  const exportPivotCsv = () => {
    const headers = ['Region', ...quartersPresent, 'Total Revenue', 'Q2 to Q3 Delta ($)', 'Q2 to Q3 Delta (%)', 'Total Units'];
    const rows = regionStats.map((r) => [
      `"${r.region}"`,
      ...quartersPresent.map((q) => {
        const key = q.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
        return r[key] || 0;
      }),
      r.totalRevenue,
      r.q2ToQ3Delta,
      r.q2ToQ3PctDelta.toFixed(2) + '%',
      r.totalUnits,
    ]);

    const companyRow = [
      '"Total Company"',
      ...quartersPresent.map((q) => {
        const key = `${q.toLowerCase()}Rev` as keyof typeof totalCompany;
        return totalCompany[key] || 0;
      }),
      totalCompany.totalRev,
      totalCompany.q2ToQ3Delta,
      totalCompany.q2ToQ3PctDelta.toFixed(2) + '%',
      totalCompany.totalUnits,
    ];

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(',')), companyRow.join(',')].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quarterly_revenue_by_region_table.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const mostChangedRegName = calculations.mostChangedByAbsolute?.region;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-slate-100">
              Regional Quarterly Revenue Pivot Table
            </h3>
            <span className="text-xs bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
              {regionStats.length} Regions
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Detailed breakdown with Q2 &rarr; Q3 absolute and percentage deltas. Click any region row to inspect driver breakdown.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportPivotCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Table CSV</span>
          </button>
        </div>
      </div>

      {/* Table Wrapper with horizontal scroll */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3.5 px-4 w-10"></th>
              <th
                onClick={() => handleSort('region')}
                className="py-3.5 px-4 cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Region</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Dynamic Quarter Columns */}
              {quartersPresent.map((q) => {
                const qKey = q.toLowerCase() as SortField;
                const isQ2 = q === 'Q2';
                const isQ3 = q === 'Q3';

                return (
                  <th
                    key={q}
                    onClick={() => handleSort(qKey)}
                    className={`py-3.5 px-4 text-right cursor-pointer hover:text-slate-200 transition-colors ${
                      isQ2 || isQ3 ? 'bg-slate-800/20' : ''
                    }`}
                  >
                    <div className="flex items-center justify-end gap-1">
                      <span>{q} Revenue</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-500" />
                    </div>
                  </th>
                );
              })}

              {/* Total Revenue */}
              <th
                onClick={() => handleSort('totalRevenue')}
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Total Revenue</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>

              {/* Q2 to Q3 Dollar Delta */}
              <th
                onClick={() => handleSort('q2ToQ3Delta')}
                className="py-3.5 px-4 text-right cursor-pointer hover:text-amber-300 transition-colors bg-amber-950/20 text-amber-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Q2 &rarr; Q3 Delta ($)</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-400/80" />
                </div>
              </th>

              {/* Q2 to Q3 Pct Delta */}
              <th
                onClick={() => handleSort('q2ToQ3PctDelta')}
                className="py-3.5 px-4 text-right cursor-pointer hover:text-amber-300 transition-colors bg-amber-950/20 text-amber-300"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Q2 &rarr; Q3 (%)</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-400/80" />
                </div>
              </th>

              {/* Total Units */}
              <th
                onClick={() => handleSort('totalUnits')}
                className="py-3.5 px-4 text-right cursor-pointer hover:text-slate-200 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Units</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-500" />
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-800/60 font-mono">
            {sortedStats.map((r, idx) => {
              const isExpanded = expandedRegions.has(r.region);
              const isSelected = selectedRegion === r.region;
              const isMostChanged = mostChangedRegName === r.region;
              const delta = r.q2ToQ3Delta;
              const pctDelta = r.q2ToQ3PctDelta;
              const isPositive = delta >= 0;
              const colorInfo = getColorForRegion(r.region, idx);

              return (
                <React.Fragment key={r.region}>
                  <tr
                    className={`transition-colors cursor-pointer ${
                      isMostChanged
                        ? 'bg-amber-950/15 hover:bg-amber-950/30 font-medium'
                        : isSelected
                        ? 'bg-slate-800/80'
                        : 'hover:bg-slate-800/40'
                    }`}
                    onClick={() => toggleExpand(r.region)}
                  >
                    {/* Expand icon */}
                    <td className="py-3.5 px-4 text-center text-slate-500">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-300" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      )}
                    </td>

                    {/* Region */}
                    <td className="py-3.5 px-4 font-sans font-medium text-slate-200 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-sm shrink-0"
                          style={{ backgroundColor: colorInfo.hex }}
                        />
                        <span>{r.region}</span>
                        {isMostChanged && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-sans font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                            <Flame className="w-3 h-3" />
                            Most Changed
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Dynamic Quarters */}
                    {quartersPresent.map((q) => {
                      const key = q.toLowerCase() as 'q1' | 'q2' | 'q3' | 'q4';
                      const val = r[key] || 0;
                      const isQ2 = q === 'Q2';
                      const isQ3 = q === 'Q3';

                      return (
                        <td
                          key={q}
                          className={`py-3.5 px-4 text-right text-slate-300 whitespace-nowrap ${
                            isQ2 || isQ3 ? 'bg-slate-800/10' : ''
                          }`}
                        >
                          {formatCurrencyFull(val)}
                        </td>
                      );
                    })}

                    {/* Total Revenue */}
                    <td className="py-3.5 px-4 text-right font-semibold text-slate-100 whitespace-nowrap">
                      {formatCurrencyFull(r.totalRevenue)}
                    </td>

                    {/* Q2 to Q3 Dollar Delta */}
                    <td
                      className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                        isPositive ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10'
                      }`}
                    >
                      <div className="flex items-center justify-end gap-1">
                        {isPositive ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                        <span>
                          {isPositive ? '+' : ''}
                          {formatCurrencyFull(delta)}
                        </span>
                      </div>
                    </td>

                    {/* Q2 to Q3 Pct Delta */}
                    <td
                      className={`py-3.5 px-4 text-right font-semibold whitespace-nowrap ${
                        isPositive ? 'text-emerald-400 bg-emerald-950/10' : 'text-rose-400 bg-rose-950/10'
                      }`}
                    >
                      <span>
                        {isPositive ? '+' : ''}
                        {pctDelta.toFixed(1)}%
                      </span>
                    </td>

                    {/* Units */}
                    <td className="py-3.5 px-4 text-right text-slate-400 whitespace-nowrap">
                      {r.totalUnits.toLocaleString()}
                    </td>
                  </tr>

                  {/* Expanded Row Breakdown: Product & Channel Drivers */}
                  {isExpanded && (
                    <tr className="bg-slate-950/90 border-y border-slate-800 font-sans">
                      <td colSpan={quartersPresent.length + 5} className="p-4 pl-12">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900/80 p-4 rounded-lg border border-slate-800">
                          {/* Product Drivers */}
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-2">
                              <Package className="w-4 h-4" />
                              <span>Key Product Drivers (Q2 &rarr; Q3 in {r.region})</span>
                            </div>
                            <div className="space-y-1.5">
                              {r.productDrivers.length === 0 ? (
                                <p className="text-xs text-slate-500">No product level data for Q2/Q3.</p>
                              ) : (
                                r.productDrivers.slice(0, 4).map((p) => {
                                  const pPos = p.delta >= 0;
                                  return (
                                    <div
                                      key={p.product}
                                      className="flex items-center justify-between text-xs bg-slate-850 p-2 rounded border border-slate-800"
                                    >
                                      <div>
                                        <span className="font-medium text-slate-200">{p.product}</span>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          Q2: {formatCurrencyShort(p.q2Rev)} &rarr; Q3: {formatCurrencyShort(p.q3Rev)}
                                        </div>
                                      </div>
                                      <div className={`text-right font-mono font-medium ${pPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <div>{pPos ? '+' : ''}{formatCurrencyShort(p.delta)}</div>
                                        <div className="text-[10px]">{pPos ? '+' : ''}{p.pctDelta.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>

                          {/* Channel Drivers & Context */}
                          <div>
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2">
                              <Share2 className="w-4 h-4" />
                              <span>Sales Channel Drivers &amp; Discounts ({r.region})</span>
                            </div>
                            <div className="space-y-1.5">
                              {r.channelDrivers.length === 0 ? (
                                <p className="text-xs text-slate-500">No channel level data for Q2/Q3.</p>
                              ) : (
                                r.channelDrivers.slice(0, 3).map((c) => {
                                  const cPos = c.delta >= 0;
                                  return (
                                    <div
                                      key={c.channel}
                                      className="flex items-center justify-between text-xs bg-slate-850 p-2 rounded border border-slate-800"
                                    >
                                      <div>
                                        <span className="font-medium text-slate-200">{c.channel}</span>
                                        <div className="text-[10px] text-slate-400 font-mono">
                                          Q2: {formatCurrencyShort(c.q2Rev)} &rarr; Q3: {formatCurrencyShort(c.q3Rev)}
                                        </div>
                                      </div>
                                      <div className={`text-right font-mono font-medium ${cPos ? 'text-emerald-400' : 'text-rose-400'}`}>
                                        <div>{cPos ? '+' : ''}{formatCurrencyShort(c.delta)}</div>
                                        <div className="text-[10px]">{cPos ? '+' : ''}{c.pctDelta.toFixed(1)}%</div>
                                      </div>
                                    </div>
                                  );
                                })
                              )}
                            </div>

                            <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                              <span>Realized Discount Rate:</span>
                              <span className="font-mono text-slate-200">
                                Q2: {r.avgDiscountQ2.toFixed(1)}% &rarr; Q3: {r.avgDiscountQ3.toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>

          {/* Grand Total Footer Row */}
          <tfoot>
            <tr className="bg-slate-950 border-t-2 border-slate-700 font-mono font-bold text-slate-100">
              <td className="py-4 px-4"></td>
              <td className="py-4 px-4 font-sans uppercase tracking-wider text-xs text-indigo-300">
                Total Company
              </td>
              {quartersPresent.map((q) => {
                const key = `${q.toLowerCase()}Rev` as keyof typeof totalCompany;
                const val = (totalCompany[key] as number) || 0;
                return (
                  <td key={q} className="py-4 px-4 text-right">
                    {formatCurrencyFull(val)}
                  </td>
                );
              })}
              <td className="py-4 px-4 text-right text-indigo-300">
                {formatCurrencyFull(totalCompany.totalRev)}
              </td>
              <td
                className={`py-4 px-4 text-right ${
                  totalCompany.q2ToQ3Delta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalCompany.q2ToQ3Delta >= 0 ? '+' : ''}
                {formatCurrencyFull(totalCompany.q2ToQ3Delta)}
              </td>
              <td
                className={`py-4 px-4 text-right ${
                  totalCompany.q2ToQ3PctDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {totalCompany.q2ToQ3PctDelta >= 0 ? '+' : ''}
                {totalCompany.q2ToQ3PctDelta.toFixed(1)}%
              </td>
              <td className="py-4 px-4 text-right text-slate-300">
                {totalCompany.totalUnits.toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

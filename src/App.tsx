import React, { useMemo, useState } from 'react';
import { SalesOrder } from './types';
import { SAMPLE_SALES_ORDERS } from './utils/sampleData';
import { calculateSalesAnalytics } from './utils/analytics';
import { RevenueChart, formatCurrencyFull, formatCurrencyShort } from './components/RevenueChart';
import { RevenuePivotTable } from './components/RevenuePivotTable';
import { AISummaryCard } from './components/AISummaryCard';
import { CsvUploader } from './components/CsvUploader';
import { RawOrdersDrawer } from './components/RawOrdersDrawer';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  Table as TableIcon,
  Sparkles,
  Layers,
  FileSpreadsheet,
  Flame,
  Percent,
  Package,
} from 'lucide-react';

export default function App() {
  const [orders, setOrders] = useState<SalesOrder[]>(SAMPLE_SALES_ORDERS);
  const [datasetName, setDatasetName] = useState<string>('sales_orders_dataset.csv (Sample)');
  const [activeTab, setActiveTab] = useState<'analytics' | 'raw_data' | 'upload'>('analytics');
  const [selectedRegion, setSelectedRegion] = useState<string | undefined>(undefined);

  // Compute calculated statistics whenever orders change
  const calculations = useMemo(() => {
    return calculateSalesAnalytics(orders);
  }, [orders]);

  const handleDataLoaded = (newOrders: SalesOrder[], fileName: string) => {
    setOrders(newOrders);
    setDatasetName(fileName);
    setActiveTab('analytics');
  };

  const { totalCompany, mostChangedByAbsolute } = calculations;
  const isCompanyQ2Q3Positive = totalCompany.q2ToQ3Delta >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Top Global Navigation Bar */}
      <header className="border-b border-slate-800/90 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-violet-500 rounded-xl shadow-md text-white">
              <BarChart2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                <span>Quarterly Sales Intelligence</span>
                <span className="hidden sm:inline-block text-[10px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold px-2 py-0.5 rounded-full">
                  Gemini 3.8 Powered
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">
                Revenue analysis by region &amp; quarter with calculated AI movement attribution
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'analytics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span>Analytics &amp; Chart</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('raw_data')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'raw_data'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Raw Orders ({orders.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'upload'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* KPI Summary Cards Bar */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Revenue */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Revenue (All Quarters)</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {formatCurrencyFull(totalCompany.totalRev)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
              <span>{calculations.regions.length} regions</span>
              <span>•</span>
              <span>{calculations.quartersPresent.join(', ')}</span>
            </div>
          </div>

          {/* Card 2: Q2 vs Q3 Company Trend */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Q2 &rarr; Q3 Total Net Shift</span>
              {isCompanyQ2Q3Positive ? (
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-400" />
              )}
            </div>
            <div
              className={`text-2xl font-bold font-mono ${
                isCompanyQ2Q3Positive ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {isCompanyQ2Q3Positive ? '+' : ''}
              {formatCurrencyShort(totalCompany.q2ToQ3Delta)}
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>
                Q2: {formatCurrencyShort(totalCompany.q2Rev)} &rarr; Q3: {formatCurrencyShort(totalCompany.q3Rev)}
              </span>
              <span
                className={`font-semibold ${
                  isCompanyQ2Q3Positive ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isCompanyQ2Q3Positive ? '+' : ''}
                {totalCompany.q2ToQ3PctDelta.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Card 3: Most Changed Region Spotlight */}
          <div className="bg-slate-900 border border-amber-500/30 rounded-xl p-4 shadow-sm relative overflow-hidden bg-gradient-to-br from-slate-900 to-amber-950/20">
            <div className="flex items-center justify-between text-amber-400 text-xs mb-1 font-medium">
              <span className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Most Changed Region (Q2 &rarr; Q3)</span>
              </span>
            </div>
            <div className="text-xl font-bold text-slate-100 truncate">
              {mostChangedByAbsolute?.region || 'N/A'}
            </div>
            <div className="text-[11px] text-amber-300 font-mono font-medium mt-1">
              {mostChangedByAbsolute ? (
                <>
                  {mostChangedByAbsolute.delta >= 0 ? '+' : ''}
                  {formatCurrencyShort(mostChangedByAbsolute.delta)} ({mostChangedByAbsolute.delta >= 0 ? '+' : ''}
                  {mostChangedByAbsolute.pctDelta.toFixed(1)}%)
                </>
              ) : (
                'Insufficient quarterly data'
              )}
            </div>
          </div>

          {/* Card 4: Volume & Discount Execution */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-xl p-4 shadow-sm relative overflow-hidden">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span>Total Volume &amp; Avg Discount</span>
              <Package className="w-4 h-4 text-violet-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-100">
              {totalCompany.totalUnits.toLocaleString()}{' '}
              <span className="text-xs font-sans text-slate-400 font-normal">units</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1 flex items-center justify-between font-mono">
              <span>Realized Discount Avg:</span>
              <span className="text-slate-200 font-semibold">{totalCompany.avgDiscount.toFixed(1)}%</span>
            </div>
          </div>
        </section>

        {/* Tab 1: Analytics Dashboard (AI Summary + Chart + Table) */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* 1. AI Three-Sentence Executive Summary */}
            <AISummaryCard calculations={calculations} />

            {/* 2. Interactive Chart */}
            <RevenueChart
              calculations={calculations}
              highlightedRegion={selectedRegion}
              onSelectRegion={(reg) =>
                setSelectedRegion((prev) => (prev === reg ? undefined : reg))
              }
            />

            {/* 3. Pivot Table */}
            <RevenuePivotTable
              calculations={calculations}
              selectedRegion={selectedRegion}
              onSelectRegion={(reg) =>
                setSelectedRegion((prev) => (prev === reg ? undefined : reg))
              }
            />
          </div>
        )}

        {/* Tab 2: Raw Orders Line Item Viewer */}
        {activeTab === 'raw_data' && (
          <div className="space-y-4">
            <RawOrdersDrawer orders={orders} />
          </div>
        )}

        {/* Tab 3: Upload CSV & Dataset Manager */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            <CsvUploader
              onDataLoaded={handleDataLoaded}
              currentOrderCount={orders.length}
              currentFileName={datasetName}
            />

            {/* Quick preview of parsed data */}
            <RawOrdersDrawer orders={orders} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Quarterly Sales Intelligence &bull; Active Dataset: {datasetName}</span>
          <span className="text-slate-600">Strict Numerical Grounding &bull; Gemini 3.8 Flash</span>
        </div>
      </footer>
    </div>
  );
}

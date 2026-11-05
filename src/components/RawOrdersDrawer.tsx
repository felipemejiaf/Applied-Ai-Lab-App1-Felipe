import React, { useState, useMemo } from 'react';
import { SalesOrder } from '../types';
import { Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { formatCurrencyFull } from './RevenueChart';

interface RawOrdersDrawerProps {
  orders: SalesOrder[];
}

export const RawOrdersDrawer: React.FC<RawOrdersDrawerProps> = ({ orders }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('ALL');
  const [selectedQuarter, setSelectedQuarter] = useState<string>('ALL');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  const regions = useMemo(() => Array.from(new Set(orders.map((o) => o.region))).sort(), [orders]);
  const quarters = useMemo(() => Array.from(new Set(orders.map((o) => o.quarter))).sort(), [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchSearch =
        searchTerm === '' ||
        o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.channel.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.region.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.quarter.toLowerCase().includes(searchTerm.toLowerCase());

      const matchRegion = selectedRegion === 'ALL' || o.region === selectedRegion;
      const matchQuarter = selectedQuarter === 'ALL' || o.quarter === selectedQuarter;

      return matchSearch && matchRegion && matchQuarter;
    });
  }, [orders, searchTerm, selectedRegion, selectedQuarter]);

  const totalPages = Math.ceil(filteredOrders.length / pageSize) || 1;
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredOrders.slice(start, start + pageSize);
  }, [filteredOrders, currentPage]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>Raw Sales Orders Data</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing individual line items ({filteredOrders.length} matching rows of {orders.length} total)
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product, channel..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-950 border border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 w-44"
            />
          </div>

          {/* Region filter */}
          <select
            value={selectedRegion}
            onChange={(e) => {
              setSelectedRegion(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Regions</option>
            {regions.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          {/* Quarter filter */}
          <select
            value={selectedQuarter}
            onChange={(e) => {
              setSelectedQuarter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Quarters</option>
            {quarters.map((q) => (
              <option key={q} value={q}>
                {q}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-950/70 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-2.5 px-3">Quarter</th>
              <th className="py-2.5 px-3">Region</th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3">Product</th>
              <th className="py-2.5 px-3 text-right">Units</th>
              <th className="py-2.5 px-3 text-right">Discount %</th>
              <th className="py-2.5 px-3 text-right">Revenue</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {paginatedOrders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500 font-sans">
                  No orders match the selected filters.
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => (
                <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-sans font-medium text-slate-300 whitespace-nowrap">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded text-[11px] border border-slate-700">
                      {o.quarter}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-sans text-slate-200 whitespace-nowrap">{o.region}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-300 whitespace-nowrap">{o.channel}</td>
                  <td className="py-2.5 px-3 font-sans text-slate-100 font-medium whitespace-nowrap">
                    {o.product}
                  </td>
                  <td className="py-2.5 px-3 text-right text-slate-300">{o.units.toLocaleString()}</td>
                  <td className="py-2.5 px-3 text-right text-slate-400">
                    {(o.discount_pct * 100).toFixed(1)}%
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-emerald-400 whitespace-nowrap">
                    {formatCurrencyFull(o.revenue)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-800 text-xs text-slate-400">
        <div>
          Showing {(currentPage - 1) * pageSize + 1} to{' '}
          {Math.min(currentPage * pageSize, filteredOrders.length)} of {filteredOrders.length} entries
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-mono text-slate-300">
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

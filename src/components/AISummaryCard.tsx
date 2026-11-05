import React, { useEffect, useState } from 'react';
import { AISummaryResponse, AnalysisCalculations } from '../types';
import {
  Sparkles,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText,
  TrendingUp,
  AlertCircle,
  Hash,
} from 'lucide-react';
import { formatCurrencyFull, formatCurrencyShort } from './RevenueChart';

interface AISummaryCardProps {
  calculations: AnalysisCalculations;
}

export const AISummaryCard: React.FC<AISummaryCardProps> = ({ calculations }) => {
  const [rankingCriterion, setRankingCriterion] = useState<'absolute' | 'percentage'>('absolute');
  const [loading, setLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<AISummaryResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGroundTruth, setShowGroundTruth] = useState<boolean>(false);

  const activeTarget =
    rankingCriterion === 'percentage'
      ? calculations.mostChangedByPercentage
      : calculations.mostChangedByAbsolute;

  const fetchSummary = async (criterion: 'absolute' | 'percentage') => {
    const target =
      criterion === 'percentage'
        ? calculations.mostChangedByPercentage
        : calculations.mostChangedByAbsolute;

    if (!target) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/summarize-q2-q3', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mostChangedRegion: target,
          allRegionsSummary: calculations.regionStats.map((r) => ({
            region: r.region,
            q2Revenue: r.q2,
            q3Revenue: r.q3,
            delta: r.q2ToQ3Delta,
            pctDelta: r.q2ToQ3PctDelta,
          })),
          totalCompany: {
            q2Rev: calculations.totalCompany.q2Rev,
            q3Rev: calculations.totalCompany.q3Rev,
            delta: calculations.totalCompany.q2ToQ3Delta,
            pctDelta: calculations.totalCompany.q2ToQ3PctDelta,
          },
          rankingCriterion: criterion,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data: AISummaryResponse = await response.json();
      setSummaryData(data);
    } catch (err: any) {
      console.error('Failed to generate AI summary:', err);
      setError(err?.message || 'Failed to fetch executive summary');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when calculations or ranking criterion changes
  useEffect(() => {
    if (activeTarget) {
      fetchSummary(rankingCriterion);
    }
  }, [
    calculations.regionStats,
    rankingCriterion,
    calculations.mostChangedByAbsolute?.region,
  ]);

  const handleCopy = () => {
    if (!summaryData?.summary) return;
    navigator.clipboard.writeText(summaryData.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Split summary into sentences for clean executive display
  const sentences = summaryData?.summary
    ? summaryData.summary
        .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
        .split('|')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const sentenceLabels = [
    'Regional Shift & Magnitude',
    'Product Driver',
    'Channel & Pricing Mechanism',
  ];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border-2 border-indigo-500/40 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100">
                Executive AI Intelligence: Q2 &rarr; Q3 Regional Shift Summary
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                100% Calculated Numbers
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Three-sentence executive brief isolating the greatest regional change and underlying drivers
            </p>
          </div>
        </div>

        {/* Controls: Ranking Toggle & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Ranking Mode Toggle */}
          <div className="inline-flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setRankingCriterion('absolute')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                rankingCriterion === 'absolute'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rank by highest absolute dollar movement ($)"
            >
              Rank by Dollar ($)
            </button>
            <button
              type="button"
              onClick={() => setRankingCriterion('percentage')}
              className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                rankingCriterion === 'percentage'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Rank by highest percentage change (%)"
            >
              Rank by % Change
            </button>
          </div>

          {/* Regenerate Button */}
          <button
            type="button"
            onClick={() => fetchSummary(rankingCriterion)}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            title="Regenerate summary with Gemini"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            <span className="hidden sm:inline">Regenerate</span>
          </button>

          {/* Copy Button */}
          <button
            type="button"
            onClick={handleCopy}
            disabled={!summaryData?.summary || loading}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
            title="Copy summary to clipboard"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>

      {/* Target Region Spotlight Banner */}
      {activeTarget && (
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3 mb-4 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Identified Region:</span>
            <span className="font-bold text-slate-100 text-sm bg-slate-800 px-2.5 py-0.5 rounded border border-slate-700">
              {activeTarget.region}
            </span>
            <span className="text-slate-500">•</span>
            <span className="text-slate-400">
              {rankingCriterion === 'absolute' ? 'Largest absolute movement' : 'Largest relative percentage shift'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono">
            <div>
              <span className="text-slate-500 text-[11px]">Q2: </span>
              <span className="text-slate-300 font-semibold">{formatCurrencyShort(activeTarget.q2Revenue)}</span>
            </div>
            <span className="text-slate-600">&rarr;</span>
            <div>
              <span className="text-slate-500 text-[11px]">Q3: </span>
              <span className="text-slate-300 font-semibold">{formatCurrencyShort(activeTarget.q3Revenue)}</span>
            </div>
            <span className="text-slate-600">|</span>
            <div
              className={`font-bold px-2 py-0.5 rounded ${
                activeTarget.delta >= 0
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-rose-950 text-rose-300 border border-rose-800'
              }`}
            >
              {activeTarget.delta >= 0 ? '+' : ''}
              {formatCurrencyFull(activeTarget.delta)} ({activeTarget.delta >= 0 ? '+' : ''}
              {activeTarget.pctDelta.toFixed(1)}%)
            </div>
          </div>
        </div>
      )}

      {/* AI Content Area */}
      <div className="min-h-[110px] flex flex-col justify-center">
        {loading ? (
          <div className="py-8 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <div className="text-xs text-slate-400 animate-pulse">
              Gemini 3.8 Flash is analyzing calculated Q2 &rarr; Q3 figures and synthesizing three sentences...
            </div>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to fetch Gemini response</p>
              <p className="mt-1 text-slate-400">{error}</p>
            </div>
          </div>
        ) : sentences.length > 0 ? (
          <div className="space-y-3">
            {sentences.map((sentence, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 bg-slate-950/40 hover:bg-slate-950/70 p-3 rounded-lg border border-slate-800/80 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-indigo-400 mb-0.5">
                    Sentence {idx + 1} &bull; {sentenceLabels[idx] || 'Driver Analysis'}
                  </div>
                  <p className="text-sm text-slate-200 leading-relaxed font-sans">{sentence}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 italic">No summary generated yet.</p>
        )}
      </div>

      {/* Ground Truth Calculation Audit Collapsible */}
      <div className="mt-4 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => setShowGroundTruth(!showGroundTruth)}
          className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-slate-200 py-1 transition-colors"
        >
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-semibold text-slate-300">
              Audit Calculated Ground Truth Numbers (Fed to Gemini)
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-slate-500">{showGroundTruth ? 'Hide' : 'Inspect'}</span>
            {showGroundTruth ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </button>

        {showGroundTruth && activeTarget && (
          <div className="mt-3 p-4 bg-slate-950 rounded-lg border border-slate-800 text-xs space-y-3 font-mono">
            <div className="text-slate-400 font-sans text-[11px] pb-2 border-b border-slate-800">
              These exact mathematical figures were calculated locally by the application and passed as strict constraints to the AI prompt:
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[11px]">
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Region</span>
                <span className="text-slate-200 font-bold">{activeTarget.region}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Q2 Revenue</span>
                <span className="text-slate-200 font-bold">{formatCurrencyFull(activeTarget.q2Revenue)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Q3 Revenue</span>
                <span className="text-slate-200 font-bold">{formatCurrencyFull(activeTarget.q3Revenue)}</span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded border border-slate-800">
                <span className="text-slate-500 block">Net Shift</span>
                <span className={activeTarget.delta >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                  {activeTarget.delta >= 0 ? '+' : ''}{formatCurrencyFull(activeTarget.delta)} ({activeTarget.pctDelta.toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Product breakdown */}
            <div className="pt-2">
              <span className="text-slate-400 font-sans text-[11px] block mb-1.5 font-semibold">
                Calculated Product Drivers ({activeTarget.region}):
              </span>
              <div className="space-y-1">
                {activeTarget.topProductDrivers.map((p) => (
                  <div key={p.product} className="flex justify-between text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                    <span>{p.product}</span>
                    <span>
                      Q2: {formatCurrencyShort(p.q2Rev)} &rarr; Q3: {formatCurrencyShort(p.q3Rev)} (
                      <span className={p.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {p.delta >= 0 ? '+' : ''}{formatCurrencyShort(p.delta)}
                      </span>
                      )
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Channel breakdown */}
            <div className="pt-2">
              <span className="text-slate-400 font-sans text-[11px] block mb-1.5 font-semibold">
                Calculated Channel Drivers &amp; Discounts ({activeTarget.region}):
              </span>
              <div className="space-y-1">
                {activeTarget.topChannelDrivers.map((c) => (
                  <div key={c.channel} className="flex justify-between text-slate-300 bg-slate-900/60 px-2 py-1 rounded">
                    <span>{c.channel}</span>
                    <span>
                      Q2: {formatCurrencyShort(c.q2Rev)} &rarr; Q3: {formatCurrencyShort(c.q3Rev)} (
                      <span className={c.delta >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                        {c.delta >= 0 ? '+' : ''}{formatCurrencyShort(c.delta)}
                      </span>
                      )
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[11px] text-slate-400 flex justify-between px-2">
                <span>Weighted Avg Discount:</span>
                <span>Q2: {activeTarget.avgDiscountQ2.toFixed(1)}% &rarr; Q3: {activeTarget.avgDiscountQ3.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

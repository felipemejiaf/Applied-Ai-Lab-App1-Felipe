import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertTriangle, X, RefreshCw } from 'lucide-react';
import { parseSalesCsv } from '../utils/csvParser';
import { downloadSampleCsvFile, SAMPLE_SALES_ORDERS } from '../utils/sampleData';
import { SalesOrder } from '../types';

interface CsvUploaderProps {
  onDataLoaded: (orders: SalesOrder[], fileName: string) => void;
  currentOrderCount: number;
  currentFileName: string;
}

export const CsvUploader: React.FC<CsvUploaderProps> = ({
  onDataLoaded,
  currentOrderCount,
  currentFileName,
}) => {
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [warningMessages, setWarningMessages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const REQUIRED_COLUMNS = ['quarter', 'region', 'channel', 'product', 'units', 'discount_pct', 'revenue'];

  const processFile = (file: File) => {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMessages(['Please upload a valid .csv format file.']);
      return;
    }

    setIsProcessing(true);
    setErrorMessages([]);
    setWarningMessages([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const result = parseSalesCsv(text);

        if (result.errors.length > 0) {
          setErrorMessages(result.errors);
          setWarningMessages(result.warnings);
          setIsProcessing(false);
          return;
        }

        if (result.orders.length === 0) {
          setErrorMessages(['No valid rows could be imported from the CSV.']);
          setIsProcessing(false);
          return;
        }

        setWarningMessages(result.warnings);
        onDataLoaded(result.orders, file.name);
        setIsProcessing(false);
      } catch (err: any) {
        setErrorMessages([`Failed to parse CSV: ${err?.message || 'Unknown error'}`]);
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setErrorMessages(['Failed to read file from disk.']);
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
    // reset input value so re-uploading the same file works
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleLoadSample = () => {
    setErrorMessages([]);
    setWarningMessages([]);
    onDataLoaded(SAMPLE_SALES_ORDERS, 'sales_orders_dataset.csv (Sample)');
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <span>Upload Sales Orders CSV</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Required columns: <span className="font-mono text-indigo-300">quarter, region, channel, product, units, discount_pct, revenue</span>
          </p>
        </div>

        {/* Quick Sample Actions */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleLoadSample}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Load Sample Data</span>
          </button>

          <button
            type="button"
            onClick={() => downloadSampleCsvFile()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            title="Download CSV sample template"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Drag & Drop Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-indigo-400 bg-indigo-950/30 ring-4 ring-indigo-500/20'
            : 'border-slate-700/80 bg-slate-950/40 hover:bg-slate-950/70 hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="p-3 bg-slate-800 rounded-full text-indigo-400 mb-3 border border-slate-700">
          <UploadCloud className="w-7 h-7" />
        </div>

        <p className="text-sm font-medium text-slate-200">
          Click to upload or drag &amp; drop your sales orders CSV
        </p>
        <p className="text-xs text-slate-400 mt-1 max-w-md">
          Supports CSV exports with quarter (e.g. Q1, Q2, Q3, Q4), region, channel, product, units, discount_pct, and revenue.
        </p>

        {/* Required columns pill tags */}
        <div className="flex flex-wrap justify-center gap-1.5 mt-4 max-w-xl">
          {REQUIRED_COLUMNS.map((col) => (
            <span
              key={col}
              className="text-[11px] font-mono bg-slate-800/90 text-slate-300 px-2 py-0.5 rounded border border-slate-700"
            >
              {col}
            </span>
          ))}
        </div>
      </div>

      {/* Current File Status Banner */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Current Dataset:</span>
          <span className="font-semibold text-slate-200 font-mono bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
            {currentFileName}
          </span>
          <span className="text-emerald-400 font-medium">({currentOrderCount.toLocaleString()} orders loaded)</span>
        </div>

        <span className="text-slate-500 text-[11px]">
          Upload anytime to refresh calculations and regenerate AI insights
        </span>
      </div>

      {/* Errors display */}
      {errorMessages.length > 0 && (
        <div className="mt-4 p-3 bg-rose-950/40 border border-rose-800 rounded-lg text-rose-300 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <span>CSV Import Errors:</span>
          </div>
          {errorMessages.map((msg, idx) => (
            <p key={idx} className="text-slate-300 pl-5 text-[11px]">
              &bull; {msg}
            </p>
          ))}
        </div>
      )}

      {/* Warnings display */}
      {warningMessages.length > 0 && (
        <div className="mt-3 p-3 bg-amber-950/30 border border-amber-800 rounded-lg text-amber-300 text-xs space-y-1">
          <div className="font-semibold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>CSV Warnings ({warningMessages.length} notices):</span>
          </div>
          {warningMessages.slice(0, 3).map((msg, idx) => (
            <p key={idx} className="text-slate-300 pl-5 text-[11px]">
              &bull; {msg}
            </p>
          ))}
          {warningMessages.length > 3 && (
            <p className="text-slate-400 pl-5 text-[10px]">
              +{warningMessages.length - 3} more minor notices
            </p>
          )}
        </div>
      )}
    </div>
  );
};

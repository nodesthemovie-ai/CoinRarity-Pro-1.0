import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import {
  History as HistoryIcon,
  Trash2,
  Search,
  Download,
  ChevronRight,
  Coins,
  FileSpreadsheet,
  Upload,
  DollarSign,
  Flame,
  Award,
  ShieldCheck,
} from 'lucide-react';
import { SavedAnalysis } from '../types';

interface HistoryDrawerProps {
  history: SavedAnalysis[];
  onSelect: (item: SavedAnalysis) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClearAll: () => void;
  onImportBackup?: (items: SavedAnalysis[]) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  history,
  onSelect,
  onDelete,
  onClearAll,
  onImportBackup,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('ALL');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredHistory = useMemo(() => {
    return history.filter((item) => {
      const firstCoin = item.coins[0];
      const nameMatch =
        firstCoin?.coinName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firstCoin?.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        firstCoin?.year?.includes(searchTerm);

      if (!nameMatch) return false;
      if (selectedRarity === 'ALL') return true;

      return firstCoin?.rarityLevel?.toLowerCase().includes(selectedRarity.toLowerCase());
    });
  }, [history, searchTerm, selectedRarity]);

  // Aggregate portfolio metrics
  const portfolioMetrics = useMemo(() => {
    let totalCoins = 0;
    let totalValueMin = 0;
    let totalValueMax = 0;
    let totalSilverMelt = 0;

    history.forEach((item) => {
      item.coins.forEach((c) => {
        totalCoins += 1;
        // Parse value like "$150 - $225" or "$450"
        const numbers = c.estimatedValue.replace(/[^0-9.-]/g, ' ').trim().split(/\s+/).map(Number).filter((n) => !isNaN(n) && n > 0);
        if (numbers.length === 1) {
          totalValueMin += numbers[0];
          totalValueMax += numbers[0];
        } else if (numbers.length >= 2) {
          totalValueMin += numbers[0];
          totalValueMax += numbers[1];
        }

        // Parse melt value if present
        if (c.estimatedMeltValue && c.estimatedMeltValue.toLowerCase() !== 'none') {
          const meltNum = parseFloat(c.estimatedMeltValue.replace(/[^0-9.]/g, ''));
          if (!isNaN(meltNum)) {
            totalSilverMelt += meltNum;
          }
        }
      });
    });

    return {
      totalCoins,
      totalValueMin,
      totalValueMax,
      totalSilverMelt,
    };
  }, [history]);

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `coinrarity-portfolio-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCsv = () => {
    const headers = [
      'Audit ID',
      'Date',
      'Coin Name',
      'Year',
      'Mint Mark',
      'Strike Type',
      'Assessed Grade',
      'Sheldon Number',
      'Rarity Level',
      'Composition',
      'Estimated Melt Value',
      'Estimated Market Value',
      'Authenticity Confidence',
    ];

    const rows: string[][] = [];
    history.forEach((item) => {
      const dateStr = item.dateStr || new Date(item.timestamp).toLocaleDateString();
      const auditId = item.auditId || 'N/A';
      item.coins.forEach((c) => {
        rows.push([
          `"${auditId}"`,
          `"${dateStr}"`,
          `"${c.coinName.replace(/"/g, '""')}"`,
          `"${c.year || ''}"`,
          `"${c.mintMark || ''}"`,
          `"${c.strikeType || 'Business Strike'}"`,
          `"${c.grade || 'UNC'}"`,
          `"${c.sheldonScaleNumber || ''}"`,
          `"${c.rarityLevel}"`,
          `"${c.composition || ''}"`,
          `"${c.estimatedMeltValue || 'N/A'}"`,
          `"${c.estimatedValue}"`,
          `"${c.authenticityConfidence || 95}%"`,
        ]);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `coinrarity-registry-export-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed) && onImportBackup) {
          onImportBackup(parsed);
        }
      } catch (err) {
        alert('Invalid JSON file format.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div id="history-view-container" className="max-w-4xl mx-auto space-y-6">
      {/* Portfolio Aggregate Intelligence Bar */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1.5">
              <Coins size={12} className="text-amber-400" /> Cataloged
            </span>
            <span className="text-xl font-black text-white font-mono">{portfolioMetrics.totalCoins} Coins</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1.5">
              <DollarSign size={12} className="text-emerald-400" /> Portfolio Value
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              ${portfolioMetrics.totalValueMin.toLocaleString()} – ${portfolioMetrics.totalValueMax.toLocaleString()}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1.5">
              <Flame size={12} className="text-amber-500" /> Intrinsic Melt
            </span>
            <span className="text-xl font-black text-amber-400 font-mono">
              ${portfolioMetrics.totalSilverMelt.toFixed(2)}
            </span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800">
            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1 flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-cyan-400" /> Registry Standard
            </span>
            <span className="text-xs font-bold text-slate-300 font-mono block mt-1">PCGS / NGC Compatible</span>
          </div>
        </div>
      )}

      {/* Search and Action Bar */}
      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
        <div className="relative w-full sm:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            id="history-search-input"
            type="text"
            placeholder="Search specimen by name, year, or grade..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-black/40 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {history.length > 0 && (
            <>
              <button
                id="export-csv-btn"
                onClick={handleExportCsv}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                title="Export as CSV spreadsheet"
              >
                <FileSpreadsheet size={14} className="text-emerald-400" />
                <span>CSV</span>
              </button>

              <button
                id="export-history-btn"
                onClick={handleExportJson}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white transition-colors"
                title="Export collection as JSON"
              >
                <Download size={14} />
                <span>JSON</span>
              </button>

              <button
                id="clear-history-btn"
                onClick={onClearAll}
                className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-xs font-bold text-red-400 transition-colors"
                title="Clear all saved scans"
              >
                <Trash2 size={14} />
                <span>Clear</span>
              </button>
            </>
          )}

          {/* Import Backup */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors"
            title="Import or restore JSON collection"
          >
            <Upload size={14} />
            <span>Import</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Rarity filter tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['ALL', 'Common', 'Scarce', 'Rare', 'Ultra-Rare'].map((tier) => (
          <button
            key={tier}
            onClick={() => setSelectedRarity(tier)}
            className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-all shrink-0 ${
              selectedRarity === tier
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
            }`}
          >
            {tier}
          </button>
        ))}
      </div>

      {/* History List */}
      {filteredHistory.length === 0 ? (
        <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
          <HistoryIcon size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-1">
            {history.length === 0 ? 'No Scanned Coins Yet' : 'No Specimen Matched Your Filter'}
          </h3>
          <p className="text-slate-400 text-sm">
            {history.length === 0
              ? 'Scan a coin or select a preset sample to view your authenticated collection.'
              : 'Try clearing your search query or choosing another rarity filter.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {filteredHistory.map((item) => {
            const firstCoin = item.coins[0];
            return (
              <motion.div
                layout
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => onSelect(item)}
                className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-4 rounded-2xl flex items-center gap-4 cursor-pointer group transition-all backdrop-blur-sm"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-700 bg-black flex items-center justify-center">
                  <img
                    src={item.image}
                    alt={firstCoin?.coinName || 'Specimen'}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-white truncate text-base group-hover:text-amber-400 transition-colors">
                      {firstCoin?.coinName || 'Numismatic Specimen'}
                    </h4>
                    {item.coins.length > 1 && (
                      <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
                        +{item.coins.length - 1} more
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                    <span>{new Date(item.timestamp).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="text-amber-400 font-bold">{firstCoin?.grade || 'UNC'}</span>
                    <span>•</span>
                    <span>{firstCoin?.rarityLevel || 'Common'}</span>
                    {firstCoin?.composition && (
                      <>
                        <span>•</span>
                        <span className="text-slate-500 truncate max-w-[120px]">{firstCoin.composition}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <p className="text-[9px] text-slate-500 uppercase font-black tracking-wider">Est. Value</p>
                    <p className="text-base font-black text-emerald-400 font-mono">{firstCoin?.estimatedValue || '$0'}</p>
                  </div>

                  <button
                    onClick={(e) => onDelete(item.id, e)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-colors"
                    title="Remove from history"
                  >
                    <Trash2 size={16} />
                  </button>

                  <ChevronRight size={18} className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

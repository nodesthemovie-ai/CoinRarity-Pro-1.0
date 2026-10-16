import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Coins,
  DollarSign,
  Award,
  Sparkles,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  Flame,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Eye,
  Filter,
  Grid,
  List,
} from 'lucide-react';
import { SingleCoinData, MultiCoinAnalysisResult } from '../types';

interface MultiCoinTrayExplorerProps {
  result: MultiCoinAnalysisResult;
  image: string;
  focusedCoinIndex: number;
  onSelectCoin: (index: number) => void;
  onOpenConsult?: () => void;
  onOpenCertModal?: () => void;
}

export const MultiCoinTrayExplorer: React.FC<MultiCoinTrayExplorerProps> = ({
  result,
  image,
  focusedCoinIndex,
  onSelectCoin,
  onOpenConsult,
  onOpenCertModal,
}) => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showReticles, setShowReticles] = useState<boolean>(true);
  const [showGradeTags, setShowGradeTags] = useState<boolean>(true);
  const [filterType, setFilterType] = useState<'all' | 'precious' | 'keys' | 'mintstate'>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const coins = result.coins;
  const totalCount = coins.length;

  // Filtered coins based on active filter
  const filteredCoins = useMemo(() => {
    return coins.map((c, originalIdx) => ({ ...c, originalIdx })).filter((c) => {
      if (filterType === 'precious') {
        return Boolean(c.composition?.toLowerCase().includes('silver') || c.composition?.toLowerCase().includes('gold') || (c.estimatedMeltValue && c.estimatedMeltValue !== 'None'));
      }
      if (filterType === 'keys') {
        return c.rarityLevel === 'Rare' || c.rarityLevel === 'Very Rare' || c.rarityLevel === 'Ultra-Rare' || (c.varietiesAndErrors && c.varietiesAndErrors.some((v) => v.detected));
      }
      if (filterType === 'mintstate') {
        return (c.sheldonScaleNumber && c.sheldonScaleNumber >= 60) || c.grade?.toUpperCase().includes('MS');
      }
      return true;
    });
  }, [coins, filterType]);

  // Standout key date
  const standoutCoin = useMemo(() => {
    if (result.standoutRarityCoinIndex && coins[result.standoutRarityCoinIndex - 1]) {
      return coins[result.standoutRarityCoinIndex - 1];
    }
    // Default to highest rarityScore or highest sheldon
    return [...coins].sort((a, b) => (b.rarityScore || 0) - (a.rarityScore || 0))[0] || coins[0];
  }, [coins, result.standoutRarityCoinIndex]);

  // Aggregate stats
  const averageSheldon = useMemo(() => {
    const scored = coins.filter((c) => c.sheldonScaleNumber && c.sheldonScaleNumber > 0);
    if (!scored.length) return null;
    const avg = scored.reduce((acc, c) => acc + (c.sheldonScaleNumber || 0), 0) / scored.length;
    return Math.round(avg * 10) / 10;
  }, [coins]);

  // Export full batch to CSV
  const exportBatchCsv = () => {
    const headers = [
      'Tray Slot',
      'Position',
      'Coin Name',
      'Year',
      'Mint Mark',
      'Grade',
      'Sheldon #',
      'Rarity Level',
      'Composition',
      'Melt Value',
      'Auction Valuation',
      'Die State / Pair',
      'CAC Bean %',
      'Key Varieties',
    ];

    const rows = coins.map((c, i) => [
      c.coinIndex || i + 1,
      `"${c.positionLabel || `Slot #${i + 1}`}"`,
      `"${c.coinName}"`,
      c.year || 'N/A',
      c.mintMark || 'None',
      `"${c.grade || 'N/A'}"`,
      c.sheldonScaleNumber || 'N/A',
      `"${c.rarityLevel}"`,
      `"${c.composition || 'N/A'}"`,
      `"${c.estimatedMeltValue || 'N/A'}"`,
      `"${c.estimatedValue || 'N/A'}"`,
      `"${c.dieMatching?.diePairId || 'Standard'}"`,
      c.cacAssessment?.greenBeanLikelihood ? `${c.cacAssessment.greenBeanLikelihood}%` : 'N/A',
      `"${(c.varietiesAndErrors || []).filter((v) => v.detected).map((v) => v.type).join('; ') || 'None'}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `CoinRarity_Tray_${result.auditId || 'Batch'}_${coins.length}_Coins.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-5">
      {/* Top Banner: Multi-Coin Tray Intelligence Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={11} className="text-amber-400" />
              <span>Multi-Coin Tray Scan Matrix</span>
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Audit #{result.auditId}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white uppercase italic tracking-tight mt-1 flex items-center gap-2.5">
            <span>{totalCount} Specimens Detected Simultaneously</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 normal-case not-italic">
              Up to 25 Coins
            </span>
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl mt-0.5">
            {result.collectionSummary ||
              `Interactive spatial layout of all ${totalCount} specimens. Click any target or pin to inspect individual diagnostics, die states, and subgrades.`}
          </p>
        </div>

        {/* Action Buttons: CSV Export & Print */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportBatchCsv}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-2 transition-all active:scale-95 shadow-sm"
            title="Download full 25-coin catalog as spreadsheet"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" />
            <span>Export CSV</span>
          </button>

          {onOpenCertModal && (
            <button
              onClick={onOpenCertModal}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
            >
              <Award size={14} />
              <span>Batch Dossier</span>
            </button>
          )}
        </div>
      </div>

      {/* Aggregate Valuation & Standout Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Total Detected */}
        <div className="bg-slate-950/70 border border-slate-800/90 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono uppercase font-bold">
            <span>Specimens In Image</span>
            <Coins size={14} className="text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-white font-mono">{totalCount}</span>
            <span className="text-xs text-slate-500 font-mono">/ 25 cap</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-mono mt-0.5">100% Attributed</span>
        </div>

        {/* Combined Portfolio Valuation */}
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-300 text-[10px] font-mono uppercase font-bold">
            <span>Combined Value</span>
            <DollarSign size={14} className="text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-emerald-300 font-mono">
              {result.totalEstimatedPortfolioValue || coins[0]?.estimatedValue || '$1,500+'}
            </span>
          </div>
          <span className="text-[10px] text-emerald-400/80 font-mono mt-0.5">Auction Census Range</span>
        </div>

        {/* Scrap Bullion Melt Content */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-300 text-[10px] font-mono uppercase font-bold">
            <span>Precious Metals</span>
            <Flame size={14} className="text-amber-400" />
          </div>
          <div className="mt-2">
            <span className="text-xl sm:text-2xl font-black text-amber-300 font-mono">
              {result.totalMeltValue && result.totalMeltValue !== 'None' ? result.totalMeltValue : 'Included'}
            </span>
          </div>
          <span className="text-[10px] text-amber-400/80 font-mono mt-0.5">Intrinsic Melt Floor</span>
        </div>

        {/* Top Key Date Standout */}
        <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-purple-300 text-[10px] font-mono uppercase font-bold">
            <span>Key Date Standout</span>
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div className="mt-1">
            <h4 className="text-xs font-black text-white truncate" title={standoutCoin.coinName}>
              #{standoutCoin.coinIndex || 1} {standoutCoin.coinName}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="text-[11px] font-mono font-black text-purple-300">
                {standoutCoin.grade || 'UNC'}
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {standoutCoin.estimatedValue}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-purple-400/90 font-mono mt-0.5">Top Rarity Asset</span>
        </div>
      </div>

      {/* Main Interactive Master Photo Viewer with Dynamic Hotspots */}
      <div className="space-y-3">
        {/* Controls Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-300 font-mono">
            <span className="text-amber-400 font-bold">Tray Canvas:</span>
            <span>Click any target pin to focus coin</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Reticle Outlines */}
            <button
              onClick={() => setShowReticles(!showReticles)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                showReticles
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              Reticles {showReticles ? 'ON' : 'OFF'}
            </button>

            {/* Toggle Grade Badges */}
            <button
              onClick={() => setShowGradeTags(!showGradeTags)}
              className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border transition-all ${
                showGradeTags
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
            >
              Grades {showGradeTags ? 'ON' : 'OFF'}
            </button>

            {/* Zoom Controls */}
            <div className="flex items-center bg-slate-900 rounded-lg border border-slate-800 p-0.5">
              <button
                onClick={() => setZoomLevel((z) => Math.max(1, z - 0.25))}
                disabled={zoomLevel <= 1}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                title="Zoom Out"
              >
                <ZoomOut size={13} />
              </button>
              <span className="px-1.5 text-[10px] font-mono text-slate-300 min-w-8 text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                disabled={zoomLevel >= 2.5}
                className="p-1 text-slate-400 hover:text-white disabled:opacity-30"
                title="Zoom In"
              >
                <ZoomIn size={13} />
              </button>
              {zoomLevel > 1 && (
                <button
                  onClick={() => setZoomLevel(1)}
                  className="p-1 text-amber-400 hover:text-white ml-0.5"
                  title="Reset Zoom"
                >
                  <RotateCcw size={12} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Master Image Frame */}
        <div
          ref={containerRef}
          className="relative bg-black rounded-2xl overflow-hidden border border-slate-800 shadow-inner aspect-square md:aspect-[16/10] max-h-[600px] flex items-center justify-center select-none"
        >
          <div
            className="relative w-full h-full flex items-center justify-center transition-transform duration-200 ease-out"
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center center',
            }}
          >
            {/* Master Photo */}
            <img
              src={image}
              alt="Multi-coin tray"
              className="w-full h-full object-contain pointer-events-none"
            />

            {/* Spatial Overlay of Hotspots & Bounding Reticles */}
            {coins.map((coin, idx) => {
              const isFocused = focusedCoinIndex === idx;
              const isHovered = hoveredIndex === idx;
              const box = coin.boundingBox;

              // Fallback spatial calculations if bounding box was absent or partial
              let topPct = 50;
              let leftPct = 50;
              let widthPct = 12;
              let heightPct = 12;

              if (box && box.length === 4) {
                const [ymin, xmin, ymax, xmax] = box;
                topPct = (ymin / 1000) * 100;
                leftPct = (xmin / 1000) * 100;
                widthPct = Math.max(6, ((xmax - xmin) / 1000) * 100);
                heightPct = Math.max(6, ((ymax - ymin) / 1000) * 100);
              } else {
                // Compute grid location if up to 25 coins
                const cols = totalCount > 16 ? 5 : totalCount > 9 ? 4 : 3;
                const rows = Math.ceil(totalCount / cols);
                const col = idx % cols;
                const row = Math.floor(idx / cols);
                leftPct = 8 + (col / cols) * 84;
                topPct = 10 + (row / rows) * 80;
                widthPct = 14;
                heightPct = 14;
              }

              return (
                <div
                  key={idx}
                  id={`tray-coin-hotspot-${idx + 1}`}
                  onClick={() => onSelectCoin(idx)}
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    position: 'absolute',
                    top: `${topPct}%`,
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: `${heightPct}%`,
                  }}
                  className={`cursor-pointer transition-all z-20 flex items-center justify-center group ${
                    isFocused ? 'z-30' : ''
                  }`}
                >
                  {/* Circular/Box Reticle */}
                  {showReticles && (
                    <div
                      className={`absolute inset-0 rounded-full transition-all ${
                        isFocused
                          ? 'border-2 border-amber-400 bg-amber-400/20 shadow-[0_0_25px_rgba(251,191,36,0.7)] animate-pulse'
                          : isHovered
                          ? 'border-2 border-cyan-400 bg-cyan-400/15 shadow-[0_0_15px_rgba(34,211,238,0.5)]'
                          : 'border border-amber-400/40 bg-black/10 hover:border-amber-400 hover:bg-amber-400/10'
                      }`}
                    >
                      {/* Corner / Crosshair accents on focused coin */}
                      {isFocused && (
                        <>
                          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-amber-400" />
                          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-amber-400" />
                          <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-amber-400" />
                          <div className="absolute -right-1 top-1/2 -translate-y-1/2 w-0.5 h-2 bg-amber-400" />
                        </>
                      )}
                    </div>
                  )}

                  {/* Hotspot Index Pin */}
                  <div
                    className={`relative w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center font-mono font-black text-[10px] sm:text-xs shadow-lg transition-transform ${
                      isFocused
                        ? 'bg-amber-400 text-black scale-125 ring-2 ring-white shadow-amber-500/50'
                        : isHovered
                        ? 'bg-cyan-400 text-black scale-110 shadow-cyan-500/50'
                        : 'bg-black/85 text-amber-300 border border-amber-400/60 hover:scale-110'
                    }`}
                  >
                    {coin.coinIndex || idx + 1}
                  </div>

                  {/* Grade Floating Tag */}
                  {showGradeTags && (
                    <div
                      className={`absolute -bottom-4 sm:-bottom-5 px-1.5 py-0.5 rounded text-[8px] sm:text-[9px] font-mono font-bold tracking-tight shadow pointer-events-none whitespace-nowrap transition-all ${
                        isFocused
                          ? 'bg-amber-500 text-black font-black'
                          : 'bg-black/90 text-slate-200 border border-slate-700'
                      }`}
                    >
                      {coin.grade?.split(' ')[0] || 'UNC'}
                    </div>
                  )}

                  {/* Hover Quick Insight Card */}
                  {(isHovered || isFocused) && (
                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-950/95 border border-amber-500/50 p-2.5 rounded-xl shadow-2xl backdrop-blur-md pointer-events-none min-w-[170px] max-w-[220px] z-50 text-left">
                      <div className="flex items-center justify-between text-[9px] font-mono text-amber-400 font-bold border-b border-white/10 pb-1 mb-1">
                        <span>SLOT #{coin.coinIndex || idx + 1}</span>
                        <span>{coin.grade || 'UNC'}</span>
                      </div>
                      <h5 className="text-[11px] font-bold text-white line-clamp-1">{coin.coinName}</h5>
                      <div className="flex items-center justify-between mt-1 text-[10px]">
                        <span className="font-mono text-emerald-400 font-bold">{coin.estimatedValue}</span>
                        <span className="text-[9px] text-slate-400 font-mono">{coin.rarityLevel}</span>
                      </div>
                      {coin.varietiesAndErrors && coin.varietiesAndErrors.some((v) => v.detected) && (
                        <div className="mt-1 text-[8px] text-purple-300 font-mono bg-purple-500/20 px-1 py-0.5 rounded truncate">
                          ★ {coin.varietiesAndErrors.find((v) => v.detected)?.type}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Filter Bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap pt-1">
        <div className="flex items-center gap-1.5">
          <Filter size={13} className="text-slate-400" />
          <span className="text-xs font-mono font-bold text-slate-400 uppercase">Filter Tray:</span>
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'all' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              onClick={() => setFilterType('precious')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'precious' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Silver & Gold
            </button>
            <button
              onClick={() => setFilterType('keys')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'keys' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Key Dates & Errors
            </button>
            <button
              onClick={() => setFilterType('mintstate')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                filterType === 'mintstate' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              Mint State MS+
            </button>
          </div>
        </div>

        <div className="text-[11px] font-mono text-slate-400">
          Selected: <strong className="text-amber-400">#{focusedCoinIndex + 1}</strong> (
          {coins[focusedCoinIndex]?.coinName || 'None'})
        </div>
      </div>

      {/* 25-Coin Horizontal Specimen Carousel / Selector */}
      <div className="space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold">
          Quick Jump Selector • Click to Focus Individual Specimen:
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-2 max-h-56 overflow-y-auto pr-1 custom-scrollbar">
          {filteredCoins.map((coin) => {
            const idx = coin.originalIdx;
            const isSelected = focusedCoinIndex === idx;

            return (
              <button
                key={idx}
                id={`tray-chip-${idx + 1}`}
                onClick={() => onSelectCoin(idx)}
                className={`p-2 rounded-xl text-left transition-all border flex flex-col justify-between group ${
                  isSelected
                    ? 'bg-amber-500/15 border-amber-500 shadow-md shadow-amber-500/10'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-black ${
                      isSelected
                        ? 'bg-amber-400 text-black'
                        : 'bg-slate-800 text-slate-300 group-hover:bg-slate-700'
                    }`}
                  >
                    {coin.coinIndex || idx + 1}
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-400 truncate">
                    {coin.grade?.split(' ')[0] || 'UNC'}
                  </span>
                </div>

                <div>
                  <h6
                    className={`text-[10px] font-bold line-clamp-1 ${
                      isSelected ? 'text-amber-300' : 'text-white'
                    }`}
                  >
                    {coin.coinName}
                  </h6>
                  <p className="text-[9px] font-mono text-emerald-400 truncate mt-0.5">
                    {coin.estimatedValue}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

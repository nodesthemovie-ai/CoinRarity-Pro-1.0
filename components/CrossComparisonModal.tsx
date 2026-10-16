import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ArrowLeft,
  Columns,
  Award,
  Sparkles,
  Layers,
  Scale,
  TrendingUp,
  CheckCircle2,
  ArrowLeftRight,
} from 'lucide-react';
import { SingleCoinData, SavedAnalysis } from '../types';
import { SAMPLE_COINS } from '../data/sampleCoins';

interface CrossComparisonModalProps {
  activeCoins: SingleCoinData[];
  primaryIndex?: number;
  activeImage?: string | null;
  history: SavedAnalysis[];
  onClose: () => void;
}

interface ComparableSpecimen {
  id: string;
  sourceLabel: string;
  image?: string;
  coin: SingleCoinData;
}

export const CrossComparisonModal: React.FC<CrossComparisonModalProps> = ({
  activeCoins,
  primaryIndex = 0,
  activeImage,
  history,
  onClose,
}) => {
  // Build unified pool of comparable specimens:
  // 1) All coins from the current scan (1 to 25 coins)
  // 2) Coins from Saved Registry
  // 3) Reference PCGS/NGC Benchmark Specimens from SAMPLE_COINS
  const specimenPool: ComparableSpecimen[] = useMemo(() => {
    const list: ComparableSpecimen[] = [];

    activeCoins.forEach((c, idx) => {
      list.push({
        id: `active-${idx}`,
        sourceLabel:
          activeCoins.length > 1
            ? `Active Tray Slot #${c.coinIndex || idx + 1}`
            : 'Active Scanned Specimen',
        image: c.croppedImage || activeImage || undefined,
        coin: c,
      });
    });

    history.forEach((h, hIdx) => {
      const first = h.coins[0];
      if (first) {
        list.push({
          id: `reg-${h.id || hIdx}`,
          sourceLabel: `Registry (${h.dateStr || 'Saved'})`,
          image: first.croppedImage || h.image,
          coin: first,
        });
      }
    });

    SAMPLE_COINS.forEach((s) => {
      list.push({
        id: `ref-${s.id}`,
        sourceLabel: 'Reference Benchmark',
        image: s.image,
        coin: {
          coinName: s.name,
          year: s.year,
          rarityScore: s.rarityLevel.includes('Ultra') ? 9.5 : s.rarityLevel.includes('Rare') ? 8.2 : 6.5,
          rarityLevel: s.rarityLevel,
          grade: s.id.includes('morgan') ? 'MS-66 DMPL' : s.id.includes('svdb') ? 'MS-65 RD' : 'MS-65',
          sheldonScaleNumber: s.id.includes('morgan') ? 66 : 65,
          strikeQuality: 'Full Sharp Strike',
          lusterRating: 'Frosty Cartwheel',
          eyeAppeal: 5,
          composition: s.name.toLowerCase().includes('gold') || s.name.toLowerCase().includes('saint') ? '90% Gold, 10% Copper' : '90% Silver, 10% Copper',
          estimatedValue: s.id.includes('svdb') ? '$3,850 - $4,400' : '$680 - $950',
          reasoning: s.description,
          subGrades: {
            strikeScore: 9.4,
            lusterScore: 9.3,
            surfacePreservationScore: 9.1,
            eyeAppealScore: 9.5,
          },
          dieMatching: {
            diePairId: 'PCGS-REF-1A',
            dieState: 'Early Die State (EDS)',
            varietyAttribution: 'Reference Standard Attribution',
            dieMarkers: ['Sharp peripheral denticles', 'Unbroken luster flow lines'],
            dieAuthenticityConfidence: 99,
          },
        },
      });
    });

    return list;
  }, [activeCoins, activeImage, history]);

  const defaultLeftId = specimenPool[primaryIndex]?.id || specimenPool[0]?.id || '';
  const defaultRightId =
    specimenPool[primaryIndex + 1]?.id ||
    specimenPool.find((s) => s.id !== defaultLeftId)?.id ||
    defaultLeftId;

  const [leftId, setLeftId] = useState<string>(defaultLeftId);
  const [rightId, setRightId] = useState<string>(defaultRightId);

  const leftSpec = specimenPool.find((s) => s.id === leftId) || specimenPool[0];
  const rightSpec = specimenPool.find((s) => s.id === rightId) || specimenPool[1] || specimenPool[0];

  const swapSpecimens = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  const getSub = (c?: SingleCoinData) => ({
    strike: c?.subGrades?.strikeScore || 8.6,
    luster: c?.subGrades?.lusterScore || 8.5,
    surface: c?.subGrades?.surfacePreservationScore || 8.4,
    appeal: c?.subGrades?.eyeAppealScore || 8.8,
    sheldon: c?.sheldonScaleNumber || 64,
  });

  const leftScores = getSub(leftSpec?.coin);
  const rightScores = getSub(rightSpec?.coin);
  const sheldonDelta = leftScores.sheldon - rightScores.sheldon;

  return (
    <div
      id="cross-comparison-modal"
      className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-6 overflow-y-auto"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-5xl bg-slate-950 border border-indigo-500/40 rounded-3xl shadow-[0_0_80px_rgba(99,102,241,0.2)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header with Back Button */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/95 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onClose}
              className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 hover:text-amber-300 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-400">
                  Tier 5 Architectural Engine
                </span>
                <span className="text-[10px] font-mono text-amber-400 hidden sm:inline">
                  • Multi-Coin Cross-Comparison Matrix
                </span>
              </div>
              <h3 className="text-sm sm:text-lg font-black text-white truncate">
                Side-by-Side Specimen & Set Differential Analyzer
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 font-sans">
          {/* Selector Row */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-3 items-center bg-slate-900/80 p-4 rounded-2xl border border-slate-800">
            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-mono uppercase text-amber-400 font-bold block">
                Specimen A (Primary Reference)
              </label>
              <select
                value={leftId}
                onChange={(e) => setLeftId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-amber-500"
              >
                {specimenPool.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    [{sp.sourceLabel}] {sp.coin.coinName} ({sp.coin.grade || 'UNC'})
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 flex justify-center">
              <button
                onClick={swapSpecimens}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-amber-500 hover:text-black text-slate-300 border border-slate-700 transition-all"
                title="Swap Left & Right Specimens"
              >
                <ArrowLeftRight size={16} />
              </button>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                Specimen B (Comparison Target)
              </label>
              <select
                value={rightId}
                onChange={(e) => setRightId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-cyan-500"
              >
                {specimenPool.map((sp) => (
                  <option key={sp.id} value={sp.id}>
                    [{sp.sourceLabel}] {sp.coin.coinName} ({sp.coin.grade || 'UNC'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Visual Cards Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { spec: leftSpec, scores: leftScores, accent: 'amber', badge: 'SPECIMEN A' },
              { spec: rightSpec, scores: rightScores, accent: 'cyan', badge: 'SPECIMEN B' },
            ].map(({ spec, scores, accent, badge }, idx) => (
              <div
                key={idx}
                className={`p-4 rounded-2xl bg-slate-900/70 border ${
                  accent === 'amber' ? 'border-amber-500/40' : 'border-cyan-500/40'
                } space-y-3`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-black ${
                      accent === 'amber'
                        ? 'bg-amber-500 text-black'
                        : 'bg-cyan-400 text-black'
                    }`}
                  >
                    {badge} • {spec?.sourceLabel}
                  </span>
                  <span className="text-xs font-mono font-black text-emerald-400">
                    {spec?.coin.estimatedValue}
                  </span>
                </div>

                <div className="flex items-center gap-3.5">
                  {spec?.image ? (
                    <img
                      src={spec.image}
                      alt={spec.coin.coinName}
                      className="w-20 h-20 rounded-2xl object-cover border border-slate-700 bg-black shrink-0"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-xs font-mono text-slate-400 shrink-0">
                      COIN
                    </div>
                  )}

                  <div className="min-w-0 space-y-1">
                    <h4 className="text-base font-black text-white truncate">
                      {spec?.coin.coinName}
                    </h4>
                    <div className="flex flex-wrap gap-1.5 font-mono text-[11px]">
                      <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-bold">
                        {spec?.coin.grade || `MS-${scores.sheldon}`}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        Sheldon #{scores.sheldon}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-purple-500/15 text-purple-300">
                        {spec?.coin.dieMatching?.dieState?.split(' ')[0] || 'MDS'} Die
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">
                      Alloy: {spec?.coin.composition || 'Standard Mint Alloy'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 4-Pillar & Sheldon Differential Bars */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-2">
                <Scale size={14} className="text-amber-400" />
                <span>Head-to-Head Subgrade & Technical Differential</span>
              </h4>
              <span className="text-xs font-mono text-slate-300">
                Sheldon Spread:{' '}
                <strong className={sheldonDelta >= 0 ? 'text-amber-400' : 'text-cyan-400'}>
                  {sheldonDelta === 0
                    ? 'Identical Grade Tier (0 pt delta)'
                    : `${sheldonDelta > 0 ? '+' : ''}${sheldonDelta} Sheldon Points`}
                </strong>
              </span>
            </div>

            {[
              { label: 'Strike Sharpness & Relief', a: leftScores.strike, b: rightScores.strike },
              { label: 'Cartwheel Luster & Originality', a: leftScores.luster, b: rightScores.luster },
              { label: 'Surface Preservation (Contact Marks)', a: leftScores.surface, b: rightScores.surface },
              { label: 'Eye Appeal & Toning Harmony', a: leftScores.appeal, b: rightScores.appeal },
            ].map((row, i) => {
              const diff = Math.round((row.a - row.b) * 10) / 10;
              return (
                <div key={i} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-amber-400 font-bold">{row.a.toFixed(1)} / 10</span>
                    <span className="text-slate-300 font-sans font-bold text-center">
                      {row.label}{' '}
                      <span className="text-[10px] font-mono text-slate-500">
                        ({diff > 0 ? `A +${diff}` : diff < 0 ? `B +${Math.abs(diff)}` : 'Tie'})
                      </span>
                    </span>
                    <span className="text-cyan-400 font-bold">{row.b.toFixed(1)} / 10</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden flex justify-end">
                      <div
                        className="h-full bg-amber-500 rounded-full"
                        style={{ width: `${row.a * 10}%` }}
                      />
                    </div>
                    <div className="h-2 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-cyan-400 rounded-full"
                        style={{ width: `${row.b * 10}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Dossier</span>
          </button>
          <span className="text-[10px] font-mono text-slate-500">
            MULTI-SPECIMEN SET CONSISTENCY ENGINE
          </span>
        </div>
      </motion.div>
    </div>
  );
};

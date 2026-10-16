import React from 'react';
import { motion } from 'motion/react';
import { X, TrendingUp, DollarSign, Award, Sparkles, BarChart2, ShieldCheck } from 'lucide-react';
import { MarketTrajectory } from '../types';

interface MarketTrajectoryModalProps {
  marketTrajectory?: MarketTrajectory;
  coinName?: string;
  currentValue?: string;
  onClose: () => void;
}

export const MarketTrajectoryModal: React.FC<MarketTrajectoryModalProps> = ({
  marketTrajectory,
  coinName = 'Specimen',
  currentValue = '$450 - $650',
  onClose,
}) => {
  const data = marketTrajectory || {
    currentMarketIndex: currentValue,
    sixMonthProjection: '+5.8% ($475 - $690)',
    oneYearProjection: '+14.2% ($515 - $745)',
    momentum: 'Bullish / High Collector Demand',
    rarityTrajectoryRank: 'Top 3% of PCGS/NGC Survival Census',
    keyDrivers: [
      'Aggressive competition among top-tier Registry Set builders.',
      'Strong precious metal bullion floor supporting vintage silver & gold specimens.',
      'Growing international demand for certified, CAC-verified key date dates.',
      'Fixed historical mintage with steadily shrinking available uncirculated supply.',
    ],
  };

  return (
    <div id="market-trajectory-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-3xl bg-slate-950 border border-emerald-500/40 rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Market Price Trajectory</span>
                <span className="text-[10px] font-mono text-slate-400">Auction Momentum & Registry Curves</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Predictive Valuation // {coinName}
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

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto font-sans">
          {/* Top Projection Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Current Market Index
              </span>
              <span className="text-xl font-black text-white font-mono block mt-1">{data.currentMarketIndex}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                6-Month Outlook
              </span>
              <span className="text-lg font-black text-emerald-400 font-mono block mt-1">{data.sixMonthProjection}</span>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                1-Year Trajectory
              </span>
              <span className="text-lg font-black text-emerald-300 font-mono block mt-1">{data.oneYearProjection}</span>
            </div>
          </div>

          {/* Momentum & Census Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Auction Velocity Momentum
              </span>
              <span className="text-base font-bold text-emerald-400 font-mono">{data.momentum}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Population Census Rank
              </span>
              <span className="text-base font-bold text-amber-400 font-mono">{data.rarityTrajectoryRank}</span>
            </div>
          </div>

          {/* Catalysts & Key Drivers */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <Sparkles size={14} className="text-amber-400" /> Valuation Trajectory Catalysts:
            </span>

            <div className="space-y-2">
              {data.keyDrivers.map((driver, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span className="text-xs text-slate-200 leading-relaxed">{driver}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { X, Activity, AlertTriangle, CheckCircle2, ShieldAlert, Sparkles, TrendingDown } from 'lucide-react';
import { WearProgressionModel } from '../types';

interface WearProgressionModalProps {
  wearProgression?: WearProgressionModel;
  coinName?: string;
  onClose: () => void;
}

export const WearProgressionModal: React.FC<WearProgressionModalProps> = ({
  wearProgression,
  coinName = 'Specimen',
  onClose,
}) => {
  const data = wearProgression || {
    modeledWearVsExpected: 'Natural cabinet friction on cheekbone consistent with AU-58 preservation. High relief points retain 92% original mint strike detail.',
    cleaningProbability: 12,
    artificialWearDetected: false,
    wearClassification: 'Natural Cabinet Friction',
    highPointWearBreakdown: [
      { feature: 'Cheekbone & Forehead Relief', expectedReliefPct: 95, observedReliefPct: 92, status: 'Light High-Point Friction' },
      { feature: 'Hair Curls Above Ear', expectedReliefPct: 95, observedReliefPct: 94, status: 'Mint State Sharpness' },
      { feature: 'Eagle Breast Feathers', expectedReliefPct: 90, observedReliefPct: 88, status: 'Light High-Point Friction' },
      { feature: 'Motto & Date Inscriptions', expectedReliefPct: 100, observedReliefPct: 100, status: 'Mint State Sharpness' },
    ],
    wearSummary: 'Surface wear matches hydrodynamic circulation wear patterns without abnormal flat patches or abrasive circular hairline scratches.',
  };

  const isLowCleaningRisk = data.cleaningProbability < 25;
  const isModerateCleaningRisk = data.cleaningProbability >= 25 && data.cleaningProbability < 60;

  return (
    <div id="wear-progression-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-3xl bg-slate-950 border border-cyan-500/40 rounded-3xl shadow-[0_0_80px_rgba(6,182,212,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center shrink-0">
              <Activity size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Wear Progression Engine</span>
                <span className="text-[10px] font-mono text-slate-400">Circulation vs Cleaning Modeling</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Surface Hydrodynamics // {coinName}
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
          {/* Top Status Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-cyan-400 block mb-1">
                Wear Classification
              </span>
              <span className="text-base font-black text-white font-mono block mt-1">{data.wearClassification}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Cleaning / Dipping Risk
              </span>
              <span className={`text-xl font-black font-mono block mt-1 ${isLowCleaningRisk ? 'text-emerald-400' : isModerateCleaningRisk ? 'text-amber-400' : 'text-red-400'}`}>
                {data.cleaningProbability}% {isLowCleaningRisk ? '(Uncleaned)' : '(Suspect)'}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Artificial Wear Detection
              </span>
              <span className={`text-xs font-bold block mt-2 ${data.artificialWearDetected ? 'text-red-400' : 'text-emerald-400'}`}>
                {data.artificialWearDetected ? '⚠️ Artificial Rub / Whizzing Detected' : '✓ Natural Circulation Patterns'}
              </span>
            </div>
          </div>

          {/* High Point Relief Breakdown */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              High Relief Contact Point Retention:
            </span>

            <div className="space-y-2.5">
              {data.highPointWearBreakdown.map((item, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-200">{item.feature}</span>
                    <span className="font-mono text-cyan-400 font-bold">{item.observedReliefPct}% Retention</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-amber-400 rounded-full transition-all"
                      style={{ width: `${item.observedReliefPct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span>Expected Benchmark: {item.expectedReliefPct}%</span>
                    <span className="text-amber-300 font-bold">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-1">
            <span className="text-[10px] font-black uppercase tracking-wider text-cyan-400 block">
              Modeled Wear Diagnosis:
            </span>
            <p>{data.modeledWearVsExpected}</p>
            <p className="text-slate-400 pt-1">{data.wearSummary}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

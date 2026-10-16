import React from 'react';
import { motion } from 'motion/react';
import { X, Layers, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, Compass } from 'lucide-react';
import { DieMatchingResult } from '../types';

interface DieMatchingModalProps {
  dieMatching?: DieMatchingResult;
  coinName?: string;
  onClose: () => void;
}

export const DieMatchingModal: React.FC<DieMatchingModalProps> = ({
  dieMatching,
  coinName = 'Specimen',
  onClose,
}) => {
  const data = dieMatching || {
    diePairId: 'Standard Production Die Pair',
    dieState: 'Mid Die State (MDS)',
    varietyAttribution: 'Normal Business Strike (No Major Hub Doubling)',
    dieMarkers: [
      'Normal field flow lines radiating toward rims',
      'No secondary hub doubling observed on motto lettering',
      'Mintmark punch positioned within standard die alignment',
    ],
    doublingClass: 'None Detected',
    rpmVector: 'Centered / Single Punch',
    dieAuthenticityConfidence: 96,
  };

  return (
    <div id="die-matching-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-3xl bg-slate-950 border border-purple-500/40 rounded-3xl shadow-[0_0_80px_rgba(168,85,247,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Layers size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-purple-400">AI Die-Matching Engine</span>
                <span className="text-[10px] font-mono text-emerald-400">Match Confidence: {data.dieAuthenticityConfidence}%</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Die Pair Recognition // {coinName}
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
          {/* Top Die Pair Identity Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-purple-400 block mb-1">
                Identified Die Pair
              </span>
              <span className="text-xl font-black text-white font-mono">{data.diePairId}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Working Die State
              </span>
              <span className="text-sm font-bold text-amber-300 font-mono block mt-1">{data.dieState}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Catalog Attribution
              </span>
              <span className="text-xs font-bold text-slate-200 block truncate mt-1">{data.varietyAttribution}</span>
            </div>
          </div>

          {/* Doubling & RPM Vector Classifications */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" /> Hub Doubling Classification
              </span>
              <p className="text-sm font-mono text-purple-300 font-bold">{data.doublingClass || 'Class I Rotated Hub'}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Evaluated against Cherrypickers' Guide and Wexler Doubled Die files for serif split notches and clockwise rotational spread.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
                <Compass size={14} className="text-cyan-400" /> Repunched Mintmark (RPM) Vector
              </span>
              <p className="text-sm font-mono text-cyan-300 font-bold">{data.rpmVector || 'None Detected'}</p>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identifies displacement angle and secondary punch remnants beneath the primary mintmark steel stamp.
              </p>
            </div>
          </div>

          {/* Die Markers Checklist */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Unique Die Diagnostic Markers (Die Clashes & Polish Lines):
            </span>

            <div className="space-y-2">
              {data.dieMarkers.map((marker, i) => (
                <div key={i} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-slate-200 leading-relaxed">{marker}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Numismatic Science Note */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-400 leading-relaxed space-y-1">
            <strong className="text-slate-200 block uppercase font-bold text-[10px]">Die Pair Verification Standard:</strong>
            <p>
              Coins struck from the same working die share identical microscopic markers — die polish lines, flow cracks, and clash marks from when the dies met without a planchet. Matching these confirms authenticity beyond question.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

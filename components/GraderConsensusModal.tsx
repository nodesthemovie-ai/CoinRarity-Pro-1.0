import React from 'react';
import { motion } from 'motion/react';
import { X, Users, Award, ShieldCheck, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { MultiModelGraderConsensus } from '../types';

interface GraderConsensusModalProps {
  graderConsensus?: MultiModelGraderConsensus;
  coinName?: string;
  onClose: () => void;
}

export const GraderConsensusModal: React.FC<GraderConsensusModalProps> = ({
  graderConsensus,
  coinName = 'Specimen',
  onClose,
}) => {
  const data = graderConsensus || {
    consensusGrade: 'MS-65',
    consensusSheldon: 65,
    gradeSpread: 'MS-64+ to MS-65+',
    consensusConfidence: 94,
    consensusSummary: 'Strong consensus among technical and eye-appeal nodes for Gem Uncirculated MS-65. Minor contact marks on field offset by radiant cartwheel luster.',
    nodes: [
      { graderRole: 'Chief Technical Grader', assignedGrade: 'MS-65', sheldonNum: 65, notes: 'Zero high point wear; field marks isolated to non-focal areas.' },
      { graderRole: 'Luster & Cartwheel Specialist', assignedGrade: 'MS-65+', sheldonNum: 65, notes: 'Exceptional unbroken spinning cartwheel luster radiating 360 degrees.' },
      { graderRole: 'Strike Sharpness Auditor', assignedGrade: 'MS-64+', sheldonNum: 64, notes: 'Sharp strike on center devices; eagle breast feathers fully separated.' },
      { graderRole: 'Surface Integrity Auditor', assignedGrade: 'MS-65', sheldonNum: 65, notes: 'Original skin; completely free of past dipping or cleaning hairlines.' },
      { graderRole: 'Auction Market Grader', assignedGrade: 'MS-65', sheldonNum: 65, notes: 'Trades solidly at current MS-65 median price index.' },
    ],
  };

  return (
    <div id="grader-consensus-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-3xl bg-slate-950 border border-amber-500/40 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <Users size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Consensus Deliberation</span>
                <span className="text-[10px] font-mono text-emerald-400">Multi-Model Node Agreement</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Grading Consensus // {coinName}
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
          {/* Top Consensus Card */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-400 block mb-1">
                Net Consensus Grade
              </span>
              <span className="text-2xl font-black text-amber-400 font-mono block mt-1">{data.consensusGrade}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Node Grade Spread
              </span>
              <span className="text-base font-bold text-white font-mono block mt-2">{data.gradeSpread}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Consensus Confidence
              </span>
              <span className="text-2xl font-black text-emerald-400 font-mono block mt-1">{data.consensusConfidence}%</span>
            </div>
          </div>

          {/* Deliberation Summary */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 leading-relaxed">
            <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 block mb-1">
              Deliberation Rationale:
            </span>
            {data.consensusSummary}
          </div>

          {/* Specialist Grader Nodes */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Individual Specialist Grader Node Findings:
            </span>

            <div className="space-y-2.5">
              {data.nodes.map((node, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-200 block">{node.graderRole}</span>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{node.notes}</p>
                  </div>
                  <div className="text-right shrink-0 bg-black/60 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block">NODE OPINION</span>
                    <span className="text-sm font-black text-amber-400 font-mono">{node.assignedGrade}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { X, ShieldAlert, Sparkles, CheckCircle2, AlertTriangle, Droplets, Ban } from 'lucide-react';
import { RestorationAdvisor } from '../types';

interface RestorationAdvisorModalProps {
  restorationAdvisor?: RestorationAdvisor;
  coinName?: string;
  onClose: () => void;
}

export const RestorationAdvisorModal: React.FC<RestorationAdvisorModalProps> = ({
  restorationAdvisor,
  coinName = 'Specimen',
  onClose,
}) => {
  const data = restorationAdvisor || {
    acetoneSafe: true,
    verdigrisPresent: false,
    pvcDamageDetected: false,
    conservationAction: 'Safe to Conserve (Curatorial Acetone)',
    safeHandlingSteps: [
      'Hold specimen exclusively by the coin edge over a soft microfiber tray.',
      'If organic surface grime is present, rinse in 100% ACS-grade pure acetone in a glass dish (never plastic).',
      'Allow to air-dry on clean lint-free archival paper without wiping or dabbing.',
      'Store in non-PVC inert Mylar flips or certified airtight acrylic capsules with active intercept corrosion foam.',
    ],
    warnings: [
      'NEVER rub with jewelry polishing cloths, baking soda, or silver dips — this destroys mint cartwheel luster permanently.',
      'Avoid flexible soft vinyl flips which contain acidic PVC plasticizers that leave green acidic film.',
      'Do not attempt mechanical picking with dental tools or toothpicks.',
    ],
  };

  return (
    <div id="restoration-advisor-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-3xl bg-slate-950 border border-teal-500/40 rounded-3xl shadow-[0_0_80px_rgba(20,184,166,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
              <Droplets size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-teal-400">Curatorial Conservation</span>
                <span className="text-[10px] font-mono text-slate-400">Restoration Guidance</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Restoration Advisor // {coinName}
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
          {/* Top Status */}
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-teal-400 block mb-1">
                Conservation Recommendation
              </span>
              <h4 className="text-lg font-bold text-white">{data.conservationAction}</h4>
            </div>

            <div className="flex items-center gap-3">
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${data.acetoneSafe ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' : 'bg-red-500/15 border-red-500/30 text-red-300'}`}>
                {data.acetoneSafe ? '✓ Acetone Safe' : '✗ Avoid Acetone'}
              </span>
              <span className={`px-3 py-1.5 rounded-xl text-xs font-bold font-mono border ${data.pvcDamageDetected ? 'bg-red-500/15 border-red-500/30 text-red-300' : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'}`}>
                {data.pvcDamageDetected ? '⚠️ PVC Damage' : '✓ No PVC Residue'}
              </span>
            </div>
          </div>

          {/* Actionable Handling Steps */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block flex items-center gap-1.5">
              <CheckCircle2 size={14} className="text-teal-400" /> Curatorial Preservation Protocol:
            </span>

            <div className="space-y-2">
              {data.safeHandlingSteps.map((step, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-md bg-teal-500/10 text-teal-400 font-mono text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="text-xs text-slate-200 leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strict Warnings */}
          <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 space-y-2">
            <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
              <Ban size={15} /> Prohibited Cleaning Practices (Destroys Coin Value):
            </div>
            <ul className="space-y-1.5 text-xs text-red-200/90 pl-1">
              {data.warnings.map((warning, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

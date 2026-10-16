import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, CheckCircle2, ShieldCheck, Flame, Zap, Eye } from 'lucide-react';
import { SpectralAlloyInference } from '../types';

interface SpectralAlloyModalProps {
  spectralAlloy?: SpectralAlloyInference;
  coinName?: string;
  onClose: () => void;
}

export const SpectralAlloyModal: React.FC<SpectralAlloyModalProps> = ({
  spectralAlloy,
  coinName = 'Specimen',
  onClose,
}) => {
  const data = spectralAlloy || {
    inferredAlloy: '90.2% Silver, 9.8% Copper (Legal 90/10 Standard)',
    dominantWavelengthNm: 585,
    reflectivityIndex: 88,
    alloyConsistency: 'Exact Mint Standard',
    spectralSignatureNotes: 'Specular highlights exhibit characteristic cold white silver reflectance with warm champagne toning in protected star recesses.',
    colorSpectrumGroup: 'Silver-White Lustrous',
  };

  return (
    <div id="spectral-alloy-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
              <Zap size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-emerald-400">Spectral Metal Analysis</span>
                <span className="text-[10px] font-mono text-slate-400">Color Wavelength & Metallurgy</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white truncate max-w-md">
                Optical Alloy Inference // {coinName}
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
          {/* Top Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="text-[9px] font-black uppercase tracking-widest text-emerald-400 block mb-1">
                Inferred Chemical Alloy
              </span>
              <span className="text-sm font-black text-white font-mono block mt-1">{data.inferredAlloy}</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Spectral Reflectivity Index
              </span>
              <span className="text-xl font-black text-amber-400 font-mono block mt-1">{data.reflectivityIndex} / 100</span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
                Peak Reflectance Band
              </span>
              <span className="text-xl font-black text-cyan-400 font-mono block mt-1">{data.dominantWavelengthNm} nm</span>
            </div>
          </div>

          {/* Metallurgical Spectrum Bar */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-300">Wavelength Calibration Range (400nm - 700nm):</span>
              <span className="font-mono text-emerald-400 font-bold">{data.colorSpectrumGroup}</span>
            </div>

            {/* Rainbow Spectrum Visualizer */}
            <div className="relative h-6 rounded-xl overflow-hidden bg-gradient-to-r from-violet-600 via-blue-500 via-emerald-400 via-yellow-400 via-orange-500 to-red-600 border border-white/10 flex items-center">
              {/* Position Marker */}
              <div
                className="absolute top-0 bottom-0 w-2 bg-white rounded shadow-[0_0_10px_white] -translate-x-1"
                style={{
                  left: `${Math.max(5, Math.min(95, ((data.dominantWavelengthNm - 400) / 300) * 100))}%`,
                }}
              />
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>400nm (UV / Violet)</span>
              <span className="text-white font-bold">{data.dominantWavelengthNm}nm (Detected Emission)</span>
              <span>700nm (Infrared / Deep Red)</span>
            </div>
          </div>

          {/* Alloy Consistency Status */}
          <div className="p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20 flex items-start gap-3">
            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                Alloy Consistency: {data.alloyConsistency}
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{data.spectralSignatureNotes}</p>
            </div>
          </div>

          {/* Science explanation */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/5 text-xs text-slate-400 leading-relaxed">
            <strong className="text-slate-200 block uppercase font-bold text-[10px] mb-1">
              Optical Spectral Chromatography:
            </strong>
            <p>
              Different coin alloys reflect specific ratios of blue, yellow, and red wavelengths. 90% silver reflects 95%+ of visible light evenly, while copper-nickel clad displays muted grey-blue absorption. Off-metal blanks (e.g. 1943 bronze cent vs steel) are instantly flagged by spectral divergence.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

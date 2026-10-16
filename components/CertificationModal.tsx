import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  X,
  ArrowLeft,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Sparkles,
  Bot,
  FileText,
} from 'lucide-react';
import { MultiCoinAnalysisResult } from '../types';
import { CoinSlabView } from './CoinSlabView';

interface CertificationModalProps {
  result: MultiCoinAnalysisResult;
  image: string;
  reverseImage?: string;
  onClose: () => void;
  onOpenConsultation?: () => void;
  onOpenReportStudio?: () => void;
}

export const CertificationModal: React.FC<CertificationModalProps> = ({
  result,
  image,
  reverseImage,
  onClose,
  onOpenConsultation,
  onOpenReportStudio,
}) => {
  const [copied, setCopied] = useState(false);
  const [activeView, setActiveView] = useState<'cert' | 'slab'>('cert');
  const coin = result.coins[0];
  const certId = result.auditId || `CP-${Date.now().toString(36).toUpperCase()}`;

  const handleCopyId = () => {
    navigator.clipboard.writeText(certId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="certification-modal-overlay" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 w-full max-w-4xl bg-slate-950 border border-amber-500/30 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.15)] overflow-hidden my-6"
      >
        {/* Top Control Bar */}
        <div className="bg-slate-900/90 border-b border-white/10 px-5 sm:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <ShieldCheck size={18} />
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">Numismatic Verification</h3>
              <p className="text-[10px] font-mono text-slate-400">Registry Reference: {certId}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* View Switcher */}
            <div className="bg-slate-800 p-1 rounded-xl flex border border-slate-700 text-xs font-bold">
              <button
                id="cert-tab-btn"
                onClick={() => setActiveView('cert')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'cert' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Official Document
              </button>
              <button
                id="slab-tab-btn"
                onClick={() => setActiveView('slab')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeView === 'slab' ? 'bg-amber-500 text-black shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Encapsulated Slab
              </button>
            </div>

            {onOpenReportStudio && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReportStudio();
                }}
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Generate PDF or JSON Summary Report"
              >
                <FileText size={14} />
                <span>PDF / JSON</span>
              </button>
            )}

            {onOpenConsultation && (
              <button
                onClick={() => {
                  onClose();
                  onOpenConsultation();
                }}
                className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="Consult Numismatist AI"
              >
                <Bot size={14} />
                <span className="hidden sm:inline">Ask Expert</span>
              </button>
            )}

            <button
              id="copy-cert-id-btn"
              onClick={handleCopyId}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
              title="Copy Registry ID"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
            </button>

            <button
              id="print-cert-btn"
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 transition-colors"
              title="Print Certificate"
            >
              <Printer size={16} />
            </button>

            <button
              id="close-cert-modal-btn"
              onClick={onClose}
              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-10 max-h-[80vh] overflow-y-auto">
          {activeView === 'slab' ? (
            <div className="py-6 flex flex-col items-center">
              {coin ? (
                <CoinSlabView coin={coin} image={image} reverseImage={reverseImage} auditId={certId} />
              ) : (
                <p className="text-slate-400">No primary coin specimen available.</p>
              )}
            </div>
          ) : (
            <div id="printable-certificate" className="bg-[#0b0f17] border-4 border-amber-500/40 rounded-3xl p-6 sm:p-12 relative overflow-hidden text-slate-100 shadow-2xl">
              {/* Decorative Corner Accents */}
              <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-amber-500" />
              <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-amber-500" />
              <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-amber-500" />
              <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-amber-500" />

              {/* Watermark */}
              <div className="absolute inset-0 pointer-events-none opacity-[0.02] flex items-center justify-center select-none rotate-[-25deg]">
                <span className="text-8xl font-black uppercase tracking-widest text-white">COINRARITY PRO</span>
              </div>

              {/* Certificate Header */}
              <div className="text-center space-y-3 pb-8 border-b border-amber-500/20">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-[3px] text-amber-400">
                  <Sparkles size={12} />
                  <span>Verified Numismatic Record</span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-serif font-black tracking-tight text-white uppercase">
                  Certificate of Numismatic Audit
                </h1>
                <p className="text-xs font-mono text-slate-400 uppercase tracking-[4px]">
                  Specimen Authenticity & Grade Valuation Dossier
                </p>
              </div>

              {/* Specimen and Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 my-8 items-center">
                {/* Image Section (Obverse & optional Reverse) */}
                <div className="md:col-span-4 flex flex-col items-center gap-3">
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <div className="flex flex-col items-center">
                      <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-br from-amber-500/20 to-black border-2 border-amber-500/40 shadow-2xl overflow-hidden flex items-center justify-center">
                        <img src={image} alt="Obverse specimen plate" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover" />
                      </div>
                      <span className="mt-1 text-[9px] font-mono text-amber-400 uppercase tracking-wider">Obverse Plate</span>
                    </div>

                    {reverseImage && (
                      <div className="flex flex-col items-center">
                        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-br from-amber-500/20 to-black border-2 border-amber-500/40 shadow-2xl overflow-hidden flex items-center justify-center">
                          <img src={reverseImage} alt="Reverse specimen plate" className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover" />
                        </div>
                        <span className="mt-1 text-[9px] font-mono text-amber-400 uppercase tracking-wider">Reverse Plate</span>
                      </div>
                    )}
                  </div>
                  <div className="text-center font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                    Photographic Specimen Records
                  </div>
                </div>

                {/* Primary Data */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest">Catalog Designation</span>
                    <h2 className="text-2xl font-black text-white">{coin?.coinName || 'Identified Coin'}</h2>
                    <p className="text-sm font-mono text-slate-400">
                      Year: {coin?.year || 'Unstated'} • Mint: {coin?.mintMark || 'None'} • Strike: {coin?.strikeType || 'Standard'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Assessed Grade</span>
                      <span className="text-xl font-black text-amber-400 font-mono">{coin?.grade || 'UNC'}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Rarity Tier</span>
                      <span className="text-sm font-black text-white font-mono mt-1 block">{coin?.rarityLevel || 'Common'}</span>
                    </div>
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block">Market Range</span>
                      <span className="text-lg font-black text-emerald-400 font-mono">{coin?.estimatedValue || '$0'}</span>
                    </div>
                  </div>

                  {coin?.composition && (
                    <div className="text-xs text-slate-300 font-medium">
                      <span className="text-slate-500 font-bold uppercase text-[10px] mr-2">Composition:</span>
                      {coin.composition} {coin.preciousMetalContent ? `(${coin.preciousMetalContent})` : ''}
                    </div>
                  )}

                  {/* Subgrades and CAC Indicators if available */}
                  {coin?.subGrades && (
                    <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-xs">
                      <div className="bg-black/30 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[8px] text-slate-500 block">STRIKE</span>
                        <span className="font-bold text-amber-400">{coin.subGrades.strikeScore.toFixed(1)}/10</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[8px] text-slate-500 block">LUSTER</span>
                        <span className="font-bold text-amber-400">{coin.subGrades.lusterScore.toFixed(1)}/10</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[8px] text-slate-500 block">SURFACE</span>
                        <span className="font-bold text-amber-400">{coin.subGrades.surfacePreservationScore.toFixed(1)}/10</span>
                      </div>
                      <div className="bg-black/30 p-2 rounded-lg border border-slate-800 text-center">
                        <span className="text-[8px] text-slate-500 block">APPEAL</span>
                        <span className="font-bold text-amber-400">{coin.subGrades.eyeAppealScore.toFixed(1)}/10</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Technical Reasoning */}
              <div className="my-6 bg-slate-900/40 p-5 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest">Master Grader Analysis</span>
                <p className="text-sm text-slate-300 leading-relaxed font-sans">{coin?.reasoning || result.overallCondition}</p>
                {coin?.historicalContext && (
                  <p className="text-xs text-slate-400 italic pt-2 border-t border-white/5">
                    <strong>Historical Lore:</strong> {coin.historicalContext}
                  </p>
                )}
              </div>

              {/* Footer Stamp & Signatures */}
              <div className="pt-8 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full border-2 border-amber-500/50 bg-amber-500/5 flex flex-col items-center justify-center p-1 text-center">
                    <CheckCircle2 size={20} className="text-amber-400" />
                    <span className="text-[7px] font-black uppercase tracking-widest text-amber-400 mt-1">SEALED</span>
                  </div>
                  <div className="font-mono text-[9px] text-slate-500 uppercase leading-relaxed">
                    <div>Issued: {new Date(result.timestamp).toLocaleDateString()}</div>
                    <div>Validation Node: US-W1-PRO</div>
                    <div>Standard: PCGS/NGC Sheldon 70 Equivalent</div>
                  </div>
                </div>

                <div className="text-center sm:text-right">
                  <div className="font-serif italic text-lg text-amber-400 font-bold">CoinRarity Numismatic Bureau</div>
                  <div className="w-48 h-px bg-amber-500/40 my-1 mx-auto sm:ml-auto" />
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Autonomous Grader Authorization</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

import React from 'react';
import { motion } from 'motion/react';
import { Coins, Sparkles, ShieldCheck } from 'lucide-react';
import { CoinAnalyzer } from './components/CoinAnalyzer';

const App: React.FC = () => {
  return (
    <div
      id="app-root"
      className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 pb-20 md:pb-0"
    >
      {/* Subtle Background Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-amber-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-indigo-500/5 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header
        id="app-header"
        className="bg-slate-950/85 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-[60]"
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)] shrink-0">
              <Coins className="text-black w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-black tracking-tight text-white uppercase italic truncate">
                CoinRarity <span className="text-amber-400">Pro</span>
                <span className="ml-2 text-[9px] not-italic font-mono px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 align-middle hidden xs:inline-block">
                  ULTRA ELITE
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 leading-none truncate">
                Forensic Numismatic AI • 25-Coin Tray & 50x Loupe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
                <Sparkles size={10} />
                <span>12-Node Consensus & Multi-Spectrum</span>
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-[11px] font-mono text-slate-400 uppercase">
                  Forensic Suite // Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="app-main" className="flex-grow flex flex-col items-center justify-start py-4 sm:py-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-4 sm:mb-8 px-4">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-[0.18em] text-amber-400 mb-3 shadow-sm"
          >
            <ShieldCheck size={12} />
            <span>PCGS / NGC / CAC Compatible • 12-Node AI Grading</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-2xl sm:text-5xl font-black text-white mb-2 sm:mb-3 tracking-tight leading-none"
          >
            FORENSIC <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">NUMISMATIC LAB</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="text-xs sm:text-base text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed"
          >
            Single-specimen & 25-coin tray recognition, 50× multi-spectrum loupe, die-pair attribution, strike tonnage reconstruction, and cross-comparison intelligence.
          </motion.p>
        </div>

        <CoinAnalyzer />
      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-slate-950 py-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-4 items-center">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-xs font-mono">
              [COINRARITY PRO ULTRA] // FORENSIC NUMISMATIC INTELLIGENCE PLATFORM
            </p>
            <p className="text-slate-600 text-[10px] mt-1 font-mono">
              12-NODE CONSENSUS • 50X MULTI-SPECTRUM LOUPE • DIE-MATCHING • STRIKE RECONSTRUCTION
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
              Single & 25-Coin Batch Tray Valuation & Variety Attribution
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

import React from 'react';
import { motion } from 'motion/react';
import { Coins, Sparkles, ShieldCheck, Scale, Volume2 } from 'lucide-react';
import { CoinAnalyzer } from './components/CoinAnalyzer';

const App: React.FC = () => {
  return (
    <div id="app-root" className="min-h-screen bg-[#06080d] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Subtle Background Lighting */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-amber-500/5 blur-[140px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[500px] bg-indigo-500/5 blur-[140px] rounded-full" />
      </div>

      {/* Header */}
      <header id="app-header" className="bg-slate-950/80 backdrop-blur-2xl border-b border-white/10 sticky top-0 z-[60]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.25)]">
              <Coins className="text-black w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-white uppercase italic">
                CoinRarity <span className="text-amber-400">Pro</span>
              </h1>
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 leading-none">
                AI Numismatic Grading & Valuation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex flex-col items-end">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-widest flex items-center gap-1.5">
                <Sparkles size={10} />
                <span>Gemini 3.8 Vision Engine</span>
              </span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_#34d399]" />
                <span className="text-xs font-mono text-slate-400 uppercase">Server-Side API // Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="app-main" className="flex-grow flex flex-col items-center justify-start py-10 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 px-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-amber-400 mb-5 shadow-sm"
          >
            <ShieldCheck size={12} />
            <span>PCGS & NGC Standard Compatible Audit</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl sm:text-6xl font-black text-white mb-4 tracking-tight leading-none"
          >
            PRECISION <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-yellow-500">COIN AUDIT</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.16 }}
            className="text-base sm:text-lg text-slate-400 max-w-xl mx-auto font-medium leading-relaxed"
          >
            Instant Sheldon scale grading, planchet error detection, auction price intelligence, and synthesized voice narration.
          </motion.p>
        </div>

        <CoinAnalyzer />
      </main>

      {/* Footer */}
      <footer id="app-footer" className="bg-slate-950 py-10 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6 items-center">
          <div className="text-center md:text-left">
            <p className="text-slate-400 text-xs font-mono">
              [COINRARITY PRO] // NUMISMATIC INTELLIGENCE PLATFORM
            </p>
            <p className="text-slate-600 text-[10px] mt-1 font-mono">
              ENGINE: GEMINI 3.8 FLASH • TTS: 3.1 FLASH AUDIO • ENCAPSULATION AUDIT COMPLIANT
            </p>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-500 text-[10px] uppercase font-black tracking-widest">
              Automated Specimen Valuation & Variety Identification
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

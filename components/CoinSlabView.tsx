import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Award, RefreshCw, CheckCircle2, Sparkles, QrCode } from 'lucide-react';
import { SingleCoinData } from '../types';

interface CoinSlabViewProps {
  coin: SingleCoinData;
  image: string;
  reverseImage?: string;
  auditId?: string;
}

export const CoinSlabView: React.FC<CoinSlabViewProps> = ({
  coin,
  image,
  reverseImage,
  auditId = 'CP-AUDIT-992',
}) => {
  const [showingReverse, setShowingReverse] = useState(false);
  const [cacSticker, setCacSticker] = useState<'none' | 'green' | 'gold'>('green');
  const [isFlipping, setIsFlipping] = useState(false);

  const handleFlip = () => {
    setIsFlipping(true);
    setTimeout(() => {
      setShowingReverse((prev) => !prev);
      setIsFlipping(false);
    }, 150);
  };

  // Generate SVG QR code mock for registry
  const qrSvg = `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="#fbbf24">
      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14-2h4v4h-4v-4zm-4 4h4v4h-4v-4zm4 0h4v4h-4v-4zm-4-4h4v4h-4v-4z"/>
    </svg>
  `)}`;

  return (
    <div
      id="coin-slab-card"
      className="relative w-full max-w-sm mx-auto bg-gradient-to-b from-slate-900/95 via-slate-800/90 to-slate-950/95 rounded-3xl p-4 border-2 border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8),inset_0_1px_1px_rgba(255,255,255,0.3)] backdrop-blur-xl transition-all"
    >
      {/* Outer Acrylic Slab Bevel */}
      <div className="rounded-2xl border border-white/10 p-3 bg-black/40 flex flex-col items-center relative overflow-hidden">
        {/* Holographic Security Sheen Light */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-gradient-to-br from-cyan-400/20 via-amber-300/20 to-purple-400/20 blur-2xl pointer-events-none rounded-full" />

        {/* Certified Label Header */}
        <div className="w-full bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border border-amber-500/40 rounded-xl p-3 mb-3 shadow-inner relative overflow-hidden">
          {/* Holographic Security Strip */}
          <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-cyan-400 via-amber-300 via-purple-400 to-emerald-400 opacity-80 animate-pulse" />

          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <ShieldCheck size={14} />
                <span className="text-[10px] font-black uppercase tracking-[2px]">COINRARITY PRO CERTIFIED</span>
              </div>
              <h4 className="text-sm font-black text-white tracking-tight mt-0.5">{coin.coinName}</h4>
              <p className="text-[10px] font-mono text-slate-400">
                {coin.year || 'Circa'} {coin.mintMark || ''} • {coin.strikeType || 'Business Strike'}
              </p>
            </div>

            {/* Big Grade Badge */}
            <div className="text-right shrink-0 bg-black/80 px-2.5 py-1.5 rounded-lg border border-amber-500/40 shadow-sm relative">
              <span className="text-[8px] font-mono text-slate-400 uppercase tracking-widest block leading-none">
                GRADE
              </span>
              <span className="text-lg font-black text-amber-400 font-mono tracking-tight leading-none block mt-1">
                {coin.grade || 'MS-65'}
              </span>

              {/* CAC Sticker representation */}
              {cacSticker === 'green' && (
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-emerald-500 border border-emerald-300 flex items-center justify-center shadow-[0_0_8px_#10b981]"
                  title="CAC Green Bean Certified (Premium Quality for Grade)"
                >
                  <span className="text-[7px] font-black text-black font-serif">C</span>
                </div>
              )}
              {cacSticker === 'gold' && (
                <div
                  className="absolute -bottom-2 -left-2 w-4 h-4 rounded-full bg-yellow-400 border border-amber-200 flex items-center justify-center shadow-[0_0_8px_#f59e0b]"
                  title="CAC Gold Bean Certified (Undergraded by at least 1 full grade)"
                >
                  <span className="text-[7px] font-black text-black font-serif">★</span>
                </div>
              )}
            </div>
          </div>

          {/* Barcode, QR Code & Registry Serial */}
          <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[8px] font-mono text-slate-400">
            <div className="flex items-center gap-2">
              <img src={qrSvg} alt="QR Serial" className="w-4 h-4 opacity-75" />
              <div className="tracking-[3px] text-slate-400">||||| | |||| ||| ||||||| |</div>
            </div>
            <div className="uppercase tracking-widest text-slate-300 font-bold">{auditId}</div>
          </div>
        </div>

        {/* Subgrade Badges if available */}
        {coin.subGrades && (
          <div className="w-full grid grid-cols-4 gap-1 mb-2 px-1 text-center font-mono">
            <div className="bg-black/40 py-1 rounded border border-white/5">
              <span className="text-[7px] text-slate-500 block uppercase">STRIKE</span>
              <span className="text-[10px] font-bold text-amber-300">{coin.subGrades.strikeScore.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 py-1 rounded border border-white/5">
              <span className="text-[7px] text-slate-500 block uppercase">LUSTER</span>
              <span className="text-[10px] font-bold text-amber-300">{coin.subGrades.lusterScore.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 py-1 rounded border border-white/5">
              <span className="text-[7px] text-slate-500 block uppercase">SURFACE</span>
              <span className="text-[10px] font-bold text-amber-300">{coin.subGrades.surfacePreservationScore.toFixed(1)}</span>
            </div>
            <div className="bg-black/40 py-1 rounded border border-white/5">
              <span className="text-[7px] text-slate-500 block uppercase">APPEAL</span>
              <span className="text-[10px] font-bold text-amber-300">{coin.subGrades.eyeAppealScore.toFixed(1)}</span>
            </div>
          </div>
        )}

        {/* Coin Well / Recessed Acrylic Mount */}
        <motion.div
          animate={{ rotateY: isFlipping ? 90 : 0 }}
          transition={{ duration: 0.15 }}
          className="relative w-56 h-56 rounded-full p-2 bg-gradient-to-br from-slate-800 to-black border-4 border-slate-700/60 shadow-[inset_0_4px_14px_rgba(0,0,0,0.95),0_0_20px_rgba(0,0,0,0.6)] flex items-center justify-center overflow-hidden group cursor-pointer"
          onClick={reverseImage ? handleFlip : undefined}
          title={reverseImage ? 'Click to flip coin' : undefined}
        >
          {/* Internal white gasket ring */}
          <div className="absolute inset-1.5 rounded-full border border-white/10 pointer-events-none z-10" />

          <img
            src={showingReverse && reverseImage ? reverseImage : image}
            alt={coin.coinName}
            className="w-48 h-48 rounded-full object-cover shadow-2xl transition-transform duration-300 group-hover:scale-105"
          />

          {/* Face tag overlay */}
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="px-2 py-0.5 rounded-full bg-black/80 border border-white/10 text-[9px] font-mono text-amber-300 uppercase tracking-widest shadow">
              {showingReverse && reverseImage ? 'REVERSE' : 'OBVERSE'}
            </span>
          </div>

          {/* Glare Reflection overlay */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/20 pointer-events-none rounded-full" />
        </motion.div>

        {/* Controls below well: Flip and CAC Bean Toggle */}
        <div className="w-full mt-3 flex items-center justify-between gap-2 px-1">
          {/* Flip button if reverse is present */}
          {reverseImage ? (
            <button
              onClick={handleFlip}
              className="px-3 py-1 bg-slate-800/90 hover:bg-slate-700 border border-slate-700 rounded-full text-[10px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 transition-all shadow-sm"
            >
              <RefreshCw size={11} className={showingReverse ? 'rotate-180 transition-transform' : ''} />
              <span>Flip to {showingReverse ? 'Obverse' : 'Reverse'}</span>
            </button>
          ) : (
            <span className="text-[10px] font-mono text-slate-500">Single Face Encapsulation</span>
          )}

          {/* CAC Toggle */}
          <div className="flex items-center gap-1 bg-black/60 p-0.5 rounded-full border border-white/10 text-[9px] font-mono">
            <span className="text-slate-500 px-1.5 uppercase font-bold">CAC:</span>
            <button
              onClick={() => setCacSticker('none')}
              className={`px-1.5 py-0.5 rounded-full ${cacSticker === 'none' ? 'bg-slate-700 text-white' : 'text-slate-400'}`}
            >
              Off
            </button>
            <button
              onClick={() => setCacSticker('green')}
              className={`px-1.5 py-0.5 rounded-full font-bold ${cacSticker === 'green' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}
              title="Green Bean"
            >
              Green
            </button>
            <button
              onClick={() => setCacSticker('gold')}
              className={`px-1.5 py-0.5 rounded-full font-bold ${cacSticker === 'gold' ? 'bg-amber-400 text-black' : 'text-slate-400'}`}
              title="Gold Bean"
            >
              Gold
            </button>
          </div>
        </div>

        {/* Lower Slab Specimen Details */}
        <div className="w-full mt-2.5 bg-slate-900/70 rounded-xl p-2.5 border border-slate-800 text-center">
          <div className="flex items-center justify-center gap-2 text-slate-400 text-[10px] font-medium flex-wrap">
            <div className="flex items-center gap-1">
              <Award size={12} className="text-amber-500" />
              <span>Rarity: <strong className="text-white">{coin.rarityLevel}</strong></span>
            </div>
            <span>•</span>
            <div>Valuation: <strong className="text-emerald-400">{coin.estimatedValue}</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
};

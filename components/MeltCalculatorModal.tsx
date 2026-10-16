import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { X, Flame, DollarSign, Scale, RefreshCw, Sparkles, TrendingUp } from 'lucide-react';

interface BullionCoinPreset {
  id: string;
  name: string;
  metal: 'silver' | 'gold' | 'platinum';
  metalContentOz: number; // ASW or AGW
  weightGrams: number;
  purity: string;
  defaultCollectorValueRange: string;
}

const BULLION_PRESETS: BullionCoinPreset[] = [
  { id: 'morgan-dollar', name: 'Morgan / Peace Silver Dollar (1878–1935)', metal: 'silver', metalContentOz: 0.7734, weightGrams: 26.73, purity: '90% Silver', defaultCollectorValueRange: '$32 - $55+' },
  { id: 'silver-half', name: 'Pre-1965 90% Silver Half Dollar (Walking/Franklin/1964 Kennedy)', metal: 'silver', metalContentOz: 0.3617, weightGrams: 12.50, purity: '90% Silver', defaultCollectorValueRange: '$12 - $25+' },
  { id: 'silver-quarter', name: 'Pre-1965 90% Silver Washington Quarter', metal: 'silver', metalContentOz: 0.1808, weightGrams: 6.25, purity: '90% Silver', defaultCollectorValueRange: '$5.50 - $12+' },
  { id: 'silver-dime', name: 'Pre-1965 90% Silver Roosevelt / Mercury Dime', metal: 'silver', metalContentOz: 0.0723, weightGrams: 2.50, purity: '90% Silver', defaultCollectorValueRange: '$2.20 - $6+' },
  { id: 'silver-war-nickel', name: '1942–1945 35% Silver Jefferson "War" Nickel', metal: 'silver', metalContentOz: 0.0563, weightGrams: 5.00, purity: '35% Silver', defaultCollectorValueRange: '$1.80 - $4+' },
  { id: 'silver-40-kennedy', name: '1965–1970 40% Silver Kennedy Half Dollar', metal: 'silver', metalContentOz: 0.1479, weightGrams: 11.50, purity: '40% Silver', defaultCollectorValueRange: '$4.50 - $8+' },
  { id: 'silver-eagle-1oz', name: 'American Silver Eagle (1 Troy Ounce .999)', metal: 'silver', metalContentOz: 1.000, weightGrams: 31.103, purity: '99.9% Pure Silver', defaultCollectorValueRange: '$36 - $48+' },
  { id: 'gold-double-eagle-20', name: '$20 Saint-Gaudens / Liberty Gold Double Eagle', metal: 'gold', metalContentOz: 0.9675, weightGrams: 33.436, purity: '90% Gold (21.6K)', defaultCollectorValueRange: '$2,750 - $3,500+' },
  { id: 'gold-eagle-10', name: '$10 Liberty / Indian Gold Eagle', metal: 'gold', metalContentOz: 0.48375, weightGrams: 16.718, purity: '90% Gold', defaultCollectorValueRange: '$1,380 - $1,750+' },
  { id: 'gold-half-eagle-5', name: '$5 Liberty / Indian Gold Half Eagle', metal: 'gold', metalContentOz: 0.24187, weightGrams: 8.359, purity: '90% Gold', defaultCollectorValueRange: '$700 - $950+' },
  { id: 'gold-sovereign', name: 'British Gold Sovereign (George V / Victoria)', metal: 'gold', metalContentOz: 0.2354, weightGrams: 7.988, purity: '91.67% Gold (22K)', defaultCollectorValueRange: '$680 - $850+' },
  { id: 'gold-eagle-1oz', name: 'American Gold Eagle 1 oz (.9167 Fine)', metal: 'gold', metalContentOz: 1.000, weightGrams: 33.93, purity: '22K Gold (1 oz Pure)', defaultCollectorValueRange: '$2,850 - $3,100+' },
];

interface MeltCalculatorModalProps {
  onClose: () => void;
  defaultCoinName?: string;
}

export const MeltCalculatorModal: React.FC<MeltCalculatorModalProps> = ({ onClose, defaultCoinName }) => {
  // Preset selection
  const initialPreset = useMemo(() => {
    if (!defaultCoinName) return BULLION_PRESETS[0];
    const match = BULLION_PRESETS.find((p) => defaultCoinName.toLowerCase().includes(p.id.split('-')[0]));
    return match || BULLION_PRESETS[0];
  }, [defaultCoinName]);

  const [selectedPresetId, setSelectedPresetId] = useState<string>(initialPreset.id);
  const [quantity, setQuantity] = useState<number>(1);
  const [customSpotSilver, setCustomSpotSilver] = useState<number>(31.50);
  const [customSpotGold, setCustomSpotGold] = useState<number>(2720.00);

  const currentPreset = BULLION_PRESETS.find((p) => p.id === selectedPresetId) || BULLION_PRESETS[0];

  const spotPrice = currentPreset.metal === 'gold' ? customSpotGold : customSpotSilver;
  const singleMeltValue = currentPreset.metalContentOz * spotPrice;
  const totalMeltValue = singleMeltValue * quantity;
  const totalMetalWeightOz = currentPreset.metalContentOz * quantity;

  return (
    <div id="melt-calculator-modal-overlay" className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-2xl bg-slate-950 border border-amber-500/30 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col"
      >
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Flame size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Intrinsic Bullion Melt Calculator</h3>
              <p className="text-[10px] font-mono text-slate-400">Real-Time Precious Metal Weight & Scrap Value</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
          {/* Preset Selector */}
          <div>
            <label className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Select Coin Type or Denomination:
            </label>
            <select
              value={selectedPresetId}
              onChange={(e) => setSelectedPresetId(e.target.value)}
              className="w-full p-3 bg-black/60 border border-slate-700 rounded-xl text-sm font-bold text-white focus:outline-none focus:border-amber-500"
            >
              <optgroup label="Silver Coinage">
                {BULLION_PRESETS.filter((p) => p.metal === 'silver').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.purity} • {p.metalContentOz.toFixed(4)} oz ASW)
                  </option>
                ))}
              </optgroup>
              <optgroup label="Gold Coinage">
                {BULLION_PRESETS.filter((p) => p.metal === 'gold').map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.purity} • {p.metalContentOz.toFixed(4)} oz AGW)
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Inputs Grid: Spot Prices and Quantity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block mb-1">
                Silver Spot ($/oz)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number"
                  step="0.10"
                  value={customSpotSilver}
                  onChange={(e) => setCustomSpotSilver(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block mb-1">
                Gold Spot ($/oz)
              </label>
              <div className="relative">
                <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-xs">$</span>
                <input
                  type="number"
                  step="5.00"
                  value={customSpotGold}
                  onChange={(e) => setCustomSpotGold(parseFloat(e.target.value) || 0)}
                  className="w-full pl-6 pr-2 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              <label className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-wider block mb-1">
                Coin Quantity
              </label>
              <input
                type="number"
                min="1"
                max="10000"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3 py-1.5 bg-black/60 border border-slate-700 rounded-lg text-sm font-mono text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Primary Result Banner */}
          <div className="bg-gradient-to-br from-amber-950/40 via-slate-900 to-black p-6 rounded-2xl border border-amber-500/40 shadow-inner space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-black text-amber-400 uppercase tracking-widest block">
                  Intrinsic Metal Value
                </span>
                <h4 className="text-3xl sm:text-4xl font-black text-emerald-400 font-mono">
                  ${totalMeltValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h4>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <div>Per Coin Melt: <strong className="text-white">${singleMeltValue.toFixed(2)}</strong></div>
                <div>Total Pure Content: <strong className="text-amber-400">{totalMetalWeightOz.toFixed(4)} oz</strong></div>
              </div>
            </div>

            {/* Numismatic Premium Comparison */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono pt-1">
              <div className="bg-black/40 p-3 rounded-xl border border-white/5">
                <span className="text-[9px] uppercase tracking-wider text-slate-500 block mb-0.5">
                  Base Scrap / Melt Value
                </span>
                <span className="text-base font-bold text-slate-300">
                  ${singleMeltValue.toFixed(2)}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Raw metal price if completely melted down.</p>
              </div>

              <div className="bg-black/40 p-3 rounded-xl border border-amber-500/20">
                <span className="text-[9px] uppercase tracking-wider text-amber-400 block mb-0.5">
                  Collector Market Value Range
                </span>
                <span className="text-base font-bold text-amber-400">
                  {currentPreset.defaultCollectorValueRange}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">
                  Historical premium based on grade, year, and scarcity.
                </p>
              </div>
            </div>
          </div>

          {/* Numismatic Warning */}
          <div className="p-3.5 bg-amber-500/5 rounded-xl border border-amber-500/20 text-xs text-slate-300 flex items-start gap-2.5">
            <Sparkles size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-amber-400 font-bold">Numismatic Rule of Thumb:</strong> Never clean or melt historical coins! Rare dates or high grades can carry premiums 10x to 1,000x above their raw metal melt value.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

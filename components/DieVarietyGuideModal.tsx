import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Search, Sparkles, AlertCircle, Eye, HelpCircle } from 'lucide-react';

interface VarietyItem {
  id: string;
  name: string;
  category: 'Doubled Die' | 'Mintmark Variety' | 'Planchet Error' | 'Strike Error' | 'Die Defect';
  famousExample: string;
  rarityImpact: 'High Premium' | 'Extreme Multiplier' | 'Moderate Value';
  howToIdentify: string;
  mechanism: string;
}

const DIE_VARIETIES: VarietyItem[] = [
  {
    id: 'ddo',
    name: 'Doubled Die Obverse (DDO)',
    category: 'Doubled Die',
    famousExample: '1955 Lincoln Cent DDO-001, 1972 Cent, 1969-S Lincoln Cent',
    rarityImpact: 'Extreme Multiplier',
    howToIdentify: 'Distinct notches or spread doubling on lettering ("LIBERTY", "IN GOD WE TRUST") and the date. Unlike machine doubling, true hub doubling has rounded, raised serif split points.',
    mechanism: 'Caused during the die manufacturing process when the working hub transfers the design to the die multiple times out of rotational or axial alignment.',
  },
  {
    id: 'ddr',
    name: 'Doubled Die Reverse (DDR)',
    category: 'Doubled Die',
    famousExample: '1983 Lincoln Cent DDR, 1945 Walking Liberty Half Dollar DDR',
    rarityImpact: 'High Premium',
    howToIdentify: 'Notching or clear separation of strokes in reverse inscriptions ("ONE CENT", "UNITED STATES OF AMERICA") or details in eagle feathers and wheat ears.',
    mechanism: 'Misalignment between hubbings on the reverse working die during production at the mint.',
  },
  {
    id: 'rpm',
    name: 'Repunched Mint Mark (RPM)',
    category: 'Mintmark Variety',
    famousExample: '1909-S/S Lincoln Cent, 1938-D/D Buffalo Nickel, 1950-D/S Overmintmark',
    rarityImpact: 'Moderate Value',
    howToIdentify: 'Multiple secondary outlines of the letter "S" or "D" visible slightly displaced in angle or position beneath the primary punch.',
    mechanism: 'Prior to 1990, mintmarks were hand-punched into dies with steel stamps and a mallet. A bouncing or repositioned punch created overlapping impressions.',
  },
  {
    id: 'wrong-planchet',
    name: 'Transitional / Wrong Planchet Error',
    category: 'Planchet Error',
    famousExample: '1943 Bronze Lincoln Cent (worth $150K - $1.7M!), 1965 Silver Quarter',
    rarityImpact: 'Extreme Multiplier',
    howToIdentify: 'Wrong color, incorrect weight (e.g. 3.11g copper penny vs 2.7g steel), or non-magnetic properties. Struck on planchet intended for another denomination or composition.',
    mechanism: 'Stray blanks from the previous year or another coining press remained caught in feeder hoppers and were struck with new dies.',
  },
  {
    id: 'die-polish-3leg',
    name: 'Die Polishing / Missing Detail Error',
    category: 'Die Defect',
    famousExample: '1937-D 3-Legged Buffalo Nickel, 1922 "No D" Strong Reverse Lincoln Cent',
    rarityImpact: 'Extreme Multiplier',
    howToIdentify: 'Complete absence of a major device (e.g. front right leg of buffalo; mintmark "D") while surrounding fields show die polishing lines and rough relief.',
    mechanism: 'Mint workmen aggressively ground down die clash marks with emery sticks, inadvertently polishing away delicate shallow relief details.',
  },
  {
    id: 'clipped-planchet',
    name: 'Clipped Planchet (Curved / Straight)',
    category: 'Planchet Error',
    famousExample: 'Curved clip on Morgan Dollars and Lincoln Cents',
    rarityImpact: 'Moderate Value',
    howToIdentify: 'A smooth curved or straight crescent missing from the rim. Genuine clips show the "Blakesley Effect" — weakness of the rim directly opposite the clip.',
    mechanism: 'Metal strip failed to advance properly through the blanking press, causing punches to overlap previous holes.',
  },
  {
    id: 'off-center',
    name: 'Off-Center Strike',
    category: 'Strike Error',
    famousExample: '5% to 90% Off-Center strikes with full clear date',
    rarityImpact: 'High Premium',
    howToIdentify: 'Coin design displaced toward one edge with a crescent of unstruck blank metal. Highest value occurs when 40-50% off-center with the full date readable.',
    mechanism: 'The blank planchet did not seat completely into the coining collar prior to the hammer die impact.',
  },
  {
    id: 'cud-die-break',
    name: 'Cud & Retained Cud',
    category: 'Die Defect',
    famousExample: 'Terminal Die State Morgan Dollars and Jefferson Nickels',
    rarityImpact: 'High Premium',
    howToIdentify: 'An unstruck, smooth raised lump of metal along the rim where design details are completely missing.',
    mechanism: 'A section of the hardened steel die broke off completely at the edge under the intense tons of striking pressure.',
  },
];

interface DieVarietyGuideModalProps {
  onClose: () => void;
}

export const DieVarietyGuideModal: React.FC<DieVarietyGuideModalProps> = ({ onClose }) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Doubled Die', 'Mintmark Variety', 'Planchet Error', 'Strike Error', 'Die Defect'];

  const filtered = DIE_VARIETIES.filter((item) => {
    const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.famousExample.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.howToIdentify.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div id="die-variety-modal-overlay" className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[88vh]"
      >
        {/* Header */}
        <div className="bg-slate-900/90 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Numismatic Die Varieties & Mint Errors</h3>
              <p className="text-[10px] font-mono text-slate-400">Identification Field Manual & Valuation Guide</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search variety, error, or series..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 hover:border-slate-700 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <span className="px-2.5 py-1 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-white">{item.name}</h4>
                </div>

                <span
                  className={`text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full font-bold border ${
                    item.rarityImpact === 'Extreme Multiplier'
                      ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
                      : item.rarityImpact === 'High Premium'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                      : 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                  }`}
                >
                  {item.rarityImpact}
                </span>
              </div>

              <div className="text-xs text-slate-300 bg-black/40 p-3 rounded-xl border border-white/5 space-y-2">
                <div>
                  <strong className="text-amber-400 font-mono text-[10px] uppercase block mb-0.5">
                    How to Scrutinize Under Loupe:
                  </strong>
                  <p className="leading-relaxed">{item.howToIdentify}</p>
                </div>
                <div>
                  <strong className="text-slate-400 font-mono text-[10px] uppercase block mb-0.5">
                    Mint Origin & Mechanism:
                  </strong>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{item.mechanism}</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
                <span>
                  Famous Reference: <strong className="text-white">{item.famousExample}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

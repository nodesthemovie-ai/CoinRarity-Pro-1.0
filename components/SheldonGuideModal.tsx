import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Award, ShieldCheck, Search, ChevronRight, Sparkles, Scale } from 'lucide-react';

interface GradeCategory {
  range: string;
  name: string;
  description: string;
  wearDetail: string;
  luster: string;
  grades: { code: string; num: number; definition: string; marketTip: string }[];
}

const SHELDON_CATEGORIES: GradeCategory[] = [
  {
    range: 'MS-60 to MS-70',
    name: 'Mint State / Uncirculated',
    description: 'No trace of wear from circulation. Coin retains original mint luster, with grading determined by surface marks, strike sharpness, and eye appeal.',
    wearDetail: 'Zero wear on high points. Full original detail present as struck at the mint.',
    luster: '95% - 100% original cartwheel or frosty luster.',
    grades: [
      { code: 'MS-70', num: 70, definition: 'Perfect Uncirculated: No post-production imperfections at 5x magnification.', marketTip: 'Extremely rare on moderns, essentially nonexistent on vintage coins.' },
      { code: 'MS-68', num: 68, definition: 'Superb Gem: Virtually flawless with exceptional strike and radiant cartwheel luster.', marketTip: 'Commands huge exponential premiums over MS-66.' },
      { code: 'MS-65', num: 65, definition: 'Gem Uncirculated: High quality with strong luster and only minor contact bag marks.', marketTip: 'The benchmark threshold for premier investment-grade specimens.' },
      { code: 'MS-63', num: 63, definition: 'Choice Uncirculated: Attractive coin with moderate contact marks in prime focal areas.', marketTip: 'Common entry point for collectors seeking uncirculated coins.' },
      { code: 'MS-60', num: 60, definition: 'Basal Uncirculated: No wear, but heavy bag marks, hairline friction, or dull luster.', marketTip: 'Often trades at a discount compared to MS-63.' },
    ],
  },
  {
    range: 'AU-50 to AU-58',
    name: 'About Uncirculated (AU)',
    description: 'Traces of light wear or friction visible only on the very highest design points, with significant remaining mint luster.',
    wearDetail: 'Slight friction wear on cheek, hair curls, eagle breast, or wreath tips.',
    luster: '50% - 90% original mint luster remaining in protected fields.',
    grades: [
      { code: 'AU-58', num: 58, definition: 'Choice About Uncirculated: Almost full mint luster with barely perceptible rubbing.', marketTip: 'Known as "The Collector’s Best Friend" — looks like MS-63 at a fraction of the cost!' },
      { code: 'AU-55', num: 55, definition: 'About Uncirculated: Light friction on major high points; 75%+ luster remains.', marketTip: 'Strong value for key date series.' },
      { code: 'AU-50', num: 50, definition: 'Basal AU: Noticeable friction on high points, roughly half of original luster remaining.', marketTip: 'Good balance of affordability and detail.' },
    ],
  },
  {
    range: 'EF-40 to EF-45',
    name: 'Extremely Fine (XF / EF)',
    description: 'Light overall wear on all high points, but all major design elements remain crisp and well-defined.',
    wearDetail: 'Hairlines and feather details show even, smooth wear while devices stay sharp.',
    luster: 'Traces of mint luster may linger around protected lettering.',
    grades: [
      { code: 'EF-45', num: 45, definition: 'Choice Extremely Fine: Light overall wear, sharp legends, luster traces.', marketTip: 'High eye appeal for vintage type coins.' },
      { code: 'EF-40', num: 40, definition: 'Extremely Fine: Design clear with smooth high points; all lettering distinct.', marketTip: 'Solid budget grade for classic key dates.' },
    ],
  },
  {
    range: 'VF-20 to VF-35',
    name: 'Very Fine (VF)',
    description: 'Moderate to heavy wear across all relief elements, but major features and full inscriptions remain visible.',
    wearDetail: 'Hair and feathers flattened; major motto words like "LIBERTY" fully legible.',
    luster: 'No mint luster remains.',
    grades: [
      { code: 'VF-35', num: 35, definition: 'Choice VF: Moderate wear, excellent rim integrity, full letters.', marketTip: 'Very collectible for 19th-century silver and gold.' },
      { code: 'VF-20', num: 20, definition: 'Very Fine: Noticeable flattening across major motifs; all letters clear.', marketTip: 'Affordable mid-grade specimen.' },
    ],
  },
  {
    range: 'P-1 to F-15',
    name: 'Circulated Collector Grades',
    description: 'Heavily circulated pieces ranging from clear major outlines down to barely identifiable dates.',
    wearDetail: 'Significant loss of interior details, partial rims, and flat fields.',
    luster: 'Completely muted metallic tone.',
    grades: [
      { code: 'F-12', num: 12, definition: 'Fine: Major details visible; about half of interior hair/feathers worn flat.', marketTip: 'Common for well-loved circulation finds.' },
      { code: 'VG-8', num: 8, definition: 'Very Good: Main design clear but flat; full rim outlines.', marketTip: 'Entry level for key dates like 1916-D Mercury or 1909-S VDB.' },
      { code: 'G-4', num: 4, definition: 'Good: Heavily worn; rims may touch lettering; date fully readable.', marketTip: 'Lowest acceptable standard grade for most collectors.' },
      { code: 'AG-3', num: 3, definition: 'About Good: Very heavily worn; date readable; rims worn into lettering.', marketTip: 'Often collected in "low-ball" sets.' },
      { code: 'P-1', num: 1, definition: 'Poor: Barely identifiable specimen with faint silhouette and legible date.', marketTip: 'Popular among specialized "Low Ball Registry" competitive collectors!' },
    ],
  },
];

interface SheldonGuideModalProps {
  onClose: () => void;
  currentCoinGrade?: string;
}

export const SheldonGuideModal: React.FC<SheldonGuideModalProps> = ({ onClose, currentCoinGrade }) => {
  const [selectedCategory, setSelectedCategory] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCategories = SHELDON_CATEGORIES.filter((cat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      cat.name.toLowerCase().includes(q) ||
      cat.range.toLowerCase().includes(q) ||
      cat.grades.some((g) => g.code.toLowerCase().includes(q) || g.definition.toLowerCase().includes(q))
    );
  });

  return (
    <div id="sheldon-guide-modal-overlay" className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
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
              <Award size={18} />
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Sheldon 70-Point Grading Standard</h3>
              <p className="text-[10px] font-mono text-slate-400">Official PCGS & NGC Numismatic Reference</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-300 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search and Navigation Bar */}
        <div className="p-4 bg-slate-900/50 border-b border-slate-800 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search grade (e.g. MS-65, AU-58)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-black/50 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {SHELDON_CATEGORIES.map((cat, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedCategory(idx)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-mono font-bold uppercase whitespace-nowrap transition-all ${
                  selectedCategory === idx
                    ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/50'
                }`}
              >
                {cat.range}
              </button>
            ))}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-16 text-slate-500 text-sm font-mono">
              No matching grades found for "{searchQuery}".
            </div>
          ) : (
            filteredCategories.map((category, catIdx) => {
              if (searchQuery === '' && catIdx !== selectedCategory) return null;
              return (
                <div key={catIdx} className="space-y-4">
                  {/* Category Banner */}
                  <div className="bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900/60 p-4 rounded-2xl border border-amber-500/20">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-mono font-black text-amber-400 uppercase tracking-widest">
                        {category.range}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">{category.name}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed mb-3">{category.description}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono pt-2 border-t border-white/5">
                      <div className="text-slate-400">
                        <strong className="text-slate-200 uppercase">Wear Pattern:</strong> {category.wearDetail}
                      </div>
                      <div className="text-slate-400">
                        <strong className="text-slate-200 uppercase">Luster Profile:</strong> {category.luster}
                      </div>
                    </div>
                  </div>

                  {/* Individual Grade Cards */}
                  <div className="grid gap-2.5">
                    {category.grades.map((grade) => (
                      <div
                        key={grade.code}
                        className={`p-3.5 rounded-xl border transition-all ${
                          currentCoinGrade && currentCoinGrade.includes(grade.code)
                            ? 'bg-amber-500/15 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2.5">
                            <span className="px-2.5 py-1 rounded-lg bg-black border border-slate-700 font-mono font-black text-amber-400 text-sm">
                              {grade.code}
                            </span>
                            <span className="text-xs font-bold text-white">{grade.definition}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-500 uppercase">
                            Numerical Point: {grade.num}/70
                          </span>
                        </div>

                        <div className="text-[11px] text-slate-400 flex items-start gap-1.5 mt-1 bg-black/30 p-2 rounded-lg border border-white/5">
                          <Sparkles size={12} className="text-amber-400 shrink-0 mt-0.5" />
                          <span>
                            <strong className="text-amber-300 font-mono text-[10px] mr-1">Market Insight:</strong>
                            {grade.marketTip}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    </div>
  );
};

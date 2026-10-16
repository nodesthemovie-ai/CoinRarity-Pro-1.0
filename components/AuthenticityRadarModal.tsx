import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Activity,
  Compass,
} from 'lucide-react';
import { SingleCoinData } from '../types';

interface MintStandard {
  id: string;
  name: string;
  weightGrams: number;
  weightToleranceGrams: number;
  diameterMm: number;
  diameterToleranceMm: number;
  composition: string;
  magneticExpected: boolean; // false for silver/copper/gold, true only for 1943 steel cent
  specificGravity: number;
}

const MINT_STANDARDS: MintStandard[] = [
  {
    id: 'morgan-peace-dollar',
    name: 'Morgan & Peace Silver Dollar (1878–1935)',
    weightGrams: 26.73,
    weightToleranceGrams: 0.097,
    diameterMm: 38.1,
    diameterToleranceMm: 0.1,
    composition: '90% Silver, 10% Copper',
    magneticExpected: false,
    specificGravity: 10.34,
  },
  {
    id: 'walking-franklin-half',
    name: '90% Silver Half Dollar (Walking/Franklin/1964 Kennedy)',
    weightGrams: 12.50,
    weightToleranceGrams: 0.097,
    diameterMm: 30.61,
    diameterToleranceMm: 0.1,
    composition: '90% Silver, 10% Copper',
    magneticExpected: false,
    specificGravity: 10.34,
  },
  {
    id: 'silver-quarter-pre65',
    name: 'Washington Silver Quarter (1932–1964)',
    weightGrams: 6.25,
    weightToleranceGrams: 0.097,
    diameterMm: 24.26,
    diameterToleranceMm: 0.1,
    composition: '90% Silver, 10% Copper',
    magneticExpected: false,
    specificGravity: 10.34,
  },
  {
    id: 'silver-dime-pre65',
    name: 'Mercury & Roosevelt Silver Dime (1916–1964)',
    weightGrams: 2.50,
    weightToleranceGrams: 0.097,
    diameterMm: 17.91,
    diameterToleranceMm: 0.1,
    composition: '90% Silver, 10% Copper',
    magneticExpected: false,
    specificGravity: 10.34,
  },
  {
    id: 'lincoln-copper-cent',
    name: 'Lincoln Cent (1909–1982 Bronze / Brass)',
    weightGrams: 3.11,
    weightToleranceGrams: 0.13,
    diameterMm: 19.05,
    diameterToleranceMm: 0.1,
    composition: '95% Copper, 5% Tin/Zinc',
    magneticExpected: false,
    specificGravity: 8.83,
  },
  {
    id: 'lincoln-steel-1943',
    name: '1943 Wartime Zinc-Coated Steel Cent',
    weightGrams: 2.70,
    weightToleranceGrams: 0.13,
    diameterMm: 19.05,
    diameterToleranceMm: 0.1,
    composition: 'Zinc-coated Steel (STRONGLY MAGNETIC)',
    magneticExpected: true,
    specificGravity: 7.80,
  },
  {
    id: 'lincoln-zinc-modern',
    name: 'Lincoln Cent (1982–Present Copper-Plated Zinc)',
    weightGrams: 2.50,
    weightToleranceGrams: 0.10,
    diameterMm: 19.05,
    diameterToleranceMm: 0.1,
    composition: '97.5% Zinc, 2.5% Copper Core',
    magneticExpected: false,
    specificGravity: 7.18,
  },
  {
    id: 'buffalo-jefferson-nickel',
    name: 'Buffalo & Jefferson Nickel (Cupro-Nickel)',
    weightGrams: 5.00,
    weightToleranceGrams: 0.194,
    diameterMm: 21.21,
    diameterToleranceMm: 0.1,
    composition: '75% Copper, 25% Nickel',
    magneticExpected: false,
    specificGravity: 8.92,
  },
  {
    id: 'gold-saint-gaudens-20',
    name: '$20 Saint-Gaudens / Liberty Gold Double Eagle',
    weightGrams: 33.436,
    weightToleranceGrams: 0.032,
    diameterMm: 34.0,
    diameterToleranceMm: 0.1,
    composition: '90% Gold, 10% Copper',
    magneticExpected: false,
    specificGravity: 17.2,
  },
  {
    id: 'silver-eagle-1oz',
    name: 'American Silver Eagle (1 oz .999)',
    weightGrams: 31.103,
    weightToleranceGrams: 0.05,
    diameterMm: 40.6,
    diameterToleranceMm: 0.1,
    composition: '99.9% Fine Silver',
    magneticExpected: false,
    specificGravity: 10.49,
  },
];

interface AuthenticityRadarModalProps {
  coin?: SingleCoinData;
  onClose: () => void;
}

export const AuthenticityRadarModal: React.FC<AuthenticityRadarModalProps> = ({ coin, onClose }) => {
  // Try to match selected coin to a standard
  const initialStandard = useMemo(() => {
    if (!coin?.coinName) return MINT_STANDARDS[0];
    const name = coin.coinName.toLowerCase();
    const found = MINT_STANDARDS.find((s) => {
      const sLower = s.name.toLowerCase();
      if (name.includes('morgan') || name.includes('peace')) return s.id.includes('dollar');
      if (name.includes('half')) return s.id.includes('half');
      if (name.includes('quarter')) return s.id.includes('quarter');
      if (name.includes('dime') || name.includes('mercury')) return s.id.includes('dime');
      if (name.includes('buffalo') || name.includes('nickel')) return s.id.includes('nickel');
      if (name.includes('gold') || name.includes('saint')) return s.id.includes('gold');
      if (name.includes('cent') || name.includes('penny')) return s.id.includes('cent');
      return sLower.includes(name);
    });
    return found || MINT_STANDARDS[0];
  }, [coin]);

  const [selectedStandardId, setSelectedStandardId] = useState<string>(initialStandard.id);
  const currentStandard = MINT_STANDARDS.find((s) => s.id === selectedStandardId) || MINT_STANDARDS[0];

  const [measuredWeight, setMeasuredWeight] = useState<string>(currentStandard.weightGrams.toString());
  const [measuredDiameter, setMeasuredDiameter] = useState<string>(currentStandard.diameterMm.toString());
  const [isMagnetic, setIsMagnetic] = useState<boolean>(false);
  const [hasCastSeam, setHasCastSeam] = useState<boolean>(false);
  const [hasFieldPorosity, setHasFieldPorosity] = useState<boolean>(false);

  // When standard changes, update placeholder weights
  const handleStandardChange = (id: string) => {
    setSelectedStandardId(id);
    const std = MINT_STANDARDS.find((s) => s.id === id);
    if (std) {
      setMeasuredWeight(std.weightGrams.toString());
      setMeasuredDiameter(std.diameterMm.toString());
    }
  };

  const parsedWeight = parseFloat(measuredWeight) || 0;
  const parsedDiameter = parseFloat(measuredDiameter) || 0;

  const weightDelta = parsedWeight - currentStandard.weightGrams;
  const weightWithinTolerance = Math.abs(weightDelta) <= currentStandard.weightToleranceGrams;

  const diameterDelta = parsedDiameter - currentStandard.diameterMm;
  const diameterWithinTolerance = Math.abs(diameterDelta) <= currentStandard.diameterToleranceMm;

  const magneticPass = isMagnetic === currentStandard.magneticExpected;

  // Composite Risk Calculation
  const riskScore = useMemo(() => {
    let score = 0;
    if (!weightWithinTolerance) score += 35;
    if (!diameterWithinTolerance) score += 25;
    if (!magneticPass) score += 30;
    if (hasCastSeam) score += 30;
    if (hasFieldPorosity) score += 20;
    return Math.min(100, score);
  }, [weightWithinTolerance, diameterWithinTolerance, magneticPass, hasCastSeam, hasFieldPorosity]);

  const riskLabel = riskScore < 20 ? 'HIGH AUTHENTICITY CONFIDENCE' : riskScore < 50 ? 'MODERATE ANOMALIES DETECTED' : 'CRITICAL COUNTERFEIT WARNING';
  const riskColor = riskScore < 20 ? 'text-emerald-400' : riskScore < 50 ? 'text-amber-400' : 'text-red-400';
  const riskBg = riskScore < 20 ? 'bg-emerald-500/10 border-emerald-500/30' : riskScore < 50 ? 'bg-amber-500/10 border-amber-500/30' : 'bg-red-500/10 border-red-500/30';

  return (
    <div id="authenticity-radar-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
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
        className="relative z-10 w-full max-w-4xl bg-slate-950 border border-amber-500/30 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.2)] overflow-hidden my-6"
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Authenticity Diagnostics</span>
                <span className="text-[10px] font-mono text-slate-400">Tolerance Radar</span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Physical & Weight Verification Engine</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Preset Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Reference Mint Standard:
            </label>
            <select
              value={selectedStandardId}
              onChange={(e) => handleStandardChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-medium focus:outline-none focus:border-amber-500 transition-colors"
            >
              {MINT_STANDARDS.map((std) => (
                <option key={std.id} value={std.id}>
                  {std.name} — ({std.weightGrams}g / {std.diameterMm}mm)
                </option>
              ))}
            </select>
          </div>

          {/* Metric Assessment Banner */}
          <div className={`p-4 rounded-2xl border ${riskBg} flex flex-col sm:flex-row items-center justify-between gap-4`}>
            <div className="space-y-1 text-center sm:text-left">
              <span className={`text-[10px] font-black uppercase tracking-[2px] ${riskColor} block`}>
                Verification Diagnosis
              </span>
              <h4 className="text-lg font-black text-white">{riskLabel}</h4>
              <p className="text-xs text-slate-400">
                Composite physical deviation score based on official mint legal tolerances.
              </p>
            </div>

            <div className="bg-black/60 px-5 py-3 rounded-2xl border border-white/10 text-center shrink-0">
              <span className="text-[9px] font-mono uppercase text-slate-400 block">Risk Metric</span>
              <span className={`text-2xl font-black font-mono ${riskColor}`}>{riskScore}%</span>
            </div>
          </div>

          {/* Interactive Input Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weight Input */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Scale size={14} className="text-amber-400" />
                  <span>0.01g Scale Weight</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Target: {currentStandard.weightGrams}g (±{currentStandard.weightToleranceGrams}g)
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={measuredWeight}
                  onChange={(e) => setMeasuredWeight(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-amber-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  grams
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Tolerance Delta:</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${weightWithinTolerance ? 'text-emerald-400' : 'text-red-400'}`}>
                  {weightWithinTolerance ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {weightDelta > 0 ? `+${weightDelta.toFixed(3)}g` : `${weightDelta.toFixed(3)}g`}
                  ({weightWithinTolerance ? 'Within Legal Mint Limit' : 'EXCEEDS MINT TOLERANCE'})
                </span>
              </div>
            </div>

            {/* Caliper Diameter Input */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Compass size={14} className="text-cyan-400" />
                  <span>Digital Caliper Diameter</span>
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  Target: {currentStandard.diameterMm}mm (±{currentStandard.diameterToleranceMm}mm)
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.05"
                  value={measuredDiameter}
                  onChange={(e) => setMeasuredDiameter(e.target.value)}
                  className="w-full bg-black/60 border border-slate-700/80 rounded-xl px-4 py-2.5 text-base font-mono font-bold text-white focus:outline-none focus:border-cyan-500"
                />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500">
                  mm
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-400">Diameter Delta:</span>
                <span className={`font-mono font-bold flex items-center gap-1 ${diameterWithinTolerance ? 'text-emerald-400' : 'text-red-400'}`}>
                  {diameterWithinTolerance ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                  {diameterDelta > 0 ? `+${diameterDelta.toFixed(2)}mm` : `${diameterDelta.toFixed(2)}mm`}
                  ({diameterWithinTolerance ? 'Exact Mint Gauge' : 'DIAMETER MISMATCH'})
                </span>
              </div>
            </div>
          </div>

          {/* Quick Check Diagnostic Toggles */}
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              Physical Inspection Checklist:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Magnet Test */}
              <div
                onClick={() => setIsMagnetic(!isMagnetic)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  magneticPass
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-red-500/10 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Neodymium Magnet</span>
                  <input
                    type="checkbox"
                    checked={isMagnetic}
                    onChange={() => {}}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  {currentStandard.magneticExpected
                    ? 'Expected: MAGNETIC (1943 steel)'
                    : 'Expected: NON-MAGNETIC (Silver/Copper/Gold)'}
                </p>
              </div>

              {/* Cast Seam Test */}
              <div
                onClick={() => setHasCastSeam(!hasCastSeam)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  !hasCastSeam
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-red-500/10 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Rim Parting Seam</span>
                  <input
                    type="checkbox"
                    checked={hasCastSeam}
                    onChange={() => {}}
                    className="accent-red-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Raised mold lines or filed flats along reeded edge (indicates counterfeit casting).
                </p>
              </div>

              {/* Porosity Test */}
              <div
                onClick={() => setHasFieldPorosity(!hasFieldPorosity)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                  !hasFieldPorosity
                    ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    : 'bg-red-500/10 border-red-500/40 text-red-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Field Porosity / Pimples</span>
                  <input
                    type="checkbox"
                    checked={hasFieldPorosity}
                    onChange={() => {}}
                    className="accent-red-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Tiny microscopic craters or bubbles in the fields from molten metal casting.
                </p>
              </div>
            </div>
          </div>

          {/* Expert Field Guidance */}
          <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-slate-400 leading-relaxed font-sans">
            <span className="text-slate-300 font-bold flex items-center gap-1.5 text-xs uppercase tracking-wider">
              <Sparkles size={12} className="text-amber-400" /> Numismatist Authentication Tips:
            </span>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>
                <strong className="text-slate-200">Weight Standard:</strong> Genuine uncirculated US 90% silver coins must match mint target within 0.1g. Heavy wear (Good-4 to VG-8) can reduce weight by up to 0.4g–0.8g from natural metal abrasion.
              </li>
              <li>
                <strong className="text-slate-200">Specific Gravity:</strong> Pure 90% Silver / 10% Copper alloy has a specific gravity of 10.34. Counterfeits made of silver-plated copper/zinc typically register 8.8–9.2.
              </li>
              <li>
                <strong className="text-slate-200">Magnet Slide Test:</strong> High-grade silver is diamagnetic — when held at a 45° angle, a strong rare-earth magnet slides slowly down the coin rather than sticking or falling freely.
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

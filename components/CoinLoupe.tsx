import React, { useState, useRef, useCallback } from 'react';
import {
  ZoomIn,
  Crosshair,
  Sun,
  Maximize2,
  Sparkles,
  Camera,
  Layers,
  Compass,
  Columns,
  Eye,
  Activity,
  Flame,
  Zap,
} from 'lucide-react';

export type SpectrumMode =
  | 'visible'
  | 'uv'
  | 'ir'
  | 'thermal'
  | 'relief_heatmap'
  | 'metal_grain'
  | 'edge_highpass';

interface CoinLoupeProps {
  image: string;
  reverseImage?: string | null;
  alt?: string;
  className?: string;
  doublingClass?: string;
  rpmVector?: string;
}

export const CoinLoupe: React.FC<CoinLoupeProps> = ({
  image,
  reverseImage,
  alt = 'Coin specimen',
  className = '',
  doublingClass,
  rpmVector,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [coords, setCoords] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [zoomLevel, setZoomLevel] = useState<number>(10); // 2, 5, 10, 15, 30, 50
  const [showReticle, setShowReticle] = useState(true);
  const [spectrumMode, setSpectrumMode] = useState<SpectrumMode>('visible');
  const [lightAngle, setLightAngle] = useState<number>(45); // Degrees (0-360)
  const [loupeSize, setLoupeSize] = useState<number>(190); // Diameter in px
  const [showCaliperGrid, setShowCaliperGrid] = useState(false);
  const [isDualPane, setIsDualPane] = useState(false);
  const [aiDetailBoost, setAiDetailBoost] = useState(false);
  const [snapshotSuccess, setSnapshotSuccess] = useState(false);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setCoords({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const touch = e.touches[0];
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((touch.clientX - rect.left) / rect.width) * 100;
    const y = ((touch.clientY - rect.top) / rect.height) * 100;
    setCoords({
      x: Math.max(0, Math.min(100, x)),
      y: Math.max(0, Math.min(100, y)),
    });
    setIsHovered(true);
  }, []);

  // Compute directional light highlight position based on angle
  const rad = (lightAngle * Math.PI) / 180;
  const lightX = 50 + 40 * Math.cos(rad);
  const lightY = 50 + 40 * Math.sin(rad);

  // CSS filter styles according to spectrum mode
  const getSpectrumFilterStyle = (mode: SpectrumMode, isLoupeView = false) => {
    switch (mode) {
      case 'uv': // 365nm UV Mode (chemical residues, artificial toning)
        return isLoupeView
          ? 'hue-rotate-[270deg] saturate-[300%] contrast-[180%] brightness-95'
          : 'hue-rotate-[270deg] saturate-[220%] contrast-[140%]';
      case 'ir': // Infrared Metal Penetration
        return isLoupeView
          ? 'grayscale(100%) invert(85%) contrast-[200%] brightness-110'
          : 'grayscale(100%) invert(60%) contrast-[140%]';
      case 'thermal': // Thermal Emission Mode
        return isLoupeView
          ? 'hue-rotate-[180deg] saturate-[400%] contrast-[220%] brightness-105'
          : 'hue-rotate-[180deg] saturate-[250%] contrast-[150%]';
      case 'relief_heatmap': // 3D Relief Topography Heatmap
        return isLoupeView
          ? 'hue-rotate-[90deg] saturate-[350%] contrast-[200%] brightness-90'
          : 'hue-rotate-[90deg] saturate-[220%] contrast-[150%]';
      case 'metal_grain': // Microcrystalline planchet flow lines
        return isLoupeView
          ? 'contrast-[250%] brightness-90 grayscale(80%)'
          : 'contrast-[160%] grayscale(40%)';
      case 'edge_highpass': // High-pass edge detection
        return isLoupeView
          ? 'contrast-[280%] grayscale(100%) brightness-95'
          : 'contrast-[180%] grayscale(100%)';
      case 'visible':
      default:
        return aiDetailBoost ? 'contrast-[135%] brightness-105 saturate-[120%]' : '';
    }
  };

  const takeLoupeSnapshot = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 440;
      canvas.height = 440;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.fillStyle = '#06080d';
        ctx.fillRect(0, 0, 440, 440);

        // Circular clipping
        ctx.save();
        ctx.beginPath();
        ctx.arc(220, 220, 200, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const sWidth = img.width / zoomLevel;
        const sHeight = img.height / zoomLevel;
        const sx = Math.max(0, Math.min(img.width - sWidth, (coords.x / 100) * img.width - sWidth / 2));
        const sy = Math.max(0, Math.min(img.height - sHeight, (coords.y / 100) * img.height - sHeight / 2));

        if (spectrumMode === 'edge_highpass') {
          ctx.filter = 'contrast(240%) grayscale(100%)';
        } else if (spectrumMode === 'uv') {
          ctx.filter = 'hue-rotate(270deg) saturate(300%) contrast(180%)';
        } else if (spectrumMode === 'thermal') {
          ctx.filter = 'hue-rotate(180deg) saturate(350%) contrast(200%)';
        } else if (spectrumMode === 'relief_heatmap') {
          ctx.filter = 'hue-rotate(90deg) saturate(300%) contrast(190%)';
        }

        ctx.drawImage(img, sx, sy, sWidth, sHeight, 20, 20, 400, 400);
        ctx.restore();

        // Lens bezel
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.arc(220, 220, 200, 0, Math.PI * 2);
        ctx.stroke();

        // Label
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
        ctx.fillRect(110, 360, 220, 30);
        ctx.fillStyle = '#fbbf24';
        ctx.font = 'bold 12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`MICRO-LOUPE ${zoomLevel}x • ${spectrumMode.toUpperCase()}`, 220, 380);

        const link = document.createElement('a');
        link.download = `micro-forensic-loupe-${zoomLevel}x-${spectrumMode}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();

        setSnapshotSuccess(true);
        setTimeout(() => setSnapshotSuccess(false), 2000);
      };
      img.src = image;
    } catch (e) {
      console.error('Failed to capture snapshot:', e);
    }
  };

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {/* Top Toolbar: Magnification Timeline & Diagnostics */}
      <div className="w-full mb-2 px-1 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <ZoomIn size={13} className="text-amber-400 shrink-0" />
          <span className="font-bold text-slate-200">50x Scientific Micro-Loupe</span>
          <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.2 rounded border border-amber-500/20">
            {zoomLevel}x Zoom
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Zoom Timeline Slider Buttons (2x, 5x, 10x, 15x, 30x, 50x) */}
          <div className="flex bg-slate-900 border border-slate-700/60 rounded-lg p-0.5 shadow-inner">
            {[2, 5, 10, 15, 30, 50].map((z) => (
              <button
                key={z}
                onClick={() => setZoomLevel(z)}
                className={`px-1.5 py-0.5 rounded text-[10px] font-bold transition-all ${
                  zoomLevel === z ? 'bg-amber-500 text-black shadow-sm font-black' : 'text-slate-400 hover:text-white'
                }`}
                title={`Digital micro-magnification ${z}x`}
              >
                {z}x
              </button>
            ))}
          </div>

          {/* AI Detail Super-Resolution Boost */}
          <button
            onClick={() => setAiDetailBoost(!aiDetailBoost)}
            className={`px-2 py-1 rounded-lg border text-[10px] font-bold transition-all flex items-center gap-1 ${
              aiDetailBoost
                ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="AI Detail Enhancement: Sharpens faint doubling, RPMs, and split serifs"
          >
            <Sparkles size={11} />
            <span>AI Boost</span>
          </button>

          {/* Reticle Toggle */}
          <button
            onClick={() => setShowReticle(!showReticle)}
            className={`p-1.5 rounded-lg border transition-all ${
              showReticle
                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Toggle alignment reticle"
          >
            <Crosshair size={13} />
          </button>

          {/* Caliper Micrometer Grid */}
          <button
            onClick={() => setShowCaliperGrid(!showCaliperGrid)}
            className={`p-1.5 rounded-lg border transition-all ${
              showCaliperGrid
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Millimeter micrometer grid overlay"
          >
            <Layers size={13} />
          </button>

          {/* Dual-Pane Loupe Toggle if reverse is provided */}
          {reverseImage && (
            <button
              onClick={() => setIsDualPane(!isDualPane)}
              className={`p-1.5 rounded-lg border transition-all ${
                isDualPane
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
              }`}
              title="Dual-Pane Split Loupe: Obverse vs Reverse"
            >
              <Columns size={13} />
            </button>
          )}

          {/* Lens Diameter Expand */}
          <button
            onClick={() => setLoupeSize(loupeSize === 190 ? 250 : 190)}
            className={`p-1.5 rounded-lg border transition-all ${
              loupeSize > 190
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Expand lens viewport diameter"
          >
            <Maximize2 size={13} />
          </button>

          {/* Snapshot button */}
          <button
            onClick={takeLoupeSnapshot}
            className={`p-1.5 rounded-lg border transition-all ${
              snapshotSuccess
                ? 'bg-emerald-500 text-black border-emerald-400'
                : 'bg-slate-900 border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title="Export high-resolution forensic snapshot"
          >
            <Camera size={13} />
          </button>
        </div>
      </div>

      {/* Multi-Spectrum Mode Filter Tabs */}
      <div className="w-full mb-2 px-1 flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px] font-mono no-scrollbar">
        <span className="text-slate-500 uppercase font-bold shrink-0">Spectrum:</span>
        <button
          onClick={() => setSpectrumMode('visible')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'visible'
              ? 'bg-amber-500 text-black shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
        >
          Visible Raking
        </button>
        <button
          onClick={() => setSpectrumMode('uv')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'uv'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
          title="365nm UV Mode: Highlights chemical dips, cleaning lines & artificial toning"
        >
          365nm UV
        </button>
        <button
          onClick={() => setSpectrumMode('thermal')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'thermal'
              ? 'bg-red-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
          title="Thermal Thermography: Reveals alloy density inconsistencies & cast voids"
        >
          Thermal IR
        </button>
        <button
          onClick={() => setSpectrumMode('relief_heatmap')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'relief_heatmap'
              ? 'bg-cyan-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
          title="3D Relief Heatmap: Color-codes high points (wear zones) vs mirror fields"
        >
          Relief Heatmap
        </button>
        <button
          onClick={() => setSpectrumMode('metal_grain')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'metal_grain'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
          title="Planchet Grain Structure: Flow lines & strike crystallization"
        >
          Metal Grain
        </button>
        <button
          onClick={() => setSpectrumMode('edge_highpass')}
          className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition-all ${
            spectrumMode === 'edge_highpass'
              ? 'bg-yellow-500 text-black shadow-sm'
              : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white'
          }`}
          title="High-Pass Relief: Die cracks, repunched marks & hub doubling"
        >
          Edge Relief
        </button>
      </div>

      {/* Raking Direction Slider (visible mode) */}
      {spectrumMode === 'visible' && (
        <div className="w-full mb-2 px-3 py-1.5 bg-slate-900/90 rounded-xl border border-amber-500/20 flex items-center justify-between gap-3 text-[10px] font-mono">
          <span className="text-amber-400 font-bold flex items-center gap-1 shrink-0">
            <Compass size={12} /> Light: {lightAngle}°
          </span>
          <input
            type="range"
            min={0}
            max={360}
            step={15}
            value={lightAngle}
            onChange={(e) => setLightAngle(Number(e.target.value))}
            className="flex-1 accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-slate-500 text-[9px] hidden sm:inline">Rotate to spin cartwheel luster</span>
        </div>
      )}

      {/* Main Interactive Stage */}
      <div
        ref={containerRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onMouseMove={handleMouseMove}
        onTouchStart={() => setIsHovered(true)}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setIsHovered(false)}
        className="relative w-full aspect-square rounded-2xl overflow-hidden cursor-crosshair border border-slate-800 bg-black select-none shadow-2xl group"
      >
        {/* Base Specimen View or Dual-Pane Split */}
        {isDualPane && reverseImage ? (
          <div className="w-full h-full grid grid-cols-2 gap-1 bg-slate-950">
            <div className="relative overflow-hidden">
              <img
                src={image}
                alt="Obverse"
                className={`w-full h-full object-cover ${getSpectrumFilterStyle(spectrumMode)}`}
              />
              <span className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-amber-400 uppercase">
                OBVERSE
              </span>
            </div>
            <div className="relative overflow-hidden">
              <img
                src={reverseImage}
                alt="Reverse"
                className={`w-full h-full object-cover ${getSpectrumFilterStyle(spectrumMode)}`}
              />
              <span className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-amber-400 uppercase">
                REVERSE
              </span>
            </div>
          </div>
        ) : (
          <img
            src={image}
            alt={alt}
            className={`w-full h-full object-cover transition-all duration-300 ${getSpectrumFilterStyle(spectrumMode)}`}
          />
        )}

        {/* Dynamic Directional Raking Light Overlay */}
        {spectrumMode === 'visible' && (
          <div
            className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-60"
            style={{
              background: `radial-gradient(circle at ${lightX}% ${lightY}%, rgba(255,245,210,0.85) 0%, rgba(20,20,20,0.85) 75%)`,
            }}
          />
        )}

        {/* Millimeter Caliper Grid Overlay */}
        {showCaliperGrid && (
          <div className="absolute inset-0 pointer-events-none opacity-40">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="micro-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#06b6d4" strokeWidth="0.5" />
                </pattern>
                <pattern id="micro-major-grid" width="100" height="100" patternUnits="userSpaceOnUse">
                  <rect width="100" height="100" fill="url(#micro-grid)" />
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#22d3ee" strokeWidth="1.2" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#micro-major-grid)" />
            </svg>
            <div className="absolute top-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-cyan-400 border border-cyan-500/30">
              1 DIV ≈ 0.25mm
            </div>
          </div>
        )}

        {/* Die Variety & Doubling Classifier Overlay HUD */}
        {(doublingClass || rpmVector) && (
          <div className="absolute top-3 right-3 bg-black/85 backdrop-blur-md px-2.5 py-1.5 rounded-xl border border-purple-500/40 text-[9px] font-mono text-purple-300 pointer-events-none z-10 space-y-0.5">
            {doublingClass && <div>ATTRIB: <strong className="text-white">{doublingClass}</strong></div>}
            {rpmVector && <div>VECTOR: <strong className="text-amber-400">{rpmVector}</strong></div>}
          </div>
        )}

        {/* Floating Loupe Glass Lens */}
        {isHovered && (
          <div
            className="absolute pointer-events-none rounded-full border-4 border-amber-400 shadow-[0_0_40px_rgba(0,0,0,0.95),inset_0_0_25px_rgba(0,0,0,0.85)] overflow-hidden z-20 transition-transform duration-75"
            style={{
              width: `${loupeSize}px`,
              height: `${loupeSize}px`,
              left: `calc(${coords.x}% - ${loupeSize / 2}px)`,
              top: `calc(${coords.y}% - ${loupeSize / 2}px)`,
              background: '#06080d',
            }}
          >
            {/* Magnified Image Container */}
            <div
              className={`w-full h-full transition-all ${getSpectrumFilterStyle(spectrumMode, true)}`}
              style={{
                backgroundImage: `url(${image})`,
                backgroundPosition: `${coords.x}% ${coords.y}%`,
                backgroundSize: `${zoomLevel * 100}%`,
                backgroundRepeat: 'no-repeat',
              }}
            />

            {/* Glass Curvature & Glare Highlights */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/10 to-white/30 pointer-events-none" />
            <div className="absolute inset-0 rounded-full shadow-[inset_0_0_25px_rgba(0,0,0,0.85)] pointer-events-none" />

            {/* Precision Reticle Crosshair */}
            {showReticle && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-px bg-amber-400/60" />
                <div className="h-full w-px bg-amber-400/60 absolute" />
                <div className="w-10 h-10 rounded-full border border-amber-400/60 absolute" />
                <div className="w-20 h-20 rounded-full border border-dashed border-amber-400/40 absolute" />
              </div>
            )}

            {/* Lens Rim Coordinates & Zoom Label */}
            <div className="absolute bottom-2 left-0 right-0 text-center">
              <span className="bg-black/90 px-2.5 py-0.5 rounded text-[8px] font-mono text-amber-400 tracking-wider uppercase border border-amber-500/40 shadow">
                {zoomLevel}x • {spectrumMode.toUpperCase()} • {Math.round(coords.x)}%:{Math.round(coords.y)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Scientific Mode Description */}
      <div className="mt-2 text-center text-[10px] font-mono text-slate-400 flex items-center justify-center gap-1.5 flex-wrap">
        {spectrumMode === 'uv' && (
          <span className="text-purple-400">
            [UV 365nm] Fluorescent inspection active: Detects chemical dipping, AT lacquer, and organic coin residues.
          </span>
        )}
        {spectrumMode === 'thermal' && (
          <span className="text-red-400">
            [Thermal IR] False-color thermography active: Identifies metal density shifts, hollow planchets, and cast voids.
          </span>
        )}
        {spectrumMode === 'relief_heatmap' && (
          <span className="text-cyan-400">
            [Relief Heatmap] High relief points (red/orange) evaluated against circulation friction patterns.
          </span>
        )}
        {spectrumMode === 'metal_grain' && (
          <span className="text-emerald-400">
            [Metal Grain] Planchet flow lines and strike annealing crystal structure magnified.
          </span>
        )}
        {spectrumMode === 'edge_highpass' && (
          <span className="text-yellow-400">
            [Edge High-Pass] Sub-micron relief boundaries amplified for hub doubling & repunched mintmarks.
          </span>
        )}
        {spectrumMode === 'visible' && (
          <span>
            Hover across high-relief points, denticles, mintmarks, and eagle feathers to reveal luster cartwheel flow.
          </span>
        )}
      </div>
    </div>
  );
};

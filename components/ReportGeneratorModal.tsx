import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import {
  X,
  ArrowLeft,
  FileText,
  FileJson,
  Share2,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldCheck,
  Coins,
  Grid,
  Printer,
  Sliders,
  CheckCircle2,
  Award,
  DollarSign,
  Flame,
  Layers,
} from 'lucide-react';
import { MultiCoinAnalysisResult } from '../types';
import {
  ReportConfig,
  buildNumismaticJsonReport,
  buildShareableTextSummary,
  generateNumismaticPdfBlob,
  triggerBlobDownload,
} from '../utils/reportGenerator';

interface ReportGeneratorModalProps {
  result: MultiCoinAnalysisResult;
  image: string;
  reverseImage?: string;
  initialScope?: 'batch' | 'single';
  initialCoinIndex?: number;
  onClose: () => void;
}

export const ReportGeneratorModal: React.FC<ReportGeneratorModalProps> = ({
  result,
  image,
  reverseImage,
  initialScope,
  initialCoinIndex = 0,
  onClose,
}) => {
  const isMultiCoinAvailable = result.coins.length > 1;

  const [config, setConfig] = useState<ReportConfig>({
    scope: initialScope || (isMultiCoinAvailable ? 'batch' : 'single'),
    selectedCoinIndex: initialCoinIndex,
    includeForensics: true,
    includeConsensus: true,
    includeMarketAndPedigree: true,
    includePhotos: true,
    includeImagesInJson: false,
    customCollectorNotes: '',
    preparedFor: 'Private Numismatic Vault & Auction Registry',
  });

  const [activeTab, setActiveTab] = useState<'pdf-preview' | 'json-preview' | 'share-hub'>('pdf-preview');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [statusToast, setStatusToast] = useState<string | null>(null);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const showToast = (msg: string) => {
    setStatusToast(msg);
    setTimeout(() => setStatusToast(null), 3200);
  };

  const jsonReport = useMemo(() => buildNumismaticJsonReport(result, config), [result, config]);
  const jsonString = useMemo(() => JSON.stringify(jsonReport, null, 2), [jsonReport]);
  const shareableText = useMemo(() => buildShareableTextSummary(result, config), [result, config]);

  const jsonByteSize = useMemo(() => {
    const bytes = new Blob([jsonString]).size;
    return bytes > 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${bytes} B`;
  }, [jsonString]);

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    try {
      const { blob, filename } = await generateNumismaticPdfBlob(result, image, reverseImage, config);
      triggerBlobDownload(blob, filename);
      showToast(`Saved Official PDF Dossier: ${filename}`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      showToast('Could not generate PDF. Try printing or saving JSON.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadJson = () => {
    const cleanAudit = (result.auditId || 'AUDIT').replace(/[^a-zA-Z0-9_-]/g, '');
    const isSingle = config.scope === 'single' || result.coins.length === 1;
    const filename = isSingle
      ? `CoinRarity_Specimen_${cleanAudit}_Slot${config.selectedCoinIndex + 1}.json`
      : `CoinRarity_Batch_${cleanAudit}_${result.coins.length}Coins.json`;

    const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
    triggerBlobDownload(blob, filename);
    showToast(`Saved Structured JSON Report: ${filename}`);
  };

  const handleCopyJson = async () => {
    await navigator.clipboard.writeText(jsonString);
    setCopiedJson(true);
    showToast('Structured JSON Dossier copied to clipboard');
    setTimeout(() => setCopiedJson(false), 2200);
  };

  const handleCopySummary = async () => {
    await navigator.clipboard.writeText(shareableText);
    setCopiedSummary(true);
    showToast('Executive Summary copied to clipboard');
    setTimeout(() => setCopiedSummary(false), 2200);
  };

  const handleNativeShare = async (format: 'pdf' | 'json' | 'text') => {
    try {
      if (format === 'pdf') {
        setIsGeneratingPdf(true);
        const { blob, filename } = await generateNumismaticPdfBlob(result, image, reverseImage, config);
        setIsGeneratingPdf(false);
        const file = new File([blob], filename, { type: 'application/pdf' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `CoinRarity Pro PDF Dossier (${jsonReport.reportMetadata.reportId})`,
            text: shareableText.slice(0, 280),
            files: [file],
          });
          showToast('Shared PDF Report via System Share Sheet');
          return;
        }
        // Fallback: download PDF and copy summary
        triggerBlobDownload(blob, filename);
        await navigator.clipboard.writeText(shareableText);
        showToast('PDF downloaded & summary copied for sharing');
        return;
      }

      if (format === 'json') {
        const cleanAudit = (result.auditId || 'AUDIT').replace(/[^a-zA-Z0-9_-]/g, '');
        const filename = `CoinRarity_${cleanAudit}.json`;
        const blob = new Blob([jsonString], { type: 'application/json' });
        const file = new File([blob], filename, { type: 'application/json' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: `CoinRarity Pro JSON Telemetry (${jsonReport.reportMetadata.reportId})`,
            text: `Structured JSON Numismatic Report (${jsonReport.reportMetadata.specimenCount} specimens)`,
            files: [file],
          });
          showToast('Shared JSON Report via System Share Sheet');
          return;
        }
        triggerBlobDownload(blob, filename);
        showToast('JSON file downloaded for sharing');
        return;
      }

      if (navigator.share) {
        await navigator.share({
          title: `CoinRarity Pro Audit — ${jsonReport.reportMetadata.reportId}`,
          text: shareableText,
        });
        showToast('Shared Executive Summary');
      } else {
        await handleCopySummary();
      }
    } catch (err: any) {
      setIsGeneratingPdf(false);
      if (err?.name !== 'AbortError') {
        await handleCopySummary();
      }
    }
  };

  return (
    <div
      id="report-generator-modal"
      className="fixed inset-0 z-[220] flex items-center justify-center p-2 sm:p-5 overflow-y-auto"
    >
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/90 backdrop-blur-xl"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="relative z-10 w-full max-w-5xl bg-slate-950 border border-amber-500/35 rounded-3xl shadow-[0_0_90px_rgba(245,158,11,0.18)] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-slate-900/95 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-400 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
              title="Back to Workspace"
            >
              <ArrowLeft size={14} />
              <span>Back</span>
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                <FileText size={18} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-white">
                    PDF & JSON Summary Report Studio
                  </h3>
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[9px] font-mono font-bold uppercase">
                    {jsonReport.reportMetadata.cryptographicChecksum}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-slate-400">
                  Generate, customize, download, or share official single-coin or 25-coin batch dossiers
                </p>
              </div>
            </div>
          </div>

          {/* Primary Fast Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              id="download-pdf-report-btn"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-60 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-95"
            >
              <Download size={14} />
              <span>{isGeneratingPdf ? 'Building PDF...' : 'Save PDF'}</span>
            </button>

            <button
              id="download-json-report-btn"
              onClick={handleDownloadJson}
              className="px-3.5 py-2 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-500/40 text-indigo-200 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95"
            >
              <FileJson size={14} className="text-indigo-400" />
              <span>Save JSON</span>
            </button>

            <button
              id="share-report-fast-btn"
              onClick={() => handleNativeShare('pdf')}
              className="px-3 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Share PDF or Executive Report"
            >
              <Share2 size={14} />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Status Toast Notification */}
        {statusToast && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-6 py-2 flex items-center justify-between text-xs text-emerald-200 font-mono">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-400 shrink-0" />
              <span>{statusToast}</span>
            </div>
            <span className="text-[10px] uppercase text-emerald-400 font-bold">Verified Output</span>
          </div>
        )}

        {/* Control Strip: Scope (Single vs 25-Coin Batch) & View Mode Switcher */}
        <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 sm:px-6 py-3 flex flex-col lg:flex-row lg:items-center justify-between gap-3 shrink-0">
          {/* Left: Scope Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-mono uppercase font-bold text-slate-400 mr-1">
              Report Scope:
            </span>

            <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center gap-1">
              {isMultiCoinAvailable && (
                <button
                  onClick={() => setConfig((prev) => ({ ...prev, scope: 'batch' }))}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                    config.scope === 'batch'
                      ? 'bg-amber-500 text-black shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid size={13} />
                  <span>Full {result.coins.length}-Coin Batch</span>
                </button>
              )}

              <button
                onClick={() => setConfig((prev) => ({ ...prev, scope: 'single' }))}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                  config.scope === 'single' || !isMultiCoinAvailable
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Coins size={13} />
                <span>Single Specimen</span>
              </button>
            </div>

            {/* Individual Coin Selector when Single Specimen mode is active in a multi-coin tray */}
            {config.scope === 'single' && isMultiCoinAvailable && (
              <select
                value={config.selectedCoinIndex}
                onChange={(e) =>
                  setConfig((prev) => ({ ...prev, selectedCoinIndex: Number(e.target.value) }))
                }
                className="bg-slate-900 border border-slate-700 text-amber-300 text-xs font-mono font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-amber-500"
              >
                {result.coins.map((c, idx) => (
                  <option key={idx} value={idx}>
                    #{c.coinIndex || idx + 1} — {c.coinName} ({c.grade || 'UNC'})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Right: Preview Mode Tabs */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center text-xs font-bold self-start lg:self-auto">
            <button
              onClick={() => setActiveTab('pdf-preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'pdf-preview'
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText size={13} />
              <span>PDF Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('json-preview')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'json-preview'
                  ? 'bg-indigo-500 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileJson size={13} />
              <span>JSON Schema ({jsonByteSize})</span>
            </button>

            <button
              onClick={() => setActiveTab('share-hub')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                activeTab === 'share-hub'
                  ? 'bg-emerald-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Share2 size={13} />
              <span>Save & Share Hub</span>
            </button>
          </div>
        </div>

        {/* Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Customization Controls Accordion/Bar */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Sliders size={14} />
                <span>Report Telemetry & Dossier Configuration</span>
              </div>
              <span className="text-[10px] font-mono text-slate-400">
                {jsonReport.reportMetadata.specimenCount}{' '}
                {jsonReport.reportMetadata.specimenCount === 1 ? 'Specimen' : 'Specimens'} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeForensics}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includeForensics: e.target.checked }))
                  }
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="font-bold text-white block">Forensic Diagnostics</span>
                  <span className="text-[10px] text-slate-400">
                    Die Pair, 140T Strike, Wear & Alloy
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeConsensus}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includeConsensus: e.target.checked }))
                  }
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="font-bold text-white block">12-Node Grader Panel</span>
                  <span className="text-[10px] text-slate-400">
                    Consensus spread & specialist votes
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includeMarketAndPedigree}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includeMarketAndPedigree: e.target.checked }))
                  }
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="font-bold text-white block">Market & Pedigree</span>
                  <span className="text-[10px] text-slate-400">
                    1-Yr projections & provenance chain
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 cursor-pointer hover:border-amber-500/40 transition-colors">
                <input
                  type="checkbox"
                  checked={config.includePhotos}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, includePhotos: e.target.checked }))
                  }
                  className="accent-amber-500 w-4 h-4 rounded"
                />
                <div>
                  <span className="font-bold text-white block">Photographic Plates</span>
                  <span className="text-[10px] text-slate-400">
                    Embed specimen / tray imagery in PDF
                  </span>
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Prepared For (Collection / Dealer / Insurance Title)
                </label>
                <input
                  type="text"
                  value={config.preparedFor}
                  onChange={(e) => setConfig((prev) => ({ ...prev, preparedFor: e.target.value }))}
                  placeholder="e.g., Heritage Auction Consignment / Private Vault"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Custom Appraiser / Collector Notes (Included in PDF & JSON)
                </label>
                <input
                  type="text"
                  value={config.customCollectorNotes}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, customCollectorNotes: e.target.value }))
                  }
                  placeholder="Add vault location, acquisition cost, or dealer remarks..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: Interactive PDF Document Preview */}
          {activeTab === 'pdf-preview' && (
            <div className="bg-[#0b0f19] border-2 border-amber-500/30 rounded-3xl p-5 sm:p-8 space-y-6 shadow-2xl">
              {/* Document Header Banner */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-amber-500/20">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] font-mono font-black uppercase tracking-widest mb-2">
                    <Sparkles size={11} />
                    <span>{jsonReport.reportMetadata.reportScope}</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    CoinRarity Pro — Official Numismatic Summary Report
                  </h2>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Prepared For: <strong className="text-slate-200">{jsonReport.reportMetadata.preparedFor}</strong>
                  </p>
                </div>

                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 text-right font-mono text-xs shrink-0">
                  <div className="text-amber-400 font-bold">{jsonReport.reportMetadata.reportId}</div>
                  <div className="text-[10px] text-slate-400">
                    Checksum: {jsonReport.reportMetadata.cryptographicChecksum}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {jsonReport.reportMetadata.generatedAtFormatted}
                  </div>
                </div>
              </div>

              {/* Executive KPI Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-slate-400 flex items-center justify-between">
                    <span>Specimens</span>
                    <Coins size={13} className="text-amber-400" />
                  </span>
                  <div className="text-xl font-black text-white font-mono mt-1">
                    {jsonReport.reportMetadata.specimenCount}{' '}
                    <span className="text-xs font-normal text-slate-400">
                      {jsonReport.reportMetadata.specimenCount === 1 ? 'Coin' : 'Coins'}
                    </span>
                  </div>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {jsonReport.portfolioSummary.averageSheldonScore
                      ? `Avg Sheldon: ${jsonReport.portfolioSummary.averageSheldonScore}/70`
                      : 'Sheldon 70 Standard'}
                  </span>
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-emerald-300 flex items-center justify-between">
                    <span>Total Valuation</span>
                    <DollarSign size={13} className="text-emerald-400" />
                  </span>
                  <div className="text-xl font-black text-emerald-300 font-mono mt-1">
                    {jsonReport.portfolioSummary.combinedEstimatedValuation}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 font-mono">Auction Market Range</span>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-amber-300 flex items-center justify-between">
                    <span>Intrinsic Melt</span>
                    <Flame size={13} className="text-amber-400" />
                  </span>
                  <div className="text-xl font-black text-amber-300 font-mono mt-1">
                    {jsonReport.portfolioSummary.totalIntrinsicMeltFloor}
                  </div>
                  <span className="text-[10px] text-amber-400/80 font-mono">Bullion Scrap Floor</span>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-3.5">
                  <span className="text-[10px] font-mono uppercase text-purple-300 flex items-center justify-between">
                    <span>Top Standout</span>
                    <Award size={13} className="text-purple-400" />
                  </span>
                  <div className="text-xs font-black text-white truncate mt-1">
                    {jsonReport.portfolioSummary.standoutSpecimen?.coinName || 'Primary Specimen'}
                  </div>
                  <span className="text-[11px] text-purple-300 font-mono font-bold">
                    {jsonReport.portfolioSummary.standoutSpecimen?.grade} •{' '}
                    {jsonReport.portfolioSummary.standoutSpecimen?.estimatedValue}
                  </span>
                </div>
              </div>

              {/* Master Image & Synopsis */}
              {config.includePhotos && image && (
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-2 shrink-0">
                    <img
                      src={
                        config.scope === 'single' &&
                        result.coins[config.selectedCoinIndex]?.croppedImage
                          ? result.coins[config.selectedCoinIndex].croppedImage
                          : image
                      }
                      alt="Report Specimen Plate"
                      className="w-24 h-24 rounded-2xl object-cover border border-amber-500/40 bg-black"
                    />
                    {config.scope === 'single' && reverseImage && (
                      <img
                        src={reverseImage}
                        alt="Reverse Specimen Plate"
                        className="w-24 h-24 rounded-2xl object-cover border border-amber-500/40 bg-black"
                      />
                    )}
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <span className="text-[10px] font-mono font-black uppercase text-amber-400 block">
                      Executive Numismatic Synopsis
                    </span>
                    <p className="text-slate-300 leading-relaxed">
                      {jsonReport.portfolioSummary.collectionSummary}
                    </p>
                    {config.customCollectorNotes && (
                      <p className="text-amber-300 font-mono text-[11px] pt-1">
                        Collector Note: "{config.customCollectorNotes}"
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Specimen Table / Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Layers size={14} className="text-amber-400" />
                    <span>
                      Included Specimen Dossiers ({jsonReport.specimens.length})
                    </span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-500">
                    All rows exported to PDF & JSON
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-900 text-[10px] font-mono uppercase text-slate-400 border-b border-slate-800">
                        <th className="py-2.5 px-3">Slot</th>
                        <th className="py-2.5 px-3">Specimen Designation</th>
                        <th className="py-2.5 px-3">Grade</th>
                        <th className="py-2.5 px-3">Rarity</th>
                        {config.includeForensics && <th className="py-2.5 px-3">Die / Press</th>}
                        {config.includeConsensus && <th className="py-2.5 px-3">12-Node</th>}
                        <th className="py-2.5 px-3 text-right">Valuation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/70 font-mono">
                      {jsonReport.specimens.map((s) => (
                        <tr key={s.slotNumber} className="hover:bg-slate-900/50 transition-colors">
                          <td className="py-2.5 px-3 font-bold text-amber-400">#{s.slotNumber}</td>
                          <td className="py-2.5 px-3 font-sans">
                            <div className="font-bold text-white">{s.identity.coinName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {s.identity.year} {s.identity.mintMark} • {s.positionLabel}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-bold text-amber-300">
                            {s.gradingAndValuation.grade}
                          </td>
                          <td className="py-2.5 px-3 text-purple-300">
                            {s.gradingAndValuation.rarityLevel}
                          </td>
                          {config.includeForensics && (
                            <td className="py-2.5 px-3 text-[11px] text-slate-300">
                              {s.forensicDiagnostics?.dieMatching?.diePairId || 'Standard'}
                              {s.forensicDiagnostics?.strikeReconstruction?.estimatedStrikeTonnage
                                ? ` • ${s.forensicDiagnostics.strikeReconstruction.estimatedStrikeTonnage}T`
                                : ''}
                            </td>
                          )}
                          {config.includeConsensus && (
                            <td className="py-2.5 px-3 text-[11px] text-cyan-300">
                              {s.graderConsensus?.consensusGrade || s.gradingAndValuation.grade}
                            </td>
                          )}
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-400">
                            {s.gradingAndValuation.estimatedAuctionValue}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Structured JSON Schema Explorer */}
          {activeTab === 'json-preview' && (
            <div className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl">
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.includeImagesInJson}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, includeImagesInJson: e.target.checked }))
                      }
                      className="accent-indigo-500 w-4 h-4 rounded"
                    />
                    <span>Embed Base64 Cropped Specimen Images in JSON</span>
                  </label>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Size: {jsonByteSize}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyJson}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-bold text-slate-200 flex items-center gap-1.5 transition-all"
                  >
                    {copiedJson ? (
                      <Check size={14} className="text-emerald-400" />
                    ) : (
                      <Copy size={14} />
                    )}
                    <span>{copiedJson ? 'Copied JSON!' : 'Copy JSON'}</span>
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="px-3.5 py-1.5 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all"
                  >
                    <Download size={14} />
                    <span>Download .JSON</span>
                  </button>
                </div>
              </div>

              <div className="bg-black/90 border border-slate-800 rounded-2xl p-4 overflow-x-auto max-h-[420px]">
                <pre className="text-[11px] font-mono text-emerald-300 leading-relaxed">
                  {jsonString}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: Save & Share Distribution Hub */}
          {activeTab === 'share-hub' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: Direct File Downloads & Native Share */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
                  <Download size={15} />
                  <span>Official File Exports & Native Sharing</span>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleDownloadPdf}
                    disabled={isGeneratingPdf}
                    className="w-full p-4 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-black flex items-center justify-center font-black">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-amber-300">
                          Download Multi-Page PDF Report (.pdf)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Formatted institutional dossier with photos, subgrades & 12-node consensus
                        </p>
                      </div>
                    </div>
                    <Download size={18} className="text-amber-400 shrink-0" />
                  </button>

                  <button
                    onClick={handleDownloadJson}
                    className="w-full p-4 rounded-2xl bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 flex items-center justify-between text-left transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500 text-white flex items-center justify-center font-black">
                        <FileJson size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white group-hover:text-indigo-300">
                          Download Structured JSON Report (.json)
                        </h4>
                        <p className="text-[11px] text-slate-400">
                          Complete machine-readable schema ({jsonByteSize}) for vault & registry import
                        </p>
                      </div>
                    </div>
                    <Download size={18} className="text-indigo-400 shrink-0" />
                  </button>

                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    <button
                      onClick={() => handleNativeShare('pdf')}
                      className="p-3 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Share2 size={14} />
                      <span>Share PDF File</span>
                    </button>

                    <button
                      onClick={() => handleNativeShare('json')}
                      className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                    >
                      <Share2 size={14} />
                      <span>Share JSON File</span>
                    </button>
                  </div>

                  <button
                    onClick={() => window.print()}
                    className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Printer size={14} className="text-amber-400" />
                    <span>Print Physical Audit Certificate</span>
                  </button>
                </div>
              </div>

              {/* Right Column: Shareable Executive Text Brief */}
              <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                    <ShieldCheck size={15} />
                    <span>Shareable Executive Text Brief</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleNativeShare('text')}
                      className="px-2.5 py-1 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-[11px] font-bold flex items-center gap-1"
                    >
                      <Share2 size={12} />
                      <span>Share Text</span>
                    </button>
                    <button
                      onClick={handleCopySummary}
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1"
                    >
                      {copiedSummary ? (
                        <Check size={12} className="text-emerald-400" />
                      ) : (
                        <Copy size={12} />
                      )}
                      <span>{copiedSummary ? 'Copied' : 'Copy Text'}</span>
                    </button>
                  </div>
                </div>

                <textarea
                  readOnly
                  value={shareableText}
                  rows={11}
                  className="w-full bg-black/80 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-slate-300 leading-relaxed focus:outline-none resize-none"
                />

                <p className="text-[10px] text-slate-500 font-mono">
                  Ready to paste into dealer emails, auction consignment notes, insurance schedules, or messages.
                </p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

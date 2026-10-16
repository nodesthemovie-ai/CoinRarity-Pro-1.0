import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Camera,
  Upload,
  History as HistoryIcon,
  X,
  Scan,
  Coins,
  ShieldCheck,
  Award,
  AlertCircle,
  FileCheck2,
  RefreshCw,
  Sparkles,
  Layers,
  Flame,
  DollarSign,
  ZoomIn,
  Bot,
  Columns,
  Activity,
  Zap,
  Users,
  Droplets,
  TrendingUp,
  Grid,
  ArrowLeft,
  ArrowRight,
  Hammer,
  ArrowLeftRight,
  Home,
  FileText,
  Share2,
} from 'lucide-react';
import {
  AnalysisStatus,
  MultiCoinAnalysisResult,
  SavedAnalysis,
  SingleCoinData,
} from '../types';
import { analyzeCoinImage, generateNarrationAudio } from '../services/geminiService';
import { resizeImage, cropCoinImage } from '../utils/imageUtils';
import { SAMPLE_COINS, SampleCoin, SAMPLE_MULTI_COIN_TRAYS, SampleTray } from '../data/sampleCoins';
import { AudioBriefingPlayer } from './AudioBriefingPlayer';
import { CertificationModal } from './CertificationModal';
import { HistoryDrawer } from './HistoryDrawer';
import { CoinSlabView } from './CoinSlabView';
import { CoinLoupe } from './CoinLoupe';
import { SheldonGuideModal } from './SheldonGuideModal';
import { MeltCalculatorModal } from './MeltCalculatorModal';
import { DieVarietyGuideModal } from './DieVarietyGuideModal';
import { NumismatistConsultModal } from './NumismatistConsultModal';
import { AuthenticityRadarModal } from './AuthenticityRadarModal';
import { DieMatchingModal } from './DieMatchingModal';
import { WearProgressionModal } from './WearProgressionModal';
import { SpectralAlloyModal } from './SpectralAlloyModal';
import { GraderConsensusModal } from './GraderConsensusModal';
import { RestorationAdvisorModal } from './RestorationAdvisorModal';
import { MarketTrajectoryModal } from './MarketTrajectoryModal';
import { MultiCoinTrayExplorer } from './MultiCoinTrayExplorer';
import { StrikeAndProvenanceModal } from './StrikeAndProvenanceModal';
import { CrossComparisonModal } from './CrossComparisonModal';
import { ReportGeneratorModal } from './ReportGeneratorModal';

interface CachedSession {
  image: string;
  reverseImage: string | null;
  result: MultiCoinAnalysisResult;
  audioUrl: string | null;
}

export const CoinAnalyzer: React.FC = () => {
  const [status, setStatus] = useState<AnalysisStatus>(AnalysisStatus.IDLE);
  const [image, setImage] = useState<string | null>(null);
  const [reverseImage, setReverseImage] = useState<string | null>(null);
  const [result, setResult] = useState<MultiCoinAnalysisResult | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [lastSession, setLastSession] = useState<CachedSession | null>(null);
  const [currentVoice, setCurrentVoice] = useState<string>('Fenrir');
  const [isRegeneratingAudio, setIsRegeneratingAudio] = useState(false);
  const [history, setHistory] = useState<SavedAnalysis[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<SavedAnalysis | null>(null);
  const [isHistoryDetailsOpen, setIsHistoryDetailsOpen] = useState(false);
  const [isCertOpen, setIsCertOpen] = useState(false);
  const [showSlabInResult, setShowSlabInResult] = useState(false);
  const [useLoupeMode, setUseLoupeMode] = useState(false);
  const [activeFaceView, setActiveFaceView] = useState<'obverse' | 'reverse' | 'split'>('obverse');
  const [step, setStep] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Multi-Coin Tray (Up to 25 Coins) states
  const [scanMode, setScanMode] = useState<'single' | 'tray'>('single');
  const [focusedCoinIndex, setFocusedCoinIndex] = useState<number>(0);
  const [sampleTab, setSampleTab] = useState<'singles' | 'trays'>('singles');

  // Diagnostic Modals
  const [isSheldonModalOpen, setIsSheldonModalOpen] = useState(false);
  const [isMeltModalOpen, setIsMeltModalOpen] = useState(false);
  const [isVarietyModalOpen, setIsVarietyModalOpen] = useState(false);
  const [isConsultModalOpen, setIsConsultModalOpen] = useState(false);
  const [isAuthenticityModalOpen, setIsAuthenticityModalOpen] = useState(false);
  const [isDieMatchingOpen, setIsDieMatchingOpen] = useState(false);
  const [isWearProgressionOpen, setIsWearProgressionOpen] = useState(false);
  const [isSpectralAlloyOpen, setIsSpectralAlloyOpen] = useState(false);
  const [isGraderConsensusOpen, setIsGraderConsensusOpen] = useState(false);
  const [isRestorationOpen, setIsRestorationOpen] = useState(false);
  const [isMarketTrajectoryOpen, setIsMarketTrajectoryOpen] = useState(false);
  const [isStrikeProvenanceOpen, setIsStrikeProvenanceOpen] = useState(false);
  const [strikeProvenanceTab, setStrikeProvenanceTab] = useState<'strike' | 'provenance'>('strike');
  const [isCrossCompareOpen, setIsCrossCompareOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportModalScope, setReportModalScope] = useState<'batch' | 'single'>('batch');

  const openReportStudio = useCallback(
    (scope?: 'batch' | 'single', coinIdx?: number) => {
      if (typeof coinIdx === 'number') {
        setFocusedCoinIndex(coinIdx);
      }
      if (scope) {
        setReportModalScope(scope);
      } else {
        setReportModalScope(result && result.coins.length > 1 ? 'batch' : 'single');
      }
      setIsReportModalOpen(true);
    },
    [result]
  );

  // Camera handling
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraTargetFace, setCameraTargetFace] = useState<'obverse' | 'reverse'>('obverse');
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const videoRef = useRef<HTMLVideoElement>(null);
  const obverseInputRef = useRef<HTMLInputElement>(null);
  const reverseInputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    const saved = localStorage.getItem('coin_rarity_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load history', e);
      }
    }
  }, []);

  // Save history when it changes
  useEffect(() => {
    try {
      localStorage.setItem('coin_rarity_history', JSON.stringify(history));
    } catch (e) {
      console.warn('LocalStorage limit reached, trimming history');
      if (history.length > 5) {
        setHistory((prev) => prev.slice(0, 5));
      }
    }
  }, [history]);

  const saveToHistory = useCallback((analysis: MultiCoinAnalysisResult, obverseData: string, reverseData?: string | null) => {
    const newItem: SavedAnalysis = {
      ...analysis,
      id: crypto.randomUUID(),
      image: obverseData,
      reverseImage: reverseData || undefined,
      dateStr: new Date().toLocaleDateString(),
    };
    setHistory((prev) => [newItem, ...prev].slice(0, 30));
  }, []);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Determine if any modal or sub-state is currently open for Contextual Back Button
  const hasAnyModalOpen =
    isCertOpen ||
    isConsultModalOpen ||
    isDieMatchingOpen ||
    isWearProgressionOpen ||
    isSpectralAlloyOpen ||
    isGraderConsensusOpen ||
    isRestorationOpen ||
    isMarketTrajectoryOpen ||
    isAuthenticityModalOpen ||
    isSheldonModalOpen ||
    isMeltModalOpen ||
    isVarietyModalOpen ||
    isHistoryDetailsOpen ||
    isStrikeProvenanceOpen ||
    isCrossCompareOpen ||
    isReportModalOpen;

  const canGoBack =
    hasAnyModalOpen ||
    useLoupeMode ||
    showSlabInResult ||
    isCameraActive ||
    showHistory ||
    Boolean(image) ||
    status !== AnalysisStatus.IDLE;

  const closeAllModals = useCallback(() => {
    setIsCertOpen(false);
    setIsConsultModalOpen(false);
    setIsDieMatchingOpen(false);
    setIsWearProgressionOpen(false);
    setIsSpectralAlloyOpen(false);
    setIsGraderConsensusOpen(false);
    setIsRestorationOpen(false);
    setIsMarketTrajectoryOpen(false);
    setIsAuthenticityModalOpen(false);
    setIsSheldonModalOpen(false);
    setIsMeltModalOpen(false);
    setIsVarietyModalOpen(false);
    setIsHistoryDetailsOpen(false);
    setIsStrikeProvenanceOpen(false);
    setIsCrossCompareOpen(false);
    setIsReportModalOpen(false);
  }, []);

  // Universal Contextual Back Navigation Handler
  const handleBackNavigation = useCallback(() => {
    if (hasAnyModalOpen) {
      closeAllModals();
      return;
    }
    if (useLoupeMode) {
      setUseLoupeMode(false);
      return;
    }
    if (showSlabInResult) {
      setShowSlabInResult(false);
      return;
    }
    if (isCameraActive) {
      stopCamera();
      return;
    }
    if (showHistory) {
      setShowHistory(false);
      return;
    }
    if (image || status !== AnalysisStatus.IDLE) {
      if (image && result) {
        setLastSession({ image, reverseImage, result, audioUrl });
      }
      stopCamera();
      setImage(null);
      setReverseImage(null);
      setResult(null);
      setAudioUrl(null);
      setStatus(AnalysisStatus.IDLE);
      setErrorMsg(null);
      setUseLoupeMode(false);
      setFocusedCoinIndex(0);
    }
  }, [
    hasAnyModalOpen,
    closeAllModals,
    useLoupeMode,
    showSlabInResult,
    isCameraActive,
    stopCamera,
    showHistory,
    image,
    status,
    result,
    reverseImage,
    audioUrl,
  ]);

  const resumePreviousSession = () => {
    if (!lastSession) return;
    setImage(lastSession.image);
    setReverseImage(lastSession.reverseImage);
    setResult(lastSession.result);
    setAudioUrl(lastSession.audioUrl);
    setStatus(AnalysisStatus.COMPLETE);
    setShowHistory(false);
  };

  // Bind Escape key to contextual Back navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && canGoBack) {
        handleBackNavigation();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [canGoBack, handleBackNavigation]);

  // Compute human-readable back label
  const getBackTargetLabel = () => {
    if (hasAnyModalOpen) return 'Close Diagnostic';
    if (useLoupeMode) return 'Exit 50× Loupe';
    if (showSlabInResult) return 'Hide Slab';
    if (isCameraActive) return 'Exit Camera';
    if (showHistory) return 'Back to Scanner';
    if (image || status !== AnalysisStatus.IDLE) return 'Back to Home Scanner';
    return 'Home';
  };

  const startCamera = async (targetFace: 'obverse' | 'reverse' = 'obverse', facing: 'environment' | 'user' = cameraFacing) => {
    try {
      stopCamera();
      setCameraTargetFace(targetFace);
      setIsCameraActive(true);
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facing,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setErrorMsg('Could not access camera. Please verify camera permissions or upload a photograph.');
      setIsCameraActive(false);
    }
  };

  const toggleCameraFacing = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(nextFacing);
    if (isCameraActive) {
      startCamera(cameraTargetFace, nextFacing);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 1280;
    canvas.height = videoRef.current.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    stopCamera();

    if (cameraTargetFace === 'reverse') {
      const compressedRev = await resizeImage(dataUrl, 1200);
      setReverseImage(compressedRev);
      if (image) {
        processSpecimen(image, compressedRev);
      }
    } else {
      processSpecimen(dataUrl, reverseImage);
    }
  };

  const processSpecimen = async (obverseDataUrl: string, revDataUrl?: string | null) => {
    setShowHistory(false);
    setStatus(AnalysisStatus.ANALYZING);
    setResult(null);
    setAudioUrl(null);
    setErrorMsg(null);
    setStep('Preprocessing High-Resolution Specimen & Spatial Boundaries');

    try {
      const compressedObverse = await resizeImage(obverseDataUrl, 2000);
      setImage(compressedObverse);

      let compressedReverse: string | null = null;
      if (revDataUrl) {
        compressedReverse = await resizeImage(revDataUrl, 2000);
        setReverseImage(compressedReverse);
      }

      setStep('Scanning Image Matrix & Detecting All Coins (Up to 25 Specimens)');
      const analysis = await analyzeCoinImage(compressedObverse, compressedReverse);

      if (analysis.coins && analysis.coins.length > 1) {
        setStep(`Extracting High-Res Micro-Crops for ${analysis.coins.length} Specimens`);
        try {
          const croppedCoins = await Promise.all(
            analysis.coins.map(async (coin, idx) => {
              if (coin.boundingBox && coin.boundingBox.length === 4) {
                try {
                  const crop = await cropCoinImage(compressedObverse, coin.boundingBox as [number, number, number, number]);
                  return { ...coin, croppedImage: crop, coinIndex: coin.coinIndex || idx + 1 };
                } catch {
                  return { ...coin, coinIndex: coin.coinIndex || idx + 1 };
                }
              }
              return { ...coin, coinIndex: coin.coinIndex || idx + 1 };
            })
          );
          analysis.coins = croppedCoins;
        } catch (cropErr) {
          console.warn('Micro-crop extraction notice:', cropErr);
        }
      }

      setFocusedCoinIndex(0);
      setResult(analysis);
      saveToHistory(analysis, compressedObverse, compressedReverse);

      setStep('Synthesizing Spoken Numismatic Appraisal');
      setStatus(AnalysisStatus.GENERATING_AUDIO);

      let synthUrl: string | null = null;
      try {
        synthUrl = await generateNarrationAudio(analysis.narrationScript, currentVoice);
        setAudioUrl(synthUrl);
      } catch (audioErr) {
        console.warn('Audio narration synthesis bypassed:', audioErr);
      }

      setLastSession({
        image: compressedObverse,
        reverseImage: compressedReverse,
        result: analysis,
        audioUrl: synthUrl,
      });

      setStatus(AnalysisStatus.COMPLETE);
      setStep('');
    } catch (err: any) {
      console.error('Processing Error:', err);
      setErrorMsg(err.message || 'Numismatic analysis encountered an error. Please test with a clearer photograph.');
      setStatus(AnalysisStatus.ERROR);
      setStep('');
    }
  };

  const handleVoiceChange = async (newVoice: string) => {
    setCurrentVoice(newVoice);
    if (!result?.narrationScript) return;

    setIsRegeneratingAudio(true);
    try {
      const url = await generateNarrationAudio(result.narrationScript, newVoice);
      setAudioUrl(url);
    } catch (err) {
      console.error('Failed to regenerate voice with voice:', newVoice, err);
    } finally {
      setIsRegeneratingAudio(false);
    }
  };

  const handleObverseFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
      processSpecimen(reader.result, reverseImage);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleReverseFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      if (typeof reader.result !== 'string') return;
      const compressed = await resizeImage(reader.result, 1200);
      setReverseImage(compressed);
      if (image) {
        processSpecimen(image, compressed);
      }
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          processSpecimen(reader.result, reverseImage);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectSample = (sample: SampleCoin) => {
    setReverseImage(sample.reverseImage || null);
    processSpecimen(sample.image, sample.reverseImage || null);
  };

  const handleSelectSampleTray = (sampleTray: SampleTray) => {
    setReverseImage(null);
    processSpecimen(sampleTray.image, null);
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearAllHistory = () => {
    setHistory([]);
    localStorage.removeItem('coin_rarity_history');
  };

  const loadHistoryItem = (item: SavedAnalysis) => {
    setSelectedHistoryItem(item);
    setIsHistoryDetailsOpen(true);
  };

  const restoreHistoryItemToWorkspace = (item: SavedAnalysis) => {
    setIsHistoryDetailsOpen(false);
    setShowHistory(false);
    setImage(item.image);
    setReverseImage(item.reverseImage || null);
    setResult(item);
    setFocusedCoinIndex(0);
    setStatus(AnalysisStatus.COMPLETE);
  };

  const reset = () => {
    if (image && result) {
      setLastSession({ image, reverseImage, result, audioUrl });
    }
    stopCamera();
    setImage(null);
    setReverseImage(null);
    setResult(null);
    setAudioUrl(null);
    setStatus(AnalysisStatus.IDLE);
    setErrorMsg(null);
    setUseLoupeMode(false);
    setFocusedCoinIndex(0);
  };

  const primaryCoin = result?.coins[focusedCoinIndex] || result?.coins[0];

  const currentDisplayImage =
    useLoupeMode && primaryCoin?.croppedImage
      ? primaryCoin.croppedImage
      : activeFaceView === 'reverse' && reverseImage
      ? reverseImage
      : image;

  return (
    <div id="coin-analyzer-root" className="max-w-6xl mx-auto w-full px-3 sm:px-4 pt-1 pb-24 md:pb-16 space-y-5 font-sans">
      {/* Universal Contextual Back Button & Breadcrumb Navigation Bar */}
      <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-2.5 sm:px-4 flex flex-wrap items-center justify-between gap-2 shadow-xl backdrop-blur-xl sticky top-16 sm:top-20 z-50">
        <div className="flex items-center gap-2 flex-wrap min-w-0">
          {/* Universal Back Button */}
          <button
            id="universal-back-btn"
            onClick={handleBackNavigation}
            disabled={!canGoBack}
            className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all active:scale-95 ${
              canGoBack
                ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20 hover:bg-amber-400 cursor-pointer'
                : 'bg-slate-800/60 text-slate-500 border border-slate-800 cursor-not-allowed'
            }`}
            title={canGoBack ? getBackTargetLabel() : 'At Home Scanner'}
          >
            <ArrowLeft size={14} />
            <span>{canGoBack ? getBackTargetLabel() : 'Back'}</span>
          </button>

          {/* Interactive Breadcrumb Path */}
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400 truncate">
            <button
              onClick={reset}
              className="hover:text-amber-400 transition-colors flex items-center gap-1"
            >
              <Home size={11} />
              <span>Scanner</span>
            </button>
            {showHistory && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-amber-400 font-bold">Registry ({history.length})</span>
              </>
            )}
            {!showHistory && image && (
              <>
                <span className="text-slate-600">/</span>
                <button
                  onClick={() => {
                    setUseLoupeMode(false);
                    setShowSlabInResult(false);
                  }}
                  className="text-slate-200 hover:text-amber-400 font-bold truncate max-w-[160px]"
                >
                  {result && result.coins.length > 1
                    ? `${result.coins.length}-Coin Tray`
                    : primaryCoin?.coinName || 'Specimen Audit'}
                </button>
              </>
            )}
            {!showHistory && result && result.coins.length > 1 && primaryCoin && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-amber-400 font-bold truncate max-w-[140px]">
                  #{focusedCoinIndex + 1} {primaryCoin.coinName}
                </span>
              </>
            )}
            {useLoupeMode && (
              <>
                <span className="text-slate-600">/</span>
                <span className="text-cyan-400 font-bold">50× Loupe</span>
              </>
            )}
          </div>
        </div>

        {/* Right Side: Resume Last Audit Button or Navigation Switcher */}
        <div className="flex items-center gap-2">
          {!image && lastSession && !showHistory && (
            <button
              id="resume-last-audit-btn"
              onClick={resumePreviousSession}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
              title="Return to your most recent coin or tray analysis"
            >
              <span>Resume Audit</span>
              <ArrowRight size={13} />
            </button>
          )}

          {/* Scanner vs Registry Switcher */}
          <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex">
            <button
              id="nav-scanner-tab"
              onClick={() => setShowHistory(false)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                !showHistory
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scan size={12} />
              <span>Scanner</span>
            </button>
            <button
              id="nav-history-tab"
              onClick={() => setShowHistory(true)}
              className={`px-3 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                showHistory
                  ? 'bg-amber-500 text-black shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <HistoryIcon size={12} />
              <span>Registry</span>
              {history.length > 0 && (
                <span className="bg-black/40 px-1.5 py-0.2 rounded-full text-[9px] font-mono font-bold text-amber-300">
                  {history.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Quick Numismatic Diagnostic Engines Bar (Horizontally Scrollable on Mobile) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1.5 no-scrollbar">
        {/* PDF & JSON Summary Report Studio */}
        <button
          id="open-report-studio-bar-btn"
          onClick={() => openReportStudio()}
          className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        >
          <FileText size={13} />
          <span>PDF / JSON Report</span>
        </button>

        {/* Ask Numismatist Consultation */}
        <button
          id="open-consult-btn"
          onClick={() => setIsConsultModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Bot size={13} />
          <span>Ask Numismatist</span>
        </button>

        {/* Die-Matching Engine */}
        <button
          id="open-die-matching-btn"
          onClick={() => setIsDieMatchingOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Layers size={13} className="text-purple-400" />
          <span>Die-Matching</span>
          {primaryCoin?.dieMatching?.diePairId && (
            <span className="bg-purple-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded">
              {primaryCoin.dieMatching.diePairId}
            </span>
          )}
        </button>

        {/* Strike Pressure Reconstruction & Provenance */}
        <button
          id="open-strike-provenance-btn"
          onClick={() => {
            setStrikeProvenanceTab('strike');
            setIsStrikeProvenanceOpen(true);
          }}
          className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Hammer size={13} className="text-amber-400" />
          <span>Strike & Pedigree</span>
        </button>

        {/* Cross-Comparison Engine */}
        <button
          id="open-cross-compare-btn"
          onClick={() => setIsCrossCompareOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <ArrowLeftRight size={13} className="text-indigo-400" />
          <span>Cross-Compare</span>
        </button>

        {/* Wear Progression Engine */}
        <button
          id="open-wear-progression-btn"
          onClick={() => setIsWearProgressionOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Activity size={13} className="text-cyan-400" />
          <span>Wear Model</span>
        </button>

        {/* Spectral Metal Analysis */}
        <button
          id="open-spectral-alloy-btn"
          onClick={() => setIsSpectralAlloyOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Zap size={13} className="text-emerald-400" />
          <span>Spectral Alloy</span>
        </button>

        {/* 12-Node Multi-Model Consensus */}
        <button
          id="open-grader-consensus-btn"
          onClick={() => setIsGraderConsensusOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Users size={13} className="text-amber-400" />
          <span>12-Node Consensus</span>
        </button>

        {/* Authenticity Physical Radar */}
        <button
          id="open-authenticity-radar-btn"
          onClick={() => setIsAuthenticityModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <ShieldCheck size={13} className="text-cyan-400" />
          <span>Tolerances</span>
        </button>

        {/* Restoration Advisor */}
        <button
          id="open-restoration-btn"
          onClick={() => setIsRestorationOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-teal-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Droplets size={13} className="text-teal-400" />
          <span>Restoration</span>
        </button>

        {/* Market Trajectory */}
        <button
          id="open-market-trajectory-btn"
          onClick={() => setIsMarketTrajectoryOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <TrendingUp size={13} className="text-emerald-400" />
          <span>Projections</span>
        </button>

        {/* Melt Calculator */}
        <button
          id="open-melt-calc-btn"
          onClick={() => setIsMeltModalOpen(true)}
          className="px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 shadow-sm"
        >
          <Flame size={13} className="text-amber-500" />
          <span>Melt</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!showHistory ? (
          <motion.div
            key="scanner-view"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="space-y-6"
          >
            {/* Input Selection State */}
            {!image && status === AnalysisStatus.IDLE && (
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Global Scan Mode Switcher */}
                <div className="flex bg-slate-900/90 p-1 rounded-2xl border border-slate-800 max-w-md mx-auto shadow-xl">
                  <button
                    id="mode-single-specimen-btn"
                    onClick={() => setScanMode('single')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      scanMode === 'single'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Coins size={14} />
                    <span>Single Specimen</span>
                  </button>
                  <button
                    id="mode-multi-tray-btn"
                    onClick={() => setScanMode('tray')}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                      scanMode === 'tray'
                        ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <Grid size={14} />
                    <span>Tray Scanner (Up to 25)</span>
                  </button>
                </div>

                {isCameraActive ? (
                  <div className="bg-slate-950 border border-slate-800 rounded-[32px] overflow-hidden shadow-2xl relative aspect-[3/4] md:aspect-video flex items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />

                    {/* Camera Top Bar with Back & Mode Switcher */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-auto z-20">
                      <button
                        onClick={stopCamera}
                        className="px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-slate-700 text-amber-400 text-xs font-black uppercase flex items-center gap-1.5"
                      >
                        <ArrowLeft size={13} />
                        <span>Back</span>
                      </button>

                      <div className="bg-black/80 backdrop-blur-md px-2.5 py-1 rounded-full border border-slate-700/80 flex items-center gap-2 text-xs font-mono">
                        <button
                          onClick={() => setScanMode('single')}
                          className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                            scanMode === 'single' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          1 Coin
                        </button>
                        <button
                          onClick={() => setScanMode('tray')}
                          className={`px-2.5 py-0.5 rounded-full font-bold transition-all ${
                            scanMode === 'tray' ? 'bg-amber-500 text-black' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          25-Coin Tray
                        </button>
                      </div>
                    </div>

                    {/* Reticle Overlay */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
                      {scanMode === 'tray' ? (
                        <div className="relative w-full h-full max-w-xl max-h-[480px] border-2 border-dashed border-amber-500/40 rounded-2xl flex flex-col justify-between p-4 bg-amber-500/5">
                          <div className="grid grid-cols-5 grid-rows-5 gap-2 w-full h-full opacity-40">
                            {Array.from({ length: 25 }).map((_, i) => (
                              <div
                                key={i}
                                className="border border-amber-400/30 rounded-full flex items-center justify-center"
                              >
                                <span className="text-[8px] font-mono text-amber-400 font-bold opacity-60">
                                  #{i + 1}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="absolute inset-x-0 bottom-4 flex justify-center">
                            <span className="text-[10px] font-mono text-amber-300 uppercase tracking-widest bg-black/85 px-3 py-1 rounded-full border border-amber-500/30">
                              TRAY CAPTURE MATRIX • ALIGN UP TO 25 COINS
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-60 h-60 sm:w-80 sm:h-80 border-2 border-amber-500/40 rounded-full flex items-center justify-center animate-pulse">
                          <div className="absolute top-0 w-4 h-1 bg-amber-500" />
                          <div className="absolute bottom-0 w-4 h-1 bg-amber-500" />
                          <div className="absolute left-0 w-1 h-4 bg-amber-500" />
                          <div className="absolute right-0 w-1 h-4 bg-amber-500" />
                          <span className="text-[10px] font-mono text-amber-400 uppercase tracking-[2px] bg-black/70 px-3 py-1 rounded-full backdrop-blur-sm">
                            Center {cameraTargetFace === 'reverse' ? 'Reverse (Back)' : 'Obverse (Front)'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Camera Action Buttons */}
                    <div className="absolute bottom-6 left-0 right-0 flex items-center justify-center gap-4 sm:gap-6 px-4 pointer-events-auto z-20">
                      <button
                        id="camera-flip-btn"
                        onClick={toggleCameraFacing}
                        className="w-12 h-12 bg-slate-900/80 backdrop-blur-xl border border-slate-700 text-white rounded-full flex items-center justify-center hover:bg-black transition-all"
                        title="Switch Camera"
                      >
                        <RefreshCw size={18} />
                      </button>

                      <button
                        id="camera-shutter-btn"
                        onClick={capturePhoto}
                        className="h-14 sm:h-16 px-5 sm:px-6 bg-white rounded-full flex items-center justify-center gap-2 p-1.5 shadow-[0_0_40px_rgba(255,255,255,0.4)] active:scale-95 transition-transform"
                      >
                        <div className="w-9 h-9 sm:w-10 sm:h-10 border-4 border-slate-950 rounded-full bg-amber-500 flex items-center justify-center">
                          <div className="w-3.5 h-3.5 bg-white rounded-full" />
                        </div>
                        <span className="text-black font-black text-xs font-mono uppercase tracking-wider pr-2">
                          {scanMode === 'tray' ? 'Capture Tray (25)' : 'Capture Specimen'}
                        </span>
                      </button>

                      <button
                        id="camera-close-btn"
                        onClick={stopCamera}
                        className="w-12 h-12 bg-slate-900/80 backdrop-blur-xl border border-slate-700 text-white rounded-full flex items-center justify-center hover:bg-black transition-all"
                        title="Close Camera"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-[28px] sm:rounded-[32px] p-4 sm:p-6 transition-all ${
                      isDragging ? 'border-amber-500 bg-amber-500/5' : 'border-slate-800 bg-slate-950/40'
                    }`}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                      {/* Live Camera Option */}
                      <motion.div
                        id="action-live-capture"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => startCamera('obverse')}
                        className="bg-slate-900/60 border border-slate-800 p-6 sm:p-7 rounded-3xl cursor-pointer hover:border-amber-500/50 transition-all group relative overflow-hidden h-48 sm:h-56 flex flex-col items-center justify-center text-center shadow-xl shadow-black/40"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/10 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-amber-500 group-hover:scale-110 transition-transform">
                          <Camera size={26} />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mb-1 uppercase tracking-tight">
                          {scanMode === 'tray' ? 'Camera Tray Scanner' : 'Camera Scanner'}
                        </h3>
                        <p className="text-slate-400 text-xs">
                          {scanMode === 'tray'
                            ? 'Capture full dealer tray or binder sheet with up to 25 coins'
                            : 'Align single specimen in live precision reticle'}
                        </p>
                      </motion.div>

                      {/* File Upload Option */}
                      <motion.div
                        id="action-upload-file"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => obverseInputRef.current?.click()}
                        className="bg-slate-900/60 border border-slate-800 p-6 sm:p-7 rounded-3xl cursor-pointer hover:border-indigo-500/50 transition-all group relative overflow-hidden h-48 sm:h-56 flex flex-col items-center justify-center text-center shadow-xl shadow-black/40"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="w-12 h-12 sm:w-14 sm:h-14 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-3 sm:mb-4 text-indigo-400 group-hover:scale-110 transition-transform">
                          <Upload size={26} />
                        </div>
                        <h3 className="text-base sm:text-lg font-black text-white mb-1 uppercase tracking-tight">
                          {scanMode === 'tray' ? 'Upload Multi-Coin Tray' : 'Upload Specimen'}
                        </h3>
                        <p className="text-slate-400 text-xs">
                          {scanMode === 'tray'
                            ? 'Upload a photo with up to 25 coins in one image'
                            : 'Drag & drop or browse high-res specimen photo'}
                        </p>
                        <input
                          id="coin-file-input"
                          type="file"
                          ref={obverseInputRef}
                          onChange={handleObverseFileChange}
                          accept="image/*"
                          className="hidden"
                        />
                      </motion.div>
                    </div>

                    {/* Presets Row for Fast Testing */}
                    <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-800/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                        <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                          <Sparkles size={14} className="text-amber-400" />
                          <span>Reference Test Library & 25-Coin Benchmarks:</span>
                        </div>

                        <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[11px] font-mono">
                          <button
                            onClick={() => setSampleTab('singles')}
                            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold transition-all ${
                              sampleTab === 'singles'
                                ? 'bg-amber-500 text-black shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Individual Coins (8)
                          </button>
                          <button
                            onClick={() => setSampleTab('trays')}
                            className={`flex-1 sm:flex-initial px-3 py-1 rounded-lg font-bold transition-all flex items-center justify-center gap-1.5 ${
                              sampleTab === 'trays'
                                ? 'bg-amber-500 text-black shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <Grid size={11} />
                            <span>Multi-Coin Trays (3)</span>
                          </button>
                        </div>
                      </div>

                      {sampleTab === 'trays' ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {SAMPLE_MULTI_COIN_TRAYS.map((tray) => (
                            <button
                              key={tray.id}
                              id={`sample-tray-${tray.id}`}
                              onClick={() => handleSelectSampleTray(tray)}
                              className="bg-slate-900/90 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/50 p-3.5 rounded-2xl text-left transition-all group flex flex-col justify-between shadow-lg"
                            >
                              <div>
                                <div className="flex items-center justify-between gap-2 mb-2.5">
                                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black border border-amber-500/30 shrink-0">
                                    <img src={tray.image} alt={tray.name} className="w-full h-full object-cover" />
                                  </div>
                                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-black">
                                    {tray.coinCount} Coins In 1 Image
                                  </span>
                                </div>
                                <h5 className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">
                                  {tray.name}
                                </h5>
                                <p className="text-[10px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                                  {tray.description}
                                </p>
                              </div>

                              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[9px] font-mono text-amber-400">
                                <span className="truncate">★ {tray.highlights}</span>
                                <span className="group-hover:translate-x-0.5 transition-transform">Scan Tray →</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2.5">
                          {SAMPLE_COINS.map((sample) => (
                            <button
                              key={sample.id}
                              id={`sample-coin-${sample.id}`}
                              onClick={() => handleSelectSample(sample)}
                              className="bg-slate-900/80 hover:bg-slate-850 border border-slate-800 hover:border-amber-500/40 p-2.5 rounded-2xl text-left transition-all group flex flex-col justify-between"
                            >
                              <div className="flex items-center gap-1.5 mb-2">
                                <div className="w-7 h-7 rounded-full overflow-hidden shrink-0 bg-black border border-amber-500/20">
                                  <img src={sample.image} alt={sample.name} className="w-full h-full object-cover" />
                                </div>
                                <span className="text-[10px] font-mono text-amber-400 font-bold truncate">{sample.year}</span>
                              </div>
                              <div>
                                <h5 className="text-[11px] font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                                  {sample.name}
                                </h5>
                                <p className="text-[9px] text-slate-500 line-clamp-1">{sample.rarityLevel}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Analysis State or Results */}
            {image && (
              <div className="space-y-6">
                {/* Multi-Coin Master Tray Explorer (When multiple coins detected) */}
                {result && result.coins.length > 1 && (
                  <MultiCoinTrayExplorer
                    result={result}
                    image={image}
                    focusedCoinIndex={focusedCoinIndex}
                    onSelectCoin={(idx) => {
                      setFocusedCoinIndex(idx);
                      const cardElem = document.getElementById(`coin-card-${idx}`);
                      if (cardElem) {
                        cardElem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                      }
                    }}
                    onOpenConsult={() => setIsConsultModalOpen(true)}
                    onOpenCertModal={() => setIsCertOpen(true)}
                    onOpenReportModal={(scope, idx) => openReportStudio(scope, idx)}
                  />
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Image Preview, Dual-Side Switcher & Loupe */}
                  <div className="lg:col-span-5 space-y-4">
                    {/* Active focused specimen badge if in multi-coin tray */}
                    {result && result.coins.length > 1 && (
                      <div className="bg-slate-900/90 border border-amber-500/30 p-3 rounded-2xl flex items-center justify-between text-xs shadow-lg">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-black font-black font-mono text-xs flex items-center justify-center shrink-0 shadow">
                            #{focusedCoinIndex + 1}
                          </span>
                          <div className="min-w-0">
                            <span className="text-[9px] font-mono uppercase text-amber-400 block font-bold truncate">
                              Inspecting Specimen ({primaryCoin?.positionLabel || `Slot #${focusedCoinIndex + 1}`})
                            </span>
                            <span className="font-bold text-white truncate block">
                              {primaryCoin?.coinName || 'Selected Specimen'}
                            </span>
                          </div>
                        </div>
                        <div className="text-right font-mono shrink-0">
                          <span className="text-amber-400 font-bold block">{primaryCoin?.grade}</span>
                          <span className="text-[10px] text-emerald-400">{primaryCoin?.estimatedValue}</span>
                        </div>
                      </div>
                    )}

                    {/* Specimen View Card */}
                    <div className="bg-slate-900/70 rounded-3xl border border-slate-800 p-3.5 sm:p-4 shadow-2xl relative">
                      {/* Top Bar with Mode Toggles */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-white/5 text-xs font-mono">
                        {/* Face Selector */}
                        <div className="flex bg-black/60 p-0.5 rounded-xl border border-slate-800">
                          <button
                            onClick={() => setActiveFaceView('obverse')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              activeFaceView === 'obverse'
                                ? 'bg-amber-500 text-black shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            {primaryCoin?.croppedImage ? 'Cropped' : 'Obverse'}
                          </button>
                          <button
                            onClick={() => setActiveFaceView('reverse')}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-all ${
                              activeFaceView === 'reverse'
                                ? 'bg-amber-500 text-black shadow'
                                : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            Reverse {reverseImage ? '✓' : ''}
                          </button>
                          {reverseImage && (
                            <button
                              onClick={() => setActiveFaceView('split')}
                              className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1 ${
                                activeFaceView === 'split'
                                  ? 'bg-amber-500 text-black shadow'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                              title="Side-by-side Dual Face Comparison"
                            >
                              <Columns size={11} />
                              <span>Dual</span>
                            </button>
                          )}
                        </div>

                        {/* Loupe Mode & Back/Reset Toggle */}
                        <div className="flex items-center gap-1.5">
                          <button
                            id="toggle-loupe-btn"
                            onClick={() => setUseLoupeMode(!useLoupeMode)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase border transition-all flex items-center gap-1 ${
                              useLoupeMode
                                ? 'bg-amber-500 text-black border-amber-400 font-black'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                            }`}
                            title="Toggle 50x Scientific Micro-Loupe"
                          >
                            <ZoomIn size={12} />
                            <span>50× Loupe</span>
                          </button>

                          <button
                            id="reset-scan-btn"
                            onClick={reset}
                            className="bg-slate-800 text-amber-400 hover:text-white px-2 py-1 rounded-lg border border-slate-700 transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                            title="Back to Home Scanner"
                          >
                            <ArrowLeft size={12} />
                            <span>New</span>
                          </button>
                        </div>
                      </div>

                      {/* Image View or Loupe Inspector */}
                      <div className="relative rounded-2xl overflow-hidden bg-black">
                        {useLoupeMode ? (
                          <CoinLoupe
                            image={currentDisplayImage || image}
                            reverseImage={reverseImage}
                            alt={`${activeFaceView} specimen`}
                            doublingClass={primaryCoin?.dieMatching?.doublingClass}
                            rpmVector={primaryCoin?.dieMatching?.rpmVector}
                            onExitLoupe={() => setUseLoupeMode(false)}
                          />
                        ) : activeFaceView === 'split' && reverseImage ? (
                          <div className="grid grid-cols-2 gap-2 p-2 aspect-square">
                            <div className="flex flex-col items-center justify-center bg-black/60 rounded-xl overflow-hidden border border-slate-800 relative">
                              <img src={image} alt="Obverse" className="w-full h-full object-cover" />
                              <span className="absolute bottom-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-amber-400 uppercase">
                                OBVERSE
                              </span>
                            </div>
                            <div className="flex flex-col items-center justify-center bg-black/60 rounded-xl overflow-hidden border border-slate-800 relative">
                              <img src={reverseImage} alt="Reverse" className="w-full h-full object-cover" />
                              <span className="absolute bottom-2 bg-black/80 px-2 py-0.5 rounded text-[8px] font-mono text-amber-400 uppercase">
                                REVERSE
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="relative aspect-square overflow-hidden rounded-2xl">
                            <img
                              src={currentDisplayImage || image}
                              alt={`${activeFaceView} specimen`}
                              className="w-full h-full object-cover grayscale-[0.05]"
                            />

                            {/* Dynamic Scanner Beam */}
                            {status === AnalysisStatus.ANALYZING && (
                              <motion.div
                                initial={{ top: '0%' }}
                                animate={{ top: '100%' }}
                                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                                className="scanner-line"
                              />
                            )}
                          </div>
                        )}

                        {/* Loading Overlay */}
                        {status === AnalysisStatus.ANALYZING && (
                          <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center text-center p-6 z-30">
                            <div className="relative mb-6">
                              <div className="w-20 h-20 border-2 border-amber-500/20 rounded-full flex items-center justify-center">
                                <div className="w-14 h-14 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                              </div>
                              <div className="absolute -inset-2 border border-amber-500/10 rounded-full animate-ping" />
                            </div>

                            <div className="space-y-2">
                              <h4 className="text-base sm:text-lg font-black text-white tracking-tight uppercase italic">
                                {step}
                              </h4>
                              <div className="flex gap-1.5 justify-center">
                                {[0, 1, 2, 3, 4].map((i) => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [4, 18, 4] }}
                                    transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.12 }}
                                    className="w-1 bg-amber-500 rounded-full"
                                  />
                                ))}
                              </div>
                              <p className="text-amber-400 font-mono text-[9px] uppercase tracking-[3px] opacity-70">
                                {reverseImage
                                  ? 'Dual-Face Sheldon Grading & Die-Matching'
                                  : '12-Node Sheldon 70 Standard & Subgrade Audit'}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Reverse Image Add/Change Bar if missing */}
                      {!reverseImage && status !== AnalysisStatus.ANALYZING && (
                        <div className="mt-3 p-3 bg-amber-500/5 rounded-xl border border-amber-500/20 flex items-center justify-between text-xs">
                          <div className="text-slate-300">
                            <strong className="text-amber-400 block text-[10px] font-mono uppercase">
                              Add Reverse Side
                            </strong>
                            <span className="text-[11px] text-slate-400">
                              Enable dual-pane inspection & full die pair matching
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => startCamera('reverse')}
                              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                              title="Camera Capture Reverse"
                            >
                              <Camera size={14} />
                            </button>
                            <button
                              onClick={() => reverseInputRef.current?.click()}
                              className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300"
                              title="Upload Reverse"
                            >
                              <Upload size={14} />
                            </button>
                            <input
                              type="file"
                              ref={reverseInputRef}
                              onChange={handleReverseFileChange}
                              accept="image/*"
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Error Notification */}
                    {status === AnalysisStatus.ERROR && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-start gap-3"
                      >
                        <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={20} />
                        <div>
                          <h4 className="text-red-200 font-bold mb-1 text-xs uppercase tracking-wider">Audit Notice</h4>
                          <p className="text-red-200/80 text-xs leading-relaxed">{errorMsg}</p>
                          <button
                            onClick={reset}
                            className="mt-2.5 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg text-[10px] font-bold uppercase tracking-wider text-red-300 transition-colors flex items-center gap-1.5"
                          >
                            <ArrowLeft size={12} />
                            <span>Back / Try Another Photo</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* Slab Preview Toggle in Results */}
                    {result && (
                      <div className="bg-slate-900/60 p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ShieldCheck size={16} className="text-amber-400" />
                          <span className="text-xs font-bold text-slate-300">Certified Slab Holder</span>
                        </div>
                        <button
                          id="toggle-slab-preview-btn"
                          onClick={() => setShowSlabInResult(!showSlabInResult)}
                          className="text-xs font-mono font-bold text-amber-400 hover:underline"
                        >
                          {showSlabInResult ? 'Hide Slab' : 'Show Encapsulated Slab'}
                        </button>
                      </div>
                    )}

                    {showSlabInResult && result && primaryCoin && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="pt-1"
                      >
                        <CoinSlabView
                          coin={primaryCoin}
                          image={primaryCoin.croppedImage || image}
                          reverseImage={reverseImage || undefined}
                          auditId={result.auditId}
                        />
                      </motion.div>
                    )}
                  </div>

                  {/* Right Column: Detailed Numismatic Assessment */}
                  <div className="lg:col-span-7">
                    <AnimatePresence mode="wait">
                      {status === AnalysisStatus.COMPLETE && result ? (
                        <motion.div
                          key="result-content"
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="space-y-5"
                        >
                          {/* Header and Certificate Launch */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
                                  Analysis Complete {reverseImage ? '• Dual-Face Audit' : ''}
                                </span>
                              </div>
                              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase italic tracking-tight">
                                Numismatic Dossier
                              </h3>
                              <p className="text-slate-400 text-xs font-mono">
                                Audit ID: <strong className="text-amber-400">{result.auditId}</strong>
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              {/* PDF / JSON Summary Report Studio */}
                              <button
                                id="open-report-studio-header-btn"
                                onClick={() => openReportStudio()}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 font-black uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <FileText size={13} className="text-emerald-400" />
                                <span>PDF / JSON Report</span>
                              </button>

                              {/* Cross-Compare Button */}
                              <button
                                onClick={() => setIsCrossCompareOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-indigo-500/15 hover:bg-indigo-500/25 border border-indigo-500/40 text-indigo-300 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <ArrowLeftRight size={13} />
                                <span>Compare</span>
                              </button>

                              {/* Ask Numismatist */}
                              <button
                                id="consult-grader-header-btn"
                                onClick={() => setIsConsultModalOpen(true)}
                                className="flex items-center gap-1.5 px-3 py-2 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 font-bold uppercase text-[10px] tracking-wider rounded-xl transition-all shadow-sm active:scale-95"
                              >
                                <Bot size={13} />
                                <span>Consult AI</span>
                              </button>

                              {/* Certificate & Slab Modal */}
                              <button
                                id="open-cert-modal-btn"
                                onClick={() => setIsCertOpen(true)}
                                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase text-[10px] tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)] active:scale-95"
                              >
                                <FileCheck2 size={14} />
                                <span>Certificate & Slab</span>
                              </button>
                            </div>
                          </div>

                          {/* Audio Briefing Player with Multi-Voice support */}
                          <AudioBriefingPlayer
                            audioUrl={audioUrl}
                            script={result.narrationScript}
                            currentVoice={currentVoice}
                            onVoiceChange={handleVoiceChange}
                            isRegeneratingAudio={isRegeneratingAudio}
                          />

                          {/* Overview Stats */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                              <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Coins size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  Specimens Cataloged
                                </span>
                              </div>
                              <div className="text-2xl font-black text-white font-mono">{result.coins.length}</div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                              <div className="flex items-center gap-2 text-slate-500 mb-1">
                                <Award size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  Focused Grade
                                </span>
                              </div>
                              <div className="text-xl font-black text-amber-400 font-mono">
                                {primaryCoin?.grade || 'UNC'}
                              </div>
                            </div>

                            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                              <div className="flex items-center gap-2 text-amber-400 mb-1">
                                <DollarSign size={14} />
                                <span className="text-[9px] font-black uppercase tracking-widest">
                                  Auction Valuation
                                </span>
                              </div>
                              <div className="text-xl font-black text-emerald-400 font-mono">
                                {primaryCoin?.estimatedValue || 'N/A'}
                              </div>
                            </div>
                          </div>

                          {/* Reverse Notes Callout if Dual-Face Analyzed */}
                          {result.reverseGradingNotes && (
                            <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-slate-300 space-y-1">
                              <span className="text-[10px] font-mono font-black text-indigo-300 uppercase tracking-wider block">
                                Reverse Side Inspection Report
                              </span>
                              <p className="leading-relaxed">{result.reverseGradingNotes}</p>
                            </div>
                          )}

                          {/* Specimen Catalog List */}
                          <div className="space-y-4 pt-1">
                            <div className="flex items-center gap-3">
                              <div className="h-px flex-1 bg-slate-800" />
                              <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">
                                Detailed Breakdown & Diagnostic Modules
                              </span>
                              <div className="h-px flex-1 bg-slate-800" />
                            </div>

                            {result.coins.map((coin, idx) => (
                              <CoinCard
                                key={idx}
                                coin={coin}
                                index={idx}
                                isFocused={focusedCoinIndex === idx}
                                onFocus={() => setFocusedCoinIndex(idx)}
                                onInspectInLoupe={() => {
                                  setFocusedCoinIndex(idx);
                                  setUseLoupeMode(true);
                                  window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                onOpenMelt={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsMeltModalOpen(true);
                                }}
                                onOpenSheldon={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsSheldonModalOpen(true);
                                }}
                                onOpenConsult={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsConsultModalOpen(true);
                                }}
                                onOpenAuthenticity={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsAuthenticityModalOpen(true);
                                }}
                                onOpenDieMatching={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsDieMatchingOpen(true);
                                }}
                                onOpenWearProgression={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsWearProgressionOpen(true);
                                }}
                                onOpenSpectralAlloy={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsSpectralAlloyOpen(true);
                                }}
                                onOpenGraderConsensus={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsGraderConsensusOpen(true);
                                }}
                                onOpenRestoration={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsRestorationOpen(true);
                                }}
                                onOpenMarketTrajectory={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsMarketTrajectoryOpen(true);
                                }}
                                onOpenStrikeProvenance={(tab) => {
                                  setFocusedCoinIndex(idx);
                                  setStrikeProvenanceTab(tab);
                                  setIsStrikeProvenanceOpen(true);
                                }}
                                onOpenCrossCompare={() => {
                                  setFocusedCoinIndex(idx);
                                  setIsCrossCompareOpen(true);
                                }}
                                onOpenReport={() => {
                                  openReportStudio('single', idx);
                                }}
                              />
                            ))}
                          </div>
                        </motion.div>
                      ) : status === AnalysisStatus.GENERATING_AUDIO ? (
                        <div className="h-[360px] flex flex-col items-center justify-center text-center p-8 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
                          <div className="w-14 h-14 bg-amber-500/10 text-amber-400 rounded-full flex items-center justify-center mb-3 animate-bounce">
                            <Sparkles size={24} />
                          </div>
                          <h4 className="text-base font-bold text-white mb-1">Generating Spoken Appraisal</h4>
                          <p className="text-slate-400 text-xs max-w-sm">
                            Synthesizing numismatist commentary with Gemini TTS.
                          </p>
                        </div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          <HistoryDrawer
            history={history}
            onSelect={loadHistoryItem}
            onDelete={deleteHistoryItem}
            onClearAll={clearAllHistory}
            onImportBackup={(items) => setHistory(items)}
          />
        )}
      </AnimatePresence>

      {/* Sticky Mobile Bottom Command Dock (Mobile-First One-Thumb Bar) */}
      <div className="fixed bottom-0 left-0 right-0 z-[80] md:hidden bg-slate-950/95 backdrop-blur-2xl border-t border-slate-800 px-2 py-2 flex items-center justify-around shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
        <button
          onClick={handleBackNavigation}
          disabled={!canGoBack}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            canGoBack ? 'text-amber-400 font-bold active:scale-90' : 'text-slate-600'
          }`}
        >
          <ArrowLeft size={18} />
          <span className="text-[9px] font-mono uppercase">Back</span>
        </button>

        <button
          onClick={() => {
            setShowHistory(false);
            if (image) reset();
          }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            !showHistory && !image ? 'text-amber-400 font-bold' : 'text-slate-300'
          }`}
        >
          <Scan size={18} />
          <span className="text-[9px] font-mono uppercase">Scanner</span>
        </button>

        <button
          onClick={() => {
            if (!image) {
              handleSelectSample(SAMPLE_COINS[0]);
            } else {
              setShowHistory(false);
              setUseLoupeMode((v) => !v);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl transition-all ${
            useLoupeMode ? 'text-cyan-400 font-bold' : 'text-slate-300'
          }`}
        >
          <ZoomIn size={18} />
          <span className="text-[9px] font-mono uppercase">50× Loupe</span>
        </button>

        <button
          onClick={() => setIsCrossCompareOpen(true)}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-indigo-300 active:scale-90"
        >
          <ArrowLeftRight size={18} />
          <span className="text-[9px] font-mono uppercase">Compare</span>
        </button>

        <button
          onClick={() => openReportStudio()}
          className="flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl text-emerald-300 active:scale-90"
        >
          <FileText size={18} />
          <span className="text-[9px] font-mono uppercase">Report</span>
        </button>

        <button
          onClick={() => setShowHistory((v) => !v)}
          className={`flex flex-col items-center gap-0.5 px-2.5 py-1 rounded-xl relative transition-all ${
            showHistory ? 'text-amber-400 font-bold' : 'text-slate-300'
          }`}
        >
          <HistoryIcon size={18} />
          <span className="text-[9px] font-mono uppercase">Registry</span>
          {history.length > 0 && (
            <span className="absolute -top-0.5 right-1 w-4 h-4 rounded-full bg-amber-500 text-black text-[8px] font-mono font-black flex items-center justify-center">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* PDF & JSON Summary Report Studio Modal */}
      <AnimatePresence>
        {isReportModalOpen && (
          <ReportGeneratorModal
            result={
              result ||
              lastSession?.result ||
              history[0] || {
                auditId: 'CRP-REF-001',
                timestamp: Date.now(),
                overallCondition: 'Choice Uncirculated Reference Specimen',
                collectionSummary:
                  'Reference benchmark dossier loaded for PDF and JSON report verification.',
                narrationScript:
                  'This specimen exhibits full original mint luster and sharp strike telemetry.',
                coins: [
                  {
                    coinIndex: 1,
                    positionLabel: 'Slot #1 (Primary)',
                    coinName: '1909-S VDB Lincoln Cent (Reference)',
                    year: '1909',
                    mintMark: 'S',
                    grade: 'MS-65 RD',
                    sheldonScaleNumber: 65,
                    rarityScore: 9.5,
                    rarityLevel: 'Ultra-Rare',
                    estimatedValue: '$3,850 - $4,400',
                    estimatedMeltValue: '$0.03',
                    composition: '95% Copper, 5% Tin & Zinc',
                    reasoning:
                      'Full blazing red surfaces with crisp V.D.B. initials on the lower reverse rim.',
                  },
                ],
              }
            }
            image={image || lastSession?.image || history[0]?.image || SAMPLE_COINS[0].image}
            reverseImage={reverseImage || lastSession?.reverseImage || undefined}
            initialScope={reportModalScope}
            initialCoinIndex={focusedCoinIndex}
            onClose={() => setIsReportModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Strike Pressure Reconstruction & Provenance Modal */}
      <AnimatePresence>
        {isStrikeProvenanceOpen && (
          <StrikeAndProvenanceModal
            coin={primaryCoin}
            initialTab={strikeProvenanceTab}
            onClose={() => setIsStrikeProvenanceOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Multi-Coin Cross-Comparison Modal */}
      <AnimatePresence>
        {isCrossCompareOpen && (
          <CrossComparisonModal
            activeCoins={result?.coins || (primaryCoin ? [primaryCoin] : [])}
            primaryIndex={focusedCoinIndex}
            activeImage={image}
            history={history}
            onClose={() => setIsCrossCompareOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Official Certificate Modal */}
      <AnimatePresence>
        {isCertOpen && result && (
          <CertificationModal
            result={result}
            image={image || ''}
            reverseImage={reverseImage || undefined}
            onClose={() => setIsCertOpen(false)}
            onOpenConsultation={() => setIsConsultModalOpen(true)}
            onOpenReportStudio={() => openReportStudio()}
          />
        )}
      </AnimatePresence>

      {/* Numismatist Consultation Modal */}
      <AnimatePresence>
        {isConsultModalOpen && (
          <NumismatistConsultModal
            coin={
              primaryCoin || {
                coinName: '1909-S VDB Lincoln Cent (Reference)',
                year: '1909',
                mintMark: 'S',
                grade: 'MS-65 RD',
                rarityScore: 9.5,
                rarityLevel: 'Ultra-Rare',
                estimatedValue: '$3,850 - $4,400',
                reasoning: 'Key-date reference specimen loaded for AI consultation.',
              }
            }
            image={image}
            reverseImage={reverseImage}
            onClose={() => setIsConsultModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Die-Matching Modal */}
      <AnimatePresence>
        {isDieMatchingOpen && (
          <DieMatchingModal
            dieMatching={primaryCoin?.dieMatching}
            coinName={primaryCoin?.coinName}
            onClose={() => setIsDieMatchingOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Wear Progression Modal */}
      <AnimatePresence>
        {isWearProgressionOpen && (
          <WearProgressionModal
            wearProgression={primaryCoin?.wearProgression}
            coinName={primaryCoin?.coinName}
            onClose={() => setIsWearProgressionOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Spectral Metal Analysis Modal */}
      <AnimatePresence>
        {isSpectralAlloyOpen && (
          <SpectralAlloyModal
            spectralAlloy={primaryCoin?.spectralAlloy}
            coinName={primaryCoin?.coinName}
            onClose={() => setIsSpectralAlloyOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Multi-Model Consensus Modal */}
      <AnimatePresence>
        {isGraderConsensusOpen && (
          <GraderConsensusModal
            graderConsensus={primaryCoin?.graderConsensus}
            coinName={primaryCoin?.coinName}
            onClose={() => setIsGraderConsensusOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Restoration Advisor Modal */}
      <AnimatePresence>
        {isRestorationOpen && (
          <RestorationAdvisorModal
            restorationAdvisor={primaryCoin?.restorationAdvisor}
            coinName={primaryCoin?.coinName}
            onClose={() => setIsRestorationOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Market Trajectory Modal */}
      <AnimatePresence>
        {isMarketTrajectoryOpen && (
          <MarketTrajectoryModal
            marketTrajectory={primaryCoin?.marketTrajectory}
            coinName={primaryCoin?.coinName}
            currentValue={primaryCoin?.estimatedValue}
            onClose={() => setIsMarketTrajectoryOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Authenticity & Weight Tolerance Radar Modal */}
      <AnimatePresence>
        {isAuthenticityModalOpen && (
          <AuthenticityRadarModal
            coin={primaryCoin}
            onClose={() => setIsAuthenticityModalOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sheldon Grading Guide Modal */}
      <AnimatePresence>
        {isSheldonModalOpen && (
          <SheldonGuideModal
            onClose={() => setIsSheldonModalOpen(false)}
            currentCoinGrade={primaryCoin?.grade}
          />
        )}
      </AnimatePresence>

      {/* Bullion Melt Calculator Modal */}
      <AnimatePresence>
        {isMeltModalOpen && (
          <MeltCalculatorModal
            onClose={() => setIsMeltModalOpen(false)}
            defaultCoinName={primaryCoin?.coinName}
          />
        )}
      </AnimatePresence>

      {/* Die Variety & Error Guide Modal */}
      <AnimatePresence>
        {isVarietyModalOpen && (
          <DieVarietyGuideModal onClose={() => setIsVarietyModalOpen(false)} />
        )}
      </AnimatePresence>

      {/* History Details Modal */}
      <AnimatePresence>
        {isHistoryDetailsOpen && selectedHistoryItem && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsHistoryDetailsOpen(false)}
              className="fixed inset-0 bg-black/85 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative z-10 bg-slate-950 border border-slate-800 rounded-3xl w-full max-w-3xl max-h-[88vh] overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-2 bg-slate-900/70">
                <div className="flex items-center gap-2.5 min-w-0">
                  <button
                    onClick={() => setIsHistoryDetailsOpen(false)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-black uppercase flex items-center gap-1 shrink-0"
                  >
                    <ArrowLeft size={13} />
                    <span>Back</span>
                  </button>
                  <div className="min-w-0">
                    <h3 className="text-sm sm:text-base font-bold text-white truncate">
                      {selectedHistoryItem.coins[0]?.coinName}
                    </h3>
                    <p className="text-[11px] font-mono text-slate-500">
                      Archived: {new Date(selectedHistoryItem.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      restoreHistoryItemToWorkspace(selectedHistoryItem);
                      setReportModalScope(selectedHistoryItem.coins.length > 1 ? 'batch' : 'single');
                      setIsReportModalOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5"
                  >
                    <FileText size={13} />
                    <span>PDF / JSON Report</span>
                  </button>
                  <button
                    onClick={() => restoreHistoryItemToWorkspace(selectedHistoryItem)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black uppercase tracking-wider"
                  >
                    Open in Lab
                  </button>
                  <button
                    onClick={() => setIsHistoryDetailsOpen(false)}
                    className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex items-center gap-2">
                    <img
                      src={selectedHistoryItem.image}
                      alt="Obverse Specimen"
                      className="w-28 sm:w-36 aspect-square object-cover rounded-2xl border border-slate-800 shrink-0"
                    />
                    {selectedHistoryItem.reverseImage && (
                      <img
                        src={selectedHistoryItem.reverseImage}
                        alt="Reverse Specimen"
                        className="w-28 sm:w-36 aspect-square object-cover rounded-2xl border border-slate-800 shrink-0"
                      />
                    )}
                  </div>
                  <div className="space-y-4 flex-1">
                    <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 text-xs text-slate-300 italic font-serif">
                      "{selectedHistoryItem.narrationScript}"
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Grade</span>
                        <span className="text-lg font-black text-amber-400 font-mono">
                          {selectedHistoryItem.coins[0]?.grade || 'UNC'}
                        </span>
                      </div>
                      <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                        <span className="text-[9px] uppercase font-mono text-slate-500 block">Valuation</span>
                        <span className="text-lg font-black text-emerald-400 font-mono">
                          {selectedHistoryItem.coins[0]?.estimatedValue}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  {selectedHistoryItem.coins.map((coin, idx) => (
                    <CoinCard
                      key={idx}
                      coin={coin}
                      index={idx}
                      onOpenConsult={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsConsultModalOpen(true);
                      }}
                      onOpenAuthenticity={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsAuthenticityModalOpen(true);
                      }}
                      onOpenDieMatching={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsDieMatchingOpen(true);
                      }}
                      onOpenWearProgression={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsWearProgressionOpen(true);
                      }}
                      onOpenSpectralAlloy={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsSpectralAlloyOpen(true);
                      }}
                      onOpenGraderConsensus={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsGraderConsensusOpen(true);
                      }}
                      onOpenRestoration={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsRestorationOpen(true);
                      }}
                      onOpenMarketTrajectory={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsMarketTrajectoryOpen(true);
                      }}
                      onOpenStrikeProvenance={(tab) => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setStrikeProvenanceTab(tab);
                        setIsStrikeProvenanceOpen(true);
                      }}
                      onOpenCrossCompare={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setIsCrossCompareOpen(true);
                      }}
                      onOpenReport={() => {
                        restoreHistoryItemToWorkspace(selectedHistoryItem);
                        setFocusedCoinIndex(idx);
                        setReportModalScope('single');
                        setIsReportModalOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Detailed Single Coin Card Component
const CoinCard: React.FC<{
  coin: SingleCoinData;
  index: number;
  isFocused?: boolean;
  onFocus?: () => void;
  onInspectInLoupe?: () => void;
  onOpenMelt?: () => void;
  onOpenSheldon?: () => void;
  onOpenConsult?: () => void;
  onOpenAuthenticity?: () => void;
  onOpenDieMatching?: () => void;
  onOpenWearProgression?: () => void;
  onOpenSpectralAlloy?: () => void;
  onOpenGraderConsensus?: () => void;
  onOpenRestoration?: () => void;
  onOpenMarketTrajectory?: () => void;
  onOpenStrikeProvenance?: (tab: 'strike' | 'provenance') => void;
  onOpenCrossCompare?: () => void;
  onOpenReport?: () => void;
}> = ({
  coin,
  index,
  isFocused,
  onFocus,
  onInspectInLoupe,
  onOpenMelt,
  onOpenSheldon,
  onOpenConsult,
  onOpenAuthenticity,
  onOpenDieMatching,
  onOpenWearProgression,
  onOpenSpectralAlloy,
  onOpenGraderConsensus,
  onOpenRestoration,
  onOpenMarketTrajectory,
  onOpenStrikeProvenance,
  onOpenCrossCompare,
  onOpenReport,
}) => {
  return (
    <div
      id={`coin-card-${index}`}
      onClick={onFocus}
      className={`bg-slate-900/70 border rounded-2xl p-4 sm:p-5 space-y-4 transition-all cursor-pointer ${
        isFocused
          ? 'border-amber-500 shadow-xl shadow-amber-500/10 ring-1 ring-amber-500/40'
          : 'border-slate-800/80 hover:border-amber-500/30'
      }`}
    >
      {/* Title & Valuation */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="flex items-start gap-3.5">
          {coin.croppedImage ? (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onInspectInLoupe?.();
              }}
              className="w-14 h-14 rounded-2xl overflow-hidden bg-black border-2 border-amber-500/40 shrink-0 cursor-pointer hover:scale-105 transition-transform shadow-md group relative"
              title="Click to inspect in 50x Scientific Micro-Loupe"
            >
              <img src={coin.croppedImage} alt={coin.coinName} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <ZoomIn size={14} className="text-amber-400" />
              </div>
            </div>
          ) : (
            <span className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black font-mono flex items-center justify-center shrink-0">
              #{coin.coinIndex || index + 1}
            </span>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-5 h-5 rounded-md bg-amber-500/15 text-amber-400 text-[11px] font-black font-mono flex items-center justify-center">
                #{coin.coinIndex || index + 1}
              </span>
              <h4 className="text-base sm:text-lg font-bold text-white tracking-tight">{coin.coinName}</h4>
              {isFocused && (
                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-mono font-black uppercase">
                  ACTIVE FOCUS
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-1.5 pt-0.5">
              {coin.positionLabel && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-300">
                  {coin.positionLabel}
                </span>
              )}
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 border border-white/10 text-slate-300">
                {coin.year || 'Date N/A'} {coin.mintMark || ''}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenSheldon?.();
                }}
                className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 transition-colors"
                title="View in Sheldon Scale Guide"
              >
                Grade: {coin.grade || 'UNC'}
              </button>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/10 border border-purple-500/30 text-purple-300">
                {coin.rarityLevel}
              </span>
              {coin.strikeQuality && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                  Strike: {coin.strikeQuality}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-start flex-wrap">
          {onOpenReport && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenReport();
              }}
              className="bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Generate PDF or JSON Summary Report for this Specimen"
            >
              <FileText size={13} className="text-emerald-400" />
              <span>PDF / JSON</span>
            </button>
          )}

          {onInspectInLoupe && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onInspectInLoupe();
              }}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white px-2.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Inspect specimen in 50x Scientific Loupe"
            >
              <ZoomIn size={13} className="text-amber-400" />
              <span>50× Loupe</span>
            </button>
          )}

          {onOpenConsult && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenConsult();
              }}
              className="bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Bot size={14} />
              <span>Ask AI</span>
            </button>
          )}

          <div className="bg-black/40 px-3.5 py-2 rounded-xl border border-slate-800 text-right shrink-0">
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 block">
              Market Ledger
            </span>
            <span className="text-lg sm:text-xl font-black text-emerald-400 font-mono">
              {coin.estimatedValue}
            </span>
          </div>
        </div>
      </div>

      {/* 8-Engine Advanced Scientific Diagnostic Fast-Triggers */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 pt-1 font-mono text-[10px]">
        {/* Die-Match Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenDieMatching?.();
          }}
          className="p-2 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-purple-400 uppercase font-black flex items-center gap-1">
            <Layers size={10} /> DIE PAIR
          </span>
          <span className="font-bold text-white truncate block mt-0.5">
            {coin.dieMatching?.diePairId || 'Match Die'}
          </span>
        </button>

        {/* Strike Tonnage Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenStrikeProvenance?.('strike');
          }}
          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-amber-400 uppercase font-black flex items-center gap-1">
            <Hammer size={10} /> STRIKE FORCE
          </span>
          <span className="font-bold text-white truncate block mt-0.5">
            {coin.strikeReconstruction?.estimatedStrikeTonnage
              ? `${coin.strikeReconstruction.estimatedStrikeTonnage}T Press`
              : '140T Sim'}
          </span>
        </button>

        {/* Provenance Pedigree Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenStrikeProvenance?.('provenance');
          }}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-indigo-300 uppercase font-black flex items-center gap-1">
            <HistoryIcon size={10} /> PEDIGREE
          </span>
          <span className="font-bold text-white truncate block mt-0.5">
            {coin.provenanceChain?.pedigreeStatus?.split(' ')[0] || 'Verified'}
          </span>
        </button>

        {/* Wear Model Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenWearProgression?.();
          }}
          className="p-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-cyan-400 uppercase font-black flex items-center gap-1">
            <Activity size={10} /> WEAR MODEL
          </span>
          <span className="font-bold text-white truncate block mt-0.5">
            {coin.wearProgression?.wearClassification || 'Model Wear'}
          </span>
        </button>

        {/* Spectral Alloy Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenSpectralAlloy?.();
          }}
          className="p-2 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-emerald-400 uppercase font-black flex items-center gap-1">
            <Zap size={10} /> SPECTRAL
          </span>
          <span className="font-bold text-white truncate block mt-0.5">
            {coin.spectralAlloy?.dominantWavelengthNm
              ? `${coin.spectralAlloy.dominantWavelengthNm}nm`
              : 'Alloy Wave'}
          </span>
        </button>

        {/* 12-Node Consensus Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenGraderConsensus?.();
          }}
          className="p-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-amber-400 uppercase font-black flex items-center gap-1">
            <Users size={10} /> 12-NODE
          </span>
          <span className="font-bold text-amber-300 truncate block mt-0.5">
            {coin.graderConsensus?.consensusGrade || coin.grade || 'Consensus'}
          </span>
        </button>

        {/* Restoration Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenRestoration?.();
          }}
          className="p-2 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-teal-400 uppercase font-black flex items-center gap-1">
            <Droplets size={10} /> CONSERVE
          </span>
          <span className="font-bold text-teal-300 truncate block mt-0.5">
            {coin.restorationAdvisor?.acetoneSafe ? 'Acetone Safe' : 'Preserve'}
          </span>
        </button>

        {/* Cross-Compare / Market Chip */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onOpenCrossCompare?.();
          }}
          className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-left transition-colors flex flex-col justify-between"
        >
          <span className="text-[8px] text-indigo-400 uppercase font-black flex items-center gap-1">
            <ArrowLeftRight size={10} /> COMPARE
          </span>
          <span className="font-bold text-indigo-200 truncate block mt-0.5">
            vs Set / Ref
          </span>
        </button>
      </div>

      {/* SubGrades 4-Pillar Grid if present */}
      {coin.subGrades && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[8px] text-slate-500 block uppercase">STRIKE</span>
            <span className="font-bold text-amber-300">{coin.subGrades.strikeScore.toFixed(1)} / 10</span>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[8px] text-slate-500 block uppercase">LUSTER</span>
            <span className="font-bold text-amber-300">{coin.subGrades.lusterScore.toFixed(1)} / 10</span>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[8px] text-slate-500 block uppercase">SURFACE</span>
            <span className="font-bold text-amber-300">
              {coin.subGrades.surfacePreservationScore.toFixed(1)} / 10
            </span>
          </div>
          <div className="bg-black/30 p-2 rounded-xl border border-slate-800">
            <span className="text-[8px] text-slate-500 block uppercase">EYE APPEAL</span>
            <span className="font-bold text-amber-300">{coin.subGrades.eyeAppealScore.toFixed(1)} / 10</span>
          </div>
        </div>
      )}

      {/* Specifications grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="bg-black/20 p-2.5 rounded-xl border border-slate-800/60 font-mono">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Alloy</span>
          <span className="font-bold text-slate-200 truncate block">{coin.composition || 'Standard'}</span>
        </div>
        <div className="bg-black/20 p-2.5 rounded-xl border border-slate-800/60 font-mono">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Mass / Diameter</span>
          <span className="font-bold text-slate-200 truncate block">
            {coin.weight || 'Std'} • {coin.diameter || 'Std'}
          </span>
        </div>
        <div className="bg-black/20 p-2.5 rounded-xl border border-slate-800/60 font-mono">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Luster / Appeal</span>
          <span className="font-bold text-amber-300 truncate block">
            {coin.lusterRating || 'Cartwheel'} ({coin.eyeAppeal ? `${coin.eyeAppeal}/5 ★` : '4/5 ★'})
          </span>
        </div>
        <div className="bg-black/20 p-2.5 rounded-xl border border-slate-800/60 font-mono">
          <span className="text-[8px] uppercase tracking-wider text-slate-500 block">Rarity Index</span>
          <span className="font-bold text-amber-400 block">{coin.rarityScore}/10</span>
        </div>
      </div>

      {/* CAC Assessment if available */}
      {coin.cacAssessment && (
        <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500 text-black font-serif font-black flex items-center justify-center text-[10px] shrink-0">
              C
            </div>
            <div>
              <span className="text-emerald-400 font-bold font-mono text-[10px] uppercase block">
                CAC Qualification Probability: {coin.cacAssessment.greenBeanLikelihood}% (
                {coin.cacAssessment.gradeConsistency})
              </span>
              <p className="text-slate-400 text-[11px] leading-tight mt-0.5">
                {coin.cacAssessment.cacNotes}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Authenticity Diagnostics Callout */}
      {coin.authenticityDiagnostics && (
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck
              size={16}
              className={
                coin.authenticityDiagnostics.riskLevel.includes('Low')
                  ? 'text-emerald-400'
                  : 'text-amber-400'
              }
            />
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-slate-400">
                Authenticity Diagnostic:{' '}
                <strong
                  className={
                    coin.authenticityDiagnostics.riskLevel.includes('Low')
                      ? 'text-emerald-400'
                      : 'text-amber-400'
                  }
                >
                  {coin.authenticityDiagnostics.riskLevel}
                </strong>
              </span>
              <p className="text-slate-400 text-[11px] mt-0.5">
                {coin.authenticityDiagnostics.detailsSummary}
              </p>
            </div>
          </div>

          {onOpenAuthenticity && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenAuthenticity();
              }}
              className="text-[10px] font-mono text-cyan-400 hover:underline uppercase font-bold shrink-0"
            >
              Verify Tolerances ↗
            </button>
          )}
        </div>
      )}

      {/* Melt Value Badge if precious metal present */}
      {coin.estimatedMeltValue && coin.estimatedMeltValue.toLowerCase() !== 'none' && (
        <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs">
          <div className="flex items-center gap-2">
            <Flame size={14} className="text-amber-500 shrink-0" />
            <span className="text-slate-400">Intrinsic Bullion Melt Value:</span>
            <strong className="text-amber-400 font-mono">{coin.estimatedMeltValue}</strong>
            {coin.preciousMetalContent && (
              <span className="text-slate-500 text-[10px]">({coin.preciousMetalContent})</span>
            )}
          </div>
          {onOpenMelt && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenMelt();
              }}
              className="text-[10px] font-mono text-amber-400 hover:underline uppercase font-bold"
            >
              Calculate Scrap ↗
            </button>
          )}
        </div>
      )}

      {/* Varieties and Errors section if present */}
      {coin.varietiesAndErrors && coin.varietiesAndErrors.length > 0 && (
        <div className="space-y-2 pt-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-1.5">
            <Layers size={12} className="text-indigo-400" />
            <span>Notable Varieties & Planchet Characteristics</span>
          </span>
          <div className="grid gap-1.5">
            {coin.varietiesAndErrors.map((item, i) => (
              <div
                key={i}
                className="text-xs p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-start gap-2"
              >
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    item.detected ? 'bg-amber-400' : 'bg-slate-600'
                  }`}
                />
                <div>
                  <strong className="text-slate-200 mr-2">{item.type}:</strong>
                  <span className="text-slate-400">{item.description}</span>
                  {item.significance && (
                    <span className="ml-2 text-[10px] text-amber-400 font-mono">
                      [{item.significance}]
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expert Reasoning */}
      <div className="text-xs text-slate-300 leading-relaxed bg-black/30 p-3.5 rounded-xl border border-white/5">
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500 block mb-1">
          Grading Assessment & Surface Preservation
        </span>
        {coin.reasoning}
      </div>

      {/* Historical Lore */}
      {coin.historicalContext && (
        <div className="text-xs text-slate-400 italic bg-amber-500/5 p-3 rounded-xl border border-amber-500/10">
          <strong className="text-amber-500 font-bold not-italic mr-1.5">Numismatic Lore:</strong>
          {coin.historicalContext}
        </div>
      )}
    </div>
  );
};

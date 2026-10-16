import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, Download, Copy, Check, RefreshCw, VolumeX } from 'lucide-react';

export const VOICE_OPTIONS = [
  { id: 'Fenrir', label: 'Fenrir', role: 'Lead PCGS Grader (Authoritative)' },
  { id: 'Puck', label: 'Puck', role: 'Live Auctioneer (Dynamic)' },
  { id: 'Aoede', label: 'Aoede', role: 'Museum Curator (Refined)' },
  { id: 'Charon', label: 'Charon', role: 'Numismatic Historian (Scholarly)' },
  { id: 'Kore', label: 'Kore', role: 'Appraisal Specialist (Warm)' },
];

interface AudioBriefingPlayerProps {
  audioUrl: string | null;
  script: string;
  currentVoice?: string;
  onVoiceChange?: (newVoice: string) => void;
  isRegeneratingAudio?: boolean;
}

export const AudioBriefingPlayer: React.FC<AudioBriefingPlayerProps> = ({
  audioUrl,
  script,
  currentVoice = 'Fenrir',
  onVoiceChange,
  isRegeneratingAudio = false,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(console.error);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleRateChange = () => {
    const rates = [1, 1.25, 1.5, 0.8];
    const nextRate = rates[(rates.indexOf(playbackRate) + 1) % rates.length];
    setPlaybackRate(nextRate);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextRate;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const copyScript = async () => {
    try {
      await navigator.clipboard.writeText(script);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div id="audio-briefing-player" className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-2xl relative overflow-hidden backdrop-blur-md">
      {/* Glow accent */}
      <div className="absolute top-0 right-0 w-64 h-32 bg-amber-500/10 blur-3xl pointer-events-none" />

      <audio
        ref={audioRef}
        src={audioUrl || ''}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className="hidden"
      />

      <div className="flex flex-col gap-4">
        {/* Header line with Voice Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Volume2 size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-black text-white uppercase tracking-wider">Spoken Numismatic Briefing</h4>
                {/* Live audio visualizer equalizer */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-3">
                    {[12, 18, 8, 14, 20, 10, 16].map((h, i) => (
                      <motion.div
                        key={i}
                        animate={{ height: [3, h, 4] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.08 }}
                        className="w-0.5 bg-amber-400 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-400 font-mono">Gemini AI Studio Speech Synthesis</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Voice Dropdown */}
            {onVoiceChange && (
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-mono text-slate-400 hidden sm:inline">Voice:</span>
                <select
                  value={currentVoice}
                  disabled={isRegeneratingAudio}
                  onChange={(e) => onVoiceChange(e.target.value)}
                  className="bg-black/60 border border-slate-700/80 rounded-lg px-2.5 py-1 text-[11px] font-mono text-amber-300 focus:outline-none focus:border-amber-500"
                >
                  {VOICE_OPTIONS.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.label} ({v.role})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              id="audio-speed-btn"
              onClick={handleRateChange}
              className="px-2 py-1 rounded-lg text-[10px] font-mono font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              title="Change playback speed"
            >
              {playbackRate}x
            </button>
            <button
              id="audio-mute-btn"
              onClick={toggleMute}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted ? <VolumeX size={14} className="text-red-400" /> : <Volume2 size={14} />}
            </button>
            <button
              id="audio-restart-btn"
              onClick={handleRestart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
              title="Replay from start"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        {/* Narrative Script Quote with copy & download buttons */}
        <div className="bg-black/40 p-4 rounded-xl border border-white/5 relative group">
          <p className="text-xs sm:text-sm text-slate-200 italic leading-relaxed font-serif pr-8">
            "{script}"
          </p>
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
            <button
              onClick={copyScript}
              className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              title="Copy transcript text"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
            </button>
            {audioUrl && (
              <a
                href={audioUrl}
                download="coinrarity-appraisal-narration.wav"
                className="p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="Download spoken audio file (.wav)"
              >
                <Download size={12} />
              </a>
            )}
          </div>
        </div>

        {/* Controls and Timeline */}
        <div className="flex items-center gap-4 pt-1">
          <button
            id="audio-play-pause-btn"
            disabled={!audioUrl || isRegeneratingAudio}
            onClick={togglePlay}
            className={`w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0 shadow-lg transition-all ${
              !audioUrl || isRegeneratingAudio
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : isPlaying
                ? 'bg-amber-500 text-black hover:bg-amber-400 shadow-amber-500/20'
                : 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/30'
            }`}
          >
            {isRegeneratingAudio ? (
              <RefreshCw size={18} className="animate-spin text-slate-400" />
            ) : isPlaying ? (
              <Pause size={18} />
            ) : (
              <Play size={18} className="translate-x-0.5" />
            )}
          </button>

          <div className="flex-1 space-y-1.5">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
              <span>{formatTime(currentTime)}</span>
              <span>{isRegeneratingAudio ? 'Synthesizing voice...' : formatTime(duration)}</span>
            </div>

            {/* Custom scrubber */}
            <div className="relative flex items-center">
              <input
                id="audio-scrubber-range"
                type="range"
                min="0"
                max={duration || 0}
                step="0.1"
                value={currentTime}
                onChange={handleSeek}
                disabled={!audioUrl || duration === 0 || isRegeneratingAudio}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 focus:outline-none"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

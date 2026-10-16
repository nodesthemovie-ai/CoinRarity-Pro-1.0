import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Send,
  Sparkles,
  Bot,
  User,
  ShieldCheck,
  Award,
  Copy,
  Check,
  RotateCcw,
  MessageSquare,
  HelpCircle,
  AlertTriangle,
} from 'lucide-react';
import { SingleCoinData, ChatMessage } from '../types';
import { consultNumismatist, ConsultHistoryItem } from '../services/geminiService';

interface NumismatistConsultModalProps {
  coin: SingleCoinData;
  image?: string | null;
  reverseImage?: string | null;
  onClose: () => void;
}

const DEFAULT_QUESTIONS = [
  'Why did this coin receive this specific grade?',
  'Does this coin show any signs of past cleaning or artificial toning?',
  'Is this specimen worth sending to PCGS or NGC for grading?',
  'What should I inspect under 10x magnification for authenticity?',
  'What are the chances of receiving a CAC Green Sticker?',
  'How should I safely store and preserve this piece without causing damage?',
];

export const NumismatistConsultModal: React.FC<NumismatistConsultModalProps> = ({
  coin,
  image,
  reverseImage,
  onClose,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'initial',
      role: 'assistant',
      content: `Welcome to your private Numismatic Consultation for the **${coin.coinName}** (Assessed Grade: **${coin.grade || 'UNC'}**). I can provide in-depth grading rationale, die variety verifications, CAC stickering assessments, auction market nuances, or safe preservation advice. What would you like to explore?`,
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (questionText?: string) => {
    const textToSend = questionText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: textToSend,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const historyItems: ConsultHistoryItem[] = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const reply = await consultNumismatist(
        textToSend,
        coin,
        historyItems,
        image,
        reverseImage
      );

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: reply,
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      const errMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: `Error consulting numismatist: ${err.message || 'Please check your connection and try again.'}`,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: 'initial-reset',
        role: 'assistant',
        content: `Consultation session refreshed for **${coin.coinName}**. How else may I assist your audit?`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div id="numismatist-consult-modal" className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/85 backdrop-blur-xl"
      />

      {/* Modal Dialog */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative z-10 w-full max-w-3xl h-[88vh] max-h-[850px] bg-slate-950 border border-amber-500/30 rounded-3xl shadow-[0_0_80px_rgba(245,158,11,0.2)] flex flex-col overflow-hidden"
      >
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 bg-slate-900/90 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-600 text-black flex items-center justify-center shadow-lg shadow-amber-500/20 shrink-0">
              <Bot size={20} />
            </div>
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-400">Expert Numismatist</span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase">Consultation</span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate">
                {coin.coinName} • <span className="font-mono text-amber-400">{coin.grade || 'UNC'}</span>
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleResetChat}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Reset consultation"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Close consultation"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Specimen Badge Bar */}
        <div className="bg-black/60 px-4 sm:px-6 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-slate-400 shrink-0 overflow-x-auto">
          <div className="flex items-center gap-3">
            <span>Alloy: <strong className="text-slate-200">{coin.composition || 'Standard'}</strong></span>
            <span>Melt: <strong className="text-amber-400">{coin.estimatedMeltValue || 'N/A'}</strong></span>
            <span>Value: <strong className="text-emerald-400">{coin.estimatedValue}</strong></span>
          </div>
          {coin.varietiesAndErrors && coin.varietiesAndErrors.length > 0 && (
            <span className="text-purple-400 font-bold truncate max-w-xs">
              ★ {coin.varietiesAndErrors[0].type}
            </span>
          )}
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 font-sans text-sm">
          {messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={16} />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 relative group ${
                    isUser
                      ? 'bg-amber-500 text-black font-medium shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/80 border border-slate-800 text-slate-200 leading-relaxed shadow-md'
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap leading-relaxed select-text font-sans text-xs sm:text-sm">
                    {m.content}
                  </div>

                  {/* Message Action Bar for Assistant */}
                  {!isUser && (
                    <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                      <span>PCGS / NGC Curated Standard</span>
                      <button
                        onClick={() => handleCopy(m.content, m.id)}
                        className="flex items-center gap-1 text-slate-400 hover:text-amber-400 transition-colors"
                      >
                        {copiedId === m.id ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={12} />
                            <span>Copy Advice</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3 items-center"
            >
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
                <ShieldCheck size={16} />
              </div>
              <div className="bg-slate-900/80 border border-slate-800 rounded-2xl px-4 py-3 flex items-center gap-1.5 text-xs text-amber-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping mr-1" />
                <span>Consulting numismatic archives & grading records...</span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Preset Question Pills */}
        <div className="px-4 py-2 bg-slate-950 border-t border-white/5 overflow-x-auto no-scrollbar flex items-center gap-2 shrink-0">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles size={11} className="text-amber-400" /> Inquiries:
          </span>
          {DEFAULT_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 text-[11px] text-slate-300 hover:text-white transition-all shrink-0 disabled:opacity-50"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-white/10 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask the numismatist anything about this ${coin.coinName || 'specimen'}...`}
              disabled={isLoading}
              className="flex-1 bg-black/60 border border-slate-700/80 focus:border-amber-500 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 sm:px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-black font-black uppercase text-xs tracking-wider rounded-xl transition-all flex items-center gap-2 shrink-0"
            >
              <span>Consult</span>
              <Send size={14} />
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

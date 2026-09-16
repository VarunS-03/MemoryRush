import React from 'react';
import { HelpCircle, Check, Eye, Snowflake, Shield, Zap, Clock } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div
      id="how-to-play-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="how-to-play-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center select-none">
        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold tracking-widest font-display mb-3">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>GUIDE</span>
        </div>

        <h2
          id="how-to-play-title"
          className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-5"
        >
          HOW TO PLAY
        </h2>

        {/* Instructions List */}
        <div className="space-y-3 mb-6 text-left">
          {/* Step 1 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center shrink-0 text-sm font-bold font-display">
              1
            </div>
            <div>
              <p className="text-sm text-slate-100 font-semibold">Flip two cards to find a matching pair.</p>
              <p className="text-xs text-slate-400 mt-0.5">Matched pairs stay revealed; mismatches flip back.</p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-300 flex items-center justify-center shrink-0 text-sm font-bold font-display">
              2
            </div>
            <div>
              <p className="text-sm text-slate-100 font-semibold">Match cards rhythmically to build combos.</p>
              <p className="text-xs text-slate-400 mt-0.5">Each consecutive match scales score multipliers up to ×2.50.</p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0 text-sm font-bold font-display">
              3
            </div>
            <div>
              <p className="text-sm text-slate-100 font-semibold">Deploy tactical power-ups when needed.</p>
              <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-300">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3 text-amber-400" /> Radar</span>
                <span className="flex items-center gap-1"><Snowflake className="w-3 h-3 text-cyan-400" /> Freeze</span>
                <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-400" /> Shield</span>
              </div>
            </div>
          </div>

          {/* Step 4 */}
          <div className="flex items-start gap-3 bg-slate-800/60 p-3 rounded-2xl border border-slate-700/40">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 text-sm font-bold font-display">
              4
            </div>
            <div>
              <p className="text-sm text-slate-100 font-semibold">Complete the board before time runs out.</p>
              <p className="text-xs text-slate-400 mt-0.5">Gain speed bonuses, accuracy awards, and advance!</p>
            </div>
          </div>
        </div>

        {/* Primary Action Button: GOT IT */}
        <button
          id="how-to-play-got-it-btn"
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
        >
          <Check className="w-5 h-5" />
          <span>GOT IT</span>
        </button>
      </div>
    </div>
  );
};

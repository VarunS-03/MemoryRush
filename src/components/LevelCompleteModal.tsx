import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { RoundSummary } from '../types';
import { Trophy, ArrowRight, Star, Flame, Clock, Target, Home } from 'lucide-react';

interface LevelCompleteModalProps {
  summary: RoundSummary;
  reducedMotion: boolean;
  onNextLevel: () => void;
  onHome: () => void;
}

export const LevelCompleteModal: React.FC<LevelCompleteModalProps> = ({
  summary,
  reducedMotion,
  onNextLevel,
  onHome,
}) => {
  useEffect(() => {
    if (!reducedMotion) {
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#38bdf8', '#818cf8', '#34d399', '#fbbf24', '#f472b6'],
        });
      } catch {}
    }
  }, [reducedMotion]);

  // Determine dynamic title based on performance
  const getCongratulatoryTitle = () => {
    if (summary.accuracy >= 95 && summary.bestCombo >= 5) return 'PERFECT RUN! 🌟';
    if (summary.accuracy >= 90) return 'MEMORY MASTER! 🧠';
    if (summary.timeTaken < 30) return 'SPEED DEMON! ⚡';
    return 'LEVEL COMPLETE! 🎉';
  };

  return (
    <div
      id="level-complete-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-complete-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center select-none">
        {/* Glow ambient background inside modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Level / Mode badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold tracking-widest font-display mb-3">
          <Star className="w-3.5 h-3.5 fill-emerald-300" />
          <span>
            {summary.mode === 'daily_challenge'
              ? 'DAILY CHALLENGE COMPLETE'
              : summary.mode === 'time_attack'
              ? `WAVE ${summary.level} CLEARED`
              : `LEVEL ${summary.level} CLEARED`}
          </span>
        </div>

        {/* Dynamic Title */}
        <h2
          id="level-complete-title"
          className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-4"
        >
          {summary.mode === 'daily_challenge'
            ? 'TODAY’S PUZZLE SOLVED! 🎉'
            : getCongratulatoryTitle()}
        </h2>

        {/* Score Highlight Box */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-4 shadow-inner">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
            Total Score
          </span>
          <span className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300">
            {summary.score.toLocaleString()}
          </span>
          {summary.isNewRecord && (
            <div className="mt-1.5 inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
              <Trophy className="w-3 h-3" />
              <span>NEW HIGH SCORE!</span>
            </div>
          )}

          {/* Bonus Breakdown Badges */}
          {(summary.timeBonus || summary.clearBonus || summary.accuracyBonus) ? (
            <div className="flex flex-wrap items-center justify-center gap-1.5 mt-3 pt-3 border-t border-slate-700/50 text-[11px] text-slate-300">
              {summary.clearBonus ? (
                <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 font-mono font-bold border border-emerald-500/30">
                  +{summary.clearBonus} CLEAR
                </span>
              ) : null}
              {summary.timeBonus ? (
                <span className="px-2 py-0.5 rounded-lg bg-cyan-500/20 text-cyan-300 font-mono font-bold border border-cyan-500/30">
                  +{summary.timeBonus} TIME
                </span>
              ) : null}
              {summary.accuracyBonus ? (
                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 text-amber-300 font-mono font-bold border border-amber-500/30">
                  +{summary.accuracyBonus} ACCURACY
                </span>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Performance Metrics Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6 text-left">
          {/* Accuracy */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-1">
              <Target className="w-3 h-3 text-cyan-400" />
              <span>ACCURACY</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100 block">
              {summary.accuracy}%
            </span>
            <span className="text-[10px] text-slate-400">
              {summary.blunders !== undefined ? `${summary.blunders} blunder${summary.blunders === 1 ? '' : 's'}` : `${summary.mistakes} misses`}
            </span>
          </div>

          {/* Time */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-1">
              <Clock className="w-3 h-3 text-indigo-400" />
              <span>TIME</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              {summary.timeTaken.toFixed(1)}s
            </span>
          </div>

          {/* Best Combo */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-1">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>COMBO</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              ×{summary.bestCombo}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5">
          {summary.mode !== 'daily_challenge' ? (
            <button
              id="next-level-btn"
              type="button"
              onClick={onNextLevel}
              className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base sm:text-lg text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
            >
              <span>{summary.mode === 'time_attack' ? 'NEXT WAVE' : 'NEXT LEVEL'}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              id="daily-finish-btn"
              type="button"
              onClick={onHome}
              className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base sm:text-lg text-slate-950 bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
            >
              <span>DONE (BACK TO MENU)</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          )}

          {summary.mode !== 'daily_challenge' && (
            <button
              id="level-home-btn"
              type="button"
              onClick={onHome}
              className="w-full py-2.5 px-4 rounded-xl font-semibold font-display text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
            >
              <Home className="w-4 h-4" />
              <span>MAIN MENU</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

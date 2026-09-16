import React from 'react';
import { RoundSummary } from '../types';
import { Trophy, RotateCcw, Home, Target, Clock, Flame, Zap } from 'lucide-react';

interface GameOverModalProps {
  summary: RoundSummary;
  onTryAgain: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  summary,
  onTryAgain,
  onHome,
}) => {
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div
      id="game-over-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-over-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center select-none">
        {/* Ambient glow in modal */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        <h2
          id="game-over-title"
          className="text-3xl sm:text-4xl font-black font-display text-transparent bg-clip-text bg-gradient-to-b from-rose-200 via-rose-300 to-rose-500 tracking-tight mb-2"
        >
          GAME OVER
        </h2>

        {summary.isNewRecord && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-black tracking-wider font-display mb-4 animate-bounce">
            <Trophy className="w-3.5 h-3.5 fill-amber-300" />
            <span>🏆 NEW HIGH SCORE!</span>
          </div>
        )}

        {/* Score Box */}
        <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700/50 mb-5 shadow-inner">
          <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold block mb-1">
            Final Score
          </span>
          <span className="text-3xl sm:text-4xl font-black font-display text-white">
            {summary.score.toLocaleString()}
          </span>
        </div>

        {/* Breakdown Stats Grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-6 text-left">
          {/* Level Reached */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span className="uppercase">
                {summary.mode === 'time_attack'
                  ? 'WAVE REACHED'
                  : summary.mode === 'daily_challenge'
                  ? 'CHALLENGE'
                  : 'LEVEL REACHED'}
              </span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              {summary.mode === 'daily_challenge' ? 'Daily' : summary.level}
            </span>
          </div>

          {/* Best Combo */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span>BEST COMBO</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              ×{summary.bestCombo}
            </span>
          </div>

          {/* Accuracy */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>ACCURACY</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              {summary.accuracy}%
            </span>
          </div>

          {/* Total Time */}
          <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/40">
            <div className="flex items-center gap-1 text-slate-400 text-xs font-semibold mb-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>TOTAL TIME</span>
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-slate-100">
              {formatTime(summary.timeTaken)}
            </span>
          </div>
        </div>

        {/* Buttons: TRY AGAIN / HOME */}
        <div className="flex flex-col gap-2.5">
          <button
            id="gameover-try-again-btn"
            type="button"
            onClick={onTryAgain}
            className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base sm:text-lg text-slate-950 bg-gradient-to-r from-cyan-400 via-indigo-300 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
          >
            <RotateCcw className="w-5 h-5" />
            <span>TRY AGAIN</span>
          </button>

          <button
            id="gameover-home-btn"
            type="button"
            onClick={onHome}
            className="w-full py-2.5 px-4 rounded-xl font-semibold font-display text-sm text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>HOME</span>
          </button>
        </div>
      </div>
    </div>
  );
};

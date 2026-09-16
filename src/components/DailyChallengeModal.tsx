import React from 'react';
import { DailyResult, UserStats } from '../types';
import { Calendar, Play, CheckCircle2, RotateCcw, X, Clock, Target, Trophy } from 'lucide-react';
import { getTodayDateString } from '../storage';

interface DailyChallengeModalProps {
  stats: UserStats;
  onPlayDaily: () => void;
  onClose: () => void;
}

export const DailyChallengeModal: React.FC<DailyChallengeModalProps> = ({
  stats,
  onPlayDaily,
  onClose,
}) => {
  const todayStr = getTodayDateString();
  const todayResult: DailyResult | undefined = stats.dailyHistory[todayStr];

  // Format date readable e.g. "Tuesday, Sep 15, 2026"
  const formattedDate = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      id="daily-challenge-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="daily-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center select-none">
        {/* Close Button */}
        <button
          id="close-daily-modal-btn"
          type="button"
          onClick={onClose}
          aria-label="Close daily challenge"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold tracking-widest font-display mb-3">
          <Calendar className="w-3.5 h-3.5" />
          <span>DAILY PUZZLE</span>
        </div>

        <h2
          id="daily-modal-title"
          className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-1"
        >
          TODAY'S CHALLENGE
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-6">{formattedDate}</p>

        {/* Challenge Status / Card */}
        {todayResult && todayResult.completed ? (
          <div className="bg-slate-800/80 rounded-2xl p-5 border border-emerald-500/40 mb-6 shadow-inner text-left">
            <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold mb-3">
              <CheckCircle2 className="w-4 h-4" />
              <span>COMPLETED TODAY!</span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-2">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Today's Score</span>
                <span className="text-xl font-bold font-display text-white">
                  {todayResult.score.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Best Daily Record</span>
                <span className="text-xl font-bold font-display text-amber-300">
                  {stats.bestDailyScore.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Completion Time</span>
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Clock className="w-3 h-3 text-cyan-400" />
                  {todayResult.time.toFixed(1)}s
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Mistakes</span>
                <span className="text-sm font-semibold text-slate-200 flex items-center gap-1 mt-0.5">
                  <Target className="w-3 h-3 text-rose-400" />
                  {todayResult.mistakes} errors
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/60 mb-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center mx-auto mb-3 text-indigo-300">
              <Trophy className="w-6 h-6" />
            </div>
            <p className="text-sm text-slate-200 font-medium mb-1">
              Deterministic Daily Board (6×6)
            </p>
            <p className="text-xs text-slate-400">
              The exact same card arrangement for all players today. Test your daily speed and memory retention!
            </p>
            {stats.bestDailyScore > 0 && (
              <div className="mt-4 pt-3 border-t border-slate-700/50 flex items-center justify-center gap-2 text-xs text-slate-300">
                <span>All-Time Best Daily Score:</span>
                <strong className="text-amber-300 font-display font-bold">
                  {stats.bestDailyScore.toLocaleString()}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <button
          id="play-daily-btn"
          type="button"
          onClick={onPlayDaily}
          className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base sm:text-lg text-slate-950 bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 hover:from-indigo-300 hover:to-pink-300 shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
        >
          {todayResult?.completed ? (
            <>
              <RotateCcw className="w-5 h-5" />
              <span>REPLAY TODAY'S BOARD</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-slate-950" />
              <span>START DAILY CHALLENGE</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

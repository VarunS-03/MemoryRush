import React from 'react';
import { GameMode } from '../types';
import { Pause, Volume2, VolumeX, Timer as TimerIcon, Shield } from 'lucide-react';

interface GameHUDProps {
  level: number;
  mode: GameMode;
  score: number;
  timeLeft: number;
  matchedPairs: number;
  totalPairs: number;
  soundEnabled: boolean;
  isPaused: boolean;
  isFrozen: boolean;
  isShieldActive?: boolean;
  onTogglePause: () => void;
  onToggleSound: () => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  level,
  mode,
  score,
  timeLeft,
  matchedPairs,
  totalPairs,
  soundEnabled,
  isPaused,
  isFrozen,
  isShieldActive = false,
  onTogglePause,
  onToggleSound,
}) => {
  // Smooth animated rolling score counter
  const [displayScore, setDisplayScore] = React.useState(score);
  const animRef = React.useRef<number | null>(null);

  React.useEffect(() => {
    const startVal = displayScore;
    const endVal = score;
    if (startVal === endVal) return;

    const startTime = performance.now();
    const duration = 320; // 320ms smooth count-up

    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startVal + (endVal - startVal) * ease);
      setDisplayScore(current);

      if (progress < 1) {
        animRef.current = requestAnimationFrame(step);
      }
    };

    animRef.current = requestAnimationFrame(step);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [score]);

  // Format timer MM:SS or SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const isLowTime = timeLeft <= 10 && timeLeft > 0;

  const getModeLabel = () => {
    if (mode === 'daily_challenge') return 'DAILY';
    if (mode === 'time_attack') return 'TIME ATTACK';
    return `LEVEL ${level}`;
  };

  return (
    <header
      id="game-hud"
      className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-2 sm:py-3 select-none"
    >
      {/* Top Controls & Status Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-4 bg-slate-900/80 backdrop-blur-md px-3 sm:px-5 py-2 rounded-2xl border border-slate-800 shadow-xl">
        {/* TOP LEFT: Level / Mode Badge */}
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs sm:text-sm font-bold tracking-wider font-display uppercase shadow-inner">
            {getModeLabel()}
          </div>
          <span className="hidden sm:inline-block text-xs font-medium text-slate-400">
            Pairs: <strong className="text-slate-200">{matchedPairs}/{totalPairs}</strong>
          </span>
        </div>

        {/* TOP CENTER: Score */}
        <div className="flex flex-col items-center justify-center">
          <span className="text-[10px] sm:text-xs uppercase tracking-widest text-slate-400 font-semibold">
            Score
          </span>
          <span
            id="hud-score-val"
            className="text-lg sm:text-2xl md:text-3xl font-black font-display tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-teal-200 to-indigo-200"
          >
            {displayScore.toLocaleString()}
          </span>
        </div>

        {/* TOP RIGHT: Timer & Utility Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Active Shield Badge */}
          {isShieldActive && (
            <div
              id="hud-shield-indicator"
              className="flex items-center gap-1 px-2 py-1 rounded-xl bg-emerald-950/70 border border-emerald-400 text-emerald-300 shadow-emerald-500/20 shadow-sm animate-pulse text-[11px] font-bold"
              title="Combo Shield Active: Next blunder is absorbed"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline font-mono">SHIELD</span>
            </div>
          )}

          {/* Timer Display */}
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl border transition-all duration-300 ${
              isFrozen
                ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 shadow-cyan-500/20 shadow-md ring-1 ring-cyan-400/40'
                : isLowTime
                ? 'bg-rose-950/60 border-rose-500 text-rose-400 animate-pulse ring-1 ring-rose-500/40'
                : 'bg-slate-800/80 border-slate-700/60 text-slate-200'
            }`}
          >
            <TimerIcon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isLowTime ? 'text-rose-400' : 'text-cyan-400'}`} />
            <span className="text-xs sm:text-sm font-mono font-bold">
              {formatTime(timeLeft)}
            </span>
          </div>

          {/* Sound Toggle */}
          <button
            id="hud-sound-toggle-btn"
            type="button"
            onClick={onToggleSound}
            aria-label={soundEnabled ? 'Mute sound' : 'Unmute sound'}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors duration-150 border border-slate-700/60 active:scale-95"
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Pause Button */}
          <button
            id="hud-pause-btn"
            type="button"
            onClick={onTogglePause}
            aria-label={isPaused ? 'Resume game' : 'Pause game'}
            className="p-1.5 sm:p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors duration-150 border border-slate-700/60 active:scale-95"
          >
            <Pause className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Mobile Pairs Counter Sub-row */}
      <div className="sm:hidden flex items-center justify-between text-[11px] font-medium text-slate-400 px-3 py-1">
        <span>Pairs Found:</span>
        <span className="text-slate-200 font-bold">{matchedPairs} / {totalPairs}</span>
      </div>
    </header>
  );
};

import React from 'react';
import { Eye, Snowflake, Shield } from 'lucide-react';
import { PowerUpCounts, PowerUpType } from '../types';

interface PowerUpsBarProps {
  counts: PowerUpCounts;
  isFreezeActive: boolean;
  freezeTimeLeft: number;
  isPeekActive: boolean;
  isShieldActive: boolean;
  isEvaluating: boolean;
  onUsePowerUp: (type: PowerUpType) => void;
  disabled: boolean;
}

export const PowerUpsBar: React.FC<PowerUpsBarProps> = React.memo(({
  counts,
  isFreezeActive,
  freezeTimeLeft,
  isPeekActive,
  isShieldActive,
  isEvaluating,
  onUsePowerUp,
  disabled,
}) => {
  return (
    <div
      id="power-ups-bar"
      className="flex items-center justify-center gap-2 sm:gap-3 py-1 px-3"
      role="region"
      aria-label="Power-up abilities"
    >
      {/* RADAR (PEEK) */}
      <button
        id="powerup-peek-btn"
        type="button"
        disabled={disabled || counts.peek <= 0 || isPeekActive || isEvaluating}
        onClick={() => onUsePowerUp('peek')}
        title="Radar (Key: 1): Reveal matching twin for 1.5s"
        className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 ${
          isPeekActive
            ? 'bg-amber-500/30 border-amber-400 text-amber-300 ring-2 ring-amber-400/50 shadow-lg shadow-amber-500/20'
            : counts.peek > 0 && !disabled && !isEvaluating
            ? 'bg-slate-900/80 hover:bg-slate-800/90 border-amber-500/30 text-slate-200 hover:border-amber-400/60 active:scale-95 shadow-md'
            : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        <Eye className={`w-4 h-4 ${isPeekActive ? 'text-amber-300 animate-pulse' : 'text-amber-400'}`} />
        <span className="hidden sm:inline font-display">Radar</span>
        <span className="hidden md:inline-block text-[10px] text-amber-400/70 border border-amber-400/30 px-1 rounded">1</span>
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-bold ${
            counts.peek > 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-500'
          }`}
        >
          {counts.peek}
        </span>
      </button>

      {/* FREEZE */}
      <button
        id="powerup-freeze-btn"
        type="button"
        disabled={disabled || counts.freeze <= 0 || isFreezeActive || isEvaluating}
        onClick={() => onUsePowerUp('freeze')}
        title="Freeze (Key: 2): Stop timer and combo decay for 5s"
        className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 ${
          isFreezeActive
            ? 'bg-cyan-500/30 border-cyan-400 text-cyan-300 ring-2 ring-cyan-400/50 shadow-lg shadow-cyan-500/20'
            : counts.freeze > 0 && !disabled && !isEvaluating
            ? 'bg-slate-900/80 hover:bg-slate-800/90 border-cyan-500/30 text-slate-200 hover:border-cyan-400/60 active:scale-95 shadow-md'
            : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        <Snowflake className={`w-4 h-4 ${isFreezeActive ? 'text-cyan-300 animate-spin' : 'text-cyan-400'}`} />
        <span className="hidden sm:inline font-display">Freeze</span>
        <span className="hidden md:inline-block text-[10px] text-cyan-400/70 border border-cyan-400/30 px-1 rounded">2</span>
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-bold ${
            isFreezeActive
              ? 'bg-cyan-400 text-slate-950'
              : counts.freeze > 0
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isFreezeActive ? `${freezeTimeLeft}s` : counts.freeze}
        </span>
      </button>

      {/* SHIELD */}
      <button
        id="powerup-shield-btn"
        type="button"
        disabled={disabled || counts.shield <= 0 || isShieldActive || isEvaluating}
        onClick={() => onUsePowerUp('shield')}
        title="Shield (Key: 3): Protects combo streak from next mistake"
        className={`relative flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border text-xs sm:text-sm font-semibold transition-all duration-200 ${
          isShieldActive
            ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50 shadow-lg shadow-emerald-500/20'
            : counts.shield > 0 && !disabled && !isEvaluating
            ? 'bg-slate-900/80 hover:bg-slate-800/90 border-emerald-500/30 text-slate-200 hover:border-emerald-400/60 active:scale-95 shadow-md'
            : 'bg-slate-900/40 border-slate-800 text-slate-500 cursor-not-allowed opacity-50'
        }`}
      >
        <Shield className={`w-4 h-4 ${isShieldActive ? 'text-emerald-300 animate-pulse' : 'text-emerald-400'}`} />
        <span className="hidden sm:inline font-display">Shield</span>
        <span className="hidden md:inline-block text-[10px] text-emerald-400/70 border border-emerald-400/30 px-1 rounded">3</span>
        <span
          className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] sm:text-xs font-bold ${
            isShieldActive
              ? 'bg-emerald-400 text-slate-950'
              : counts.shield > 0
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-800 text-slate-500'
          }`}
        >
          {isShieldActive ? 'ON' : counts.shield}
        </span>
      </button>
    </div>
  );
});

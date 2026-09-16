import React from 'react';
import { Flame, Zap } from 'lucide-react';

interface ComboMeterProps {
  combo: number;
  comboTimeLeft: number;
  maxComboTime: number;
}

export const ComboMeter: React.FC<ComboMeterProps> = React.memo(({
  combo,
  comboTimeLeft,
  maxComboTime,
}) => {
  const percent = maxComboTime > 0 ? Math.min(100, Math.max(0, (comboTimeLeft / maxComboTime) * 100)) : 0;
  const isOnFire = combo >= 5;
  const isActive = combo >= 2;

  // Determine accent theme
  const getTheme = () => {
    if (combo >= 6) {
      return {
        bar: 'bg-gradient-to-r from-orange-500 via-rose-500 to-pink-500 shadow-rose-500/50',
        text: 'text-rose-400',
        badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        label: 'ON FIRE! 🔥',
      };
    }
    if (combo >= 4) {
      return {
        bar: 'bg-gradient-to-r from-amber-500 to-orange-500 shadow-orange-500/50',
        text: 'text-amber-400',
        badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        label: 'SUPER COMBO',
      };
    }
    if (combo >= 2) {
      return {
        bar: 'bg-gradient-to-r from-cyan-500 to-indigo-500 shadow-cyan-500/40',
        text: 'text-cyan-400',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
        label: `COMBO ×${combo}`,
      };
    }
    if (comboTimeLeft > 0) {
      return {
        bar: 'bg-gradient-to-r from-teal-500 to-cyan-500 shadow-teal-500/30',
        text: 'text-teal-300',
        badge: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
        label: 'CHAIN RUSH! MATCH FOR ×2',
      };
    }
    return {
      bar: 'bg-slate-700/60',
      text: 'text-slate-400',
      badge: 'bg-slate-800 text-slate-400 border-slate-700',
      label: 'CHAIN MATCHES FOR COMBO MULTIPLIER',
    };
  };

  const theme = getTheme();
  const isCountingDown = comboTimeLeft > 0;

  return (
    <div
      id="combo-meter-container"
      className={`w-full max-w-md mx-auto px-3 py-1.5 rounded-xl border transition-all duration-300 ${
        isActive
          ? 'bg-slate-900/85 backdrop-blur-md border-indigo-500/40 shadow-lg shadow-indigo-950/40'
          : isCountingDown
          ? 'bg-slate-900/70 border-teal-500/30 shadow-md'
          : 'bg-slate-900/30 border-slate-800/30 opacity-70'
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-1.5">
          {isOnFire ? (
            <Flame className="w-4 h-4 text-orange-400 animate-bounce" />
          ) : (
            <Zap className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : isCountingDown ? 'text-teal-400' : 'text-slate-500'}`} />
          )}
          <span className="text-[11px] sm:text-xs font-bold tracking-wider font-display uppercase text-slate-300">
            {theme.label}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isActive ? (
            <span
              className={`text-sm sm:text-base font-black tracking-tight font-display ${theme.text} ${
                isOnFire ? 'animate-pulse' : ''
              }`}
            >
              ×{combo}
            </span>
          ) : isCountingDown ? (
            <span className="text-[11px] font-bold text-teal-300 font-mono">
              {comboTimeLeft.toFixed(1)}s
            </span>
          ) : (
            <span className="text-[10px] text-slate-500">2x next</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1.5 sm:h-2 bg-slate-800/90 rounded-full overflow-hidden p-0.5 border border-slate-700/40">
        <div
          className={`h-full rounded-full transition-all duration-100 ease-linear shadow-sm ${theme.bar}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
});

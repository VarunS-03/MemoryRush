import React from 'react';
import { Play, RotateCcw, Home, Volume2, VolumeX } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onHome: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onHome,
  soundEnabled,
  onToggleSound,
}) => {
  return (
    <div
      id="pause-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-xs sm:max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center select-none">
        <h2
          id="pause-title"
          className="text-2xl sm:text-3xl font-black font-display text-white tracking-tight mb-2"
        >
          GAME PAUSED
        </h2>
        <p className="text-xs text-slate-400 mb-6">Take a breath, your run is saved</p>

        <div className="flex flex-col gap-2.5">
          {/* Resume */}
          <button
            id="pause-resume-btn"
            type="button"
            onClick={onResume}
            className="w-full py-3.5 px-6 rounded-2xl font-black font-display text-base text-slate-950 bg-gradient-to-r from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all duration-150 active:scale-98"
          >
            <Play className="w-5 h-5 fill-slate-950" />
            <span>RESUME</span>
          </button>

          {/* Restart Level */}
          <button
            id="pause-restart-btn"
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-4 rounded-xl font-bold font-display text-sm text-slate-200 bg-slate-800 hover:bg-slate-700/80 border border-slate-700 flex items-center justify-center gap-2 active:scale-98 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>RESTART ROUND</span>
          </button>

          {/* Sound toggle */}
          <button
            type="button"
            onClick={onToggleSound}
            className="w-full py-2.5 px-4 rounded-xl font-semibold font-display text-xs text-slate-300 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/40 flex items-center justify-center gap-2 transition-colors"
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-4 h-4 text-cyan-400" />
                <span>SOUND ON</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4 text-slate-400" />
                <span>SOUND OFF</span>
              </>
            )}
          </button>

          {/* Main Menu */}
          <button
            id="pause-home-btn"
            type="button"
            onClick={onHome}
            className="w-full py-2 px-4 rounded-xl font-semibold font-display text-xs text-slate-400 hover:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>QUIT TO MAIN MENU</span>
          </button>
        </div>
      </div>
    </div>
  );
};

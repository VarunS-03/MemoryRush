import React from 'react';
import { GameMode, UserSettings, UserStats } from '../types';
import { Play, Calendar, HelpCircle, Settings, Flame, Trophy, Zap, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { getTodayDateString } from '../storage';

interface HomeScreenProps {
  stats: UserStats;
  settings: UserSettings;
  selectedMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onStartGame: () => void;
  onOpenDaily: () => void;
  onOpenHowToPlay: () => void;
  onOpenSettings: () => void;
  onToggleSound: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  settings,
  selectedMode,
  onSelectMode,
  onStartGame,
  onOpenDaily,
  onOpenHowToPlay,
  onOpenSettings,
  onToggleSound,
}) => {
  const todayStr = getTodayDateString();
  const dailyCompleted = Boolean(stats.dailyHistory[todayStr]?.completed);

  return (
    <div
      id="home-screen"
      className="relative z-10 flex flex-col items-center justify-between min-h-[90vh] py-6 px-4 max-w-lg mx-auto select-none"
    >
      {/* Top Header Action Icons */}
      <header className="w-full flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300 backdrop-blur-sm">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="font-semibold tracking-wide">Arcade Edition</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="home-sound-btn"
            type="button"
            onClick={onToggleSound}
            aria-label={settings.soundEnabled ? 'Disable sound' : 'Enable sound'}
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all duration-150 active:scale-95 shadow-md"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          <button
            id="home-settings-btn"
            type="button"
            onClick={onOpenSettings}
            aria-label="Settings"
            className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-all duration-150 active:scale-95 shadow-md"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero Branding Section */}
      <div className="my-auto flex flex-col items-center text-center py-4">
        {/* Game Title */}
        <div className="relative mb-2">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-indigo-500 to-pink-500 rounded-3xl blur-xl opacity-30 animate-pulse" />
          <h1
            id="home-game-title"
            className="relative text-5xl sm:text-6xl md:text-7xl font-black tracking-tight font-display text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-400 drop-shadow-sm"
          >
            MEMORY RUSH
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-lg text-slate-400 font-medium tracking-wide mb-8">
          How sharp is your memory?
        </p>

        {/* Mode Selector Tabs */}
        <div
          role="tablist"
          aria-label="Game Mode"
          className="w-full max-w-xs flex p-1 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-inner mb-6"
        >
          <button
            id="mode-tab-classic"
            type="button"
            role="tab"
            aria-selected={selectedMode === 'classic'}
            onClick={() => onSelectMode('classic')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-display transition-all duration-200 ${
              selectedMode === 'classic'
                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            CLASSIC
          </button>
          <button
            id="mode-tab-time-attack"
            type="button"
            role="tab"
            aria-selected={selectedMode === 'time_attack'}
            onClick={() => onSelectMode('time_attack')}
            className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-bold font-display transition-all duration-200 ${
              selectedMode === 'time_attack'
                ? 'bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            TIME ATTACK
          </button>
        </div>

        {/* Primary Action Button: PLAY */}
        <button
          id="home-play-btn"
          type="button"
          onClick={onStartGame}
          className="group relative w-full max-w-xs py-4 px-8 rounded-2xl font-black font-display text-xl sm:text-2xl text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 shadow-xl shadow-cyan-500/25 hover:shadow-cyan-400/40 transform hover:-translate-y-1 active:translate-y-0 active:scale-98 transition-all duration-150 flex items-center justify-center gap-3 cursor-pointer"
        >
          <Play className="w-6 h-6 fill-slate-950 group-hover:scale-110 transition-transform duration-150" />
          <span>PLAY NOW</span>
        </button>

        {/* Secondary Buttons */}
        <div className="w-full max-w-xs flex flex-col gap-2.5 mt-3">
          <button
            id="home-daily-challenge-btn"
            type="button"
            onClick={onOpenDaily}
            className="w-full py-3 px-4 rounded-xl font-bold font-display text-sm sm:text-base text-slate-200 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 hover:border-indigo-500/60 shadow-md flex items-center justify-between active:scale-98 transition-all duration-150"
          >
            <div className="flex items-center gap-2.5">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span>DAILY CHALLENGE</span>
            </div>
            {dailyCompleted ? (
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Done ✓
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 animate-pulse">
                Ready!
              </span>
            )}
          </button>

          <button
            id="home-how-to-play-btn"
            type="button"
            onClick={onOpenHowToPlay}
            className="w-full py-2.5 px-4 rounded-xl font-semibold font-display text-xs sm:text-sm text-slate-400 hover:text-slate-200 bg-transparent hover:bg-slate-900/50 border border-transparent hover:border-slate-800 transition-all duration-150 flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            <span>HOW TO PLAY</span>
          </button>
        </div>
      </div>

      {/* Player Lifetime Stats Ribbon */}
      <footer className="w-full max-w-md bg-slate-900/70 backdrop-blur-md rounded-2xl border border-slate-800/80 p-3 shadow-lg">
        <div className="grid grid-cols-3 divide-x divide-slate-800 text-center">
          {/* Best Score */}
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-0.5">
              <Trophy className="w-3 h-3 text-amber-400" />
              <span>BEST SCORE</span>
            </div>
            <span className="text-sm sm:text-base font-black font-display text-slate-100">
              {stats.highestScore > 0 ? stats.highestScore.toLocaleString() : '—'}
            </span>
          </div>

          {/* Best Streak / Combo */}
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-0.5">
              <Flame className="w-3 h-3 text-orange-400" />
              <span>BEST COMBO</span>
            </div>
            <span className="text-sm sm:text-base font-black font-display text-slate-100">
              {stats.bestCombo > 0 ? `×${stats.bestCombo}` : '—'}
            </span>
          </div>

          {/* Highest Level */}
          <div className="px-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[10px] sm:text-xs font-semibold mb-0.5">
              <Zap className="w-3 h-3 text-cyan-400" />
              <span>MAX LEVEL</span>
            </div>
            <span className="text-sm sm:text-base font-black font-display text-slate-100">
              {stats.highestLevel}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

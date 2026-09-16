import React, { useState } from 'react';
import { UserSettings } from '../types';
import { Settings as SettingsIcon, Volume2, Music, Zap, Trash2, X, AlertTriangle } from 'lucide-react';
import { APP_VERSION, APP_BUILD_NAME } from '../version';

interface SettingsModalProps {
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
  onResetProgress: () => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onResetProgress,
  onClose,
}) => {
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleMusic = () => {
    onUpdateSettings({ ...settings, musicEnabled: !settings.musicEnabled });
  };

  const toggleReducedMotion = () => {
    onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
  };

  const handleConfirmReset = () => {
    onResetProgress();
    setShowConfirmReset(false);
  };

  return (
    <div
      id="settings-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-[fade-in_0.2s_ease-out]"
    >
      <div className="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden select-none">
        {/* Close Button */}
        <button
          id="close-settings-modal-btn"
          type="button"
          onClick={onClose}
          aria-label="Close settings"
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-5">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 id="settings-title" className="text-xl sm:text-2xl font-black font-display text-white">
              SETTINGS
            </h2>
            <p className="text-xs text-slate-400">Customize your arcade experience</p>
          </div>
        </div>

        {/* Settings List */}
        <div className="space-y-3 mb-6">
          {/* Sound FX Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3">
              <Volume2 className={`w-5 h-5 ${settings.soundEnabled ? 'text-cyan-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Sound FX</span>
                <span className="text-[11px] text-slate-400">Card flips, matches, chimes</span>
              </div>
            </div>
            <button
              id="setting-toggle-sound"
              type="button"
              role="switch"
              aria-checked={settings.soundEnabled}
              onClick={toggleSound}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 flex items-center ${
                settings.soundEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Music Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3">
              <Music className={`w-5 h-5 ${settings.musicEnabled ? 'text-indigo-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Ambient Music</span>
                <span className="text-[11px] text-slate-400">Procedural relaxing synth chords</span>
              </div>
            </div>
            <button
              id="setting-toggle-music"
              type="button"
              role="switch"
              aria-checked={settings.musicEnabled}
              onClick={toggleMusic}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-400 flex items-center ${
                settings.musicEnabled ? 'bg-indigo-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Reduced Motion Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/40">
            <div className="flex items-center gap-3">
              <Zap className={`w-5 h-5 ${settings.reducedMotion ? 'text-amber-400' : 'text-slate-500'}`} />
              <div>
                <span className="text-sm font-semibold text-slate-200 block">Reduced Motion</span>
                <span className="text-[11px] text-slate-400">Minimize animations and shakes</span>
              </div>
            </div>
            <button
              id="setting-toggle-motion"
              type="button"
              role="switch"
              aria-checked={settings.reducedMotion}
              onClick={toggleReducedMotion}
              className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 flex items-center ${
                settings.reducedMotion ? 'bg-amber-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-6 h-6 rounded-full bg-white shadow-md transform transition-transform" />
            </button>
          </div>

          {/* Reset Progress */}
          <div className="p-3.5 rounded-2xl bg-slate-800/30 border border-slate-700/30">
            {!showConfirmReset ? (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-semibold text-slate-300 block">Reset Progress</span>
                  <span className="text-[11px] text-slate-500">Clear high scores and history</span>
                </div>
                <button
                  id="reset-progress-btn"
                  type="button"
                  onClick={() => setShowConfirmReset(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold transition-colors flex items-center gap-1.5 active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>RESET</span>
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Are you sure? This will erase all high scores!</span>
                </div>
                <div className="flex items-center gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setShowConfirmReset(false)}
                    className="px-3 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    id="confirm-reset-btn"
                    type="button"
                    onClick={handleConfirmReset}
                    className="px-3 py-1 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-md"
                  >
                    Yes, Reset All
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Done Button & Version Footer */}
        <button
          id="close-settings-done-btn"
          type="button"
          onClick={onClose}
          className="w-full py-3 px-4 rounded-xl font-bold font-display text-sm text-slate-900 bg-slate-200 hover:bg-white transition-colors cursor-pointer mb-3"
        >
          CLOSE
        </button>

        <div className="text-center">
          <span className="text-[11px] text-slate-500 font-mono font-medium">
            Memory Rush v{APP_VERSION} • {APP_BUILD_NAME}
          </span>
        </div>
      </div>
    </div>
  );
};

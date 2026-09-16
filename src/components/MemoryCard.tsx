import React from 'react';
import { CardItem } from '../types';
import { Sparkles } from 'lucide-react';

interface MemoryCardProps {
  card: CardItem;
  index: number;
  totalCards: number;
  onClick: () => void;
  disabled: boolean;
}

export const MemoryCard: React.FC<MemoryCardProps> = React.memo(({
  card,
  index,
  totalCards,
  onClick,
  disabled,
}) => {
  const isVisible = card.isFlipped || card.isMatched || card.isPeeked;

  // Compute font size based on total cards to ensure emojis fit cleanly on mobile and desktop
  const getSymbolSizeClass = () => {
    if (totalCards > 48) {
      return 'text-xl sm:text-2xl md:text-3xl';
    }
    if (totalCards > 30) {
      return 'text-2xl sm:text-3xl md:text-4xl';
    }
    if (totalCards > 16) {
      return 'text-3xl sm:text-4xl md:text-5xl';
    }
    return 'text-4xl sm:text-5xl md:text-6xl';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!disabled && !isVisible) {
        onClick();
      }
    }
  };

  return (
    <div
      id={`memory-card-wrapper-${card.id}`}
      className="perspective-1000 w-full h-full aspect-square relative select-none"
    >
      <button
        id={`card-btn-${index}`}
        type="button"
        role="button"
        tabIndex={card.isMatched ? -1 : 0}
        aria-label={
          card.isMatched
            ? `Card ${index + 1}: Matched ${card.symbol}`
            : isVisible
            ? `Card ${index + 1}: Revealed ${card.symbol}`
            : `Card ${index + 1}: Face down`
        }
        aria-pressed={isVisible}
        disabled={disabled || card.isMatched || (card.isFlipped && !card.isPeeked)}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={`w-full h-full relative cursor-pointer preserve-3d transition-transform duration-350 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 rounded-xl sm:rounded-2xl will-change-transform ${
          isVisible ? 'rotate-y-180' : ''
        } ${card.isShaking ? 'animate-card-shake' : ''} ${
          card.isMatched ? 'animate-card-match' : ''
        } ${
          !card.isMatched && !isVisible && !disabled
            ? 'hover:-translate-y-0.5 active:scale-95 transition-all duration-150 shadow-md hover:shadow-indigo-500/20'
            : ''
        }`}
      >
        {/* CARD BACK (Hidden Face) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl backface-hidden border flex items-center justify-center shadow-lg transition-all duration-200 overflow-hidden ${
            disabled
              ? 'bg-slate-800/80 border-slate-700/50'
              : 'bg-gradient-to-br from-slate-800/95 via-slate-900 to-indigo-950/95 border-indigo-500/40 hover:border-cyan-400/60 hover:shadow-cyan-500/20'
          }`}
          style={{ WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Subtle glossy sheen sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.04] to-transparent pointer-events-none" />

          {/* Decorative geometric pattern */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#818cf8_1px,transparent_1px)] [background-size:8px_8px]" />
          
          <div className="relative w-7 h-7 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-indigo-500/15 border border-indigo-400/40 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform duration-200">
            <span className="text-indigo-300 text-xs sm:text-base font-black tracking-widest font-display">
              ?
            </span>
          </div>

          {/* Corner accents */}
          <div className="absolute top-1.5 left-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-cyan-400/40" />
          <div className="absolute bottom-1.5 right-1.5 w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-indigo-400/40" />
        </div>

        {/* CARD FRONT (Revealed Face) */}
        <div
          className={`absolute inset-0 w-full h-full rounded-xl sm:rounded-2xl rotate-y-180 backface-hidden border flex flex-col items-center justify-center shadow-xl transition-all duration-300 overflow-hidden ${
            card.isMatched
              ? 'bg-gradient-to-b from-emerald-950/80 via-slate-900/95 to-emerald-900/50 border-emerald-400/80 shadow-emerald-500/30 ring-1 ring-emerald-400/50'
              : card.isShaking
              ? 'bg-gradient-to-b from-rose-950/90 via-slate-900/95 to-rose-900/60 border-rose-500/90 shadow-rose-500/40 ring-1 ring-rose-500/50'
              : card.isPeeked
              ? 'bg-gradient-to-b from-amber-950/70 via-slate-900/95 to-amber-900/50 border-amber-400/80 shadow-amber-500/30'
              : 'bg-gradient-to-b from-slate-800/95 via-slate-900 to-indigo-950/95 border-cyan-400/70 shadow-cyan-500/25 ring-1 ring-cyan-400/30'
          }`}
          style={{ WebkitBackfaceVisibility: 'hidden' }}
        >
          {/* Subtle glossy sheen sweep */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.06] to-transparent pointer-events-none" />

          {/* Matched sparkle icon badge */}
          {card.isMatched && (
            <div className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 text-emerald-300 animate-pulse">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
            </div>
          )}

          {/* Peek badge */}
          {card.isPeeked && !card.isMatched && (
            <div className="absolute top-1 left-1 px-1 py-0.2 bg-amber-500/30 rounded text-[8px] sm:text-[9px] font-bold text-amber-300">
              PEEK
            </div>
          )}

          {/* Card Symbol */}
          <span
            className={`${getSymbolSizeClass()} transform transition-transform duration-200 select-none filter drop-shadow-md leading-none flex items-center justify-center`}
            role="img"
            aria-label={card.symbol}
          >
            {card.symbol}
          </span>
        </div>
      </button>
    </div>
  );
});

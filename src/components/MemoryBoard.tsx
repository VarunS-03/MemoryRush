import React, { useRef } from 'react';
import { CardItem } from '../types';
import { MemoryCard } from './MemoryCard';
import { Pause } from 'lucide-react';

interface MemoryBoardProps {
  cards: CardItem[];
  gridCols: number;
  gridRows: number;
  onCardClick: (card: CardItem) => void;
  isEvaluating: boolean;
  isPeekActive: boolean;
  isPaused?: boolean;
}

export const MemoryBoard: React.FC<MemoryBoardProps> = React.memo(({
  cards,
  gridCols,
  gridRows,
  onCardClick,
  isEvaluating,
  isPeekActive,
  isPaused = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation handler for arrow keys (Up, Down, Left, Right)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let nextIndex = -1;

    if (e.key === 'ArrowRight') {
      nextIndex = (index + 1) % cards.length;
    } else if (e.key === 'ArrowLeft') {
      nextIndex = (index - 1 + cards.length) % cards.length;
    } else if (e.key === 'ArrowDown') {
      nextIndex = index + gridCols;
      if (nextIndex >= cards.length) nextIndex = index % gridCols;
    } else if (e.key === 'ArrowUp') {
      nextIndex = index - gridCols;
      if (nextIndex < 0) {
        nextIndex = Math.floor(cards.length / gridCols) * gridCols + (index % gridCols);
        if (nextIndex >= cards.length) nextIndex -= gridCols;
      }
    }

    if (nextIndex >= 0 && nextIndex < cards.length) {
      e.preventDefault();
      const targetBtn = document.getElementById(`card-btn-${nextIndex}`);
      targetBtn?.focus();
    }
  };

  // Determine container max-width and grid class based on gridCols
  const getGridColsClass = () => {
    if (gridCols === 6) return 'grid-cols-6 max-w-sm sm:max-w-xl';
    return 'grid-cols-4 max-w-xs sm:max-w-md';
  };

  const getGapClass = () => {
    if (gridCols >= 6) return 'gap-1.5 sm:gap-2.5';
    return 'gap-2 sm:gap-3.5';
  };

  return (
    <div className="relative w-full flex items-center justify-center p-1 sm:p-3">
      {/* Fair Pause Shield - Prevents pause-buffering and memorizing during pause */}
      {isPaused && (
        <div
          id="board-pause-shield"
          className="absolute inset-0 z-20 bg-slate-950/90 backdrop-blur-md rounded-2xl flex flex-col items-center justify-center border border-slate-800/80 p-6 text-center select-none shadow-2xl"
          role="alert"
          aria-live="polite"
        >
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mb-3">
            <Pause className="w-6 h-6 text-amber-400" />
          </div>
          <span className="text-lg sm:text-xl font-bold font-display text-slate-100 tracking-wide">
            GAME PAUSED
          </span>
          <span className="text-xs text-slate-400 mt-1 max-w-xs">
            Cards are covered to preserve competitive memory fairness.
          </span>
        </div>
      )}

      <div
        ref={containerRef}
        id="memory-board-grid"
        role="grid"
        aria-label="Memory Card Matching Grid"
        aria-rowcount={gridRows}
        aria-colcount={gridCols}
        className={`w-full grid ${getGridColsClass()} ${getGapClass()} mx-auto transition-all duration-300 place-content-center ${
          isPaused ? 'opacity-20 pointer-events-none filter blur-sm' : ''
        }`}
      >
        {cards.map((card, idx) => (
          <div
            key={card.id}
            role="gridcell"
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className="w-full aspect-square flex items-center justify-center"
          >
            <MemoryCard
              card={card}
              index={idx}
              totalCards={cards.length}
              disabled={isEvaluating || isPeekActive || isPaused}
              onClick={() => onCardClick(card)}
            />
          </div>
        ))}
      </div>
    </div>
  );
});

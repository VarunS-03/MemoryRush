import React from 'react';
import { FloatingFeedbackItem } from '../types';

interface FloatingFeedbackProps {
  items: FloatingFeedbackItem[];
}

export const FloatingFeedback: React.FC<FloatingFeedbackProps> = ({ items }) => {
  return (
    <div
      id="floating-feedback-overlay"
      className="fixed inset-0 pointer-events-none z-40 overflow-hidden"
      aria-hidden="true"
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ease-out animate-[fade-up_0.8s_forwards]"
          style={{
            left: `${item.x}%`,
            top: `${item.y}%`,
          }}
        >
          <div
            className={`px-3 py-1 rounded-full text-xs sm:text-sm font-black font-display tracking-wide shadow-lg border backdrop-blur-sm flex flex-col items-center justify-center ${item.color}`}
          >
            <span>{item.text}</span>
            {item.subtext && (
              <span className="text-[10px] font-semibold opacity-90">{item.subtext}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';

interface HelpTooltipProps {
  content: string;
  title?: string;
}

export const HelpTooltip = ({ content, title = 'Help' }: HelpTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsVisible(!isVisible)}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center justify-center w-5 h-5 text-white text-opacity-40 hover:text-opacity-100 transition-colors"
      >
        <HelpCircle className="w-5 h-5" />
      </button>

      {isVisible && (
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 z-50 w-64">
          <div className="glass-strong rounded-xl p-4 shadow-2xl">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-semibold text-white text-sm">{title}</h4>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsVisible(false);
                }}
                className="text-white text-opacity-60 hover:text-opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-white text-opacity-80 leading-relaxed">{content}</p>
          </div>
          <div className="w-3 h-3 glass-strong transform rotate-45 mx-auto -mt-1.5" />
        </div>
      )}
    </div>
  );
};

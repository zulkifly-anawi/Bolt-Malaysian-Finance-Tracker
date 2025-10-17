import { useState } from 'react';
import { ChevronDown, X } from 'lucide-react';

interface MobileDropdownProps {
  label: string;
  value: number;
  options: { value: number; label: string }[];
  onChange: (value: number) => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export const MobileDropdown = ({ label, value, options, onChange, icon: Icon }: MobileDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedOption = options.find(opt => opt.value === value);

  const handleSelect = (newValue: number) => {
    onChange(newValue);
    setIsOpen(false);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="w-full glass-button rounded-xl px-4 py-3 flex items-center justify-between transition-all active:scale-98"
        type="button"
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon className="w-5 h-5 text-white" />}
          <div className="text-left">
            <p className="text-xs text-white text-opacity-70">{label}</p>
            <p className="text-sm font-semibold text-white">{selectedOption?.label}</p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-white text-opacity-70" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-4 z-50 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="glass-strong rounded-3xl w-full max-w-md max-h-[80vh] overflow-y-auto glow animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">{label}</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white text-opacity-80 hover:text-opacity-100 transition-all p-2 hover:bg-white hover:bg-opacity-10 rounded-lg"
                  type="button"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2">
                {options.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`w-full px-4 py-4 rounded-xl font-medium transition-all text-left ${
                      option.value === value
                        ? 'glass-button text-white shadow-lg'
                        : 'glass text-white text-opacity-80 hover:text-opacity-100 hover:glass-button'
                    }`}
                    type="button"
                  >
                    <span className="text-lg">{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

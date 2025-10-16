import { useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error';
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast = ({ id, message, type, duration = 3000, onClose }: ToastProps) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  return (
    <div
      className={`glass-strong rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in ${
        type === 'success' ? 'border-2 border-green-400 border-opacity-30' : 'border-2 border-red-400 border-opacity-30'
      }`}
    >
      <div className={`flex-shrink-0 ${type === 'success' ? 'text-green-300' : 'text-red-300'}`}>
        {type === 'success' ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <AlertCircle className="w-6 h-6" />
        )}
      </div>
      <p className="flex-1 text-white text-sm font-medium">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="flex-shrink-0 text-white text-opacity-70 hover:text-opacity-100 transition-all"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
};

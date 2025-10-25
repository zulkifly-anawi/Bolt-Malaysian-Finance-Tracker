import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

export interface ToastProps {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
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

  const variantStyles: Record<ToastProps['type'], { border: string; iconColor: string; Icon: typeof CheckCircle }> = {
    success: { border: 'border-green-400 border-opacity-30', iconColor: 'text-green-300', Icon: CheckCircle },
    error: { border: 'border-red-400 border-opacity-30', iconColor: 'text-red-300', Icon: AlertCircle },
    info: { border: 'border-blue-400 border-opacity-30', iconColor: 'text-blue-300', Icon: Info },
  };

  const { border, iconColor, Icon } = variantStyles[type];

  return (
    <div
      className={`glass-strong rounded-2xl p-4 shadow-lg flex items-center gap-3 min-w-[300px] max-w-md animate-slide-in border-2 ${border}`}
    >
      <div className={`flex-shrink-0 ${iconColor}`}>
        <Icon className="w-6 h-6" />
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

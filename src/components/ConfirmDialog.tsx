import { X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning' | 'info';
}

export const ConfirmDialog = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  variant = 'warning'
}: ConfirmDialogProps) => {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-gradient-to-br from-red-500 to-red-600',
    warning: 'bg-gradient-to-br from-amber-500 to-orange-600',
    info: 'bg-gradient-to-br from-blue-500 to-blue-600'
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white border-opacity-20">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-white text-opacity-60 hover:text-opacity-100 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-white text-opacity-80 mb-6 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 glass px-4 py-3 rounded-xl text-white font-medium hover:scale-105 transition-all"
          >
            {cancelLabel}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onCancel();
            }}
            className={`flex-1 ${variantStyles[variant]} px-4 py-3 rounded-xl text-white font-medium hover:scale-105 transition-all shadow-lg`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

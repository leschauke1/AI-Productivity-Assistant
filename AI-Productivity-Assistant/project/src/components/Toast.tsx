import { useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export interface ToastState {
  id: number;
  message: string;
  type: 'success' | 'error';
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' = 'success') => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, message, type }]);
      window.setTimeout(() => dismiss(id), 3500);
    },
    [dismiss],
  );

  return { toasts, showToast, dismiss };
}

export function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastState[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="animate-slide-in-right flex items-center gap-2.5 rounded-inkwell border border-border-strong bg-panelRaised px-4 py-3 shadow-lg"
        >
          {t.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-teal" />
          ) : (
            <AlertCircle className="h-4 w-4 shrink-0 text-clay" />
          )}
          <span className="text-sm text-ink">{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 cursor-pointer text-ink-faint transition-colors hover:text-ink"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}


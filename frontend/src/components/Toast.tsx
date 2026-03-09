import { useState, useEffect, useCallback } from 'react';

export interface ToastMessage {
  id: string;
  text: string;
  type: 'success' | 'error' | 'info';
}

let addToastExternal: ((text: string, type: ToastMessage['type']) => void) | null = null;

export function showToast(text: string, type: ToastMessage['type'] = 'info') {
  if (addToastExternal) addToastExternal(text, type);
}

export default function Toast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((text: string, type: ToastMessage['type']) => {
    const id = `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  useEffect(() => {
    addToastExternal = addToast;
    return () => { addToastExternal = null; };
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((t) => (
        <div key={t.id} className={`toast ${t.type}`}>
          {t.type === 'success' && '✓ '}
          {t.type === 'error' && '✕ '}
          {t.type === 'info' && 'ℹ '}
          {t.text}
        </div>
      ))}
    </div>
  );
}

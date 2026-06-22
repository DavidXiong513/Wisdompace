'use client';

import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';

// ============================================================
// Toast 类型与 Context
// ============================================================

type ToastType = 'success' | 'error' | 'info';

interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  show: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

let toastIdCounter = 0;

// ============================================================
// Provider 组件
// ============================================================

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback(
    (type: ToastType, message: string) => {
      const id = ++toastIdCounter;
      setToasts(prev => [...prev, { id, type, message }]);
      // 3 秒后自动消失
      setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  const success = useCallback((msg: string) => show('success', msg), [show]);
  const error = useCallback((msg: string) => show('error', msg), [show]);
  const info = useCallback((msg: string) => show('info', msg), [show]);

  return (
    <ToastContext.Provider value={{ show, success, error, info }}>
      {children}
      {/* Toast 渲染区域 */}
      <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`animate-slide-up pointer-events-auto flex items-center gap-2.5 rounded-xl px-4 py-3 text-sm font-medium shadow-lg ${
              toast.type === 'success'
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                  ? 'bg-rose-500 text-white'
                  : 'bg-[#2d2a26] text-white'
            }`}
          >
            <span className="shrink-0 text-base">
              {toast.type === 'success' ? '\u2713' : toast.type === 'error' ? '\u2717' : '\u24D8'}
            </span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="shrink-0 text-white/70 hover:text-white"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================
// useToast Hook
// ============================================================

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // 在 Provider 外使用时返回 no-op，避免崩溃
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      info: () => {},
    } as ToastContextValue;
  }
  return ctx;
}

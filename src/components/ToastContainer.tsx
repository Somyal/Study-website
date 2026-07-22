import React from 'react';

export interface ToastMessage {
  id: string;
  msg: string;
  type: 'emerald' | 'cyan' | 'amber' | 'violet' | 'rose';
}

interface ToastContainerProps {
  toasts: ToastMessage[];
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts }) => {
  const typeBorder: Record<ToastMessage['type'], string> = {
    emerald: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    cyan: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    amber: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    violet: 'border-violet-500/40 bg-violet-500/10 text-violet-300',
    rose: 'border-rose-500/40 bg-rose-500/10 text-rose-300',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col-reverse gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`pointer-events-auto px-4 py-2.5 rounded-xl border backdrop-blur-md text-xs font-semibold shadow-xl flex items-center gap-2 animate-slideInRight ${
            typeBorder[t.type] || typeBorder.cyan
          }`}
        >
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
};

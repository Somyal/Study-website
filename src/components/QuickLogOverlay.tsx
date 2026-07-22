import React, { useState, useEffect } from 'react';
import { store, getLocalDateString } from '../store';
import { Clock, X, Check } from 'lucide-react';

interface QuickLogOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string, type?: string) => void;
}

export const QuickLogOverlay: React.FC<QuickLogOverlayProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [hours, setHours] = useState<number | ''>('');
  const [questions, setQuestions] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setHours('');
          setQuestions('');
          setNotes('');
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const hrsVal = typeof hours === 'number' ? hours : 0;
    const qsVal = typeof questions === 'number' ? questions : 0;

    if (hrsVal <= 0 && qsVal <= 0) {
      onShowToast('Enter study hours or questions solved', 'rose');
      return;
    }

    const todayStr = getLocalDateString();
    store.logStudySession({
      date: todayStr,
      lc: 0,
      pr: hrsVal,
      tot: hrsVal,
      qs: qsVal,
      no: notes.trim() || 'Quick Logged Session',
    });

    onShowToast(`${hrsVal}h logged! +100 XP`, 'emerald');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg-c)] border border-[var(--bh)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-base font-extrabold text-cyan-400 flex items-center gap-2">
            <Clock className="w-4 h-4" /> Quick Log Session (Cmd+L)
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--tm)] hover:text-[var(--tp)] p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Study Hours</label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="24"
            autoFocus
            value={hours}
            onChange={(e) => setHours(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
            placeholder="e.g. 2.5"
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Questions Solved</label>
          <input
            type="number"
            min="0"
            value={questions}
            onChange={(e) => setQuestions(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
            placeholder="e.g. 30"
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Notes</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Topics covered..."
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[var(--bg-c2)] text-[var(--ts)] rounded-xl text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" /> Log Session
          </button>
        </div>
      </form>
    </div>
  );
};

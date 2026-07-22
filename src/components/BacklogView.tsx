import React, { useState, useEffect } from 'react';
import { ALL_CHAPTERS } from '../data/chapters';
import { store } from '../store';
import { StageKey } from '../types';
import { getPyqSolvedCount } from '../utils/calculations';
import { Check, Trash2, Pin, Sparkles } from 'lucide-react';

interface BacklogViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const backlogChapters = ALL_CHAPTERS.filter((ch) => {
    const cd = store.getChapterData(ch.id);
    return cd.backlog;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Pin className="w-5 h-5 text-amber-400" /> Backlog Manager
          </h2>
          <p className="text-xs text-[var(--tm)] mt-1">
            Chapters explicitly flagged for priority attention and catch-up study sessions.
          </p>
        </div>
        <div className="text-xs font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-xl">
          {backlogChapters.length} Chapters Flagged
        </div>
      </div>

      {backlogChapters.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl space-y-2">
          <Sparkles className="w-10 h-10 text-emerald-400 mx-auto" />
          <div className="text-sm font-bold text-[var(--tp)]">No chapters in backlog!</div>
          <div className="text-xs text-[var(--tm)]">You are completely up to date. Keep up the great work!</div>
        </div>
      ) : (
        <div className="space-y-3">
          {backlogChapters.map((ch) => {
            const cd = store.getChapterData(ch.id);
            const pyqInfo = getPyqSolvedCount(ch.id, state);
            const stages: Array<{ k: StageKey; label: string }> = [
              { k: 'theory', label: 'Theory' },
              { k: 'dpp', label: 'DPPs' },
              { k: 'pyq', label: `PYQs (${pyqInfo.solved}/${pyqInfo.total})` },
              { k: 'revision', label: 'Revision' },
            ];

            return (
              <div
                key={ch.id}
                className="bg-[var(--bg-c)] border border-amber-500/30 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-extrabold text-base text-[var(--tp)]">{ch.name}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                      {ch.sub.toUpperCase()} • Class {ch.cls}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30">
                      {ch.weight} Weight
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-[var(--ts)] mt-2">
                    {stages.map((st) => (
                      <span
                        key={st.k}
                        className={`flex items-center gap-1 font-medium ${
                          cd.stages[st.k] ? 'text-emerald-400 font-bold' : 'text-[var(--tm)]'
                        }`}
                      >
                        <Check
                          className={`w-3.5 h-3.5 ${
                            cd.stages[st.k] ? 'text-emerald-400' : 'text-slate-600'
                          }`}
                        />
                        {st.label}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      store.toggleBacklog(ch.id);
                      onShowToast('Cleared from Backlog!', 'emerald');
                    }}
                    className="px-4 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Resolve & Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

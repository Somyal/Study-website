import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ALL_CHAPTERS } from '../data/chapters';
import { store } from '../store';
import { StageKey } from '../types';
import { getPyqSolvedCount } from '../utils/calculations';
import { Check, Trash2, Pin, Sparkles } from 'lucide-react';
import { TiltCard } from './TiltCard';

interface BacklogViewProps {
  onShowToast: (msg: string, type?: string, onUndo?: () => void) => void;
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
            <Pin className="w-5 h-5 text-[var(--warning)]" /> Backlog Manager
          </h2>
          <p className="text-xs text-[var(--tm)] mt-1">
            Chapters explicitly flagged for priority attention and catch-up study sessions.
          </p>
        </div>
        <div className="text-xs font-mono font-bold bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold-border)] px-3 py-1.5 rounded-xl">
          {backlogChapters.length} Chapters Flagged
        </div>
      </div>

      {backlogChapters.length === 0 ? (
        <div className="p-12 text-center bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl space-y-2">
          <Sparkles className="w-10 h-10 text-[var(--gold)] mx-auto" />
          <div className="text-sm font-bold text-[var(--tp)]">No chapters in backlog!</div>
          <div className="text-xs text-[var(--ts)]">You are completely up to date. Keep up the great work!</div>
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
              <motion.div
                key={ch.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: backlogChapters.indexOf(ch) * 0.04 }}
                className="bg-[var(--bg-c)] border border-[var(--warning)] rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap"
              >
                <TiltCard className="flex w-full items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-extrabold text-base text-[var(--tp)]">{ch.name}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-c2)] text-[var(--info)] border border-[var(--b)]">
                        {ch.sub.toUpperCase()} • Class {ch.cls}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--gold-muted)] text-[var(--warning)] border border-[var(--gold-border)]">
                        {ch.weight} Weight
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[var(--ts)] mt-2">
                      {stages.map((st) => (
                        <span
                          key={st.k}
                          className={`flex items-center gap-1 font-medium ${
                            cd.stages[st.k] ? 'text-[var(--success)] font-bold' : 'text-[var(--tm)]'
                          }`}
                        >
                          <Check
                            className={`w-3.5 h-3.5 ${
                              cd.stages[st.k] ? 'text-[var(--success)]' : 'text-[var(--b)]'
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
                        const wasBacklog = cd.backlog;
                        store.toggleBacklog(ch.id);
                        onShowToast('Cleared from Backlog!', 'emerald', wasBacklog ? () => {
                          store.toggleBacklog(ch.id);
                        } : undefined);
                      }}
                      className="px-4 py-2 bg-[rgba(74,158,122,0.15)] text-[var(--success)] border border-[var(--success)] hover:bg-[rgba(74,158,122,0.25)] rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Resolve & Remove
                    </button>
                  </div>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { store } from '../store';
import { MistakeItem, ErrorCategory, SubjectId } from '../types';
import { ALL_CHAPTERS } from '../data/chapters';
import { AlertTriangle, Plus, Trash2, CheckCircle2, Clock, Filter } from 'lucide-react';

interface MistakeVaultViewProps {
  onShowToast: (msg: string, type?: string, onUndo?: () => void) => void;
}

export const MistakeVaultView: React.FC<MistakeVaultViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());

  // Form State
  const [questionText, setQuestionText] = useState('');
  const [sub, setSub] = useState<SubjectId>('physics');
  const [errorType, setErrorType] = useState<ErrorCategory>('calculation');
  const [chId, setChId] = useState('');
  const [notes, setNotes] = useState('');

  // Filter State
  const [filterSub, setFilterSub] = useState<'all' | SubjectId>('all');
  const [filterError, setFilterError] = useState<'all' | ErrorCategory>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'resolving' | 'resolved'>('all');

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const handleAddMistake = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      onShowToast('Please enter question description', 'rose');
      return;
    }

    const newMistake: MistakeItem = {
      id: Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      questionText: questionText.trim(),
      sub,
      errorType,
      chId: chId || undefined,
      status: 'open',
      notes: notes.trim() || undefined,
    };

    store.addMistake(newMistake);
    onShowToast('Added to Mistake Vault!', 'amber');

    setQuestionText('');
    setChId('');
    setNotes('');
  };

  const filteredMistakes = state.mistakes.filter((m) => {
    if (filterSub !== 'all' && m.sub !== filterSub) return false;
    if (filterError !== 'all' && m.errorType !== filterError) return false;
    if (filterStatus !== 'all' && m.status !== filterStatus) return false;
    return true;
  });

  const lastDeletedRef = useRef<MistakeItem | null>(null);

  const getErrorBadge = (type: ErrorCategory) => {
    switch (type) {
      case 'calculation':
        return <span className="bg-[rgba(184,84,80,0.12)] text-[var(--error)] border border-[rgba(184,84,80,0.25)] px-2 py-0.5 rounded text-[10px] font-bold">Calculation Error</span>;
      case 'conceptual':
        return <span className="bg-[var(--gold-muted)] text-[var(--warning)] border border-[var(--gold-border)] px-2 py-0.5 rounded text-[10px] font-bold">Conceptual Gap</span>;
      case 'misread':
        return <span className="bg-[rgba(91,143,168,0.12)] text-[var(--info)] border border-[rgba(91,143,168,0.25)] px-2 py-0.5 rounded text-[10px] font-bold">Misread Question</span>;
      case 'timePressure':
        return <span className="bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold-border)] px-2 py-0.5 rounded text-[10px] font-bold">Time Pressure</span>;
    }
  };

  const statusClass = (status: string) => {
    switch (status) {
      case 'resolved':
        return 'bg-[rgba(74,158,122,0.15)] text-[var(--success)] border-[var(--success)]';
      case 'resolving':
        return 'bg-[var(--gold-muted)] text-[var(--warning)] border-[var(--gold-border)]';
      default:
        return 'bg-[rgba(184,84,80,0.15)] text-[var(--error)] border-[var(--error)]';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[var(--error)]" /> Mistake Vault & Error Diagnostic Engine
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <form onSubmit={handleAddMistake} className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--gold)]" /> Catalog Wrong Question
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Question / Concept Description</label>
            <textarea
              rows={3}
              required
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="e.g. Applied parallel axis theorem about non-CM axis in Rotational Motion Q12"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] focus:border-[var(--gold)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Subject</label>
              <select
                value={sub}
                onChange={(e) => setSub(e.target.value as SubjectId)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-2 text-xs text-[var(--tp)] outline-none"
              >
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Error Type</label>
              <select
                value={errorType}
                onChange={(e) => setErrorType(e.target.value as ErrorCategory)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-2 text-xs text-[var(--tp)] outline-none"
              >
                <option value="calculation">Calculation Error</option>
                <option value="conceptual">Conceptual Gap</option>
                <option value="misread">Misread Question</option>
                <option value="timePressure">Time Pressure</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Linked Chapter (Optional)</label>
            <select
              value={chId}
              onChange={(e) => setChId(e.target.value)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-2 text-xs text-[var(--tp)] outline-none"
            >
              <option value="">Select Chapter...</option>
              {ALL_CHAPTERS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.sub.toUpperCase()} • {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Corrective Action / Key Takeaway</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Always check if reference axis passes through COM"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--error)] text-white font-bold text-xs rounded-xl hover:opacity-90 transition-all cursor-pointer"
          >
            Add to Mistake Vault
          </button>
        </form>

        {/* Vault Catalog & Filter Container */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filter Bar */}
          <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 flex items-center justify-between gap-3 flex-wrap text-xs">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[var(--gold)]" />
              <span className="font-bold text-[var(--tp)]">Filter Vault:</span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={filterSub}
                onChange={(e) => setFilterSub(e.target.value as 'all' | SubjectId)}
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1 text-xs text-[var(--tp)] outline-none"
              >
                <option value="all">All Subjects</option>
                <option value="physics">Physics</option>
                <option value="chemistry">Chemistry</option>
                <option value="mathematics">Mathematics</option>
              </select>

              <select
                value={filterError}
                onChange={(e) => setFilterError(e.target.value as 'all' | ErrorCategory)}
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1 text-xs text-[var(--tp)] outline-none"
              >
                <option value="all">All Error Types</option>
                <option value="calculation">Calculation</option>
                <option value="conceptual">Conceptual</option>
                <option value="misread">Misread</option>
                <option value="timePressure">Time Pressure</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'open' | 'resolving' | 'resolved')}
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1 text-xs text-[var(--tp)] outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open</option>
                <option value="resolving">Resolving</option>
                <option value="resolved">Resolved ✓</option>
              </select>
            </div>
          </div>

          {/* Cards List */}
          {filteredMistakes.length === 0 ? (
            <div className="p-12 text-center text-xs text-[var(--tm)] bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl">
              No mistakes found matching criteria.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMistakes.map((m, index) => {
                const chObj = ALL_CHAPTERS.find((c) => c.id === m.chId);
                return (
                  <motion.div
                    key={m.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25, delay: index * 0.04 }}
                    className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-3 hover:border-[var(--bh)] transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-[var(--bg-c2)] text-[var(--info)] border border-[var(--b)]">
                            {m.sub}
                          </span>
                          {getErrorBadge(m.errorType)}
                          {chObj && (
                            <span className="text-[10px] font-bold text-[var(--tm)]">
                              • {chObj.name}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-bold text-[var(--tp)] leading-snug">{m.questionText}</p>
                      </div>

                      <button
                        onClick={() => {
                          const deleted = state.mistakes.find((x) => x.id === m.id) || null;
                          lastDeletedRef.current = deleted;
                          store.deleteMistake(m.id);
                          onShowToast('Removed from Mistake Vault', 'amber', () => {
                            if (lastDeletedRef.current) {
                              store.addMistake(lastDeletedRef.current, lastDeletedRef.current.dateAdded);
                              lastDeletedRef.current = null;
                            }
                          });
                        }}
                        className="text-[var(--tm)] hover:text-[var(--error)] p-1 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {m.notes && (
                      <div className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-2.5 text-xs text-[var(--ts)]">
                        <span className="font-bold text-[var(--gold)]">Key Takeaway:</span> {m.notes}
                      </div>
                    )}

                    <div className="flex items-center justify-between border-t border-[var(--b)] pt-2 text-xs">
                      <span className="text-[10px] text-[var(--tm)]">Status Tracking</span>
                      <select
                        value={m.status}
                        onChange={(e) => store.updateMistakeStatus(m.id, e.target.value as 'open' | 'resolving' | 'resolved')}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 outline-none border cursor-pointer ${statusClass(m.status)}`}
                      >
                        <option value="open">Open</option>
                        <option value="resolving">Resolving</option>
                        <option value="resolved">Resolved ✓</option>
                      </select>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

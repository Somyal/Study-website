import React, { useState, useEffect, useMemo } from 'react';
import { store } from '../store';
import { ScheduledTest } from '../data/prayasTestPlannerData';
import { ALL_CHAPTERS } from '../data/chapters';
import { MistakeItem } from '../types';
import { Check } from 'lucide-react';

interface TestEntryModalProps {
  test: ScheduledTest;
  onClose: () => void;
  onShowToast: (msg: string, type?: string) => void;
}

export const TestEntryModal: React.FC<TestEntryModalProps> = ({ test, onClose, onShowToast }) => {
  const [phScore, setPhScore] = useState<number | ''>('');
  const [chScore, setChScore] = useState<number | ''>('');
  const [maScore, setMaScore] = useState<number | ''>('');
  const [correct, setCorrect] = useState<number | ''>('');
  const [incorrect, setIncorrect] = useState<number | ''>('');
  const [unattempted, setUnattempted] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [selectedWeakTopics, setSelectedWeakTopics] = useState<string[]>([]);
  const [topicSearch, setTopicSearch] = useState('');

  const autoTotal = (typeof phScore === 'number' ? phScore : 0) +
                    (typeof chScore === 'number' ? chScore : 0) +
                    (typeof maScore === 'number' ? maScore : 0);

  const filteredTopics = useMemo(() => {
    if (!topicSearch.trim()) return ALL_CHAPTERS.slice(0, 20);
    const q = topicSearch.toLowerCase();
    return ALL_CHAPTERS.filter((ch) => ch.name.toLowerCase().includes(q)).slice(0, 20);
  }, [topicSearch]);

  const toggleTopic = (chId: string) => {
    setSelectedWeakTopics((prev) =>
      prev.includes(chId) ? prev.filter((id) => id !== chId) : [...prev, chId]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTest = {
      name: test.name,
      date: test.date,
      ph: typeof phScore === 'number' ? Math.max(0, Math.min(120, phScore)) : 0,
      ch: typeof chScore === 'number' ? Math.max(0, Math.min(120, chScore)) : 0,
      ma: typeof maScore === 'number' ? Math.max(0, Math.min(120, maScore)) : 0,
      to: autoTotal,
      at: typeof correct === 'number' ? correct : undefined,
      inc: typeof incorrect === 'number' ? incorrect : undefined,
      no: notes.trim() || undefined,
      scheduledTestId: test.id,
    };

    store.addMockTest(newTest);
    store.markPrayasTestAttempted(test.id);

    const weakTopicNames = selectedWeakTopics
      .map((id) => ALL_CHAPTERS.find((ch) => ch.id === id)?.name)
      .filter(Boolean);

    if (weakTopicNames.length > 0) {
      weakTopicNames.forEach((name) => {
        const chapter = ALL_CHAPTERS.find((ch) => ch.name === name);
        const mistake: Omit<MistakeItem, 'id' | 'dateAdded'> = {
          questionText: `Prayas ${test.name} — Weak Topic`,
          sub: 'physics',
          errorType: 'conceptual',
          status: 'open',
          chId: chapter?.id,
          notes: `Flagged during ${test.name} attempt. ${notes.trim()}`,
        };
        store.addMistake(mistake);
      });
    }

    onShowToast(`${test.name} result logged! +200 XP`, 'emerald');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between border-b border-[var(--b)] pb-3">
          <div>
            <h3 className="text-base font-extrabold text-[var(--tp)] flex items-center gap-2">
              {test.name}
            </h3>
            <div className="text-xs text-[var(--tm)] mt-0.5">
              {test.testType} • {test.pattern} • {test.date}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--tm)] hover:text-[var(--tp)] p-1 rounded-lg cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="text-xs text-[var(--ts)]">
          Subject Scores (out of 100/120)
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--info)] mb-1">Physics</label>
            <input
              type="number"
              min="0"
              max="120"
              value={phScore}
              onChange={(e) => setPhScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--success)] mb-1">Chemistry</label>
            <input
              type="number"
              min="0"
              max="120"
              value={chScore}
              onChange={(e) => setChScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--gold)] mb-1">Math</label>
            <input
              type="number"
              min="0"
              max="120"
              value={maScore}
              onChange={(e) => setMaScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
        </div>

        <div className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-3 flex items-center justify-between">
          <span className="text-xs font-bold text-[var(--ts)]">Calculated Total Score</span>
          <span className="font-mono text-base font-black text-[var(--gold)]">{autoTotal} / 360</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-[11px] font-bold text-[var(--success)] mb-1">Correct</label>
            <input
              type="number"
              min="0"
              value={correct}
              onChange={(e) => setCorrect(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--error)] mb-1">Incorrect</label>
            <input
              type="number"
              min="0"
              value={incorrect}
              onChange={(e) => setIncorrect(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-[var(--tm)] mb-1">Unattempted</label>
            <input
              type="number"
              min="0"
              value={unattempted}
              onChange={(e) => setUnattempted(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--ts)] mb-1">Reflection Notes</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Silly mistake in Integration, time management was good"
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[var(--ts)] mb-1">Weak Topics Tagger (Syncs to Mistake Vault)</label>
          <input
            type="text"
            value={topicSearch}
            onChange={(e) => setTopicSearch(e.target.value)}
            placeholder="Search chapters..."
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none mb-2"
          />
          <div className="flex flex-wrap gap-2">
            {filteredTopics.map((ch) => {
              const selected = selectedWeakTopics.includes(ch.id);
              return (
                <button
                  key={ch.id}
                  type="button"
                  onClick={() => toggleTopic(ch.id)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                    selected
                      ? 'bg-[var(--gold-muted)] text-[var(--gold)] border-[var(--gold-border)]'
                      : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                  }`}
                >
                  {selected ? <Check className="w-3 h-3 inline mr-1" /> : null}
                  {ch.name}
                </button>
              );
            })}
          </div>
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
            className="px-5 py-2 bg-[var(--gold)] text-[var(--bg)] rounded-xl text-xs font-bold hover:bg-[var(--gold-hover)] flex items-center gap-1.5 cursor-pointer"
          >
            Save Result (+200 XP)
          </button>
        </div>
      </form>
    </div>
  );
};

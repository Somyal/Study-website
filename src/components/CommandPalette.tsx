import React, { useState, useEffect } from 'react';
import { ALL_CHAPTERS } from '../data/chapters';
import { chapterMatchesSearch } from '../data/keywords';
import { Search, BookOpen, Layers, Target, Trophy, Clock, Settings, X, Sparkles, AlertTriangle } from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: string) => void;
  onSelectChapter?: (chId: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectChapter,
}) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          setQuery('');
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

  const tabsList = [
    { id: 'syllabus', label: 'Go to Syllabus Tracker', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'backlog', label: 'Go to Backlog Manager', icon: <Layers className="w-4 h-4 text-amber-400" /> },
    { id: 'tests', label: 'Go to Mock Tests Analytics', icon: <Target className="w-4 h-4 text-emerald-400" /> },
    { id: 'mistakes', label: 'Go to Mistake Vault', icon: <AlertTriangle className="w-4 h-4 text-rose-400" /> },
    { id: 'goals', label: 'Go to Subject Goals', icon: <Target className="w-4 h-4 text-violet-400" /> },
    { id: 'badges', label: 'Go to Achievements & Badges', icon: <Trophy className="w-4 h-4 text-amber-400" /> },
    { id: 'study', label: 'Go to Study Hours Tracker', icon: <Clock className="w-4 h-4 text-cyan-400" /> },
    { id: 'focus', label: 'Go to Focus Portal & Browser', icon: <Sparkles className="w-4 h-4 text-violet-400" /> },
    { id: 'settings', label: 'Go to Settings & Data Backup', icon: <Settings className="w-4 h-4 text-slate-400" /> },
  ];

  const matchingChapters = ALL_CHAPTERS.filter((ch) =>
    chapterMatchesSearch(ch.name, query)
  ).slice(0, 8);

  const matchingTabs = tabsList.filter((t) =>
    t.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4 animate-fadeIn">
      <div
        className="bg-[var(--bg-c)] border border-[var(--bh)] w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--b)]">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, chapter name, or topic (e.g. 'rotational', 'mock tests')..."
            className="flex-1 bg-transparent border-none outline-none text-[var(--tp)] placeholder-[var(--tm)] text-sm font-medium"
          />
          <button
            onClick={onClose}
            className="text-[var(--tm)] hover:text-[var(--tp)] p-1 rounded-lg hover:bg-[var(--bg-c2)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 space-y-1">
          {/* Navigation Links */}
          {matchingTabs.length > 0 && (
            <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--tm)] uppercase">
              Navigation
            </div>
          )}
          {matchingTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                onSelectTab(t.id);
                onClose();
              }}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--bg-c2)] flex items-center justify-between transition-colors group"
            >
              <div className="flex items-center gap-3">
                {t.icon}
                <span className="text-xs font-semibold text-[var(--tp)] group-hover:text-cyan-400">
                  {t.label}
                </span>
              </div>
              <span className="text-[10px] text-[var(--tm)] font-mono">Jump ↵</span>
            </button>
          ))}

          {/* Matching Chapters */}
          {matchingChapters.length > 0 && (
            <>
              <div className="px-3 py-1.5 text-[10px] font-bold tracking-wider text-[var(--tm)] uppercase mt-2">
                JEE Chapters
              </div>
              {matchingChapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => {
                    onSelectTab('syllabus');
                    if (onSelectChapter) onSelectChapter(ch.id);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-[var(--bg-c2)] flex items-center justify-between transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-[var(--ts)] uppercase">
                      {ch.sub.slice(0, 3)}
                    </span>
                    <div>
                      <div className="text-xs font-semibold text-[var(--tp)] group-hover:text-cyan-400">
                        {ch.name}
                      </div>
                      <div className="text-[10px] text-[var(--tm)]">
                        Class {ch.cls} • {ch.weight} Weightage {ch.subtype ? `• ${ch.subtype}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded font-mono font-semibold">
                    View Chapter
                  </span>
                </button>
              ))}
            </>
          )}

          {matchingTabs.length === 0 && matchingChapters.length === 0 && (
            <div className="p-8 text-center text-xs text-[var(--tm)]">
              No matching commands or chapters found for &ldquo;{query}&rdquo;.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[var(--bg-c2)] border-t border-[var(--b)] flex items-center justify-between text-[11px] text-[var(--tm)]">
          <span>
            Use <kbd className="bg-[var(--bg-c3)] px-1.5 py-0.5 rounded font-mono border border-[var(--b)]">↑</kbd>{' '}
            <kbd className="bg-[var(--bg-c3)] px-1.5 py-0.5 rounded font-mono border border-[var(--b)]">↓</kbd> to navigate
          </span>
          <span>
            Press <kbd className="bg-[var(--bg-c3)] px-1.5 py-0.5 rounded font-mono border border-[var(--b)]">ESC</kbd> to exit
          </span>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { SyllabusView } from './components/SyllabusView';
import { BacklogView } from './components/BacklogView';
import { MockTestsView } from './components/MockTestsView';
import { MistakeVaultView } from './components/MistakeVaultView';
import { GoalsView } from './components/GoalsView';
import { BadgesView } from './components/BadgesView';
import { StudyHoursView } from './components/StudyHoursView';
import { FocusPortalView } from './components/FocusPortalView';
import { SettingsView } from './components/SettingsView';
import { DashboardView } from './components/DashboardView';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { QuickLogOverlay } from './components/QuickLogOverlay';
import { PrayasLectureTrackerView } from './components/PrayasLectureTrackerView';
import { store } from './store';
import { calcUserLevel } from './utils/calculations';
import { BADGE_DEFINITIONS } from './data/badges';
import {
  Search,
  Sun,
  Moon,
  Flame,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TAB_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  syllabus: 'Syllabus Tracker',
  backlog: 'Backlog Manager',
  tests: 'Mock Tests',
  mistakes: 'Mistake Vault',
  goals: 'Subject Goals',
  badges: 'Achievements',
  study: 'Study Hours',
  focus: 'Focus Portal',
  prayas: 'Prayas Lectures',
  settings: 'Settings',
};

export function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('jeeCommandCenter_activeTab') || 'dashboard';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light'));
  const [appState, setAppState] = useState(store.getState());
  const prevBadgeIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const currentIds = new Set<string>();
    BADGE_DEFINITIONS.forEach((b) => {
      if (b.check(appState)) currentIds.add(b.id);
    });
    const prev = prevBadgeIdsRef.current;
    const newBadges = [...currentIds].filter((id) => !prev.has(id));
    if (newBadges.length > 0) {
      const names = newBadges.map((id) => BADGE_DEFINITIONS.find((b) => b.id === id)?.name || id).join(', ');
      showToast(`Badge unlocked: ${names}`, 'gold');
    }
    prevBadgeIdsRef.current = currentIds;
  }, [appState]);

  useEffect(() => {
    localStorage.setItem('jeeCommandCenter_activeTab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setAppState(store.getState()));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'l') {
        e.preventDefault();
        setIsQuickLogOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleTheme = () => {
    const current = localStorage.getItem('jeeCommandCenter_theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem('jeeCommandCenter_theme', next);

    if (next === 'light') {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.body.classList.remove('dark');
      document.body.classList.add('light');
      setIsLight(true);
    } else {
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
      setIsLight(false);
    }
  };

  const { level, levelTitle } = calcUserLevel(appState.xp);

  const showToast = (msg: string, type: string = 'cyan', onUndo?: () => void) => {
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const validTypes: string[] = ['emerald', 'cyan', 'amber', 'violet', 'rose'];
    const toastType = validTypes.includes(type) ? (type as ToastMessage['type']) : 'cyan';
    const newToast: ToastMessage = { id, msg, type: toastType, onUndo };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tp)] font-sans transition-colors duration-200 flex">
      {/* Ambient Background Gradient */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 15% 15%, rgba(201,168,76,0.03) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(91,143,168,0.02) 0%, transparent 45%)',
        }}
      />

      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Wrapper */}
      <div className="flex-1 ml-[220px] lg:ml-[220px] md:ml-16 flex flex-col min-h-screen">
        {/* Compact Top Bar */}
        <header className="sticky top-0 z-20 h-14 bg-[var(--bg-c)] border-b border-[var(--b)] flex items-center justify-between px-4 lg:px-6 gap-4 transition-colors duration-200">
          {/* Left: Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="hidden md:flex items-center gap-2 text-xs text-[var(--ts)] bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              title="Global Command Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span>Quick Jump</span>
              <kbd className="text-[10px] bg-[var(--bg-c3)] text-[var(--tp)] px-1.5 py-0.5 rounded font-mono border border-[var(--b)]">
                ⌘K
              </kbd>
            </button>
            <h1 className="text-sm font-heading font-semibold text-[var(--tp)] truncate">
              {TAB_TITLES[activeTab] || 'Dashboard'}
            </h1>
          </div>

          {/* Right: Stats & Toggles */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)]">
              <Flame className="w-3.5 h-3.5 text-[var(--warning)]" />
              <span className="text-xs font-mono font-bold text-[var(--tp)]">{appState.streak.count}d</span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)]">
              <Sparkles className="w-3.5 h-3.5 text-[var(--gold)]" />
              <span className="text-xs font-mono font-bold text-[var(--tp)]">{appState.xp.toLocaleString()} XP</span>
            </div>

            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] text-[var(--tp)] font-medium transition-all cursor-pointer"
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-[var(--info)]" /> : <Sun className="w-3.5 h-3.5 text-[var(--warning)]" />}
              <span className="hidden sm:inline">{isLight ? 'Dark' : 'Light'}</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 px-4 lg:px-8 py-6 lg:py-8 max-w-[1400px] w-full">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {activeTab === 'dashboard' && <DashboardView onShowToast={showToast} onOpenQuickLog={() => setIsQuickLogOpen(true)} onSelectChapter={(chId) => { setActiveTab('syllabus'); setSelectedChapterId(chId); }} />}
              {activeTab === 'syllabus' && (
                <SyllabusView onShowToast={showToast} selectedChapterId={selectedChapterId} />
              )}
              {activeTab === 'backlog' && <BacklogView onShowToast={showToast} />}
              {activeTab === 'tests' && <MockTestsView onShowToast={showToast} />}
              {activeTab === 'mistakes' && <MistakeVaultView onShowToast={showToast} />}
              {activeTab === 'goals' && <GoalsView />}
              {activeTab === 'badges' && <BadgesView />}
              {activeTab === 'study' && <StudyHoursView onShowToast={showToast} />}
              {activeTab === 'focus' && <FocusPortalView onShowToast={showToast} />}
              {activeTab === 'prayas' && <PrayasLectureTrackerView onShowToast={showToast} />}
              {activeTab === 'settings' && <SettingsView onShowToast={showToast} />}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--b)] py-3 text-center text-xs text-[var(--tm)]">
          JEE Command Center V4.0 • Distraction-Free Preparation System • Press{' '}
          <kbd className="bg-[var(--bg-c2)] px-1.5 py-0.5 rounded font-mono text-[10px] border border-[var(--b)]">
            ⌘K
          </kbd>{' '}
          for quick commands,{' '}
          <kbd className="bg-[var(--bg-c2)] px-1.5 py-0.5 rounded font-mono text-[10px] border border-[var(--b)]">
            ⌘L
          </kbd>{' '}
          to log session
        </footer>
      </div>

      {/* Overlays & Modals */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={setActiveTab}
        onSelectChapter={(id) => setSelectedChapterId(id)}
      />

      <QuickLogOverlay
        isOpen={isQuickLogOpen}
        onClose={() => setIsQuickLogOpen(false)}
        onShowToast={showToast}
      />

      <ToastContainer toasts={toasts} />
    </div>
  );
}

export default App;

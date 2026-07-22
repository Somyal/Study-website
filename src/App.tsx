import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { SyllabusView } from './components/SyllabusView';
import { BacklogView } from './components/BacklogView';
import { MockTestsView } from './components/MockTestsView';
import { MistakeVaultView } from './components/MistakeVaultView';
import { GoalsView } from './components/GoalsView';
import { BadgesView } from './components/BadgesView';
import { StudyHoursView } from './components/StudyHoursView';
import { FocusPortalView } from './components/FocusPortalView';
import { SettingsView } from './components/SettingsView';
import { CommandPalette } from './components/CommandPalette';
import { ToastContainer, ToastMessage } from './components/ToastContainer';
import { QuickLogOverlay } from './components/QuickLogOverlay';
import { store } from './store';

export function App() {
  const [activeTab, setActiveTab] = useState<string>(() => {
    return localStorage.getItem('jeeCommandCenter_activeTab') || 'syllabus';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isQuickLogOpen, setIsQuickLogOpen] = useState(false);
  const [selectedChapterId, setSelectedChapterId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('jeeCommandCenter_activeTab', activeTab);
  }, [activeTab]);

  // Global hotkeys (Cmd+K for search, Cmd+L for quick log, D for theme toggle)
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

  const showToast = (msg: string, type: string = 'cyan') => {
    const id = Date.now() + '_' + Math.random().toString(36).substr(2, 4);
    const validTypes: Array<ToastMessage['type']> = ['emerald', 'cyan', 'amber', 'violet', 'rose'];
    const toastType = validTypes.includes(type as any) ? (type as ToastMessage['type']) : 'cyan';

    const newToast: ToastMessage = { id, msg, type: toastType };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--tp)] font-sans transition-colors duration-200 flex flex-col">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-[1600px] w-full mx-auto px-4 py-6 flex-1">
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
        {activeTab === 'settings' && <SettingsView onShowToast={showToast} />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[var(--b)] py-4 text-center text-xs text-[var(--tm)]">
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

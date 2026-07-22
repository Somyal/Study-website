import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { calcOverallPct, calcUserLevel } from '../utils/calculations';
import {
  Zap,
  Flame,
  Sun,
  Moon,
  Sparkles,
  BookOpen,
  Pin,
  BarChart2,
  AlertTriangle,
  Target,
  Trophy,
  Clock,
  Gamepad2,
  Settings,
  ShieldCheck,
  Search,
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, onOpenCommandPalette }) => {
  const [state, setState] = useState(store.getState());
  const [isLight, setIsLight] = useState(document.documentElement.classList.contains('light'));
  const [countdowns, setCountdowns] = useState({ m1: '', m2: '', ad: '' });

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const updateCd = () => {
      const dates = state.dates;
      const calc = (ds: string) => {
        if (!ds) return '—';
        const target = new Date(ds.trim() + 'T12:00:00');
        if (isNaN(target.getTime())) return '?';
        const diff = target.getTime() - Date.now();
        if (diff <= 0) return 'Exam Day!';
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        return `${d}d ${h}h ${m}m`;
      };
      setCountdowns({
        m1: calc(dates.m1),
        m2: calc(dates.m2),
        ad: calc(dates.ad),
      });
    };

    updateCd();
    const interval = setInterval(updateCd, 1000);
    return () => clearInterval(interval);
  }, [state.dates]);

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

  const overallPct = calcOverallPct(state);
  const { level, levelTitle } = calcUserLevel(state.xp);

  const navTabs = [
    { id: 'syllabus', label: 'Syllabus', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'backlog', label: 'Backlog', icon: <Pin className="w-3.5 h-3.5" /> },
    { id: 'tests', label: 'Mock Tests', icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { id: 'mistakes', label: 'Mistake Vault', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-3.5 h-3.5" /> },
    { id: 'badges', label: 'Badges', icon: <Trophy className="w-3.5 h-3.5" /> },
    { id: 'study', label: 'Study Hours', icon: <Clock className="w-3.5 h-3.5" /> },
    { id: 'focus', label: 'Focus Portal', icon: <Gamepad2 className="w-3.5 h-3.5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  return (
    <header id="hdr" className="sticky top-0 z-40 bg-[var(--hdr-bg)] backdrop-blur-xl border-b border-[var(--b)] transition-colors duration-200">
      <div className="max-w-[1600px] mx-auto px-4">
        {/* Top Row */}
        <div className="flex items-center justify-between py-3 gap-4 flex-wrap">
          {/* Logo & Command Palette Launcher */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-600 to-violet-600 flex items-center justify-center text-white font-black shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="font-black text-lg bg-gradient-to-r from-cyan-400 to-violet-500 bg-clip-text text-transparent leading-tight flex items-center gap-2">
                JEE Command Center
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono font-bold">
                  v4.0
                </span>
              </div>
              <div className="text-[10px] text-[var(--tm)] font-semibold tracking-wider">
                PERSONAL PREPARATION ENGINE
              </div>
            </div>

            {/* Quick Cmd+K Button */}
            <button
              onClick={onOpenCommandPalette}
              className="hidden md:flex items-center gap-2 text-xs text-[var(--ts)] bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
              title="Global Command Search (Cmd+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Quick Jump</span>
              <kbd className="text-[10px] bg-[var(--bg-c3)] text-[var(--tp)] px-1.5 py-0.5 rounded font-mono border border-[var(--b)]">
                ⌘K
              </kbd>
            </button>
          </div>

          {/* Countdown Timers */}
          <div className="hidden lg:flex items-center gap-4">
            <div className="text-center px-3 py-1 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)]">
              <div className="text-[10px] font-bold text-cyan-400 tracking-wider">JEE MAIN S1</div>
              <div className="font-mono font-extrabold text-xs text-[var(--tp)]">{countdowns.m1}</div>
            </div>
            <div className="text-center px-3 py-1 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)]">
              <div className="text-[10px] font-bold text-violet-400 tracking-wider">JEE MAIN S2</div>
              <div className="font-mono font-extrabold text-xs text-[var(--tp)]">{countdowns.m2}</div>
            </div>
            <div className="text-center px-3 py-1 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)]">
              <div className="text-[10px] font-bold text-amber-400 tracking-wider">JEE ADVANCED</div>
              <div className="font-mono font-extrabold text-xs text-[var(--tp)]">{countdowns.ad}</div>
            </div>
          </div>

          {/* Gamification Stats & Theme Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] text-[var(--tp)] font-medium transition-all cursor-pointer"
            >
              {isLight ? <Moon className="w-3.5 h-3.5 text-violet-500" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
              <span>{isLight ? 'Dark' : 'Light'}</span>
            </button>

            {/* Streak */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold" title={`${state.streak.freezes} Streak Freeze(s) Available`}>
              <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
              <span>{state.streak.count}d</span>
              {state.streak.freezes > 0 && (
                <span className="text-[10px] text-amber-400/70 border-l border-amber-500/30 pl-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {state.streak.freezes}
                </span>
              )}
            </div>

            {/* Level & XP */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/30 text-violet-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-violet-400" />
              <div className="font-mono">{state.xp.toLocaleString()} XP</div>
              <span className="hidden sm:inline text-[10px] bg-violet-500/20 text-violet-300 px-1.5 py-0.5 rounded font-sans font-semibold">
                Lvl {level}: {levelTitle}
              </span>
            </div>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div className="pb-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-[var(--tm)] mb-1">
            <span>OVERALL JEE SYLLABUS PROGRESS</span>
            <span className="font-mono text-emerald-400 font-extrabold">{overallPct}%</span>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${overallPct}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-none">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-cyan-500/15 to-violet-500/15 text-cyan-400 border border-cyan-500/40'
                  : 'text-[var(--ts)] hover:text-[var(--tp)] hover:bg-[var(--bg-c2)] border border-transparent'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </header>
  );
};

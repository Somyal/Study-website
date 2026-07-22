import React, { useState, useEffect } from 'react';
import { store, FUTURE_DATES } from '../store';
import { calcUserLevel } from '../utils/calculations';
import {
  BookOpen,
  Pin,
  BarChart2,
  AlertTriangle,
  Trophy,
  Clock,
  Gamepad2,
  Settings,
  Flame,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  onSelectTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

const navItems = [
  { id: 'syllabus', label: 'Syllabus', icon: BookOpen },
  { id: 'backlog', label: 'Backlog', icon: Pin },
  { id: 'tests', label: 'Mock Tests', icon: BarChart2 },
  { id: 'mistakes', label: 'Mistake Vault', icon: AlertTriangle },
  { id: 'badges', label: 'Badges', icon: Trophy },
  { id: 'study', label: 'Study Hours', icon: Clock },
  { id: 'focus', label: 'Focus Portal', icon: Gamepad2 },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  onOpenCommandPalette,
}) => {
  const [state, setState] = useState(store.getState());
  const [collapsed, setCollapsed] = useState(false);
  const [displayXp, setDisplayXp] = useState(store.getState().xp);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  useEffect(() => {
    const start = displayXp;
    const end = state.xp;
    if (start === end) return;
    const duration = 400;
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      setDisplayXp(Math.round(start + (end - start) * progress));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [state.xp]);

  const { level, levelTitle } = calcUserLevel(state.xp);

  const COUNTDOWN_ITEMS = [
    { key: 'm1', label: 'Main S1', date: FUTURE_DATES.m1 },
    { key: 'ad', label: 'Advanced', date: FUTURE_DATES.ad },
  ];

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getCountdown = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    const diffMs = target.getTime() - today.getTime();
    const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
    const hours = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
    return { days, hours };
  };

  return (
    <aside
      className={`sidebar-transition fixed left-0 top-0 h-screen z-30 flex flex-col border-r border-[var(--b)] bg-[var(--bg-c)] ${
        collapsed ? 'w-16' : 'w-[220px]'
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-[var(--b)]">
        <div className="w-8 h-8 rounded-lg bg-[var(--gold)] flex items-center justify-center flex-shrink-0">
          <span className="text-[var(--bg)] font-heading font-bold text-sm">JEE</span>
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <div className="font-heading font-bold text-sm text-[var(--tp)] leading-tight">
              Command Center
            </div>
            <div className="w-6 h-0.5 bg-[var(--gold)] rounded-full mt-1.5" />
          </div>
        )}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="hidden lg:flex items-center justify-center mx-auto mt-4 mb-2 w-6 h-6 rounded-md text-[var(--tm)] hover:text-[var(--tp)] hover:bg-[var(--bg-c2)] cursor-pointer"
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-[var(--gold-muted)] text-[var(--gold)]'
                  : 'text-[var(--ts)] hover:text-[var(--tp)] hover:bg-[var(--bh)]'
              }`}
              title={collapsed ? item.label : undefined}
              aria-label={collapsed ? item.label : undefined}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom Stats */}
      <div className="border-t border-[var(--b)] p-3 space-y-2">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[var(--bg-c2)]">
          <Flame className="w-4 h-4 text-[var(--warning)] flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--tm)] font-medium uppercase tracking-wider">Streak</div>
              <div className="text-xs font-bold text-[var(--tp)] font-mono">
                {state.streak.count}d
                {state.streak.freezes > 0 && (
                  <span className="text-[var(--warning)] ml-1">+{state.streak.freezes}</span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[var(--bg-c2)]">
          <Sparkles className="w-4 h-4 text-[var(--gold)] flex-shrink-0" />
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-[10px] text-[var(--tm)] font-medium uppercase tracking-wider">XP</div>
              <div className="text-xs font-bold text-[var(--tp)] font-mono">
                {displayXp.toLocaleString()}
              </div>
            </div>
          )}
        </div>

        {!collapsed && (
          <>
            {COUNTDOWN_ITEMS.map((item) => {
              const { days, hours } = getCountdown(item.date);
              const totalHours = days * 24 + hours;
              const color = totalHours > 2160 ? 'text-[var(--gold)]' : totalHours > 720 ? 'text-[var(--warning)]' : 'text-[var(--error)]';
              return (
                <div key={item.key} className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-[var(--bg-c2)]">
                  <Calendar className="w-4 h-4 text-[var(--tm)] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-[var(--tm)] font-medium uppercase tracking-wider">{item.label}</div>
                    <div className={`text-xs font-bold font-mono ${color}`}>
                      {days}d {hours}h
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="px-2 py-1.5 rounded-lg border border-[var(--gold-border)] bg-[var(--gold-muted)]">
              <div className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-wider">Level {level}</div>
              <div className="text-[11px] text-[var(--ts)] font-medium truncate">{levelTitle}</div>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { store, getLocalDateString, FUTURE_DATES } from '../store';
import { calcUserLevel, getWeakChapters, calcOverallPct, calcPrayasSubjectPct } from '../utils/calculations';
import { BADGE_DEFINITIONS } from '../data/badges';
import { BookOpen, Flame, Trophy, Target, Clock, Plus, Zap, AlertTriangle, Atom, FlaskConical, Calculator, Beaker, Microscope } from 'lucide-react';
import { motion } from 'motion/react';
import { TiltCard } from './TiltCard';
import { PRAYAS_SUBJECTS } from '../data/prayasSyllabusData';

interface DashboardViewProps {
  onShowToast: (msg: string, type?: string) => void;
  onOpenQuickLog: () => void;
  onSelectChapter?: (chId: string) => void;
}

const COUNTDOWN_ITEMS = [
  { key: 'm1', label: 'JEE Main S1', date: FUTURE_DATES.m1 },
  { key: 'm2', label: 'JEE Main S2', date: FUTURE_DATES.m2 },
  { key: 'ad', label: 'JEE Advanced', date: FUTURE_DATES.ad },
];

function getCountdown(targetDate: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const target = new Date(targetDate + 'T00:00:00');
  const diff = target.getTime() - today.getTime();
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
  const hours = Math.max(0, Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)));
  return { days, hours, total: days * 24 + hours };
}

function getCountdownColor(totalHours: number) {
  if (totalHours > 2160) return 'var(--gold)'; // > 90 days
  if (totalHours > 720) return 'var(--warning)'; // > 30 days
  return 'var(--error)'; // < 30 days
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onShowToast, onOpenQuickLog, onSelectChapter }) => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const { level, levelTitle } = calcUserLevel(state.xp);
  const overallPct = useMemo(() => calcOverallPct(state), [state.chapters]);
  const weakChapters = useMemo(() => getWeakChapters(state).slice(0, 5), [state.chapters, state.mistakes]);

  const todayStr = getLocalDateString();
  const todayLog = state.studyLogs.find((l) => l.date === todayStr);
  const todayHours = todayLog ? todayLog.tot || 0 : 0;
  const dailyTarget = state.settings.dt || 8;
  const targetPct = Math.min(100, Math.round((todayHours / dailyTarget) * 100));

  const recentBadges = BADGE_DEFINITIONS.filter((b) => b.check(state)).slice(-3).reverse();

  const handleQuickLog = () => {
    onOpenQuickLog();
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--tp)]">Dashboard</h2>
        <p className="text-xs text-[var(--tm)] mt-1">Your preparation at a glance.</p>
      </div>

      {/* Top Row: Level + Overall Progress + Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Level Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 flex items-center gap-4"
        >
          <TiltCard className="h-full w-full">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--gold)] text-[var(--bg)] font-black text-xl flex items-center justify-center flex-shrink-0">
                {level}
              </div>
              <div className="min-w-0">
                <div className="text-[10px] text-[var(--gold)] font-bold uppercase tracking-widest">Level {level}</div>
                <div className="text-sm font-bold text-[var(--tp)] truncate">{levelTitle}</div>
                <div className="text-xs text-[var(--ts)] font-mono">{state.xp.toLocaleString()} XP</div>
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Overall Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.04 }}
          className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5"
        >
          <TiltCard className="h-full">
            <div>
              <div className="text-[10px] text-[var(--tm)] font-bold uppercase tracking-widest mb-2">Overall Completion</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-[var(--tp)] font-mono">{overallPct}%</span>
                <span className="text-xs text-[var(--ts)] mb-1">across all subjects</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden mt-3">
                <motion.div
                  className="h-full bg-[var(--gold)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </div>
          </TiltCard>
        </motion.div>

        {/* Today's Study Progress */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5"
        >
          <TiltCard className="h-full">
            <div>
              <div className="text-[10px] text-[var(--tm)] font-bold uppercase tracking-widest mb-2">Today&apos;s Goal</div>
              <div className="flex items-end gap-2">
                <span className="text-2xl font-black text-[var(--tp)] font-mono">{todayHours}h</span>
                <span className="text-xs text-[var(--ts)] mb-1">/ {dailyTarget}h target</span>
              </div>
              <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden mt-3">
                <motion.div
                  className="h-full bg-[var(--success)] rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${targetPct}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
              <button
                onClick={handleQuickLog}
                className="mt-3 w-full py-2 bg-[var(--gold)] text-[var(--bg)] text-xs font-bold rounded-xl hover:bg-[var(--gold-hover)] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Quick Log Session
              </button>
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Prayas 2.0 Lecture Progress */}
      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-4 h-4 text-[var(--gold)]" />
          <h3 className="text-sm font-extrabold text-[var(--tp)]">Prayas 2.0 Lecture Progress</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {PRAYAS_SUBJECTS.map((subj) => {
            const pct = calcPrayasSubjectPct(subj, state);
            let icon = <Atom className="w-3.5 h-3.5" />;
            if (subj === 'Physical Chemistry') icon = <FlaskConical className="w-3.5 h-3.5" />;
            if (subj === 'Inorganic Chemistry') icon = <Beaker className="w-3.5 h-3.5" />;
            if (subj === 'Organic Chemistry') icon = <Microscope className="w-3.5 h-3.5" />;
            if (subj === 'Mathematics') icon = <Calculator className="w-3.5 h-3.5" />;

            return (
              <div key={subj} className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-3">
                <div className="flex items-center gap-1.5 mb-2 text-[var(--gold)]">
                  {icon}
                  <span className="text-[10px] font-bold uppercase tracking-wider truncate">{subj}</span>
                </div>
                <div className="font-mono font-black text-lg text-[var(--tp)]">{pct}%</div>
                <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Exam Countdown Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {COUNTDOWN_ITEMS.map((item) => {
          const { days, hours, total } = getCountdown(item.date);
          const color = getCountdownColor(total);
          return (
            <motion.div
              key={item.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 flex items-center justify-between"
            >
              <TiltCard className="flex w-full items-center justify-between">
                <div>
                  <div className="text-[10px] text-[var(--tm)] font-bold uppercase tracking-widest">{item.label}</div>
                  <div className="text-xs text-[var(--ts)] mt-0.5">{item.date}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono" style={{ color }}>{days}d</div>
                  <div className="text-[10px] text-[var(--tm)] font-mono">{hours}h remaining</div>
                </div>
              </TiltCard>
            </motion.div>
          );
        })}
      </div>

      {/* Weak Topics + Recent Badges */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weak Topics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-3"
        >
          <TiltCard className="h-full">
            <div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[var(--warning)]" />
                <h3 className="text-sm font-extrabold text-[var(--tp)]">Priority Review</h3>
              </div>
              {weakChapters.length === 0 ? (
                <p className="text-xs text-[var(--tm)]">No weak topics identified yet. Keep tracking to get recommendations.</p>
              ) : (
                <div className="space-y-2">
                  {weakChapters.map((w) => {
                    const ch = state.chapters[w.chId];
                    return (
                      <button
                        key={w.chId}
                        onClick={() => {
                          if (onSelectChapter) onSelectChapter(w.chId);
                          onShowToast('Opening chapter in Syllabus Tracker...', 'cyan');
                        }}
                        className="flex w-full items-center justify-between text-xs bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 hover:border-[var(--bh)] transition-colors cursor-pointer text-left"
                      >
                        <span className="font-semibold text-[var(--tp)]">{w.chId.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}</span>
                        <span className="text-[var(--ts)]">{w.reason}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </TiltCard>
        </motion.div>

        {/* Recent Badges */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.14 }}
          className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-3"
        >
          <TiltCard className="h-full">
            <div>
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--gold)]" />
                <h3 className="text-sm font-extrabold text-[var(--tp)]">Recent Achievements</h3>
              </div>
              {recentBadges.length === 0 ? (
                <p className="text-xs text-[var(--tm)]">No badges unlocked yet. Complete chapter stages to earn badges.</p>
              ) : (
                <div className="space-y-2">
                  {recentBadges.map((badge) => (
                    <div key={badge.id} className="flex items-center gap-3 text-xs bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2">
                      <Zap className="w-4 h-4 text-[var(--gold)]" />
                      <div>
                        <div className="font-semibold text-[var(--tp)]">{badge.name}</div>
                        <div className="text-[var(--ts)]">{badge.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TiltCard>
        </motion.div>
      </div>

      {/* Streak + Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.18 }}
        className="bg-[var(--bg-c)] border border-[var(--gold-border)] rounded-2xl p-5 flex items-center justify-between flex-wrap gap-4"
      >
        <TiltCard className="flex w-full items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <Flame className="w-5 h-5 text-[var(--warning)]" />
            <div>
              <div className="text-xs font-bold text-[var(--tp)]">Current Streak</div>
              <div className="text-lg font-black text-[var(--tp)] font-mono">
                {state.streak.count} days
                {state.streak.freezes > 0 && (
                  <span className="text-xs text-[var(--warning)] ml-2 font-semibold">+{state.streak.freezes} freeze{state.streak.freezes > 1 ? 's' : ''}</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onShowToast('Quick log: use Study Hours for detailed logging.', 'amber')}
              className="px-4 py-2 bg-[var(--gold)] text-[var(--bg)] text-xs font-bold rounded-xl hover:bg-[var(--gold-hover)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5" /> Log Study Session
            </button>
            <button
              onClick={() => onShowToast('Opening Mock Tests...', 'cyan')}
              className="px-4 py-2 bg-[var(--bg-c2)] border border-[var(--b)] text-[var(--tp)] text-xs font-bold rounded-xl hover:border-[var(--bh)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Target className="w-3.5 h-3.5 text-[var(--gold)]" /> Take a Mock Test
            </button>
          </div>
        </TiltCard>
      </motion.div>
    </div>
  );
};

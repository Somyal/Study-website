import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { BADGE_DEFINITIONS } from '../data/badges';
import { calcUserLevel } from '../utils/calculations';
import {
  Trophy,
  Sparkles,
  Flame,
  Zap,
  Gem,
  Atom,
  FlaskConical,
  Calculator,
  Clock,
  Crown,
  Target,
  ShieldCheck,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const BadgesView: React.FC = () => {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const { level, levelTitle, currentLevelXp, nextLevelXp, progressPct } = calcUserLevel(state.xp);

  const getBadgeIcon = (id: string) => {
    switch (id) {
      case 'first_step':
        return <Sparkles className="w-6 h-6 text-amber-400" />;
      case 'streak_7':
        return <Flame className="w-6 h-6 text-orange-400" />;
      case 'streak_30':
        return <Zap className="w-6 h-6 text-yellow-400" />;
      case 'century_club':
        return <Gem className="w-6 h-6 text-cyan-400" />;
      case 'elite_250':
        return <Trophy className="w-6 h-6 text-amber-300" />;
      case 'phys_wiz':
        return <Atom className="w-6 h-6 text-cyan-400" />;
      case 'chem_boss':
        return <FlaskConical className="w-6 h-6 text-emerald-400" />;
      case 'math_ninja':
        return <Calculator className="w-6 h-6 text-violet-400" />;
      case 'marathon':
        return <Clock className="w-6 h-6 text-blue-400" />;
      case 'grandmaster':
        return <Crown className="w-6 h-6 text-yellow-300" />;
      case 'mistake_slayer':
        return <Target className="w-6 h-6 text-rose-400" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-cyan-400" />;
    }
  };

  const rarityBorder: Record<string, string> = {
    common: 'border-slate-500/30 bg-slate-500/5',
    rare: 'border-cyan-500/40 bg-cyan-500/10',
    epic: 'border-violet-500/40 bg-violet-500/10',
    legendary: 'border-amber-500/50 bg-amber-500/15 shadow-lg shadow-amber-500/10',
  };

  const rarityPill: Record<string, string> = {
    common: 'bg-slate-500/20 text-slate-300 border-slate-500/40',
    rare: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    epic: 'bg-violet-500/20 text-violet-300 border-violet-500/40',
    legendary: 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-black',
  };

  const unlockedCount = BADGE_DEFINITIONS.filter((b) => b.check(state)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" /> Achievements & Rank Progression
        </h2>
        <div className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
          {unlockedCount} / {BADGE_DEFINITIONS.length} Unlocked
        </div>
      </div>

      {/* Level Title Rank Banner */}
      <div className="bg-gradient-to-r from-violet-600/20 via-cyan-600/15 to-amber-600/20 border border-violet-500/30 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-violet-500/30">
              {level}
            </div>
            <div>
              <div className="text-xs font-bold text-violet-400 uppercase tracking-widest">
                Level {level} Rank Title
              </div>
              <div className="text-2xl font-black text-[var(--tp)]">{levelTitle}</div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-lg font-black text-cyan-400">{state.xp.toLocaleString()} Total XP</div>
            <div className="text-xs text-[var(--ts)]">
              {currentLevelXp} / {nextLevelXp} XP to next level
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--tm)] font-bold mb-1">
            <span>LEVEL PROGRESSION</span>
            <span className="font-mono text-cyan-400">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-c3)] rounded-full overflow-hidden p-0.5 border border-[var(--b)]">
            <div
              className="h-full bg-gradient-to-r from-violet-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGE_DEFINITIONS.map((badge) => {
          const isUnlocked = badge.check(state);
          return (
            <div
              key={badge.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                isUnlocked
                  ? rarityBorder[badge.rarity] || rarityBorder.common
                  : 'bg-[var(--bg-c)] border-[var(--b)] opacity-50 grayscale'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-[var(--bg-c2)] border border-[var(--b)]">
                  {getBadgeIcon(badge.id)}
                </div>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${
                    rarityPill[badge.rarity] || rarityPill.common
                  }`}
                >
                  {badge.rarity}
                </span>
              </div>

              <div>
                <h4 className="font-bold text-sm text-[var(--tp)] mb-1 flex items-center gap-1.5">
                  {badge.name}
                  {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 inline" />}
                </h4>
                <p className="text-xs text-[var(--ts)] leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-2 border-t border-[var(--b)] flex items-center justify-between text-[11px] text-[var(--tm)]">
                <span>Status</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isUnlocked ? 'text-emerald-400' : 'text-[var(--tm)]'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-slate-500" /> Locked
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

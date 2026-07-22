import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
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
        return <Sparkles className="w-6 h-6 text-[var(--warning)]" />;
      case 'streak_7':
        return <Flame className="w-6 h-6 text-[var(--warning)]" />;
      case 'streak_30':
        return <Zap className="w-6 h-6 text-[var(--gold)]" />;
      case 'century_club':
        return <Gem className="w-6 h-6 text-[var(--info)]" />;
      case 'elite_250':
        return <Trophy className="w-6 h-6 text-[var(--gold)]" />;
      case 'phys_wiz':
        return <Atom className="w-6 h-6 text-[var(--info)]" />;
      case 'chem_boss':
        return <FlaskConical className="w-6 h-6 text-[var(--success)]" />;
      case 'math_ninja':
        return <Calculator className="w-6 h-6 text-[var(--gold)]" />;
      case 'marathon':
        return <Clock className="w-6 h-6 text-[var(--info)]" />;
      case 'grandmaster':
        return <Crown className="w-6 h-6 text-[var(--gold)]" />;
      case 'mistake_slayer':
        return <Target className="w-6 h-6 text-[var(--error)]" />;
      default:
        return <ShieldCheck className="w-6 h-6 text-[var(--gold)]" />;
    }
  };

  const rarityBorder: Record<string, string> = {
    common: 'border-[var(--b)] bg-[var(--bg-c)]',
    rare: 'border-[var(--info)] bg-[rgba(91,143,168,0.08)]',
    epic: 'border-[var(--gold-border)] bg-[var(--gold-muted)]',
    legendary: 'border-[var(--gold)] bg-[var(--gold-muted)]',
  };

  const rarityPill: Record<string, string> = {
    common: 'bg-[var(--bg-c2)] text-[var(--ts)] border-[var(--b)]',
    rare: 'bg-[rgba(91,143,168,0.15)] text-[var(--info)] border-[var(--info)]',
    epic: 'bg-[var(--gold-muted)] text-[var(--gold)] border-[var(--gold-border)]',
    legendary: 'bg-[var(--gold-muted)] text-[var(--gold)] border-[var(--gold)]',
  };

  const unlockedCount = BADGE_DEFINITIONS.filter((b) => b.check(state)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[var(--gold)]" /> Achievements & Rank Progression
        </h2>
        <div className="text-xs font-mono font-bold text-[var(--gold)] bg-[var(--gold-muted)] border border-[var(--gold-border)] px-3 py-1.5 rounded-xl">
          {unlockedCount} / {BADGE_DEFINITIONS.length} Unlocked
        </div>
      </div>

      {/* Level Title Rank Banner */}
      <div className="bg-[var(--bg-c)] border border-[var(--gold-border)] rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--gold)] text-[var(--bg)] font-black text-2xl flex items-center justify-center">
              {level}
            </div>
            <div>
              <div className="text-xs font-bold text-[var(--gold)] uppercase tracking-widest">
                Level {level} Rank Title
              </div>
              <div className="text-2xl font-black text-[var(--tp)]">{levelTitle}</div>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-lg font-black text-[var(--gold)]">{state.xp.toLocaleString()} Total XP</div>
            <div className="text-xs text-[var(--ts)]">
              {currentLevelXp} / {nextLevelXp} XP to next level
            </div>
          </div>
        </div>

        {/* Level XP Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs text-[var(--tm)] font-bold mb-1">
            <span>LEVEL PROGRESSION</span>
            <span className="font-mono text-[var(--gold)]">{progressPct}%</span>
          </div>
          <div className="w-full h-3 bg-[var(--bg-c3)] rounded-full overflow-hidden border border-[var(--b)]">
            <div
              className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Badges Gallery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {BADGE_DEFINITIONS.map((badge, index) => {
          const isUnlocked = badge.check(state);
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
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
                  {isUnlocked && <CheckCircle2 className="w-3.5 h-3.5 text-[var(--success)] inline" />}
                </h4>
                <p className="text-xs text-[var(--ts)] leading-relaxed">{badge.description}</p>
              </div>

              <div className="pt-2 border-t border-[var(--b)] flex items-center justify-between text-[11px] text-[var(--tm)]">
                <span>Status</span>
                <span
                  className={`font-semibold flex items-center gap-1 ${
                    isUnlocked ? 'text-[var(--success)]' : 'text-[var(--tm)]'
                  }`}
                >
                  {isUnlocked ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-[var(--success)]" /> Unlocked
                    </>
                  ) : (
                    <>
                      <Lock className="w-3 h-3 text-[var(--ts)]" /> Locked
                    </>
                  )}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

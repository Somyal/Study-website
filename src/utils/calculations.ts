import { SubjectId, AppState, StageKey } from '../types';
import { ALL_CHAPTERS, PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, MATHEMATICS_CHAPTERS } from '../data/chapters';
import { PYQ_SHIFT_KEYS } from '../data/pyqShifts';
import { store } from '../store';

export function calcSubjectPct(sub: SubjectId, state?: AppState): number {
  const currentState = state || store.getState();
  const chapters = sub === 'physics' ? PHYSICS_CHAPTERS : sub === 'chemistry' ? CHEMISTRY_CHAPTERS : MATHEMATICS_CHAPTERS;

  if (chapters.length === 0) return 0;

  const chapterPcts = chapters.map((ch) => calcChapterPct(ch.id, currentState));
  const total = chapterPcts.reduce((acc, p) => acc + p, 0);
  return Math.round(total / chapters.length);
}

export function calcOverallPct(state?: AppState): number {
  const ph = calcSubjectPct('physics', state);
  const ch = calcSubjectPct('chemistry', state);
  const ma = calcSubjectPct('mathematics', state);
  return Math.round((ph + ch + ma) / 3);
}

export function calcChapterPct(chId: string, state?: AppState): number {
  const currentState = state || store.getState();
  const cd = currentState.chapters[chId];
  if (!cd || !cd.stages) return 0;

  let totalPct = 0;
  if (cd.stages.theory) totalPct += 25;
  if (cd.stages.dpp) totalPct += 25;
  if (cd.stages.revision) totalPct += 25;

  // PYQ Stage: proportional shift completion (16 shifts total)
  const shifts = PYQ_SHIFT_KEYS;
  if (cd.pyqShifts && Object.keys(cd.pyqShifts).length > 0) {
    const solved = shifts.filter((s) => !!cd.pyqShifts![s]).length;
    totalPct += Math.round((solved / shifts.length) * 25);
  } else if (cd.stages.pyq) {
    totalPct += 25;
  }

  return Math.min(100, Math.round(totalPct));
}

export function getPyqSolvedCount(chId: string, state?: AppState): { solved: number; total: number } {
  const currentState = state || store.getState();
  const cd = currentState.chapters[chId];
  const shifts = PYQ_SHIFT_KEYS;
  const total = shifts.length;

  if (!cd || !cd.pyqShifts) {
    return { solved: cd?.stages?.pyq ? total : 0, total };
  }

  const solved = shifts.filter((s) => !!cd.pyqShifts![s]).length;
  return { solved, total };
}

export interface SpacedRevisionStatus {
  isDue: boolean;
  daysSinceLast: number | null;
  statusColor: 'green' | 'amber' | 'red';
  statusText: string;
}

export function getSpacedRevisionStatus(chId: string, state?: AppState): SpacedRevisionStatus {
  const currentState = state || store.getState();
  const cd = currentState.chapters[chId];

  if (!cd || !cd.stages || !cd.stages.revision || !cd.revisionDates || cd.revisionDates.length === 0) {
    return { isDue: false, daysSinceLast: null, statusColor: 'green', statusText: 'Not revised yet' };
  }

  const lastDateStr = cd.revisionDates[cd.revisionDates.length - 1];
  const lastDate = new Date(lastDateStr);
  const diffDays = Math.floor((Date.now() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    return { isDue: false, daysSinceLast: diffDays, statusColor: 'green', statusText: `Fresh (${diffDays}d ago)` };
  } else if (diffDays <= 21) {
    return { isDue: false, daysSinceLast: diffDays, statusColor: 'amber', statusText: `Review Soon (${diffDays}d ago)` };
  } else {
    return { isDue: true, daysSinceLast: diffDays, statusColor: 'red', statusText: `Due for Revision (${diffDays}d ago)` };
  }
}

export function getWeakChapters(state?: AppState): Array<{ chId: string; reason: string }> {
  const currentState = state || store.getState();
  const weak: Array<{ chId: string; reason: string }> = [];

  ALL_CHAPTERS.forEach((ch) => {
    const cd = currentState.chapters[ch.id];
    if (cd) {
      if (cd.backlog) {
        weak.push({ chId: ch.id, reason: 'Flagged in Backlog' });
      } else if (cd.stars > 0 && cd.stars <= 2) {
        weak.push({ chId: ch.id, reason: `Low confidence rating (${cd.stars}★)` });
      } else if (ch.weight === 'High' && calcChapterPct(ch.id, currentState) < 50) {
        weak.push({ chId: ch.id, reason: 'High weightage topic with <50% completion' });
      }
    }
  });

  return weak;
}

export function calcUserLevel(xp: number): { level: number; levelTitle: string; currentLevelXp: number; nextLevelXp: number; progressPct: number } {
  // Level curve formula: Level N requires 500 * N^1.2 XP
  let level = 1;
  let reqXp = 0;

  const titles = [
    'JEE Aspirant',
    'Novice Scholar',
    'Formula Apprentice',
    'Problem Solver',
    'Concept Master',
    'DPP Slayer',
    'PYQ Conqueror',
    'Mock Test Strategist',
    'Ranker Candidate',
    'Top 1000 Contender',
    'AIR Top 100 Legend',
  ];

  while (xp >= 500 * Math.pow(level, 1.2)) {
    reqXp = Math.floor(500 * Math.pow(level, 1.2));
    level++;
  }

  const prevReqXp = level > 1 ? Math.floor(500 * Math.pow(level - 1, 1.2)) : 0;
  const nextReqXp = Math.floor(500 * Math.pow(level, 1.2));

  const currentLevelXp = xp - prevReqXp;
  const totalForLevel = nextReqXp - prevReqXp;
  const progressPct = Math.min(100, Math.round((currentLevelXp / totalForLevel) * 100));

  const levelTitle = titles[Math.min(level - 1, titles.length - 1)] || 'AIR Legend';

  return {
    level,
    levelTitle,
    currentLevelXp,
    nextLevelXp: nextReqXp,
    progressPct,
  };
}

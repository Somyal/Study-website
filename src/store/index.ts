import { AppState, ChapterUserData, MockTest, StudyLog, GoalSettings, ExamDates, UserSettings, StreakData, MistakeItem } from '../types';
import { ALL_CHAPTERS } from '../data/chapters';

const STORAGE_KEY = 'jeeCommandCenter_v4';
const LEGACY_STORAGE_KEY = 'jeeCommandCenter_v3';
const THEME_STORAGE_KEY = 'jeeCommandCenter_theme';

export const FUTURE_DATES: ExamDates = {
  m1: '2027-01-20',
  m2: '2027-04-02',
  ad: '2027-05-25',
};

// Local Timezone (IST/Local) YYYY-MM-DD Date Formatter (Fixes UTC offset bug BUG-01)
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDefaultState(): AppState {
  return {
    version: 4,
    chapters: {},
    tests: [],
    studyLogs: [],
    badges: {},
    goals: { pc: 80, ps: 75, cc: 80, cs: 75, mc: 80, ms: 75 },
    dates: { ...FUTURE_DATES },
    settings: { dt: 8, tt: 200 },
    streak: { count: 0, last: null, freezes: 1 },
    xp: 0,
    focusUrl: 'https://www.pw.live/study-v2/batches',
    mistakes: [],
  };
}

class Store {
  private state: AppState;
  private listeners: Set<() => void> = new Set();
  private saveTimeout: number | null = null;

  constructor() {
    this.state = this.loadInitialState();
    this.sanitizeDates();
  }

  private loadInitialState(): AppState {
    const defaultState = getDefaultState();
    if (typeof localStorage === 'undefined') return defaultState;
    try {
      // Try v4 first
      let raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Migration fallback from v3
        raw = localStorage.getItem(LEGACY_STORAGE_KEY);
      }
      if (raw) {
        const parsed = JSON.parse(raw);
        const merged: AppState = {
          ...defaultState,
          ...parsed,
          goals: { ...defaultState.goals, ...(parsed.goals || {}) },
          dates: { ...defaultState.dates, ...(parsed.dates || {}) },
          settings: { ...defaultState.settings, ...(parsed.settings || {}) },
          streak: { ...defaultState.streak, ...(parsed.streak || {}) },
          chapters: parsed.chapters || {},
          tests: Array.isArray(parsed.tests) ? parsed.tests : [],
          studyLogs: Array.isArray(parsed.studyLogs) ? parsed.studyLogs : [],
          badges: parsed.badges || {},
          mistakes: Array.isArray(parsed.mistakes) ? parsed.mistakes : [],
          xp: typeof parsed.xp === 'number' ? parsed.xp : 0,
          focusUrl: parsed.focusUrl || defaultState.focusUrl,
        };
        return merged;
      }
    } catch (e) {
      console.error('Failed to load state from localStorage:', e);
    }
    return defaultState;
  }

  private sanitizeDates(): void {
    const todayMs = new Date().setHours(0, 0, 0, 0);
    (['m1', 'm2', 'ad'] as Array<keyof ExamDates>).forEach((key) => {
      const ds = this.state.dates[key];
      if (!ds || ds.trim() === '') {
        this.state.dates[key] = FUTURE_DATES[key];
        return;
      }
      const t = new Date(ds.trim() + 'T12:00:00');
      if (isNaN(t.getTime()) || t.getTime() <= todayMs) {
        this.state.dates[key] = FUTURE_DATES[key];
      }
    });
  }

  public getState(): Readonly<AppState> {
    return this.state;
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener());
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimeout !== null) {
      clearTimeout(this.saveTimeout);
    }
    // Debounce writes by 300ms
    const setTimer = typeof window !== 'undefined' ? window.setTimeout : setTimeout;
    this.saveTimeout = setTimer(() => {
      this.saveToStorage();
    }, 300) as unknown as number;
  }

  public saveToStorage(): void {
    if (typeof localStorage === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  // --- MUTATION ACTIONS ---

  public updateState(updater: (draft: AppState) => void): void {
    updater(this.state);
    this.notify();
  }

  public getChapterData(id: string): ChapterUserData {
    if (!this.state.chapters[id]) {
      this.state.chapters[id] = {
        stages: { theory: false, dpp: false, pyq: false, revision: false },
        pyqShifts: {},
        stars: 0,
        backlog: false,
        revisionDates: [],
      };
    }
    if (!this.state.chapters[id].pyqShifts) {
      this.state.chapters[id].pyqShifts = {};
    }
    return this.state.chapters[id];
  }

  public toggleStage(id: string, stage: 'theory' | 'dpp' | 'pyq' | 'revision'): boolean {
    const cd = this.getChapterData(id);
    const prev = cd.stages[stage];
    cd.stages[stage] = !prev;

    if (stage === 'pyq') {
      // Sync shift papers
      const nextVal = !prev;
      const shifts = ['2025_jan','2025_apr','2024_jan','2024_apr','2023_jan','2023_apr','2022_jun','2022_jul','2021_feb','2021_mar','2021_jul','2021_aug','2020_jan','2020_sep','2019_jan','2019_apr'];
      if (!cd.pyqShifts) cd.pyqShifts = {};
      shifts.forEach((s) => {
        cd.pyqShifts![s] = nextVal;
      });
    }

    if (!prev) {
      // Stage completed
      this.state.xp += 50;
      if (stage === 'revision') {
        if (!cd.revisionDates) cd.revisionDates = [];
        cd.revisionDates.push(new Date().toISOString());
      }
    }
    this.notify();
    return !prev;
  }

  public togglePyqShift(chId: string, shiftKey: string): boolean {
    const cd = this.getChapterData(chId);
    if (!cd.pyqShifts) cd.pyqShifts = {};
    const prev = !!cd.pyqShifts[shiftKey];
    cd.pyqShifts[shiftKey] = !prev;

    // Check if all shifts are solved to auto-check stages.pyq
    const shifts = ['2025_jan','2025_apr','2024_jan','2024_apr','2023_jan','2023_apr','2022_jun','2022_jul','2021_feb','2021_mar','2021_jul','2021_aug','2020_jan','2020_sep','2019_jan','2019_apr'];
    const solvedCount = shifts.filter((s) => !!cd.pyqShifts![s]).length;
    const isAllDone = solvedCount === shifts.length;

    if (isAllDone && !cd.stages.pyq) {
      cd.stages.pyq = true;
      this.state.xp += 50;
    } else if (!isAllDone && cd.stages.pyq) {
      cd.stages.pyq = false;
    }

    this.notify();
    return !prev;
  }

  public selectAllPyqShifts(chId: string, selectAll: boolean): void {
    const cd = this.getChapterData(chId);
    if (!cd.pyqShifts) cd.pyqShifts = {};
    const shifts = ['2025_jan','2025_apr','2024_jan','2024_apr','2023_jan','2023_apr','2022_jun','2022_jul','2021_feb','2021_mar','2021_jul','2021_aug','2020_jan','2020_sep','2019_jan','2019_apr'];
    shifts.forEach((s) => {
      cd.pyqShifts![s] = selectAll;
    });
    cd.stages.pyq = selectAll;
    if (selectAll) this.state.xp += 50;
    this.notify();
  }

  public setStars(id: string, stars: number): void {
    const cd = this.getChapterData(id);
    cd.stars = Math.max(0, Math.min(5, stars));
    this.notify();
  }

  public toggleBacklog(id: string): boolean {
    const cd = this.getChapterData(id);
    cd.backlog = !cd.backlog;
    this.notify();
    return cd.backlog;
  }

  public addMockTest(test: Omit<MockTest, 'id'>): void {
    const id = Date.now();
    const newTest: MockTest = { ...test, id };
    this.state.tests.push(newTest);
    this.state.tests.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    if (newTest.to >= (this.state.settings.tt || 200)) {
      this.state.xp += 200;
    }
    this.notify();
  }

  public deleteMockTest(id: number): void {
    this.state.tests = this.state.tests.filter((t) => t.id !== id);
    this.notify();
  }

  public logStudySession(log: Omit<StudyLog, 'id'>): void {
    const today = log.date;
    const existingIndex = this.state.studyLogs.findIndex((l) => l.date === today);

    if (existingIndex >= 0) {
      this.state.studyLogs[existingIndex] = {
        ...this.state.studyLogs[existingIndex],
        ...log,
        id: this.state.studyLogs[existingIndex].id,
      };
    } else {
      this.state.studyLogs.push({ ...log, id: Date.now() });
      this.state.xp += 100;
      this.updateStreak();
    }
    this.state.studyLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    this.notify();
  }

  public deleteStudyLog(id: number): void {
    this.state.studyLogs = this.state.studyLogs.filter((l) => l.id !== id);
    this.notify();
  }

  public updateStreak(): void {
    const today = getLocalDateString();
    if (this.state.streak.last !== today) {
      const yesterday = getLocalDateString(new Date(Date.now() - 86400000));
      if (this.state.streak.last === yesterday) {
        this.state.streak.count += 1;
      } else if (!this.state.streak.last) {
        this.state.streak.count = 1;
      } else {
        // Missed a day — check for streak freeze
        if (this.state.streak.freezes > 0) {
          this.state.streak.freezes -= 1;
          // Keep streak active
        } else {
          this.state.streak.count = 1;
        }
      }
      this.state.streak.last = today;
      this.notify();
    }
  }

  public updateGoals(goals: Partial<GoalSettings>): void {
    this.state.goals = { ...this.state.goals, ...goals };
    this.notify();
  }

  public updateDates(dates: Partial<ExamDates>): void {
    this.state.dates = { ...this.state.dates, ...dates };
    this.sanitizeDates();
    this.notify();
  }

  public updateSettings(settings: Partial<UserSettings>): void {
    this.state.settings = { ...this.state.settings, ...settings };
    this.notify();
  }

  public addMistake(mistake: Omit<MistakeItem, 'id' | 'dateAdded'>): void {
    const newMistake: MistakeItem = {
      ...mistake,
      id: 'm_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      dateAdded: getLocalDateString(),
    };
    this.state.mistakes.unshift(newMistake);
    this.notify();
  }

  public updateMistakeStatus(id: string, status: 'open' | 'resolving' | 'resolved'): void {
    const m = this.state.mistakes.find((x) => x.id === id);
    if (m) {
      m.status = status;
      this.notify();
    }
  }

  public deleteMistake(id: string): void {
    this.state.mistakes = this.state.mistakes.filter((x) => x.id !== id);
    this.notify();
  }

  public exportData(): string {
    return JSON.stringify(this.state, null, 2);
  }

  public importData(jsonString: string): boolean {
    try {
      const imported = JSON.parse(jsonString);
      if (typeof imported !== 'object' || imported === null) return false;

      this.state = {
        ...getDefaultState(),
        ...imported,
        chapters: imported.chapters || {},
        tests: Array.isArray(imported.tests) ? imported.tests : [],
        studyLogs: Array.isArray(imported.studyLogs) ? imported.studyLogs : [],
        badges: imported.badges || {},
        goals: { ...getDefaultState().goals, ...(imported.goals || {}) },
        dates: { ...getDefaultState().dates, ...(imported.dates || {}) },
        settings: { ...getDefaultState().settings, ...(imported.settings || {}) },
        streak: { ...getDefaultState().streak, ...(imported.streak || {}) },
        mistakes: Array.isArray(imported.mistakes) ? imported.mistakes : [],
      };
      this.sanitizeDates();
      this.notify();
      return true;
    } catch (e) {
      console.error('Failed to import JSON data:', e);
      return false;
    }
  }

  public resetAllData(): void {
    this.state = getDefaultState();
    this.notify();
  }
}

export const store = new Store();

export type SubjectId = 'physics' | 'chemistry' | 'mathematics';
export type Weightage = 'High' | 'Medium' | 'Low';
export type ChemistrySubtype = 'Physical' | 'Organic' | 'Inorganic';
export type StageKey = 'theory' | 'dpp' | 'pyq' | 'revision';
export type PrayasSubject =
  | 'Physics'
  | 'Physical Chemistry'
  | 'Inorganic Chemistry'
  | 'Organic Chemistry'
  | 'Mathematics';

export interface Chapter {
  id: string;
  name: string;
  sub: SubjectId;
  cls: 11 | 12;
  weight: Weightage;
  subtype?: ChemistrySubtype;
}

export interface ChapterUserData {
  stages: Record<StageKey, boolean>;
  pyqShifts?: Record<string, boolean>;
  stars: number;
  backlog: boolean;
  revisionDates: string[];
}

export type ErrorCategory = 'calculation' | 'conceptual' | 'misread' | 'timePressure';

export interface MockTest {
  id: number | string;
  name: string;
  date: string;
  ph: number;
  ch: number;
  ma: number;
  to: number;
  at?: number;
  inc?: number;
  no?: string;
  errorBreakdown?: {
    calculation: number;
    conceptual: number;
    misread: number;
    timePressure: number;
  };
  scheduledTestId?: string;
}

export interface StudyLog {
  id?: number | string;
  date: string;
  lc: number;
  pr: number;
  tot: number;
  qs: number;
  no?: string;
}

export interface GoalSettings {
  physics?: number;
  chemistry?: number;
  mathematics?: number;
}

export interface ExamDates {
  m1: string;
  m2: string;
  ad: string;
}

export interface UserSettings {
  dt: number;
  tt: number;
}

export interface StreakData {
  count: number;
  last: string | null;
  freezes: number;
}

export interface MistakeItem {
  id: string;
  testId?: number | string;
  chId?: string;
  questionText: string;
  sub: SubjectId;
  errorType: ErrorCategory;
  status: 'open' | 'resolving' | 'resolved';
  dateAdded?: string;
  notes?: string;
}

export interface BadgeDefinition {
  id: string;
  icon: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  check: (state: AppState) => boolean;
}

export interface ChapterLectureData {
  id: string;
  subject: PrayasSubject;
  chapterName: string;
  totalLectures: number;
}

export interface ScheduledTest {
  id: string;
  name: string;
  date: string;
  testType: 'Part Test' | 'Full Test';
  pattern: 'JEE Main' | 'JEE Advanced';
  syllabus: {
    physics: string;
    chemistry: string;
    maths: string;
  };
}

export interface AppState {
  version: number;
  chapters: Record<string, ChapterUserData>;
  tests: MockTest[];
  studyLogs: StudyLog[];
  goals: GoalSettings;
  dates: ExamDates;
  settings: UserSettings;
  streak: StreakData;
  xp: number;
  badges: Record<string, boolean>;
  mistakes: MistakeItem[];
  focusUrl?: string;
  prayasLectures: Record<string, boolean>;
  prayasAttemptedIds: string[];
}

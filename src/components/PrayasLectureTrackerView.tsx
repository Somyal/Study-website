import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { PRAYAS_SYLLABUS, PRAYAS_SUBJECTS, PrayasSubject, getPrayasChaptersForSubject } from '../data/prayasSyllabusData';
import { calcPrayasSubjectPct, getPrayasLectureCounts } from '../utils/calculations';
import { ChevronDown, BookOpen, Check, X, Atom, FlaskConical, Calculator, Beaker, Microscope } from 'lucide-react';

interface PrayasLectureTrackerViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

const SUBJECT_ICONS: Record<string, React.ReactNode> = {
  Physics: <Atom className="w-4 h-4" />,
  'Physical Chemistry': <FlaskConical className="w-4 h-4" />,
  'Inorganic Chemistry': <Beaker className="w-4 h-4" />,
  'Organic Chemistry': <Microscope className="w-4 h-4" />,
  Mathematics: <Calculator className="w-4 h-4" />,
};

const SUBJECT_COLORS: Record<string, string> = {
  Physics: 'text-[var(--info)]',
  'Physical Chemistry': 'text-[var(--success)]',
  'Inorganic Chemistry': 'text-[var(--warning)]',
  'Organic Chemistry': 'text-[var(--gold)]',
  Mathematics: 'text-[var(--tp)]',
};

export const PrayasLectureTrackerView: React.FC<PrayasLectureTrackerViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());
  const [activeSubject, setActiveSubject] = useState<PrayasSubject>('Physics');
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const toggleChapter = (chId: string) => {
    setExpandedChapters((prev) => ({ ...prev, [chId]: !prev[chId] }));
  };

  const toggleLecture = (chId: string) => {
    const completed = store.togglePrayasLecture(chId);
    onShowToast(completed ? 'Lecture completed! +15 XP' : 'Lecture unchecked', completed ? 'emerald' : 'amber');
  };

  const chapters = getPrayasChaptersForSubject(activeSubject);
  const subjectPct = calcPrayasSubjectPct(activeSubject, state);
  const { completed: completedLectures, total: totalLectures } = getPrayasLectureCounts(activeSubject, state);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[var(--gold)]" /> Prayas 2.0 Lecture Tracker
        </h2>
        <p className="text-xs text-[var(--tm)] mt-1">Granular 5-subject lecture completion with XP rewards.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {PRAYAS_SUBJECTS.map((subj) => {
          const pct = calcPrayasSubjectPct(subj, state);
          const counts = getPrayasLectureCounts(subj, state);
          const isActive = activeSubject === subj;
          return (
            <button
              key={subj}
              onClick={() => setActiveSubject(subj)}
              className={`p-4 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-[var(--gold-muted)] border-[var(--gold-border)]'
                  : 'bg-[var(--bg-c)] border-[var(--b)] hover:border-[var(--bh)]'
              }`}
            >
              <div className={`mb-2 ${SUBJECT_COLORS[subj] || 'text-[var(--tp)]'}`}>
                {SUBJECT_ICONS[subj] || <BookOpen className="w-4 h-4" />}
              </div>
              <div className="font-extrabold text-sm text-[var(--tp)] leading-tight mb-1">{subj}</div>
              <div className="font-mono font-black text-lg text-[var(--tp)]">{pct}%</div>
              <div className="text-[10px] text-[var(--tm)] mb-2">{counts.completed}/{counts.total} lectures</div>
              <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
              {SUBJECT_ICONS[activeSubject]} {activeSubject}
            </h3>
            <p className="text-[10px] text-[var(--tm)] mt-0.5">
              {completedLectures} of {totalLectures} lectures watched
            </p>
          </div>
          <div className="font-mono font-black text-xl text-[var(--gold)]">{subjectPct}%</div>
        </div>

        <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden mb-5">
          <div
            className="h-full bg-[var(--gold)] rounded-full transition-all duration-500"
            style={{ width: `${subjectPct}%` }}
          />
        </div>

        <div className="space-y-3">
          {chapters.map((ch) => {
            const isComplete = !!(state.prayasLectures && state.prayasLectures[ch.id]);
            const isExpanded = !!expandedChapters[ch.id];
            return (
              <div
                key={ch.id}
                className={`rounded-xl border transition-all ${
                  isComplete ? 'bg-[var(--gold-muted)] border-[var(--gold-border)]' : 'bg-[var(--bg-c2)] border-[var(--b)]'
                }`}
              >
                <div className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-[var(--tp)]">{ch.chapterName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-c3)] text-[var(--ts)] border border-[var(--b)]">
                        {ch.totalLectures} Lectures
                      </span>
                      {isComplete && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--gold)] text-[var(--bg)]">
                          Completed
                        </span>
                      )}
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-[var(--gold)]' : 'bg-[var(--info)]'}`}
                        style={{ width: `${isComplete ? 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleLecture(ch.id)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                        isComplete
                          ? 'bg-[var(--gold)] text-[var(--bg)] border-[var(--gold)]'
                          : 'bg-[var(--bg-c3)] text-[var(--tp)] border-[var(--b)] hover:border-[var(--gold)]'
                      }`}
                    >
                      {isComplete ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      {isComplete ? 'Watched All' : 'Mark Complete'}
                    </button>
                    <button
                      onClick={() => toggleChapter(ch.id)}
                      className="p-1.5 rounded-lg border border-[var(--b)] text-[var(--ts)] hover:border-[var(--bh)] cursor-pointer"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4">
                    <div className="text-[10px] font-bold text-[var(--tm)] uppercase mb-2">Lecture Checklist</div>
                    <div className="flex flex-wrap gap-2">
                      {Array.from({ length: ch.totalLectures }).map((_, idx) => {
                        const lecNum = idx + 1;
                        const isDone = isComplete;
                        return (
                          <button
                            key={lecNum}
                            onClick={() => toggleLecture(ch.id)}
                            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all cursor-pointer ${
                              isDone
                                ? 'bg-[var(--gold)] text-[var(--bg)] border-[var(--gold)]'
                                : 'bg-[var(--bg-c)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--gold)]'
                            }`}
                          >
                            {isDone ? <Check className="w-3 h-3 inline mr-1" /> : <X className="w-3 h-3 inline mr-1 opacity-0" />}
                            Lec {lecNum}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

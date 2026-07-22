import React, { useState, useEffect } from 'react';
import { SubjectId, Weightage, ChemistrySubtype, Chapter, StageKey } from '../types';
import { PHYSICS_CHAPTERS, CHEMISTRY_CHAPTERS, MATHEMATICS_CHAPTERS, ALL_CHAPTERS } from '../data/chapters';
import { PYQ_SHIFTS, TOTAL_PYQ_SHIFTS_COUNT } from '../data/pyqShifts';
import { chapterMatchesSearch } from '../data/keywords';
import { store } from '../store';
import { calcSubjectPct, calcChapterPct, getSpacedRevisionStatus, getPyqSolvedCount } from '../utils/calculations';
import {
  Search,
  ChevronDown,
  Star,
  Check,
  AlertCircle,
  X,
  Atom,
  FlaskConical,
  Calculator,
  BookOpen,
  FileText,
  Trophy,
  RotateCcw,
  Pin,
} from 'lucide-react';

interface SyllabusViewProps {
  onShowToast: (msg: string, type?: string) => void;
  selectedChapterId?: string | null;
}

export const SyllabusView: React.FC<SyllabusViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());
  const [activeSubject, setActiveSubject] = useState<SubjectId>('physics');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<'all' | '11' | '12'>('all');
  const [weightFilter, setWeightFilter] = useState<'all' | Weightage>('all');
  const [backlogFilter, setBacklogFilter] = useState<boolean>(false);
  const [chemtypeFilter, setChemtypeFilter] = useState<'all' | ChemistrySubtype>('all');
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({});

  // PYQ Shift Tracker Modal State
  const [activePyqChapterId, setActivePyqChapterId] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const getSubjectChapters = (): Chapter[] => {
    if (activeSubject === 'physics') return PHYSICS_CHAPTERS;
    if (activeSubject === 'chemistry') return CHEMISTRY_CHAPTERS;
    return MATHEMATICS_CHAPTERS;
  };

  const filteredChapters = getSubjectChapters().filter((ch) => {
    const cd = store.getChapterData(ch.id);
    if (classFilter !== 'all' && String(ch.cls) !== classFilter) return false;
    if (weightFilter !== 'all' && ch.weight !== weightFilter) return false;
    if (backlogFilter && !cd.backlog) return false;
    if (activeSubject === 'chemistry' && chemtypeFilter !== 'all' && ch.subtype !== chemtypeFilter) return false;
    if (!chapterMatchesSearch(ch.name, searchQuery)) return false;
    return true;
  });

  // Group by Class / Subtype
  const groups: Record<string, Chapter[]> = {};
  filteredChapters.forEach((ch) => {
    let key = `Class ${ch.cls}`;
    if (activeSubject === 'chemistry' && ch.subtype) {
      key += ` — ${ch.subtype}`;
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(ch);
  });

  const toggleAccordion = (key: string) => {
    setOpenAccordions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const isAccordionOpen = (key: string) => openAccordions[key] !== false; // Open by default

  const physPct = calcSubjectPct('physics', state);
  const chemPct = calcSubjectPct('chemistry', state);
  const mathPct = calcSubjectPct('mathematics', state);

  const activePyqChapter = ALL_CHAPTERS.find((c) => c.id === activePyqChapterId);
  const activePyqData = activePyqChapterId ? store.getChapterData(activePyqChapterId) : null;
  const pyqStats = activePyqChapterId ? getPyqSolvedCount(activePyqChapterId, state) : { solved: 0, total: 16 };

  return (
    <div className="space-y-6">
      {/* Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Physics Card */}
        <button
          onClick={() => {
            setActiveSubject('physics');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
            activeSubject === 'physics'
              ? 'bg-cyan-500/10 border-cyan-500/50 shadow-lg shadow-cyan-500/10 scale-[1.01]'
              : 'bg-[var(--bg-c)] border-[var(--b)] hover:border-[var(--bh)]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <Atom className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base text-[var(--tp)]">Physics</div>
                <div className="text-[11px] text-[var(--tm)]">Mechanics to Modern</div>
              </div>
            </div>
            <div className="font-mono font-black text-xl text-cyan-400">{physPct}%</div>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
              style={{ width: `${physPct}%` }}
            />
          </div>
        </button>

        {/* Chemistry Card */}
        <button
          onClick={() => {
            setActiveSubject('chemistry');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
            activeSubject === 'chemistry'
              ? 'bg-emerald-500/10 border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.01]'
              : 'bg-[var(--bg-c)] border-[var(--b)] hover:border-[var(--bh)]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <FlaskConical className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base text-[var(--tp)]">Chemistry</div>
                <div className="text-[11px] text-[var(--tm)]">Physical, Organic, Inorganic</div>
              </div>
            </div>
            <div className="font-mono font-black text-xl text-emerald-400">{chemPct}%</div>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500"
              style={{ width: `${chemPct}%` }}
            />
          </div>
        </button>

        {/* Mathematics Card */}
        <button
          onClick={() => {
            setActiveSubject('mathematics');
            setSearchQuery('');
          }}
          className={`p-5 rounded-2xl text-left border transition-all duration-200 cursor-pointer ${
            activeSubject === 'mathematics'
              ? 'bg-violet-500/10 border-violet-500/50 shadow-lg shadow-violet-500/10 scale-[1.01]'
              : 'bg-[var(--bg-c)] border-[var(--b)] hover:border-[var(--bh)]'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-500/20 text-violet-400 flex items-center justify-center">
                <Calculator className="w-5 h-5" />
              </div>
              <div>
                <div className="font-extrabold text-base text-[var(--tp)]">Mathematics</div>
                <div className="text-[11px] text-[var(--tm)]">Algebra to Calculus</div>
              </div>
            </div>
            <div className="font-mono font-black text-xl text-violet-400">{mathPct}%</div>
          </div>
          <div className="w-full h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-600 to-violet-400 transition-all duration-500"
              style={{ width: `${mathPct}%` }}
            />
          </div>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-[var(--tm)] absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search chapters or topic keywords (e.g. 'rotational', 'mole')..."
            className="w-full bg-[var(--bg-c2)] border border-[var(--b)] focus:border-cyan-500 rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--tp)] outline-none transition-colors"
          />
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-2 flex-wrap text-xs">
          <span className="text-[10px] font-bold text-[var(--tm)] uppercase">Class:</span>
          {['all', '11', '12'].map((val) => (
            <button
              key={val}
              onClick={() => setClassFilter(val as any)}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                classFilter === val
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-[var(--bg-c2)] text-[var(--ts)] border border-[var(--b)] hover:border-[var(--bh)]'
              }`}
            >
              {val === 'all' ? 'All' : `Class ${val}`}
            </button>
          ))}

          <span className="text-[10px] font-bold text-[var(--tm)] uppercase ml-2">Weight:</span>
          {['all', 'High', 'Medium', 'Low'].map((val) => (
            <button
              key={val}
              onClick={() => setWeightFilter(val as any)}
              className={`px-3 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                weightFilter === val
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40'
                  : 'bg-[var(--bg-c2)] text-[var(--ts)] border border-[var(--b)] hover:border-[var(--bh)]'
              }`}
            >
              {val === 'all' ? 'All' : val === 'High' ? 'High' : val === 'Medium' ? 'Medium' : 'Low'}
            </button>
          ))}

          <button
            onClick={() => setBacklogFilter(!backlogFilter)}
            className={`px-3 py-1 rounded-full font-semibold transition-all border flex items-center gap-1 cursor-pointer ${
              backlogFilter
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                : 'bg-[var(--bg-c2)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
            }`}
          >
            <Pin className="w-3 h-3 text-amber-400" />
            <span>Backlog</span>
          </button>
        </div>
      </div>

      {/* Chapter Groups Accordion */}
      <div className="space-y-4">
        {Object.keys(groups).length === 0 ? (
          <div className="p-12 text-center text-sm text-[var(--tm)] bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl">
            No chapters match your search or filter criteria.
          </div>
        ) : (
          Object.keys(groups).sort().map((groupKey) => {
            const chs = groups[groupKey];
            const completedCount = chs.filter((ch) => calcChapterPct(ch.id, state) === 100).length;
            const groupPct = Math.round((completedCount / chs.length) * 100);
            const isOpen = isAccordionOpen(groupKey);

            return (
              <div key={groupKey} className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl overflow-hidden">
                <button
                  onClick={() => toggleAccordion(groupKey)}
                  className="w-full px-5 py-3.5 bg-[var(--bg-c2)] border-b border-[var(--b)] flex items-center justify-between hover:bg-[var(--bg-c3)] transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-[var(--tp)]">{groupKey}</span>
                    <span className="text-xs text-[var(--tm)]">
                      {completedCount}/{chs.length} complete
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-1.5 bg-[var(--bg-c3)] rounded-full overflow-hidden">
                      <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${groupPct}%` }} />
                    </div>
                    <span className="font-mono text-xs font-bold text-cyan-400">{groupPct}%</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[var(--tm)] transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                {isOpen && (
                  <div className="p-4 space-y-3">
                    {chs.map((ch) => {
                      const cd = store.getChapterData(ch.id);
                      const pct = calcChapterPct(ch.id, state);
                      const revStatus = getSpacedRevisionStatus(ch.id, state);
                      const pyqInfo = getPyqSolvedCount(ch.id, state);

                      return (
                        <div
                          key={ch.id}
                          className={`p-4 rounded-xl border transition-all ${
                            cd.backlog
                              ? 'bg-amber-500/5 border-amber-500/30'
                              : 'bg-[var(--bg-c2)] border-[var(--b)] hover:border-[var(--bh)]'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-3 mb-3 flex-wrap">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm text-[var(--tp)]">{ch.name}</span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                ch.cls === 11 ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-violet-500/10 text-violet-400 border-violet-500/30'
                              }`}>
                                Class {ch.cls}
                              </span>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${
                                ch.weight === 'High' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' : ch.weight === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'
                              }`}>
                                {ch.weight} Weightage
                              </span>

                              {/* Spaced Revision Alert Badge */}
                              {revStatus.isDue && (
                                <span className="text-[10px] bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                                  <AlertCircle className="w-3 h-3 text-rose-400" /> Due Revision ({revStatus.daysSinceLast}d ago)
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono text-xs font-bold text-cyan-400">{pct}%</span>
                              <button
                                onClick={() => {
                                  const isAdded = store.toggleBacklog(ch.id);
                                  onShowToast(isAdded ? 'Added to Backlog' : 'Removed from Backlog', isAdded ? 'amber' : 'emerald');
                                }}
                                className={`text-xs px-2.5 py-1 rounded-lg border font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                                  cd.backlog
                                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                    : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                                }`}
                              >
                                <Pin className="w-3 h-3 text-amber-400" />
                                <span>{cd.backlog ? '✓ Backlog' : '+ Backlog'}</span>
                              </button>
                            </div>
                          </div>

                          {/* Confidence Rating Stars */}
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[11px] text-[var(--tm)] font-semibold">Confidence:</span>
                            <div className="flex items-center gap-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => store.setStars(ch.id, star)}
                                  className="text-sm cursor-pointer hover:scale-125 transition-transform"
                                >
                                  <Star
                                    className={`w-4 h-4 ${
                                      star <= cd.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-600'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Stage Controls Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {/* Theory */}
                            <button
                              onClick={() => {
                                const done = store.toggleStage(ch.id, 'theory');
                                if (done) onShowToast('Theory done! +50 XP', 'emerald');
                              }}
                              className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                                cd.stages.theory
                                  ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40'
                                  : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Theory</span>
                              </div>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                cd.stages.theory ? 'bg-cyan-400 border-cyan-400 text-black' : 'border-[var(--bh)]'
                              }`}>
                                {cd.stages.theory && <Check className="w-3 h-3 text-black" />}
                              </div>
                            </button>

                            {/* DPPs */}
                            <button
                              onClick={() => {
                                const done = store.toggleStage(ch.id, 'dpp');
                                if (done) onShowToast('DPPs done! +50 XP', 'emerald');
                              }}
                              className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                                cd.stages.dpp
                                  ? 'bg-violet-500/20 text-violet-400 border-violet-500/40'
                                  : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <FileText className="w-3.5 h-3.5" />
                                <span>DPPs</span>
                              </div>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                cd.stages.dpp ? 'bg-violet-400 border-violet-400 text-black' : 'border-[var(--bh)]'
                              }`}>
                                {cd.stages.dpp && <Check className="w-3 h-3 text-black" />}
                              </div>
                            </button>

                            {/* PYQs with Shift Tracker Button */}
                            <button
                              onClick={() => setActivePyqChapterId(ch.id)}
                              className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                                pyqInfo.solved > 0
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                              }`}
                              title="Click to view 2019-2025 Shift Paper completion details"
                            >
                              <div className="flex items-center gap-1.5">
                                <Trophy className="w-3.5 h-3.5" />
                                <span>PYQs ({pyqInfo.solved}/{pyqInfo.total})</span>
                              </div>
                              <span className="text-[10px] bg-amber-500/30 text-amber-200 px-1.5 py-0.5 rounded font-mono font-bold">
                                Shifts
                              </span>
                            </button>

                            {/* Revision */}
                            <button
                              onClick={() => {
                                const done = store.toggleStage(ch.id, 'revision');
                                if (done) onShowToast('Revision done! +50 XP', 'emerald');
                              }}
                              className={`px-3 py-2 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all cursor-pointer ${
                                cd.stages.revision
                                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                                  : 'bg-[var(--bg-c3)] text-[var(--ts)] border-[var(--b)] hover:border-[var(--bh)]'
                              }`}
                            >
                              <div className="flex items-center gap-1.5">
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Revision</span>
                              </div>
                              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                                cd.stages.revision ? 'bg-emerald-400 border-emerald-400 text-black' : 'border-[var(--bh)]'
                              }`}>
                                {cd.stages.revision && <Check className="w-3 h-3 text-black" />}
                              </div>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* PYQ Shift Tracker Modal */}
      {activePyqChapterId && activePyqChapter && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-c)] border border-[var(--bh)] rounded-2xl p-6 w-full max-w-2xl space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[var(--b)] pb-3">
              <div>
                <h3 className="text-base font-extrabold text-[var(--tp)] flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-amber-400" /> JEE Main PYQ Shift Paper Tracker (2019–2025)
                </h3>
                <div className="text-xs text-cyan-400 font-semibold mt-0.5">
                  {activePyqChapter.name} (Class {activePyqChapter.cls})
                </div>
              </div>
              <button
                onClick={() => setActivePyqChapterId(null)}
                className="text-[var(--tm)] hover:text-[var(--tp)] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Progress Header */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-amber-300">
                  {pyqStats.solved} of {pyqStats.total} Shift Papers Completed ({Math.round((pyqStats.solved / pyqStats.total) * 100)}%)
                </div>
                <div className="text-[11px] text-[var(--ts)] mt-0.5">
                  Marking shift papers updates chapter completion and awards +10 XP per shift paper.
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    store.selectAllPyqShifts(activePyqChapterId, true);
                    onShowToast('All 16 shifts marked solved!', 'emerald');
                  }}
                  className="px-3 py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold hover:bg-emerald-500/30 cursor-pointer"
                >
                  Select All
                </button>
                <button
                  onClick={() => {
                    store.selectAllPyqShifts(activePyqChapterId, false);
                    onShowToast('Cleared shift selections', 'amber');
                  }}
                  className="px-3 py-1.5 bg-[var(--bg-c2)] text-[var(--ts)] border border-[var(--b)] rounded-lg text-xs font-bold hover:bg-[var(--bg-c3)] cursor-pointer"
                >
                  Clear All
                </button>
              </div>
            </div>

            {/* Shift Papers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {PYQ_SHIFTS.map((shift) => {
                const isSolved = !!activePyqData?.pyqShifts?.[shift.key];
                return (
                  <button
                    key={shift.key}
                    onClick={() => {
                      const done = store.togglePyqShift(activePyqChapterId, shift.key);
                      if (done) onShowToast(`${shift.label} solved! +10 XP`, 'emerald');
                    }}
                    className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSolved
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 font-bold shadow-md shadow-amber-500/10'
                        : 'bg-[var(--bg-c2)] border-[var(--b)] text-[var(--ts)] hover:border-[var(--bh)]'
                    }`}
                  >
                    <div>
                      <div className="text-xs font-extrabold text-[var(--tp)]">{shift.year} {shift.session}</div>
                      <div className="text-[10px] text-[var(--tm)]">JEE Main Shift</div>
                    </div>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      isSolved ? 'bg-amber-400 border-amber-400 text-black' : 'border-[var(--bh)]'
                    }`}>
                      {isSolved && <Check className="w-3 h-3 text-black" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setActivePyqChapterId(null)}
                className="px-5 py-2 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-cyan-500/20 cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

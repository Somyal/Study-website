import React, { useState, useEffect, useRef } from 'react';
import { store, getLocalDateString } from '../store';
import { StudyLog } from '../types';
import { Chart } from 'chart.js';
import { Clock, Plus, BarChart2, Trash2, Calendar, FileText } from 'lucide-react';

interface StudyHoursViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

export const StudyHoursView: React.FC<StudyHoursViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());

  // Form State
  const [logDate, setLogDate] = useState(getLocalDateString());
  const [lectureHrs, setLectureHrs] = useState<number | ''>('');
  const [practiceHrs, setPracticeHrs] = useState<number | ''>('');
  const [questions, setQuestions] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const barChartRef = useRef<HTMLCanvasElement | null>(null);
  const barChartInstance = useRef<Chart | null>(null);
  const lastDeletedRef = useRef<StudyLog | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    const lc = typeof lectureHrs === 'number' ? lectureHrs : 0;
    const pr = typeof practiceHrs === 'number' ? practiceHrs : 0;
    const tot = lc + pr;
    const qs = typeof questions === 'number' ? questions : 0;

    if (tot <= 0) {
      onShowToast('Please enter study hours', 'rose');
      return;
    }

    const newLog: StudyLog = {
      date: logDate || getLocalDateString(),
      lc,
      pr,
      tot,
      qs,
      no: notes.trim() || undefined,
    };

    store.logStudySession(newLog);
    onShowToast(`Logged ${tot}h study session! +100 XP`, 'emerald');

    setLectureHrs('');
    setPracticeHrs('');
    setQuestions('');
    setNotes('');
  };

  const todayStr = getLocalDateString();
  const todayLog = state.studyLogs.find((l) => l.date === todayStr);
  const todayHours = todayLog ? todayLog.tot || 0 : 0;
  const dailyTarget = state.settings.dt || 8;
  const targetPct = Math.min(100, Math.round((todayHours / dailyTarget) * 100));

  // Render Bar Chart for 7-Day History
  useEffect(() => {
    if (!barChartRef.current) return;

    // Last 7 Days Date Array
    const dates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split('T')[0]);
    }

    const totals = dates.map((dStr) => {
      const log = state.studyLogs.find((l) => l.date === dStr);
      return log ? log.tot || 0 : 0;
    });

    const isLight = document.documentElement.classList.contains('light');
    const tickColor = isLight ? '#64748b' : '#a1a1aa';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    if (barChartInstance.current) {
      barChartInstance.current.data.labels = dates.map((d) => d.slice(5));
      barChartInstance.current.data.datasets[0].data = totals;
      barChartInstance.current.update('none');
    } else {
      barChartInstance.current = new Chart(barChartRef.current, {
        type: 'bar',
        data: {
          labels: dates.map((d) => d.slice(5)),
          datasets: [
            {
              label: 'Hours Solved',
              data: totals,
              backgroundColor: totals.map((val) => (val >= dailyTarget ? 'rgba(74, 158, 122, 0.7)' : 'rgba(91, 143, 168, 0.6)')),
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { display: false } },
            y: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor }, suggestedMax: dailyTarget * 1.25 },
          },
        },
      });
    }

    return () => {
      if (barChartInstance.current) {
        barChartInstance.current.destroy();
        barChartInstance.current = null;
      }
    };
  }, [state.studyLogs, dailyTarget]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Clock className="w-5 h-5 text-[var(--gold)]" /> Daily Study Logger & Goal Meter
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <form onSubmit={handleAddLog} className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--gold)]" /> Record Study Hours
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--tm)]" /> Date
            </label>
            <input
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Lecture Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={lectureHrs}
                onChange={(e) => setLectureHrs(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Practice Hours</label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={practiceHrs}
                onChange={(e) => setPracticeHrs(e.target.value === '' ? '' : parseFloat(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Questions Solved</label>
            <input
              type="number"
              min="0"
              value={questions}
              onChange={(e) => setQuestions(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
              placeholder="0"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[var(--tm)]" /> Notes
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Topics completed..."
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--gold)] text-[var(--bg)] font-bold text-xs rounded-xl hover:bg-[var(--gold-hover)] transition-all cursor-pointer"
          >
            Log Study Session (+100 XP)
          </button>
        </form>

        {/* Circular Gauge Meter & 7-Day Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Circular Gauge Ring */}
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 flex items-center gap-6">
              <div className="relative w-24 h-24 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[var(--bg-c3)]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[var(--gold)] transition-all duration-500"
                    strokeDasharray={`${targetPct}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute text-center font-mono">
                  <span className="text-xl font-black text-[var(--tp)]">{todayHours}h</span>
                  <span className="text-[10px] block text-[var(--tm)]">/ {dailyTarget}h</span>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-[var(--gold)] uppercase tracking-wider">Today&apos;s Goal Progress</div>
                <div className="text-xl font-black text-[var(--tp)] mt-0.5">{targetPct}% Target</div>
                <p className="text-xs text-[var(--ts)] mt-1">
                  {todayHours >= dailyTarget
                    ? 'Daily target completed. Strong session.'
                    : `${(dailyTarget - todayHours).toFixed(1)}h remaining to hit target.`}
                </p>
              </div>
            </div>

            {/* Weekly Bar Chart */}
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-[var(--tp)] flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[var(--gold)]" /> 7-Day Study Trend
              </div>
              <div className="h-[120px]">
                <canvas ref={barChartRef} />
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-[var(--tp)]">Recent Study Sessions</h4>
            {state.studyLogs.length === 0 ? (
              <div className="text-center text-xs text-[var(--tm)] py-6">No study sessions recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[var(--b)] text-[var(--tm)] font-sans text-[11px]">
                      <th className="pb-2 font-bold">Date</th>
                      <th className="pb-2 font-bold text-[var(--info)]">Lectures</th>
                      <th className="pb-2 font-bold text-[var(--success)]">Practice</th>
                      <th className="pb-2 font-bold text-[var(--gold)]">Total Hours</th>
                      <th className="pb-2 font-bold text-[var(--warning)]">Qs Solved</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--b)]">
                    {state.studyLogs.map((l, idx) => (
                      <tr key={idx} className="hover:bg-[var(--bg-c2)]">
                        <td className="py-2.5 font-sans text-[var(--tp)]">{l.date}</td>
                        <td className="py-2.5 text-[var(--info)]">{l.lc || 0}h</td>
                        <td className="py-2.5 text-[var(--success)]">{l.pr || 0}h</td>
                        <td className="py-2.5 font-black text-[var(--gold)]">{l.tot || 0}h</td>
                        <td className="py-2.5 text-[var(--warning)] font-bold">{l.qs || 0}</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              const deleted = state.studyLogs.find((x) => x.id === l.id) || null;
                              lastDeletedRef.current = deleted;
                              store.deleteStudyLog(l.id!);
                              onShowToast('Session log deleted', 'amber', () => {
                                if (lastDeletedRef.current) {
                                  store.logStudySession(lastDeletedRef.current, false);
                                  lastDeletedRef.current = null;
                                }
                              });
                            }}
                            className="text-[var(--error)] hover:text-[var(--error)] p-1 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

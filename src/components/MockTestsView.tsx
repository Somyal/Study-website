import React, { useState, useEffect, useRef } from 'react';
import { store, getLocalDateString } from '../store';
import { MockTest } from '../types';
import { Chart, registerables } from 'chart.js';
import { BarChart2, Plus, LineChart, PieChart, Trash2, Calendar, FileText, Atom, FlaskConical, Calculator } from 'lucide-react';

Chart.register(...registerables);

interface MockTestsViewProps {
  onShowToast: (msg: string, type?: string, onUndo?: () => void) => void;
}

export const MockTestsView: React.FC<MockTestsViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());

  // Form State
  const [testName, setTestName] = useState('');
  const [testDate, setTestDate] = useState(getLocalDateString());
  const [phScore, setPhScore] = useState<number | ''>('');
  const [chScore, setChScore] = useState<number | ''>('');
  const [maScore, setMaScore] = useState<number | ''>('');
  const [attempted, setAttempted] = useState<number | ''>('');
  const [incorrect, setIncorrect] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  // Error Breakdown State
  const [errCalc, setErrCalc] = useState<number | ''>('');
  const [errConcept, setErrConcept] = useState<number | ''>('');
  const [errMisread, setErrMisread] = useState<number | ''>('');
  const [errTime, setErrTime] = useState<number | ''>('');

  const trendChartRef = useRef<HTMLCanvasElement | null>(null);
  const radarChartRef = useRef<HTMLCanvasElement | null>(null);
  const trendChartInstance = useRef<Chart | null>(null);
  const radarChartInstance = useRef<Chart | null>(null);
  const lastDeletedRef = useRef<MockTest | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const autoTotal = (typeof phScore === 'number' ? phScore : 0) +
                    (typeof chScore === 'number' ? chScore : 0) +
                    (typeof maScore === 'number' ? maScore : 0);

  const handleAddTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testName.trim()) {
      onShowToast('Please enter test name', 'rose');
      return;
    }

    const newTest: Omit<MockTest, 'id'> = {
      name: testName.trim(),
      date: testDate || getLocalDateString(),
      ph: typeof phScore === 'number' ? Math.max(0, Math.min(100, phScore)) : 0,
      ch: typeof chScore === 'number' ? Math.max(0, Math.min(100, chScore)) : 0,
      ma: typeof maScore === 'number' ? Math.max(0, Math.min(100, maScore)) : 0,
      to: autoTotal,
      at: typeof attempted === 'number' ? attempted : undefined,
      inc: typeof incorrect === 'number' ? incorrect : undefined,
      no: notes.trim() || undefined,
      errorBreakdown: {
        calculation: typeof errCalc === 'number' ? errCalc : 0,
        conceptual: typeof errConcept === 'number' ? errConcept : 0,
        misread: typeof errMisread === 'number' ? errMisread : 0,
        timePressure: typeof errTime === 'number' ? errTime : 0,
      },
    };

    store.addMockTest(newTest);
    onShowToast(`Logged test score: ${autoTotal}/300! +200 XP`, 'emerald');

    // Reset Form
    setTestName('');
    setPhScore('');
    setChScore('');
    setMaScore('');
    setAttempted('');
    setIncorrect('');
    setNotes('');
    setErrCalc('');
    setErrConcept('');
    setErrMisread('');
    setErrTime('');
  };

  // Render/Update Charts
  useEffect(() => {
    const tests = [...state.tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isLight = document.documentElement.classList.contains('light');
    const tickColor = isLight ? '#64748b' : '#a1a1aa';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    // Trend Chart
    if (trendChartRef.current) {
      if (trendChartInstance.current) {
        trendChartInstance.current.data.labels = tests.map((t) => t.name || t.date);
        trendChartInstance.current.data.datasets[0].data = tests.map((t) => t.to);
        trendChartInstance.current.data.datasets[1].data = tests.map(() => state.settings.tt || 200);
        trendChartInstance.current.update('none');
      } else {
        trendChartInstance.current = new Chart(trendChartRef.current, {
          type: 'line',
          data: {
            labels: tests.map((t) => t.name || t.date),
            datasets: [
              {
                label: 'Total Score',
                data: tests.map((t) => t.to),
                borderColor: '#c9a84c',
                backgroundColor: 'rgba(201, 168, 76, 0.1)',
                tension: 0.3,
                fill: true,
                pointRadius: 4,
              },
              {
                label: 'Target Score',
                data: tests.map(() => state.settings.tt || 200),
                borderColor: 'rgba(107, 104, 99, 0.6)',
                borderDash: [5, 5],
                pointRadius: 0,
                fill: false,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
              y: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor }, suggestedMax: 300, min: 0 },
            },
            plugins: { legend: { display: false } },
          },
        });
      }
    }

    // Subject Radar Chart
    if (radarChartRef.current) {
      const avgPh = tests.length ? Math.round(tests.reduce((acc, t) => acc + (t.ph || 0), 0) / tests.length) : 0;
      const avgCh = tests.length ? Math.round(tests.reduce((acc, t) => acc + (t.ch || 0), 0) / tests.length) : 0;
      const avgMa = tests.length ? Math.round(tests.reduce((acc, t) => acc + (t.ma || 0), 0) / tests.length) : 0;

      if (radarChartInstance.current) {
        radarChartInstance.current.data.datasets[0].data = [avgPh, avgCh, avgMa];
        radarChartInstance.current.update('none');
      } else {
        radarChartInstance.current = new Chart(radarChartRef.current, {
          type: 'radar',
          data: {
            labels: ['Physics', 'Chemistry', 'Mathematics'],
            datasets: [
              {
                label: 'Average Score',
                data: [avgPh, avgCh, avgMa],
                backgroundColor: 'rgba(201, 168, 76, 0.25)',
                borderColor: '#c9a84c',
                pointBackgroundColor: '#c9a84c',
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              r: {
                ticks: { color: tickColor, backdropColor: 'transparent', font: { size: 9 } },
                grid: { color: gridColor },
                pointLabels: { color: tickColor, font: { size: 10 } },
              },
            },
          },
        });
      }
    }

    return () => {
      if (trendChartInstance.current) {
        trendChartInstance.current.destroy();
        trendChartInstance.current = null;
      }
      if (radarChartInstance.current) {
        radarChartInstance.current.destroy();
        radarChartInstance.current = null;
      }
    };
  }, [state.tests, state.settings.tt]);

  const avg = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);
  const avgPh = avg(state.tests.map((t) => t.ph || 0));
  const avgCh = avg(state.tests.map((t) => t.ch || 0));
  const avgMa = avg(state.tests.map((t) => t.ma || 0));
  const avgTotal = avg(state.tests.map((t) => t.to || 0));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <BarChart2 className="w-5 h-5 text-[var(--gold)]" /> Mock Test Analytics & Performance Engine
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Container */}
        <form onSubmit={handleAddTest} className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Plus className="w-4 h-4 text-[var(--gold)]" /> Log Mock Test Result
          </h3>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Test Name / Series</label>
            <input
              type="text"
              required
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Allen Minor 04 or MathonGo FT-1"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] focus:border-[var(--gold)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--tm)]" /> Date Taken
            </label>
            <input
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          {/* Subject Scores Grid */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-[var(--info)] mb-1 flex items-center gap-1">
                <Atom className="w-3 h-3" /> Physics (/100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={phScore}
                onChange={(e) => setPhScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--success)] mb-1 flex items-center gap-1">
                <FlaskConical className="w-3 h-3" /> Chemistry (/100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={chScore}
                onChange={(e) => setChScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[var(--gold)] mb-1 flex items-center gap-1">
                <Calculator className="w-3 h-3" /> Math (/100)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={maScore}
                onChange={(e) => setMaScore(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="0"
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
          </div>

          {/* Auto Total */}
          <div className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-3 flex items-center justify-between">
            <span className="text-xs font-bold text-[var(--ts)]">Calculated Total Score</span>
            <span className="font-mono text-base font-black text-[var(--gold)]">{autoTotal} / 300</span>
          </div>

          {/* Diagnostic Mistakes Breakdown */}
          <div className="space-y-2 pt-2 border-t border-[var(--b)]">
            <label className="block text-xs font-bold text-[var(--ts)]">Error Diagnostics Breakdown (Optional)</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <input
                type="number"
                min="0"
                value={errCalc}
                onChange={(e) => setErrCalc(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="Calculation Errors"
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--tp)] outline-none"
              />
              <input
                type="number"
                min="0"
                value={errConcept}
                onChange={(e) => setErrConcept(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="Conceptual Errors"
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--tp)] outline-none"
              />
              <input
                type="number"
                min="0"
                value={errMisread}
                onChange={(e) => setErrMisread(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="Misread Questions"
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--tp)] outline-none"
              />
              <input
                type="number"
                min="0"
                value={errTime}
                onChange={(e) => setErrTime(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                placeholder="Time Pressure Errors"
                className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-lg px-2.5 py-1 text-[11px] text-[var(--tp)] outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[var(--ts)] mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-[var(--tm)]" /> Notes & Strategy Remarks
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Silly mistake in Integration, time management was good"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-[var(--gold)] text-[var(--bg)] font-bold text-xs rounded-xl hover:bg-[var(--gold-hover)] transition-all cursor-pointer"
          >
            Log Test Result (+200 XP)
          </button>
        </form>

        {/* Charts & Summary Container */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--tm)]">AVG TOTAL</div>
              <div className="font-mono font-black text-lg text-[var(--gold)]">{avgTotal}/300</div>
            </div>
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--info)]">PHYSICS AVG</div>
              <div className="font-mono font-black text-lg text-[var(--tp)]">{avgPh}/100</div>
            </div>
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--success)]">CHEMISTRY AVG</div>
              <div className="font-mono font-black text-lg text-[var(--tp)]">{avgCh}/100</div>
            </div>
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-xl p-3 text-center">
              <div className="text-[10px] font-bold text-[var(--warning)]">MATH AVG</div>
              <div className="font-mono font-black text-lg text-[var(--tp)]">{avgMa}/100</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-[var(--tp)] flex items-center gap-1.5">
                <LineChart className="w-4 h-4 text-[var(--gold)]" /> Total Score Trend
              </div>
              <div className="h-[220px]">
                <canvas ref={trendChartRef} />
              </div>
            </div>

            <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-2">
              <div className="text-xs font-bold text-[var(--tp)] flex items-center gap-1.5">
                <PieChart className="w-4 h-4 text-[var(--gold)]" /> Subject Accuracy Radar
              </div>
              <div className="h-[220px]">
                <canvas ref={radarChartRef} />
              </div>
            </div>
          </div>

          {/* History Table */}
          <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-4 space-y-3">
            <h4 className="text-xs font-bold text-[var(--tp)]">Test History ({state.tests.length})</h4>

            {state.tests.length === 0 ? (
              <div className="text-center text-xs text-[var(--tm)] py-6">No test logs recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead>
                    <tr className="border-b border-[var(--b)] text-[var(--tm)] font-sans text-[11px]">
                      <th className="pb-2 font-bold">Test Name</th>
                      <th className="pb-2 font-bold">Date</th>
                      <th className="pb-2 font-bold text-[var(--info)]">Ph</th>
                      <th className="pb-2 font-bold text-[var(--success)]">Ch</th>
                      <th className="pb-2 font-bold text-[var(--warning)]">Ma</th>
                      <th className="pb-2 font-bold text-[var(--tp)]">Total</th>
                      <th className="pb-2 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--b)]">
                    {state.tests.map((t) => (
                      <tr key={t.id} className="hover:bg-[var(--bg-c2)]">
                        <td className="py-2.5 font-sans font-semibold text-[var(--tp)]">{t.name}</td>
                        <td className="py-2.5 text-[var(--tm)]">{t.date}</td>
                        <td className="py-2.5 text-[var(--info)] font-bold">{t.ph}</td>
                        <td className="py-2.5 text-[var(--success)] font-bold">{t.ch}</td>
                        <td className="py-2.5 text-[var(--warning)] font-bold">{t.ma}</td>
                        <td className="py-2.5 font-black text-[var(--gold)]">{t.to}/300</td>
                        <td className="py-2.5 text-right">
                          <button
                            onClick={() => {
                              const deleted = state.tests.find((x) => x.id === t.id) || null;
                              lastDeletedRef.current = deleted;
                              store.deleteMockTest(t.id);
                              onShowToast('Test log deleted', 'amber', () => {
                                if (lastDeletedRef.current) {
                                  store.addMockTest(lastDeletedRef.current, false);
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

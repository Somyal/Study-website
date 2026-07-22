import React, { useState, useEffect, useRef } from 'react';
import { store } from '../store';
import { calcSubjectPct } from '../utils/calculations';
import { Target, Atom, FlaskConical, Calculator, LineChart } from 'lucide-react';
import { Chart } from 'chart.js';

export const GoalsView: React.FC = () => {
  const [state, setState] = useState(store.getState());
  const chartRef = useRef<HTMLCanvasElement | null>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const physPct = calcSubjectPct('physics', state);
  const chemPct = calcSubjectPct('chemistry', state);
  const mathPct = calcSubjectPct('mathematics', state);

  const physTarget = state.goals.physics || 80;
  const chemTarget = state.goals.chemistry || 85;
  const mathTarget = state.goals.mathematics || 75;

  const handleUpdateGoal = (subject: 'physics' | 'chemistry' | 'mathematics', val: number) => {
    store.updateGoals({ [subject]: Math.max(0, Math.min(100, val)) });
  };

  useEffect(() => {
    if (!chartRef.current) return;
    const tests = [...state.tests].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isLight = document.documentElement.classList.contains('light');
    const tickColor = isLight ? '#64748b' : '#a1a1aa';
    const gridColor = isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)';

    if (chartInstance.current) {
      chartInstance.current.data.labels = tests.map((t) => t.name || t.date);
      chartInstance.current.data.datasets[0].data = tests.map((t) => t.ph);
      chartInstance.current.data.datasets[1].data = tests.map((t) => t.ch);
      chartInstance.current.data.datasets[2].data = tests.map((t) => t.ma);
      chartInstance.current.update('none');
    } else {
      chartInstance.current = new Chart(chartRef.current, {
        type: 'line',
        data: {
          labels: tests.map((t) => t.name || t.date),
          datasets: [
            { label: 'Physics', data: tests.map((t) => t.ph), borderColor: '#06b6d4', tension: 0.3 },
            { label: 'Chemistry', data: tests.map((t) => t.ch), borderColor: '#10b981', tension: 0.3 },
            { label: 'Mathematics', data: tests.map((t) => t.ma), borderColor: '#8b5cf6', tension: 0.3 },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
            y: { ticks: { color: tickColor, font: { size: 10 } }, grid: { color: gridColor } },
          },
        },
      });
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
        chartInstance.current = null;
      }
    };
  }, [state.tests]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" /> Target Benchmarks & Goal Setting
        </h2>
      </div>

      {/* Target Subject Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Physics Goal Card */}
        <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                <Atom className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--tp)]">Physics Target</h3>
            </div>
            <span className="font-mono font-black text-cyan-400 text-lg">{physPct}% / {physTarget}%</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ts)]">Target Completion (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={physTarget}
              onChange={(e) => handleUpdateGoal('physics', parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>

          <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${Math.min(100, (physPct / physTarget) * 100)}%` }} />
          </div>
        </div>

        {/* Chemistry Goal Card */}
        <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
                <FlaskConical className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--tp)]">Chemistry Target</h3>
            </div>
            <span className="font-mono font-black text-emerald-400 text-lg">{chemPct}% / {chemTarget}%</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ts)]">Target Completion (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={chemTarget}
              onChange={(e) => handleUpdateGoal('chemistry', parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>

          <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, (chemPct / chemTarget) * 100)}%` }} />
          </div>
        </div>

        {/* Math Goal Card */}
        <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                <Calculator className="w-5 h-5" />
              </div>
              <h3 className="font-extrabold text-sm text-[var(--tp)]">Math Target</h3>
            </div>
            <span className="font-mono font-black text-violet-400 text-lg">{mathPct}% / {mathTarget}%</span>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[var(--ts)]">Target Completion (%)</label>
            <input
              type="number"
              min="0"
              max="100"
              value={mathTarget}
              onChange={(e) => handleUpdateGoal('mathematics', parseInt(e.target.value) || 0)}
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
            />
          </div>

          <div className="w-full h-2 bg-[var(--bg-c3)] rounded-full overflow-hidden">
            <div className="h-full bg-violet-400 rounded-full" style={{ width: `${Math.min(100, (mathPct / mathTarget) * 100)}%` }} />
          </div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-bold text-[var(--tp)] flex items-center gap-2">
          <LineChart className="w-4 h-4 text-cyan-400" /> Subject Score Comparison History
        </h3>
        <div className="h-[300px]">
          <canvas ref={chartRef} />
        </div>
      </div>
    </div>
  );
};

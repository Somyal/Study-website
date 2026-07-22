import React, { useState, useEffect } from 'react';
import { store } from '../store';
import { Settings, Download, Upload, Trash2, Calendar, Target, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());
  const [m1Date, setM1Date] = useState(state.dates.m1);
  const [m2Date, setM2Date] = useState(state.dates.m2);
  const [adDate, setAdDate] = useState(state.dates.ad);
  const [dailyTarget, setDailyTarget] = useState(state.settings.dt);
  const [testTarget, setTestTarget] = useState(state.settings.tt);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateDates({ m1: m1Date, m2: m2Date, ad: adDate });
    store.updateSettings({ dt: dailyTarget, tt: testTarget });
    onShowToast('Settings saved successfully!', 'emerald');
  };

  const handleExportJSON = () => {
    const jsonStr = store.exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jee_command_center_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onShowToast('Backup data exported!', 'emerald');
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      const success = store.importData(content);
      if (success) {
        onShowToast('Backup imported successfully!', 'emerald');
      } else {
        onShowToast('Invalid backup JSON file', 'rose');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    store.resetAllData();
    setIsResetModalOpen(false);
    onShowToast('All data reset to defaults.', 'rose');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Settings className="w-5 h-5 text-slate-400" /> Settings & Data Management
        </h2>
      </div>

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-6 space-y-6">
        {/* Exam Dates */}
        <div className="space-y-3">
          <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Calendar className="w-4 h-4 text-cyan-400" /> JEE Exam Dates Configuration
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-cyan-400 mb-1">JEE Main Session 1</label>
              <input
                type="date"
                value={m1Date}
                onChange={(e) => setM1Date(e.target.value)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-violet-400 mb-1">JEE Main Session 2</label>
              <input
                type="date"
                value={m2Date}
                onChange={(e) => setM2Date(e.target.value)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-amber-400 mb-1">JEE Advanced</label>
              <input
                type="date"
                value={adDate}
                onChange={(e) => setAdDate(e.target.value)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
              />
            </div>
          </div>
        </div>

        {/* Target Thresholds */}
        <div className="space-y-3 pt-4 border-t border-[var(--b)]">
          <h3 className="text-sm font-extrabold text-[var(--tp)] flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" /> Daily Target Thresholds
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Daily Study Target (Hours)</label>
              <input
                type="number"
                min="1"
                max="24"
                value={dailyTarget}
                onChange={(e) => setDailyTarget(parseInt(e.target.value) || 8)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Mock Test Target Score (/300)</label>
              <input
                type="number"
                min="0"
                max="300"
                value={testTarget}
                onChange={(e) => setTestTarget(parseInt(e.target.value) || 200)}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] font-mono outline-none"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
        >
          <CheckCircle2 className="w-4 h-4" /> Save Configuration
        </button>
      </form>

      {/* Data Backup & Restore */}
      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-6 space-y-4">
        <h3 className="text-sm font-extrabold text-[var(--tp)]">Data Mobility & Offline Backup</h3>
        <p className="text-xs text-[var(--ts)]">
          Export your preparation logs, test history, badges, and mistake vault to JSON for offline backup or machine transfer.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleExportJSON}
            className="px-4 py-2.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" /> Download JSON Backup
          </button>

          <label className="px-4 py-2.5 bg-violet-500/20 text-violet-300 border border-violet-500/40 hover:bg-violet-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer">
            <Upload className="w-4 h-4" /> Import Backup JSON
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-rose-500/5 border border-rose-500/30 rounded-2xl p-6 space-y-3">
        <h3 className="text-sm font-extrabold text-rose-400 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" /> Danger Zone
        </h3>
        <p className="text-xs text-[var(--ts)]">
          Permanently erase all syllabus progress, mock test logs, XP, badges, and settings. This action cannot be undone.
        </p>
        <button
          onClick={() => setIsResetModalOpen(true)}
          className="px-4 py-2 bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Trash2 className="w-4 h-4" /> Reset All Data
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[var(--bg-c)] border border-rose-500/40 rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-extrabold text-rose-400 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Reset All Data
            </h3>
            <p className="text-xs text-[var(--ts)]">
              This will permanently erase all syllabus completion records, test scores, badges, and notes. Are you sure?
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-c2)] text-[var(--ts)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleResetData}
                className="px-5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

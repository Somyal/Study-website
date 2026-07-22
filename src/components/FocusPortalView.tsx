import React, { useState, useEffect, useRef, useMemo, useCallback, memo } from 'react';
import { store, getLocalDateString } from '../store';
import { Rocket, Pause, Play, Square, ExternalLink, Maximize2, Minimize2, Coffee, Target, Sparkles, Check, Monitor } from 'lucide-react';

interface FocusPortalViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

const QUICK_LINKS = [
  { label: 'Physics Wallah', url: 'https://www.pw.live' },
  { label: 'YouTube', url: 'https://www.youtube.com' },
  { label: 'Unacademy', url: 'https://unacademy.com' },
  { label: 'Physics Galaxy', url: 'https://physicsgalaxy.com' },
];

function formatTimer(ms: number) {
  const hh = Math.floor(ms / 3600000);
  const mm = Math.floor((ms % 3600000) / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

function formatBreak(ms: number) {
  const mm = Math.floor((ms % 3600000) / 60000);
  const ss = Math.floor((ms % 60000) / 1000);
  return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
}

export const FocusPortalView: React.FC<FocusPortalViewProps> = ({ onShowToast }) => {
  const [urlInput, setUrlInput] = useState(
    () => store.getState().focusUrl || 'https://www.pw.live/study-v2/batches'
  );
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [subjectLabel, setSubjectLabel] = useState('General');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingHours, setPendingHours] = useState(0);
  const [questions, setQuestions] = useState<number | ''>('');
  const [ratio, setRatio] = useState<'practice' | 'lecture' | 'balanced'>('practice');
  const [notes, setNotes] = useState('');
  const [pipAvailable, setPipAvailable] = useState(false);

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const breakStartRef = useRef<number | null>(null);
  const elapsedMsRef = useRef<number>(0);
  const breakMsRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pipWindowRef = useRef<Window | null>(null);
  const timerDisplayRef = useRef<HTMLDivElement | null>(null);
  const breakDisplayRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    setPipAvailable(typeof window !== 'undefined' && 'documentPictureInPicture' in window);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // notify extension of focus status
  const notifyExtension = useCallback((active: boolean) => {
    try {
      const extId = 'jee-focus-shield';
      const c = (window as any).chrome;
      if (c && c.runtime && c.runtime.sendMessage) {
        c.runtime.sendMessage(extId, { type: 'FOCUS_STATUS', active });
      }
      if (c && c.storage && c.storage.local) {
        c.storage.local.set({ focusActive: active });
      }
    } catch {
      // extension not installed or context unavailable
    }
  }, []);

  // Inject shared theme styles into PiP document
  const injectPipTheme = useCallback((doc: Document) => {
    const style = doc.createElement('style');
    style.textContent = `
      :root {
        --bg: #0e0e10; --bg-c: #17171a; --bg-c2: #1f1f23; --bg-c3: #27272c;
        --b: rgba(255,255,255,0.06); --bh: rgba(255,255,255,0.12);
        --tp: #e8e4df; --ts: #9d9a95; --tm: #6b6863;
        --gold: #c9a84c; --gold-muted: rgba(201,168,76,0.12); --gold-border: rgba(201,168,76,0.25);
        --success: #4a9e7a; --warning: #c47a2b; --info: #5b8fa8; --error: #b85450;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0; background: var(--bg); color: var(--tp);
        font-family: system-ui, -apple-system, sans-serif;
        display: flex; align-items: center; justify-content: center; min-height: 100vh;
      }
      .pip-card {
        background: var(--bg-c); border: 1px solid var(--b); border-radius: 16px;
        padding: 18px; width: 300px; box-shadow: 0 10px 30px rgba(0,0,0,0.4);
      }
      .timer { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 28px; font-weight: 800; color: var(--gold); }
      .row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
      .btn {
        border: 1px solid var(--b); background: var(--bg-c2); color: var(--tp);
        padding: 8px 12px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer;
      }
      .btn-primary { background: var(--gold); color: var(--bg); border-color: rgba(0,0,0,0.08); }
      .btn-danger { background: rgba(184,84,80,0.15); color: var(--error); border-color: rgba(184,84,80,0.35); }
      .pill {
        display: inline-block; background: var(--gold-muted); color: var(--gold); border: 1px solid var(--gold-border);
        padding: 3px 10px; border-radius: 9999px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
      }
    `;
    doc.head.appendChild(style);
  }, []);

  const openPipWindow = useCallback(async () => {
    if (!('documentPictureInPicture' in window)) {
      onShowToast('Document Picture-in-Picture is not supported. Please update Chrome/Edge.', 'rose');
      return;
    }

    try {
      const pipWin = await (window as any).documentPictureInPicture.requestWindow({ width: 340, height: 220 });
      pipWindowRef.current = pipWin;
      injectPipTheme(pipWin.document);

      const frag = pipWin.document.createDocumentFragment();
      const card = pipWin.document.createElement('div');
      card.className = 'pip-card';
      card.innerHTML = `
        <div class="row" style="margin-bottom:12px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span id="statusDot" style="width:8px;height:8px;border-radius:50%;background:var(--success);"></span>
            <span id="subjectLabel" class="pill">${subjectLabel}</span>
          </div>
          <button id="btnEnd" class="btn btn-danger">🛑 End</button>
        </div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
          <div id="timerDisplay" class="timer">00:00:00</div>
        </div>
        <div id="breakRow" style="display:none;align-items:center;gap:8px;margin-bottom:10px;">
          <span style="font-size:11px;color:var(--warning);font-weight:700;">Break</span>
          <span id="breakDisplay" style="font-size:12px;font-weight:700;color:var(--warning);">00:00</span>
        </div>
        <div class="row">
          <button id="btnPause" class="btn">⏸️ Pause</button>
          <button id="btnResume" class="btn btn-primary" style="display:none;">▶️ Resume</button>
        </div>
      `;
      frag.appendChild(card);
      pipWin.document.body.appendChild(frag);

      const timerEl = pipWin.document.getElementById('timerDisplay') as HTMLDivElement | null;
      const breakEl = pipWin.document.getElementById('breakDisplay') as HTMLSpanElement | null;
      timerDisplayRef.current = timerEl;
      breakDisplayRef.current = breakEl;

      const startActiveTicker = () => {
        clearTimer();
        timerRef.current = window.setInterval(() => {
          if (!startTimeRef.current) return;
          const ms = accumulatedRef.current + (Date.now() - startTimeRef.current);
          elapsedMsRef.current = ms;
          if (timerDisplayRef.current) timerDisplayRef.current.textContent = formatTimer(ms);
        }, 1000);
      };

      const startBreakTicker = () => {
        clearTimer();
        timerRef.current = window.setInterval(() => {
          if (!breakStartRef.current) return;
          const ms = Date.now() - breakStartRef.current;
          breakMsRef.current = ms;
          if (breakDisplayRef.current) breakDisplayRef.current.textContent = formatBreak(ms);
        }, 1000);
      };

      pipWin.document.getElementById('btnEnd')?.addEventListener('click', () => {
        handleEndSession();
      });

      const btnPause = pipWin.document.getElementById('btnPause');
      const btnResume = pipWin.document.getElementById('btnResume');
      btnPause?.addEventListener('click', () => {
        clearTimer();
        if (startTimeRef.current) {
          accumulatedRef.current += Date.now() - startTimeRef.current;
          elapsedMsRef.current = accumulatedRef.current;
          startTimeRef.current = null;
        }
        breakStartRef.current = Date.now();
        breakMsRef.current = 0;
        setIsPaused(true);
        if (timerDisplayRef.current) timerDisplayRef.current.textContent = formatTimer(elapsedMsRef.current);
        const br = document.getElementById('breakRow');
        if (br) br.style.display = 'flex';
        if (breakDisplayRef.current) breakDisplayRef.current.textContent = '00:00';
        if (btnPause) btnPause.style.display = 'none';
        if (btnResume) btnResume.style.display = 'inline-block';
        startBreakTicker();
        onShowToast('Session paused — break timer active', 'amber');
      });

      btnResume?.addEventListener('click', () => {
        clearTimer();
        breakStartRef.current = null;
        breakMsRef.current = 0;
        setIsPaused(false);
        startTimeRef.current = Date.now();
        if (timerDisplayRef.current) timerDisplayRef.current.textContent = formatTimer(elapsedMsRef.current);
        if (btnPause) btnPause.style.display = 'inline-block';
        if (btnResume) btnResume.style.display = 'none';
        const br = document.getElementById('breakRow');
        if (br) br.style.display = 'none';
        startActiveTicker();
        onShowToast('Session resumed', 'emerald');
      });

      pipWin.addEventListener('pagehide', () => {
        pipWindowRef.current = null;
        // keep session active in main app; user can end from main UI
        onShowToast('Floating timer closed. Use main window to manage session.', 'amber');
      });

      startActiveTicker();
    } catch (err) {
      onShowToast('Document PiP failed: ' + (err as Error).message, 'rose');
    }
  }, [clearTimer, injectPipTheme, notifyExtension, onShowToast, subjectLabel]);

  useEffect(() => {
    return () => clearTimer();
  }, [clearTimer]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      const doc = document as Document & { webkitFullscreenElement?: Element | null; msFullscreenElement?: Element | null };
      const fsElement = document.fullscreenElement || doc.webkitFullscreenElement || doc.msFullscreenElement;
      setIsFullscreen(!!fsElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleLaunch = async () => {
    store.updateState((draft) => {
      draft.focusUrl = urlInput;
    });

    setIsSessionActive(true);
    setIsPaused(false);
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    breakStartRef.current = null;
    elapsedMsRef.current = 0;
    breakMsRef.current = 0;

    notifyExtension(true);

    clearTimer();
    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      const ms = accumulatedRef.current + (Date.now() - startTimeRef.current);
      elapsedMsRef.current = ms;
    }, 1000);

    onShowToast('Focus session launched!', 'violet');
    if (pipAvailable) {
      await openPipWindow();
    } else {
      onShowToast('Pop-out timer not supported. Use the in-app timer below.', 'amber');
    }
  };

  const handleTogglePause = () => {
    if (!isPaused) {
      clearTimer();
      if (startTimeRef.current) {
        accumulatedRef.current += Date.now() - startTimeRef.current;
        elapsedMsRef.current = accumulatedRef.current;
        startTimeRef.current = null;
      }
      breakStartRef.current = Date.now();
      breakMsRef.current = 0;
      setIsPaused(true);
      onShowToast('Session paused — break timer active', 'amber');
    } else {
      clearTimer();
      startTimeRef.current = Date.now();
      breakStartRef.current = null;
      breakMsRef.current = 0;
      setIsPaused(false);
      timerRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        const ms = accumulatedRef.current + (Date.now() - startTimeRef.current);
        elapsedMsRef.current = ms;
        const el = document.getElementById('mainTimer');
        if (el) el.textContent = formatTimer(ms);
      }, 1000);
      onShowToast('Session resumed', 'emerald');
    }
  };

  const handleEndSession = () => {
    let totalMs = accumulatedRef.current;
    if (!isPaused && startTimeRef.current) {
      totalMs += Date.now() - startTimeRef.current;
    }
    totalMs = Math.max(totalMs, elapsedMsRef.current);

    if (totalMs < 5000) {
      onShowToast('Session too short to log (< 5 seconds)', 'rose');
      return;
    }

    const activeHrs = Math.max(0.1, Math.round((totalMs / 3600000) * 10) / 10);
    setPendingHours(activeHrs);
    setIsModalOpen(true);
  };

  const handleSaveModalSession = (e: React.FormEvent) => {
    e.preventDefault();
    const hrs = pendingHours || 0.1;
    const qsVal = typeof questions === 'number' ? questions : 0;
    const noteVal = notes.trim() || `Focus Portal Session — ${hrs}h`;

    let lc = 0,
      pr = 0;
    if (ratio === 'lecture') {
      lc = hrs;
    } else if (ratio === 'practice') {
      pr = hrs;
    } else {
      lc = Math.round((hrs / 2) * 10) / 10;
      pr = Math.round((hrs - lc) * 10) / 10;
    }

    const todayStr = getLocalDateString();
    store.logStudySession({
      date: todayStr,
      lc,
      pr,
      tot: hrs,
      qs: qsVal,
      no: noteVal,
    });

    onShowToast(`Session logged: ${hrs}h & +100 XP!`, 'emerald');

    clearTimer();
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    elapsedMsRef.current = 0;
    breakMsRef.current = 0;
    setIsSessionActive(false);
    setIsPaused(false);
    setIsModalOpen(false);
    setQuestions('');
    setNotes('');
    notifyExtension(false);
  };

  const handleToggleFullscreen = () => {
    const element = containerRef.current;
    if (!element) return;

    try {
      if (!isFullscreen) {
        if (element.requestFullscreen) {
          element.requestFullscreen().catch(() => {
            onShowToast('Fullscreen denied by browser permissions', 'rose');
          });
        } else {
          const el = element as HTMLElement & { webkitRequestFullscreen?: () => Promise<void>; msRequestFullscreen?: () => Promise<void> };
          if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
          } else if (el.msRequestFullscreen) {
            el.msRequestFullscreen();
          } else {
            onShowToast('Fullscreen is not supported on this browser', 'rose');
          }
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else {
          const doc = document as Document & { webkitExitFullscreen?: () => Promise<void>; msExitFullscreen?: () => Promise<void> };
          if (doc.webkitExitFullscreen) {
            doc.webkitExitFullscreen();
          } else if (doc.msExitFullscreen) {
            doc.msExitFullscreen();
          }
        }
      }
    } catch {
      onShowToast('Fullscreen mode encountered an error', 'rose');
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 bg-[var(--bg)] transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Rocket className="w-5 h-5 text-[var(--gold)]" /> Focus Portal
        </h2>
        {!isSessionActive && (
          <div className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-[var(--gold-muted)] text-[var(--gold)] border border-[var(--gold-border)]">
            PiP {pipAvailable ? '✅ Supported' : '❌ Not Supported'}
          </div>
        )}
      </div>

      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--ts)]">Study Subject / Topic</label>
            <input
              type="text"
              value={subjectLabel}
              onChange={(e) => setSubjectLabel(e.target.value)}
              placeholder="e.g. Physics — Rotational Motion"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] focus:border-[var(--gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--tp)] outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-[var(--ts)]">Study Platform</label>
            <input
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://www.pw.live/study-v2/batches"
              className="w-full bg-[var(--bg-c2)] border border-[var(--b)] focus:border-[var(--gold)] rounded-xl px-4 py-2.5 text-xs text-[var(--tp)] outline-none"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLaunch}
            className="px-5 py-2.5 bg-[var(--gold)] text-[var(--bg)] font-bold text-xs rounded-xl hover:bg-[var(--gold-hover)] transition-all flex items-center gap-2 cursor-pointer"
          >
            <Rocket className="w-4 h-4" /> Start Focus Session
          </button>

          {!isSessionActive && (
            <>
              {QUICK_LINKS.map((l) => (
                <a
                  key={l.url}
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2.5 bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] text-[var(--tp)] font-bold text-xs rounded-xl transition-all flex items-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-[var(--gold)]" /> {l.label}
                </a>
              ))}
            </>
          )}
        </div>
      </div>

      {isSessionActive && (
        <div className="bg-[var(--gold-muted)] border border-[var(--gold-border)] rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span
              className={`w-3 h-3 rounded-full ${
                isPaused ? 'bg-[var(--warning)] animate-pulse' : 'bg-[var(--success)] animate-ping'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[var(--tm)] uppercase">
                  {isPaused ? 'SESSION PAUSED' : 'SESSION IN PROGRESS'}
                </span>
                <span className="pill">{subjectLabel}</span>
              </div>
              <div id="mainTimer" className="font-mono text-2xl font-black text-[var(--gold)]">
                {formatTimer(elapsedMsRef.current)}
              </div>
              {isPaused && (
                <div className="flex items-center gap-2">
                  <Coffee className="w-3.5 h-3.5 text-[var(--warning)]" />
                  <span className="text-[10px] text-[var(--warning)] font-bold">Break: {formatBreak(breakMsRef.current)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 bg-[var(--gold-muted)] text-[var(--warning)] border border-[var(--gold-border)] hover:bg-[var(--gold-muted)] rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-[rgba(184,84,80,0.15)] text-[var(--error)] border border-[var(--error)] hover:bg-[rgba(184,84,80,0.25)] rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" /> End & Save Log
            </button>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveModalSession}
            className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-6 w-full max-w-md space-y-4"
          >
            <h3 className="text-base font-extrabold text-[var(--gold)] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[var(--gold)]" /> Session Completed!
            </h3>
            <p className="text-xs text-[var(--ts)]">Log your session details to update your study tracker and claim XP.</p>

            <div className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--ts)]">Active Study Time</span>
              <span className="font-mono text-base font-extrabold text-[var(--gold)]">{pendingHours} hrs</span>
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
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Session Focus</label>
              <select
                value={ratio}
                onChange={(e) => setRatio(e.target.value as 'practice' | 'lecture' | 'balanced')}
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
              >
                <option value="practice">Practice / Problem Solving</option>
                <option value="lecture">Lecture / Theory</option>
                <option value="balanced">Balanced (50% Theory, 50% Practice)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[var(--ts)] mb-1">Session Notes</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Topics covered..."
                className="w-full bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl px-3 py-2 text-xs text-[var(--tp)] outline-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-[var(--bg-c2)] text-[var(--ts)] rounded-xl text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[var(--gold)] text-[var(--bg)] rounded-xl text-xs font-bold hover:bg-[var(--gold-hover)] flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Save Log (+100 XP)
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default FocusPortalView;
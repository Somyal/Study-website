import React, { useState, useEffect, useRef } from 'react';
import { store } from '../store';
import { Rocket, Pause, Play, Square, ExternalLink, Maximize2, Minimize2, Coffee, Target, AlertTriangle, Sparkles, Check } from 'lucide-react';

interface FocusPortalViewProps {
  onShowToast: (msg: string, type?: string) => void;
}

export const FocusPortalView: React.FC<FocusPortalViewProps> = ({ onShowToast }) => {
  const [state, setState] = useState(store.getState());
  const [urlInput, setUrlInput] = useState(state.focusUrl || 'https://www.pw.live/study-v2/batches');
  const [iframeUrl, setIframeUrl] = useState('');
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [breakMs, setBreakMs] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingHours, setPendingHours] = useState(0);
  const [questions, setQuestions] = useState<number | ''>('');
  const [ratio, setRatio] = useState<'practice' | 'lecture' | 'balanced'>('practice');
  const [notes, setNotes] = useState('');

  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedRef = useRef<number>(0);
  const breakStartRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => setState(store.getState()));
    return unsubscribe;
  }, []);

  // Fullscreen change listener
  useEffect(() => {
    const handleFullscreenChange = () => {
      const fsElement =
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).msFullscreenElement;
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

  const transformUrl = (rawUrl: string): string => {
    if (!rawUrl) return 'about:blank';
    let url = rawUrl.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtube.com') && u.searchParams.get('v')) {
        return `https://www.youtube.com/embed/${u.searchParams.get('v')}?autoplay=1`;
      }
      if (u.hostname.includes('youtu.be')) {
        const id = u.pathname.replace('/', '');
        if (id) return `https://www.youtube.com/embed/${id}?autoplay=1`;
      }
    } catch (e) {}
    return url;
  };

  const handleLaunch = () => {
    const embedUrl = transformUrl(urlInput);
    setIframeUrl(embedUrl);
    store.updateState((draft) => {
      draft.focusUrl = urlInput;
    });

    // Start Session Stopwatch
    if (timerRef.current) clearInterval(timerRef.current);
    startTimeRef.current = Date.now();
    accumulatedRef.current = 0;
    breakStartRef.current = null;
    setIsSessionActive(true);
    setIsPaused(false);
    setElapsedMs(0);
    setBreakMs(0);

    timerRef.current = window.setInterval(() => {
      if (!startTimeRef.current) return;
      setElapsedMs(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }, 1000);

    onShowToast('Focus session launched!', 'violet');
  };

  const handleTogglePause = () => {
    if (!isPaused) {
      // Pause
      if (timerRef.current) clearInterval(timerRef.current);
      if (startTimeRef.current) {
        accumulatedRef.current += Date.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
      breakStartRef.current = Date.now();
      setIsPaused(true);

      timerRef.current = window.setInterval(() => {
        if (breakStartRef.current) {
          setBreakMs(Date.now() - breakStartRef.current);
        }
      }, 1000);
      onShowToast('Session paused — break timer active', 'amber');
    } else {
      // Resume
      if (timerRef.current) clearInterval(timerRef.current);
      startTimeRef.current = Date.now();
      breakStartRef.current = null;
      setIsPaused(false);

      timerRef.current = window.setInterval(() => {
        if (!startTimeRef.current) return;
        setElapsedMs(accumulatedRef.current + (Date.now() - startTimeRef.current));
      }, 1000);
      onShowToast('Session resumed', 'emerald');
    }
  };

  const handleEndSession = () => {
    let totalMs = accumulatedRef.current;
    if (!isPaused && startTimeRef.current) {
      totalMs += Date.now() - startTimeRef.current;
    }

    if (totalMs < 5000) {
      onShowToast('Session too short to log (< 5 seconds)', 'rose');
      return;
    }

    const activeHrs = Math.max(0.1, Math.round((totalMs / 3600000) * 10) / 10);
    setPendingHours(activeHrs);
    setIsModalOpen(true);
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
        } else if ((element as any).webkitRequestFullscreen) {
          (element as any).webkitRequestFullscreen();
        } else if ((element as any).msRequestFullscreen) {
          (element as any).msRequestFullscreen();
        } else {
          onShowToast('Fullscreen is not supported on this browser', 'rose');
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if ((document as any).webkitExitFullscreen) {
          (document as any).webkitExitFullscreen();
        } else if ((document as any).msExitFullscreen) {
          (document as any).msExitFullscreen();
        }
      }
    } catch (e) {
      onShowToast('Fullscreen mode encountered an error', 'rose');
    }
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

    const todayStr = new Date().toISOString().split('T')[0];
    store.logStudySession({
      date: todayStr,
      lc,
      pr,
      tot: hrs,
      qs: qsVal,
      no: noteVal,
    });

    onShowToast(`Session logged: ${hrs}h & +100 XP!`, 'emerald');

    // Reset Stopwatch
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
    startTimeRef.current = null;
    accumulatedRef.current = 0;
    setIsSessionActive(false);
    setIsPaused(false);
    setIsModalOpen(false);
    setQuestions('');
    setNotes('');
  };

  const formatTimer = (ms: number) => {
    const hh = Math.floor(ms / 3600000);
    const mm = Math.floor((ms % 3600000) / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  const formatBreak = (ms: number) => {
    const mm = Math.floor((ms % 3600000) / 60000);
    const ss = Math.floor((ms % 60000) / 1000);
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="space-y-6 bg-[var(--bg)] transition-colors duration-200">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold text-[var(--tp)] flex items-center gap-2">
          <Rocket className="w-5 h-5 text-violet-400" /> Focus Portal & Distraction-Free Study Browser
        </h2>
      </div>

      {/* URL Input Bar */}
      <div className="bg-[var(--bg-c)] border border-[var(--b)] rounded-2xl p-5 space-y-3">
        <label className="block text-xs font-semibold text-[var(--ts)]">Study Platform URL</label>
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="e.g. https://www.pw.live/study-v2/batches or YouTube link..."
            className="flex-1 bg-[var(--bg-c2)] border border-[var(--b)] focus:border-cyan-500 rounded-xl px-4 py-2.5 text-xs text-[var(--tp)] outline-none"
          />
          <button
            onClick={handleLaunch}
            className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-violet-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-violet-500/20 hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Rocket className="w-4 h-4" /> Launch Portal
          </button>
          <button
            onClick={handleToggleFullscreen}
            className="px-4 py-2.5 bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] text-[var(--tp)] font-bold text-xs rounded-xl transition-all flex items-center gap-2 cursor-pointer"
            title="Expand to Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-violet-400" /> : <Maximize2 className="w-4 h-4 text-violet-400" />}
            <span>{isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}</span>
          </button>
          <a
            href={transformUrl(urlInput)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 bg-[var(--bg-c2)] border border-[var(--b)] hover:border-[var(--bh)] text-[var(--tp)] font-bold text-xs rounded-xl transition-all flex items-center gap-2"
            title="Open in new window (if iframe is blocked by site)"
          >
            <ExternalLink className="w-4 h-4 text-cyan-400" /> Pop-Out
          </a>
        </div>
      </div>

      {/* Active Session Timer Bar */}
      {isSessionActive && (
        <div className="bg-gradient-to-r from-violet-500/15 via-cyan-500/10 to-emerald-500/15 border border-violet-500/30 rounded-2xl p-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-4">
            <span
              className={`w-3 h-3 rounded-full ${
                isPaused ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400 animate-ping'
              }`}
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-[var(--tm)] uppercase">
                  {isPaused ? 'SESSION PAUSED' : 'SESSION IN PROGRESS'}
                </span>
                {isPaused && (
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <Coffee className="w-3 h-3" /> Break: {formatBreak(breakMs)}
                  </span>
                )}
              </div>
              <div className="font-mono text-2xl font-black text-cyan-400">{formatTimer(elapsedMs)}</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleTogglePause}
              className="px-4 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </button>
            <button
              onClick={handleEndSession}
              className="px-4 py-2 bg-rose-500/20 text-rose-300 border border-rose-500/40 hover:bg-rose-500/30 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" /> End & Save Log
            </button>
          </div>
        </div>
      )}

      {/* Iframe Viewport Container */}
      <div className={`bg-[var(--bg-c2)] border border-[var(--b)] rounded-2xl p-2 space-y-2 flex-1 flex flex-col ${isFullscreen ? 'h-full' : ''}`}>
        <div className="bg-[var(--bg-c3)] rounded-xl px-4 py-2 flex items-center justify-between text-xs text-[var(--tm)] font-semibold flex-shrink-0">
          <span className="flex items-center gap-1.5 font-bold">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> DISTRACTION-FREE STUDY VIEWPORT
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleFullscreen}
              className="hover:text-[var(--tp)] flex items-center gap-1 text-[11px] cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            </button>
            <span className="text-[10px] hidden sm:inline">Note: If site blocks iframe, use &ldquo;Pop-Out&rdquo;.</span>
          </div>
        </div>

        {iframeUrl ? (
          <iframe
            id="fiframe"
            src={iframeUrl}
            className={`w-full rounded-xl border-none bg-black flex-1 ${isFullscreen ? 'h-full min-h-[85vh]' : 'h-[600px]'}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        ) : (
          <div className="h-[500px] flex flex-col items-center justify-center text-center text-xs text-[var(--tm)] space-y-2 flex-1">
            <Rocket className="w-10 h-10 text-violet-400/40" />
            <div>Click &ldquo;Launch Portal&rdquo; to load your study platform inside this browser viewport.</div>
          </div>
        )}
      </div>

      {/* Session Completion Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveModalSession}
            className="bg-[var(--bg-c)] border border-[var(--bh)] rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
          >
            <h3 className="text-base font-extrabold text-cyan-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400" /> Session Completed!
            </h3>
            <p className="text-xs text-[var(--ts)]">
              Log your session details to update your study tracker and claim XP.
            </p>

            <div className="bg-[var(--bg-c2)] border border-[var(--b)] rounded-xl p-3 flex items-center justify-between">
              <span className="text-xs font-semibold text-[var(--ts)]">Active Study Time</span>
              <span className="font-mono text-base font-extrabold text-emerald-400">{pendingHours} hrs</span>
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
                onChange={(e) => setRatio(e.target.value as any)}
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
                className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
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

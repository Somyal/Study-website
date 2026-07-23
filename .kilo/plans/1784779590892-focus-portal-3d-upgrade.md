# JEE Command Center — Focus Portal Upgrade & 3D Aesthetics Plan

## 1. Repository Inspection Summary

### Current Packages
- React 19.0.1, Vite 6.2.3, TypeScript ~5.8.2
- `motion` ^12.23.24 (Framer-Motion v12 successor — used for tab transitions and card entry animations)
- `@tailwindcss/vite` + `tailwindcss` ^4.1.14
- `three`, `@react-three/fiber` **NOT installed** (`@react-three/drei` intentionally excluded for bundle size)

### Key Discovery: Timer Display Bug
In `FocusPortalView.tsx`:
- `handleLaunch` starts an interval that updates `elapsedMsRef.current` but **does not touch the DOM** (no `textContent` update).
- The main timer display (`<div id="mainTimer">`) reads `elapsedMsRef.current` at render time.
- It only updates when App.tsx re-renders for unrelated reasons (e.g., toast state changes), causing the timer to freeze at `00:00:00` until a parent re-render happens.
- **Decision in this plan:** Replace the ref-only pattern with a React state `displayMs` driven by a single master interval.

### Component Session State Ownership
Focus session state (`isSessionActive`, `isPaused`, timer refs, PiP refs) is **entirely component-local** (`FocusPortalView`). No store changes needed. If the user switches tabs, the component unmounts, the timer clears, and session state resets. This is **intentional and preserved** — a "distraction-free" reset on tab leave.

---

## 2. Decision Tree (Resolved)

| Question | Decision |
|---|---|
| URL validation policy | Any `https?://` URL accepted. Auto-prepend `https://` if missing. No hardcoded platform whitelist. |
| Popup blocker handling | `window.open` result checked for `null`. Toast warning if blocked; timer still starts. |
| PiP lifecycle on user-initiated close | `pagehide` event sets `isPipOpen(false)`. `closePipWindow` guards with `pipWindowRef.current?.closed`. |
| Timer architecture | Single master interval (~250ms) updates: `elapsedMsRef.current` (for end-session calc), `setDisplayMs(state)` (React-driven main timer), and PiP DOM if open. |
| motion.div + TiltCard transform conflict | **TiltCard nested INSIDE motion.div.** Outer element: entry `translateY` animation. Inner element: hover `perspective rotateX/Y`. Styles live on different DOM nodes — no conflict. |
| Three.js minimum versions for React 19 + Vite 6 | `three >= 0.168.0`, `@react-three/fiber >= 9.0.0` |
| Particle approach | Use native R3F elements (`<points>`, `<bufferGeometry>`, `<pointsMaterial>`) instead of `@react-three/drei` helpers. Build geometry manually in `useMemo`, animate in `useFrame`. |
| Canvas cleanup on unmount | R3F handles WebGL context disposal automatically on Canvas unmount. No manual cleanup needed. |
| `handleLaunch` signature | Change from `async` to `sync` — PiP auto-launch removed. |

---

## 3. Step-by-Step Execution Checklist

### PHASE A — Auto-Launch & PiP Decoupling

**Step A1 — Install Three.js deps**
```bash
npm install three@^0.170.0 @react-three/fiber@^9.0.0
```
Verify: `npm ls three @react-three/fiber`

**Step A2 — Create `src/utils/urlValidation.ts`**
Export two functions:
- `isValidStudyUrl(raw: string): boolean` — checks `https?://` scheme. Accepts full URLs including query strings and hashes (`https://www.youtube.com/watch?v=...`, `https://www.pw.live/study-v2/batches`). Auto-prepends `https://` for missing-scheme inputs before validation.
- `normaliseUrl(raw: string): string` — prepends `https://` if missing. **Preserves the full input string including query strings and hashes.** Does NOT strip, encode, or modify anything beyond the scheme prefix.

**Step A3 — Refactor timer state in FocusPortalView.tsx**
- Add `const [displayMs, setDisplayMs] = useState(0);`
- Extract `startMasterTimer` helper: clears existing interval, starts one `setInterval` (~250ms) that:
  1. Calculates `ms` from refs
  2. Sets `elapsedMsRef.current = ms`
  3. Sets `displayMs(ms)`
  4. If PiP timer element exists, updates its `textContent`
- Replace all inline `window.setInterval` calls with `startMasterTimer()`
- Change main timer JSX from `{formatTimer(elapsedMsRef.current)}` to `{formatTimer(displayMs)}`

**Step A4 — Refactor `handleLaunch` (was async, now sync)**
1. Validate URL via `isValidStudyUrl(urlInput)`. If invalid → toast error, return.
2. Normalise URL via `normaliseUrl(urlInput)`.
3. Persist to store: `store.updateState(d => d.focusUrl = normalisedUrl)`.
4. `const newTab = window.open(normalisedUrl, '_blank', 'noopener,noreferrer')`. If `newTab === null` → toast `'Popup blocked — allow popups for this site'`.
5. Reset all timer refs (`startTimeRef = Date.now()`, etc.).
6. `setIsSessionActive(true)`, `setIsPaused(false)`, `setDisplayMs(0)`.
7. Call `startMasterTimer()`.
8. Call `notifyExtension(true)`.
9. Toast: `'Study tab opened. Focus session active.'`.
10. **Remove all PiP-opening logic from this function.**

**Step A5 — Add PiP state and manual toggle**
- Add `const [isPipOpen, setIsPipOpen] = useState(false);`
- In active-session control bar (when `isSessionActive && pipAvailable`), add:
  ```tsx
  <button onClick={handleTogglePip}>
    {isPipOpen ? <Minimize2 /> : <Monitor />}
    {isPipOpen ? 'Dock Floating Timer' : 'Toggle Floating Timer'}
  </button>
  ```

**Step A6 — Implement `handleTogglePip`, `openPipWindow` (updated), `closePipWindow`**
- `handleTogglePip`: if `!isPipOpen` → call `openPipWindow()` then `setIsPipOpen(true)`. If `isPipOpen` → call `closePipWindow()` then `setIsPipOpen(false)`.
- `openPipWindow`: existing logic, but add `setIsPipOpen(true)` after successful open. Update `pagehide` listener to also call `setIsPipOpen(false)`.
- `closePipWindow`: calls `clearTimer()`, closes `pipWindowRef.current` if not already closed, nulls all PiP refs, calls `setIsPipOpen(false)`.

**Step A7 — Update `handleEndSession`**
After logging session and resetting state, call `closePipWindow()` to clean up dangling PiP.

**Step A8 — Add unmount cleanup effect**
```tsx
useEffect(() => {
  return () => {
    clearTimer();
    if (pipWindowRef.current && !pipWindowRef.current.closed) {
      pipWindowRef.current.close();
    }
    pipWindowRef.current = null;
  };
}, [clearTimer]);
```

---

### PHASE B — CSS 3D Tilt Hook & TiltCard

**Step B1 — Create `src/hooks/use3DTilt.ts`**
Return `{ ref, style, glareStyle, handlers }`. Uses `mousemove`/`mouseleave`. Defaults: `maxTilt=6`, `perspective=900`, `speed=200`, `scale=1.02`. Optional `glare` boolean.

**Step B2 — Create `src/components/TiltCard.tsx`**
Wrapper that consumes `use3DTilt` and renders a `div` with computed `style` + `handlers`. Accepts `className`, `maxTilt`, `perspective`, `speed`, `scale`, `glare`. Note: does **not** render a `motion.div`.

**Step B3 — Apply to DashboardView.tsx**
For each card (`motion.div`), wrap the inner content with `<TiltCard>`:
```tsx
<motion.div initial={...} animate={...} className="...">
  <TiltCard className="h-full">
    {/* existing card inner div */}
  </TiltCard>
</motion.div>
```
Affected cards: Level Card (line 70), Overall Progress (87), Today's Goal (109), Countdown items (139-160), Weak Topics (166), Recent Badges (200), Streak card (230).

**Step B4 — Apply to BacklogView.tsx**
Wrap each backlog chapter card content in `<TiltCard>` (line 66 area).

**Step B5 — Apply to BadgesView.tsx**
Wrap each badge tile content in `<TiltCard glare maxTilt={4} perspective={1000}>` (line 137-142).

---

### PHASE C — 3D WebGL Focus Particle Visualizer

**Step C1 — Confirm deps installed from Step A1**

**Step C2 — Create `src/components/FocusParticleVisualizer.tsx`**
Use native `@react-three/fiber` elements — no `@react-three/drei`. Build `BufferGeometry` manually in `useMemo`, render with `<points>` + `<pointsMaterial>`. The scene will:
- Render ~200 particles in a spherical cluster.
- When `isSessionActive`, rotate the entire particle system on Y-axis and increase the cluster radius (expand).
- Accept `isActive: boolean` + `count?: number` props.

Key sub-steps:
1. Inner `ParticleCloud` component uses `useMemo` to create a `THREE.BufferGeometry` with random spherical positions (`Math.cbrt` for uniform volume) and gold-ish vertex colors (`#c9a84c` range with variation).
2. Uses `useFrame` from R3F to animate: lerps `mesh.scale` (idle 1.8 → active 2.8) and rotates (`isActive ? 0.3 : 0.08` rad/s).
3. Renders `<points ref={meshRef} geometry={geometry} material={material} />` directly — no drei helpers.
4. Outer wrapper: `<div className="absolute inset-0 pointer-events-none z-0">` around `<Canvas>`.
5. Canvas: `camera={{ position: [0, 0, 5], fov: 60 }}`, `dpr={[1, 1.5]}`, `gl={{ alpha: true, antialias: false }}`.

Implementation sketch:
```tsx
// src/components/FocusParticleVisualizer.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';

interface ParticleCloudProps {
  isActive: boolean;
  count?: number;
}

function ParticleCloud({ isActive, count = 200 }: ParticleCloudProps) {
  const meshRef = useRef<THREE.Points>(null);
  const { invalidate } = useThree();
  const radiusRef = useRef(1.8);

  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = Math.cbrt(Math.random());
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const v = 0.6 + Math.random() * 0.4;
      colors[i * 3] = v * 0.79;
      colors[i * 3 + 1] = v * 0.66;
      colors[i * 3 + 2] = v * 0.3;
    }
    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const mat = new THREE.PointsMaterial({
      size: 0.04,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      sizeAttenuation: true,
      depthWrite: false,
    });
    return { geometry: geom, material: mat };
  }, [count]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const target = isActive ? 2.8 : 1.8;
    radiusRef.current += (target - radiusRef.current) * Math.min(delta * 2, 1);
    meshRef.current.scale.setScalar(radiusRef.current);
    const speed = isActive ? 0.3 : 0.08;
    meshRef.current.rotation.y += delta * speed;
    meshRef.current.rotation.x += delta * speed * 0.2;
  });

  return (
    <points ref={meshRef} geometry={geometry} material={material} />
  );
}

export const FocusParticleVisualizer: React.FC<{ isActive: boolean; count?: number }> = ({ isActive, count = 200 }) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 60 }} dpr={[1, 1.5]} gl={{ alpha: true, antialias: false }}>
        <ParticleCloud isActive={isActive} count={count} />
      </Canvas>
    </div>
  );
};
```

**Step C3 — Integrate into FocusPortalView.tsx**
- Import `FocusParticleVisualizer`.
- Place as first child inside the outer `div` (with `ref={containerRef}`).
- Ensure that div is `relative overflow-hidden`.
- Pass `isSessionActive` to `<FocusParticleVisualizer isActive={isSessionActive} count={200} />`.
- Verify inner portal cards have `relative z-10` so they render above the canvas.

---

## 4. Build & Type Safety Strategy

| Gate | Command | When |
|---|---|---|
| Deps install | `npm ls three @react-three/fiber` | After A1 |
| Type check | `npx tsc --noEmit` | After each new file / substantial edit |
| Build check | `npm run build` | After Phase A complete, after Phase B/C complete |
| Final gate | `npm run lint && npm run build` | Before push |

**Validation checklist:**
- `npx tsc --noEmit` passes with zero errors
- `npm run build` completes with no warnings
- Manual smoke test: Start Focus Session → URL opens in new tab → main timer ticks → PiP toggle opens docked timer → pause/resume syncs both displays → End Session closes PiP and logs
- PiP `pagehide` test: close PiP via OS controls → `isPipOpen` resets, timer continues in main app
- Popup blocker test: block popups → toast appears, timer still starts
- 3D card hover: Dashboard, Backlog, Badges cards tilt on mouse move
- Particle visualizer: idle state = slow rotation, compact; active state = faster rotation, expanded radius

---

## 5. File Changes Summary

| Action | File | What |
|---|---|---|
| Modify | `package.json` | Add `three`, `@react-three/fiber` deps with minimum versions |
| Create | `src/utils/urlValidation.ts` | `isValidStudyUrl`, `normaliseUrl` |
| Create | `src/hooks/use3DTilt.ts` | Mouse-tracking perspective hook |
| Create | `src/components/TiltCard.tsx` | Reusable tilt wrapper |
| Create | `src/components/FocusParticleVisualizer.tsx` | R3F particle background |
| Modify | `src/components/FocusPortalView.tsx` | Decouple launch/PiP, fix timer, add visualizer |
| Modify | `src/components/DashboardView.tsx` | Wrap cards in TiltCard |
| Modify | `src/components/BacklogView.tsx` | Wrap cards in TiltCard |
| Modify | `src/components/BadgesView.tsx` | Wrap badge tiles in TiltCard |

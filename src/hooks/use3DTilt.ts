import { useState, useCallback, useRef } from 'react';

interface Use3DTiltOptions {
  maxTilt?: number;
  perspective?: number;
  speed?: number;
  scale?: number;
  glare?: boolean;
}

export function use3DTilt(options: Use3DTiltOptions = {}) {
  const {
    maxTilt = 6,
    perspective = 900,
    speed = 200,
    scale = 1.02,
    glare = false,
  } = options;
  const ref = useRef<HTMLDivElement>(null);
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({});

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;
      setStyle({
        transform: `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(${scale},${scale},${scale})`,
        transition: `transform ${speed}ms ease-out`,
        willChange: 'transform',
      });
      if (glare) {
        setGlareStyle({
          background: `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.06) 0%, transparent 60%)`,
          transition: `background ${speed}ms ease-out`,
        });
      }
    },
    [maxTilt, perspective, speed, scale, glare]
  );

  const handleLeave = useCallback(() => {
    setStyle({
      transform: `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)`,
      transition: `transform ${speed}ms ease-in-out`,
      willChange: 'auto',
    });
    setGlareStyle({});
  }, [perspective, speed]);

  return {
    ref,
    style,
    glareStyle,
    handlers: { onMouseMove: handleMove, onMouseLeave: handleLeave },
  };
}

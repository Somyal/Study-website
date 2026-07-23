import React from 'react';
import { use3DTilt } from '../hooks/use3DTilt';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  speed?: number;
  scale?: number;
  glare?: boolean;
}

export const TiltCard: React.FC<TiltCardProps> = ({
  children,
  className = '',
  maxTilt = 6,
  perspective = 900,
  speed = 200,
  scale = 1.02,
  glare = false,
}) => {
  const { ref, style, glareStyle, handlers } = use3DTilt({
    maxTilt,
    perspective,
    speed,
    scale,
    glare,
  });

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden will-change-transform ${className}`}
      style={style}
      {...handlers}
    >
      {children}
      {glare && (
        <div
          className="pointer-events-none absolute inset-0 rounded-inherit"
          style={glareStyle}
        />
      )}
    </div>
  );
};

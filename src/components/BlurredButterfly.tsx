import React from 'react';

interface BlurredButterflyProps {
  className?: string;
  size?: number; // size in px
  blur?: number; // blur in px
  color?: string; // hex or rgba
  opacity?: number; // 0 to 1
  rotation?: number; // degrees
  animateSlow?: boolean;
  style?: React.CSSProperties;
  variant?: 'orange' | 'emerald' | 'amber' | 'neutral';
}

export const BlurredButterfly: React.FC<BlurredButterflyProps> = ({
  className = '',
  size = 280,
  blur = 22,
  color,
  opacity = 0.28,
  rotation = 0,
  animateSlow = false,
  style = {},
  variant = 'orange',
}) => {
  // Preset color gradients matching the Convix / Landing page aesthetic
  const variantColors = {
    orange: {
      primary: '#ef4d23',
      secondary: '#f97316',
      accent: '#fde047',
    },
    emerald: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
    },
    amber: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fef08a',
    },
    neutral: {
      primary: '#737373',
      secondary: '#a3a3a3',
      accent: '#e5e5e5',
    },
  };

  const c = color
    ? { primary: color, secondary: color, accent: color }
    : variantColors[variant];

  const uniqueId = React.useId().replace(/:/g, '');

  return (
    <div
      className={`pointer-events-none absolute select-none ${
        animateSlow ? 'animate-butterfly-slow' : 'animate-butterfly'
      } ${className}`}
      style={{
        width: size,
        height: size,
        filter: `blur(${blur}px)`,
        opacity,
        transform: `rotate(${rotation}deg)`,
        ...style,
      }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full transform transition-transform"
      >
        <defs>
          <linearGradient id={`wing-l-${uniqueId}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={c.accent} stopOpacity="0.95" />
            <stop offset="45%" stopColor={c.secondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.primary} stopOpacity="0.45" />
          </linearGradient>
          <linearGradient id={`wing-r-${uniqueId}`} x1="200" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={c.accent} stopOpacity="0.95" />
            <stop offset="45%" stopColor={c.secondary} stopOpacity="0.8" />
            <stop offset="100%" stopColor={c.primary} stopOpacity="0.45" />
          </linearGradient>
        </defs>

        {/* Left Forewing (top-left) */}
        <path
          d="M 100 95 C 75 40, 20 20, 15 55 C 10 85, 55 110, 100 100 Z"
          fill={`url(#wing-l-${uniqueId})`}
        />

        {/* Left Hindwing (bottom-left) */}
        <path
          d="M 100 100 C 65 115, 30 135, 45 165 C 60 185, 90 150, 100 115 Z"
          fill={`url(#wing-l-${uniqueId})`}
          opacity="0.85"
        />

        {/* Right Forewing (top-right) */}
        <path
          d="M 100 95 C 125 40, 180 20, 185 55 C 190 85, 145 110, 100 100 Z"
          fill={`url(#wing-r-${uniqueId})`}
        />

        {/* Right Hindwing (bottom-right) */}
        <path
          d="M 100 100 C 135 115, 170 135, 155 165 C 140 185, 110 150, 100 115 Z"
          fill={`url(#wing-r-${uniqueId})`}
          opacity="0.85"
        />

        {/* Butterfly Body & Antennae */}
        <path
          d="M 100 70 Q 101 100 100 140"
          stroke={c.primary}
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* Antennae */}
        <path
          d="M 100 70 Q 88 50 82 45"
          stroke={c.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          d="M 100 70 Q 112 50 118 45"
          stroke={c.secondary}
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
};

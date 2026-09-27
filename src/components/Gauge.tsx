import React from 'react';

interface GaugeProps {
  value: number;
  color?: string;
  showLabels?: boolean;
  min?: string | number;
  max?: string | number;
  label?: string;
}

export const Gauge: React.FC<GaugeProps> = ({
  value,
  color = '#ef4d23',
  showLabels = false,
  min = '0',
  max = '100',
  label,
}) => {
  const clampedVal = Math.max(0, Math.min(100, value));
  const totalTicks = 40;
  const activeCount = Math.round((clampedVal / 100) * totalTicks);
  const cx = 100;
  const cy = 100;
  const outerR = 80;
  const innerR = 70; // r - 10

  // 40 tick marks spanning a 180° arc (from angle π to 2π)
  const ticks = Array.from({ length: totalTicks }, (_, i) => {
    // Angle from π (left, 180°) to 2π (right, 360°)
    const angle = Math.PI + (i / (totalTicks - 1)) * Math.PI;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);

    const x1 = cx + innerR * cos;
    const y1 = cy + innerR * sin;
    const x2 = cx + outerR * cos;
    const y2 = cy + outerR * sin;

    const isActive = i < activeCount;

    return {
      x1,
      y1,
      x2,
      y2,
      isActive,
    };
  });

  return (
    <div className="flex flex-col items-center w-full max-w-[260px] mx-auto">
      <svg viewBox="0 0 200 120" className="w-full h-auto overflow-visible">
        {ticks.map((tick, idx) => (
          <line
            key={idx}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            strokeWidth={2.5}
            strokeLinecap="round"
            stroke={tick.isActive ? color : '#d4d4d8'}
          />
        ))}

        {/* Center Percentage Text */}
        <text
          x={100}
          y={102}
          textAnchor="middle"
          fill="#171717"
          style={{ fontSize: 22, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
        >
          {clampedVal}%
        </text>
      </svg>

      {/* Min / Max Labels if enabled */}
      {showLabels && (
        <div className="flex justify-between w-full text-[11px] font-mono text-neutral-500 px-3 -mt-2">
          <span>{min}</span>
          {label && <span className="font-semibold text-neutral-700">{label}</span>}
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

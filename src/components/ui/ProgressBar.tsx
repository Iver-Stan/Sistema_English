import React from 'react';

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  colorClass?: string;
  trackClass?: string;
  heightClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  label,
  colorClass = 'bg-emerald-400',
  trackClass = 'bg-purple-950/80 border border-purple-400/20',
  heightClass = 'h-3.5',
}) => {
  const safeMax = max > 0 ? max : 1;
  const percent = Math.min(100, Math.max(0, Math.round((value / safeMax) * 100)));

  return (
    <div className="w-full">
      {label ? (
        <div className="flex items-center justify-between text-xs font-bold text-purple-100 mb-1.5">
          <span>{label}</span>
          <span className="text-amber-300">{percent}%</span>
        </div>
      ) : null}
      <div
        className={`w-full ${heightClass} ${trackClass} rounded-full overflow-hidden p-0.5`}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={safeMax}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

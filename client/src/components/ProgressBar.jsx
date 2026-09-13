import React from 'react';

export default function ProgressBar({ current, total, color = 'bg-sky-500', height = 'h-1.5' }) {
  const pct = Math.min(100, Math.max(0, total > 0 ? (current / total) * 100 : 0));
  
  return (
    <div className={`w-full bg-surface-muted/50 rounded-full overflow-hidden ${height} border border-surface-border/50 backdrop-blur-sm`}>
      <div
        className={`${height} ${color} transition-all duration-500 ease-out`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

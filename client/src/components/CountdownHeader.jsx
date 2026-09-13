import React from 'react';
import PaceBadge from './PaceBadge';

const BinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

export default function CountdownHeader({ goal, stats, onClickGoal, onDelete, onComplete }) {
  return (
    <div className="glass-card group/card cursor-pointer hover:border-surface-borderStrong transition-all p-3 md:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 relative">
      <div className="absolute top-2.5 right-2.5 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center gap-1 z-10">
        {/* Complete icon */}
        {onComplete && goal.status !== 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(goal.id); }}
            title="Mark as Complete"
            className="text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md p-1 transition-colors"
          >
            <CheckIcon />
          </button>
        )}

        {/* Bin icon */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            title="Delete goal"
            className="text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md p-1 transition-colors"
          >
            <BinIcon />
          </button>
        )}
      </div>

      <div onClick={onClickGoal} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wider font-mono text-zinc-400 font-medium">Goal Track</span>
          <span className="text-sm font-semibold text-zinc-100 truncate group-hover/card:text-amber-400 transition-colors pr-6">
            {goal.name}
          </span>
        </div>
      </div>

      <div onClick={onClickGoal} className="flex items-center gap-4 self-end md:self-auto">
        <div className="flex items-baseline gap-1.5 font-num">
          <span className="text-xs text-zinc-400 uppercase tracking-wide">Day</span>
          <span className="text-xl md:text-2xl font-black text-zinc-100">{stats.daysElapsed}</span>
          <span className="text-xs text-zinc-500">/</span>
          <span className="text-xs font-semibold text-zinc-400">{stats.totalDays}</span>
        </div>

        <div className="h-6 w-[1px] bg-surface-border/50 hidden md:block" />

        <div className="flex items-center gap-2">
          <PaceBadge status={stats.paceStatus} label={stats.paceLabel} />
          <span className="text-xs font-mono text-zinc-400 hidden sm:inline">
            {stats.daysRemaining}d left
          </span>
        </div>
      </div>
    </div>
  );
}

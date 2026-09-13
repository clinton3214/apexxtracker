import React from 'react';
import PaceBadge from './PaceBadge';
import ProgressBar from './ProgressBar';

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

export default function GoalCard({ goal, stats, onSelectGoal, onLogClick, onDelete, onComplete }) {
  const progressColor = stats.paceStatus === 'ahead' 
    ? 'bg-emerald-500' 
    : stats.paceStatus === 'behind' 
    ? 'bg-rose-500' 
    : 'bg-sky-500';

  return (
    <div className="glass-card p-4 flex flex-col justify-between relative group/card">
      <div className="absolute top-3 right-3 opacity-100 sm:opacity-0 sm:group-hover/card:opacity-100 transition-opacity duration-200 flex items-center gap-1">
        {/* Complete icon */}
        {onComplete && goal.status !== 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(goal.id); }}
            title="Mark as Complete"
            className="text-zinc-400 sm:text-zinc-600 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-md p-1 transition-colors"
          >
            <CheckIcon />
          </button>
        )}
        
        {/* Bin icon */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            title="Delete goal"
            className="text-zinc-400 sm:text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md p-1 transition-colors"
          >
            <BinIcon />
          </button>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-2 mb-2 pr-6">
          <div>
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">Target Track</span>
            <h3 
              onClick={onSelectGoal}
              className="text-base font-bold text-zinc-100 cursor-pointer hover:text-amber-400 transition-colors"
            >
              {goal.name}
            </h3>
          </div>
          <PaceBadge status={stats.paceStatus} label={stats.paceLabel} size="sm" />
        </div>

        <div className="mt-4 mb-3">
          <div className="flex justify-between items-baseline mb-1 font-num">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-zinc-100">{stats.todayLoggedMinutes}</span>
              <span className="text-xs text-zinc-400 uppercase font-mono">/ {stats.plannedTodayMinutes} min today</span>
            </div>
            <span className="text-xs font-mono font-medium text-zinc-400">
              {Math.round((stats.todayLoggedMinutes / (stats.plannedTodayMinutes || 1)) * 100)}%
            </span>
          </div>
          <ProgressBar 
            current={stats.todayLoggedMinutes} 
            total={stats.plannedTodayMinutes} 
            color={progressColor} 
            height="h-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-surface-border/50 text-xs font-mono">
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Req. Daily Pace</span>
            <span className={`font-bold ${stats.requiredDailyPace > stats.averageDailyPace ? 'text-amber-400' : 'text-zinc-200'}`}>
              {stats.requiredDailyPace} min/d
            </span>
          </div>
          <div>
            <span className="text-zinc-500 block text-[10px] uppercase">Current Avg</span>
            <span className="font-bold text-zinc-200">{stats.averageDailyPace} min/d</span>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 flex items-center justify-between gap-2 border-t border-surface-border/30">
        <button
          onClick={onSelectGoal}
          className="text-xs text-zinc-400 hover:text-zinc-200 font-mono underline-offset-4 hover:underline"
        >
          Inspect Pace &amp; Backlog &rarr;
        </button>
        <button
          onClick={() => onLogClick(goal.id)}
          className="px-3 py-1.5 rounded-lg text-xs font-mono font-medium bg-surface-muted/50 hover:bg-surface-subtle border border-surface-border/50 text-zinc-200 hover:border-zinc-500 transition-colors backdrop-blur-sm"
        >
          + Quick Log
        </button>
      </div>
    </div>
  );
}

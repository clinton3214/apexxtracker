import React, { useState } from 'react';

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
  </svg>
);

export default function TaskRow({ task, onToggle, onUpdateSpent, onPullToToday, onDelete }) {
  const [isEditingSpent, setIsEditingSpent] = useState(false);
  const [tempSpent, setTempSpent] = useState(task.spentMinutes);

  const handleSpentBlur = () => {
    setIsEditingSpent(false);
    onUpdateSpent(task.id, Number(tempSpent) || 0);
  };

  const priorityColors = {
    high: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    medium: 'text-zinc-300 border-zinc-700/50 bg-surface-muted/50',
    low: 'text-zinc-500 border-zinc-800/50 bg-surface-subtle/50'
  };

  return (
    <div className={`glass-panel group p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors relative ${task.status === 'done' ? 'opacity-65' : 'hover:border-surface-borderStrong/60 hover:bg-surface/60'}`}>
      {/* X delete — always visible on mobile, hover-only on desktop */}
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 text-zinc-400 sm:text-zinc-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-md p-0.5"
        >
          <XIcon />
        </button>
      )}

      <div className="flex items-start gap-3 flex-1 min-w-0">
        <button
          onClick={() => onToggle(task.id)}
          className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center rounded transition-colors border ${
            task.status === 'done' 
              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' 
              : 'border-surface-borderStrong hover:border-amber-400 bg-surface-muted/50'
          }`}
        >
          {task.status === 'done' && (
            <svg className="w-3.5 h-3.5 stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
        </button>

        <div className="min-w-0 flex-1 pr-6">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-zinc-500' : 'text-zinc-200'}`}>
              {task.title}
            </span>
            <span className={`text-[10px] font-mono uppercase px-2 py-0.5 border rounded-full backdrop-blur-sm ${priorityColors[task.priority]}`}>
              {task.priority}
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1 font-mono">
            <span>Est: {task.estimatedMinutes}m</span>
            <span>&bull;</span>
            <span>Target: {task.targetDay === 'today' ? <span className="text-amber-400 font-semibold">Today</span> : task.targetDay}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-surface-border/50">
        {/* Inline "minutes actually spent" field */}
        <div className="flex items-center gap-1.5 font-num">
          <span className="text-xs text-zinc-400 font-mono">Spent:</span>
          {isEditingSpent ? (
            <input
              type="number"
              autoFocus
              value={tempSpent}
              onChange={(e) => setTempSpent(e.target.value)}
              onBlur={handleSpentBlur}
              onKeyDown={(e) => e.key === 'Enter' && handleSpentBlur()}
              className="w-16 px-2 py-1 text-xs rounded font-mono bg-canvas border border-amber-400/50 text-zinc-100 focus:outline-none"
            />
          ) : (
            <button
              onClick={() => setIsEditingSpent(true)}
              title="Click to edit actual minutes"
              className="px-2.5 py-1 text-xs rounded-md font-mono bg-surface-muted/50 hover:bg-surface-subtle/80 border border-surface-border/50 text-zinc-200 hover:border-zinc-500 transition-colors backdrop-blur-sm"
            >
              {task.spentMinutes} min
            </button>
          )}
        </div>

        {onPullToToday && task.targetDay !== 'today' && (
          <button
            onClick={() => onPullToToday(task.id)}
            className="text-xs font-mono px-2.5 py-1 rounded-md bg-surface-muted/50 hover:bg-surface-subtle/80 text-amber-400 border border-surface-border/50 backdrop-blur-sm"
          >
            Pull to Today
          </button>
        )}
      </div>
    </div>
  );
}

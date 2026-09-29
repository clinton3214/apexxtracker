import React from 'react';

const BinIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
    <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
  </svg>
);

export default function CountdownHeader({ goal, stats, onClickGoal, onDelete, onComplete }) {
  // Use goal.name or goal.title depending on what property is used
  const title = goal.title || goal.name;
  
  return (
    <div className="glass-card group cursor-pointer hover:bg-white/40 transition-all p-4 rounded-[20px] flex flex-col md:flex-row md:items-center justify-between gap-3 relative overflow-hidden">
      <div className="absolute top-2 right-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1 z-10">
        {/* Complete icon */}
        {onComplete && goal.status !== 'completed' && (
          <button
            onClick={(e) => { e.stopPropagation(); onComplete(goal.id); }}
            title="Mark as Complete"
            className="text-[#969caf] hover:text-[#10b981] p-1.5 transition-colors"
          >
            <CheckIcon />
          </button>
        )}

        {/* Bin icon */}
        {onDelete && (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(goal.id); }}
            title="Delete goal"
            className="text-[#969caf] hover:text-[#ef4444] p-1.5 transition-colors"
          >
            <BinIcon />
          </button>
        )}
      </div>

      <div onClick={onClickGoal} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-widest font-bold text-[#969caf]">Goal Track</span>
          <span className="text-lg font-bold text-[#25283b] truncate group-hover:text-[#7166dc] transition-colors pr-6 mt-0.5">
            {title}
          </span>
        </div>
      </div>

      <div onClick={onClickGoal} className="flex items-center gap-5 self-start md:self-auto mt-2 md:mt-0">
        <div className="flex items-baseline gap-1.5 font-num">
          <span className="text-xs text-[#969caf] uppercase tracking-wide font-bold">Day</span>
          <span className="text-2xl font-black text-[#25283b]">{stats.daysElapsed}</span>
          <span className="text-sm text-[#969caf]/50">/</span>
          <span className="text-sm font-bold text-[#969caf]">{stats.totalDays}</span>
        </div>

        <div className="h-8 w-[1px] bg-[#969caf]/20 hidden md:block" />

        <div className="flex items-center gap-3">
          <span className={`badge ${stats.paceStatus}`}>{stats.paceLabel}</span>
          <span className="text-xs font-bold text-[#969caf] hidden sm:inline">
            {stats.daysRemaining}d left
          </span>
        </div>
      </div>
    </div>
  );
}

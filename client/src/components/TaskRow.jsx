import React, { useState } from 'react';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
);

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

  return (
    <div className={`task-row group ${task.status === 'done' ? 'is-done' : ''}`}>
      {/* Delete Button (visible on hover) */}
      {onDelete && (
        <button
          onClick={() => onDelete(task.id)}
          title="Delete task"
          className="absolute top-1 -right-1 md:-right-8 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-[#969caf] hover:text-[#ef4444] rounded-md p-1 bg-white/50 md:bg-transparent"
        >
          <XIcon />
        </button>
      )}

      <button
        onClick={() => onToggle(task.id)}
        className="task-check"
      >
        {task.status === 'done' && <CheckIcon />}
      </button>

      <div className="task-copy">
        <strong>{task.title}</strong>
        <span>
          {task.estimatedMinutes > 0 && <span>Est: {task.estimatedMinutes}m<i></i></span>}
          {task.targetDay !== 'today' && <span>{task.targetDay}<i></i></span>}
          
          <span className="flex items-center gap-1 cursor-pointer hover:text-[#7166dc] transition-colors" onClick={() => setIsEditingSpent(true)}>
            Spent: 
            {isEditingSpent ? (
              <input
                type="number"
                autoFocus
                value={tempSpent}
                onChange={(e) => setTempSpent(e.target.value)}
                onBlur={handleSpentBlur}
                onKeyDown={(e) => e.key === 'Enter' && handleSpentBlur()}
                className="w-12 px-1 text-xs rounded border border-[#7166dc]/50 bg-white/50 text-[#25283b] outline-none"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="font-bold">{task.spentMinutes}m</span>
            )}
          </span>
          
          {onPullToToday && task.targetDay !== 'today' && (
            <>
              <i></i>
              <button
                onClick={() => onPullToToday(task.id)}
                className="text-[#7166dc] hover:underline"
              >
                Pull to Today
              </button>
            </>
          )}
        </span>
      </div>

      <div className={`priority ${task.priority}`}>
        {task.priority}
      </div>
    </div>
  );
}

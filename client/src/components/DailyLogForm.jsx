import React, { useState } from 'react';

export default function DailyLogForm({ goals = [], paceStats = {}, onSubmit, onCancel }) {
  // Initialize state per goal
  const [entriesState, setEntriesState] = useState(() => {
    const state = {};
    goals.forEach(g => {
      const stats = paceStats[g.id] || {};
      const totalLogged = stats.totalMinutesLogged || 0;
      const planned = g.totalPlannedMinutes || 1200;
      const currentPercent = Math.min(100, Math.round((totalLogged / planned) * 100));

      state[g.id] = {
        goalId: g.id,
        mode: 'minutes', // 'minutes' or 'percentage'
        percentMode: 'overall', // 'overall' (e.g. "I'm 50% done") or 'increment' (e.g. "+10% today")
        minutes: 0,
        percentage: currentPercent,
        incrementPercentage: 10
      };
    });
    return state;
  });

  const [note, setNote] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const handleModeChange = (goalId, newMode) => {
    setEntriesState(prev => {
      const current = prev[goalId];
      const g = goals.find(goal => goal.id === goalId);
      const stats = paceStats[goalId] || {};
      const totalLogged = stats.totalMinutesLogged || 0;
      const planned = g?.totalPlannedMinutes || 1200;
      const currentPercent = Math.min(100, Math.round((totalLogged / planned) * 100));

      let newMinutes = current.minutes;
      if (newMode === 'percentage') {
        const targetPercent = Math.max(currentPercent, current.percentage || currentPercent);
        const targetMins = Math.round((targetPercent / 100) * planned);
        newMinutes = Math.max(0, targetMins - totalLogged);
      }

      return {
        ...prev,
        [goalId]: {
          ...current,
          mode: newMode,
          percentage: current.percentage || currentPercent,
          minutes: newMinutes
        }
      };
    });
  };

  const handlePercentageChange = (goalId, val) => {
    const percentVal = Math.max(0, Math.min(100, Number(val) || 0));
    setEntriesState(prev => {
      const current = prev[goalId];
      const g = goals.find(goal => goal.id === goalId);
      const stats = paceStats[goalId] || {};
      const totalLogged = stats.totalMinutesLogged || 0;
      const planned = g?.totalPlannedMinutes || 1200;

      let calcMinutes = 0;
      if (current.percentMode === 'overall') {
        const targetMins = Math.round((percentVal / 100) * planned);
        calcMinutes = Math.max(0, targetMins - totalLogged);
      } else {
        calcMinutes = Math.round((percentVal / 100) * planned);
      }

      return {
        ...prev,
        [goalId]: {
          ...current,
          percentage: percentVal,
          minutes: calcMinutes
        }
      };
    });
  };

  const handlePercentModeChange = (goalId, mode) => {
    setEntriesState(prev => {
      const current = prev[goalId];
      const g = goals.find(goal => goal.id === goalId);
      const stats = paceStats[goalId] || {};
      const totalLogged = stats.totalMinutesLogged || 0;
      const planned = g?.totalPlannedMinutes || 1200;
      const currentPercent = Math.min(100, Math.round((totalLogged / planned) * 100));

      let calcMinutes = 0;
      if (mode === 'overall') {
        const target = Math.max(currentPercent, current.percentage || 50);
        const targetMins = Math.round((target / 100) * planned);
        calcMinutes = Math.max(0, targetMins - totalLogged);
      } else {
        calcMinutes = Math.round(((current.incrementPercentage || 10) / 100) * planned);
      }

      return {
        ...prev,
        [goalId]: {
          ...current,
          percentMode: mode,
          minutes: calcMinutes
        }
      };
    });
  };

  const handleIncrementChange = (goalId, val) => {
    const incVal = Math.max(1, Math.min(100, Number(val) || 0));
    setEntriesState(prev => {
      const current = prev[goalId];
      const g = goals.find(goal => goal.id === goalId);
      const planned = g?.totalPlannedMinutes || 1200;
      const calcMinutes = Math.round((incVal / 100) * planned);

      return {
        ...prev,
        [goalId]: {
          ...current,
          incrementPercentage: incVal,
          minutes: calcMinutes
        }
      };
    });
  };

  const handleDirectMinutesChange = (goalId, val) => {
    const num = Math.max(0, Number(val) || 0);
    setEntriesState(prev => ({
      ...prev,
      [goalId]: {
        ...prev[goalId],
        minutes: num
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validEntries = Object.values(entriesState)
      .filter(item => item.minutes > 0)
      .map(item => ({
        goalId: item.goalId,
        minutes: item.minutes
      }));

    if (validEntries.length === 0) {
      alert("Please log progress (minutes or percentage > 0) for at least one goal.");
      return;
    }
    onSubmit({ entries: validEntries, note, date: todayStr });
  };

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto rounded-3xl" style={{ borderTop: '4px solid #7166dc' }}>
      <div className="flex justify-between items-center mb-6 border-b border-white/50 pb-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#25283b]">
            Commit Progress / Log Pace
          </h2>
          <span className="text-xs font-normal text-[#969caf] font-mono">
            Date: {todayStr}
          </span>
        </div>
        <button 
          onClick={onCancel} 
          className="text-[#969caf] hover:text-[#25283b] transition-colors p-1"
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {goals.map(g => {
            const entry = entriesState[g.id] || { mode: 'minutes', minutes: 0, percentage: 0 };
            const stats = paceStats[g.id] || {};
            const totalLogged = stats.totalMinutesLogged || 0;
            const planned = g.totalPlannedMinutes || 1200;
            const currentPercent = Math.min(100, Math.round((totalLogged / planned) * 100));
            const title = g.title || g.name;

            return (
              <div key={g.id} className="p-4 rounded-2xl bg-white/40 border border-white/60 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-[#4c5166]">{title}</h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[#969caf]">
                      <span>Current: <strong>{currentPercent}%</strong> ({totalLogged} / {planned} min)</span>
                    </div>
                  </div>

                  {/* Mode Selector Toggle: Minutes vs Percentage */}
                  <div className="flex items-center bg-white/60 p-0.5 rounded-xl border border-white self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => handleModeChange(g.id, 'minutes')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        entry.mode === 'minutes'
                          ? 'bg-[#7166dc] text-white shadow-sm'
                          : 'text-[#969caf] hover:text-[#4c5166]'
                      }`}
                    >
                      Rate in Mins
                    </button>
                    <button
                      type="button"
                      onClick={() => handleModeChange(g.id, 'percentage')}
                      className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${
                        entry.mode === 'percentage'
                          ? 'bg-[#7166dc] text-white shadow-sm'
                          : 'text-[#969caf] hover:text-[#4c5166]'
                      }`}
                    >
                      Rate in % (Slider)
                    </button>
                  </div>
                </div>

                {/* Body according to chosen mode */}
                {entry.mode === 'minutes' ? (
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-[#969caf]">Enter minutes spent today:</span>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={entry.minutes}
                        onChange={(e) => handleDirectMinutesChange(g.id, e.target.value)}
                        className="w-24 px-3 py-1.5 font-bold bg-white/70 border border-white rounded-lg focus:outline-none focus:border-[#7166dc] text-[#25283b] text-right"
                      />
                      <span className="text-xs text-[#969caf] font-bold uppercase">min</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1 border-t border-white/50">
                    {/* Sub-mode option: Overall Goal Completion vs Added Percentage */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#969caf] font-medium">How would you like to rate progress?</span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handlePercentModeChange(g.id, 'overall')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            entry.percentMode === 'overall'
                              ? 'bg-[#7166dc]/15 text-[#7166dc] border-[#7166dc]/40'
                              : 'bg-white/40 text-[#969caf] border-transparent'
                          }`}
                        >
                          Goal Completion %
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePercentModeChange(g.id, 'increment')}
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                            entry.percentMode === 'increment'
                              ? 'bg-[#7166dc]/15 text-[#7166dc] border-[#7166dc]/40'
                              : 'bg-white/40 text-[#969caf] border-transparent'
                          }`}
                        >
                          + Add % Today
                        </button>
                      </div>
                    </div>

                    {entry.percentMode === 'overall' ? (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-[#4c5166]">
                            I am now at this completion %:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={entry.percentage}
                              onChange={(e) => handlePercentageChange(g.id, e.target.value)}
                              className="w-16 px-2 py-1 font-bold bg-white/70 border border-white rounded-lg focus:outline-none focus:border-[#7166dc] text-[#25283b] text-center text-sm"
                            />
                            <span className="text-xs font-bold text-[#7166dc]">%</span>
                          </div>
                        </div>

                        {/* Slider Element */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[#969caf]">0%</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            step="1"
                            value={entry.percentage}
                            onChange={(e) => handlePercentageChange(g.id, e.target.value)}
                            className="flex-1 h-2 bg-white/80 rounded-lg appearance-none cursor-pointer accent-[#7166dc]"
                          />
                          <span className="text-[10px] font-mono text-[#969caf]">100%</span>
                        </div>

                        {/* Progress Calculation Feedback */}
                        <div className="mt-2.5 p-2 rounded-xl bg-white/60 text-xs flex justify-between items-center text-[#4c5166]">
                          <span>
                            Progress: <strong>{currentPercent}%</strong> &rarr; <strong className="text-[#7166dc]">{entry.percentage}%</strong>
                          </span>
                          <span className="font-bold">
                            {entry.minutes > 0 ? (
                              <span className="text-emerald-600">Will commit +{entry.minutes} min</span>
                            ) : entry.percentage <= currentPercent ? (
                              <span className="text-amber-600">(Already at or above this %)</span>
                            ) : (
                              <span>0 min</span>
                            )}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-[#4c5166]">
                            Percentage of goal achieved today:
                          </label>
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={entry.incrementPercentage}
                              onChange={(e) => handleIncrementChange(g.id, e.target.value)}
                              className="w-16 px-2 py-1 font-bold bg-white/70 border border-white rounded-lg focus:outline-none focus:border-[#7166dc] text-[#25283b] text-center text-sm"
                            />
                            <span className="text-xs font-bold text-[#7166dc]">%</span>
                          </div>
                        </div>

                        {/* Slider Element */}
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-mono text-[#969caf]">1%</span>
                          <input
                            type="range"
                            min="1"
                            max="50"
                            step="1"
                            value={entry.incrementPercentage}
                            onChange={(e) => handleIncrementChange(g.id, e.target.value)}
                            className="flex-1 h-2 bg-white/80 rounded-lg appearance-none cursor-pointer accent-[#7166dc]"
                          />
                          <span className="text-[10px] font-mono text-[#969caf]">50%</span>
                        </div>

                        <div className="mt-2.5 p-2 rounded-xl bg-white/60 text-xs flex justify-between items-center text-[#4c5166]">
                          <span>+{entry.incrementPercentage}% of total goal ({planned}m)</span>
                          <span className="font-bold text-emerald-600">
                            Will commit +{entry.minutes} min
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">
            Commit Note (Optional)
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/40 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#25283b] focus:outline-none focus:border-[#7166dc] placeholder:text-[#969caf]/70"
            rows={2}
            placeholder="What did you accomplish today? Any blockers or wins?"
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-[#969caf] hover:text-[#25283b] transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#7166dc] hover:bg-[#5d51ce] text-white font-bold px-6 py-2.5 rounded-xl transition-colors tracking-wide shadow-lg shadow-[#7166dc]/30"
          >
            COMMIT LOG
          </button>
        </div>
      </form>
    </div>
  );
}

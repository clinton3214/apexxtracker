import React, { useState } from 'react';

export default function NewGoalForm({ onSubmit, onCancel }) {
  const [goalType, setGoalType] = useState('long_term'); // 'long_term' or 'daily'
  const [dailyTimeType, setDailyTimeType] = useState('custom'); // 'all_day' or 'custom'
  const [formData, setFormData] = useState({
    name: '',
    deadline: '',
    totalPlannedMinutes: 1200,
    currentDailyCapacityMin: 60
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name) return;

    if (goalType === 'daily') {
      const today = new Date().toISOString().split('T')[0];
      const mins = dailyTimeType === 'all_day' ? 1440 : formData.totalPlannedMinutes;
      onSubmit({
        ...formData,
        deadline: formData.deadline || today, // If empty, use today
        totalPlannedMinutes: mins,
        currentDailyCapacityMin: mins
      });
    } else {
      if (!formData.deadline) return;
      onSubmit(formData);
    }
  };

  const glassInput = "w-full bg-surface/30 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500/50 backdrop-blur-md transition-colors shadow-sm";

  return (
    <div className="glass-card-strong p-6 mb-8 max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6 border-b border-surface-border/50 pb-4">
        <h2 className="text-xl font-bold font-mono tracking-tight text-zinc-100">Initialize New Goal</h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300">✕</button>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setGoalType('long_term')}
          className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs transition-colors border ${goalType === 'long_term' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 backdrop-blur-md' : 'bg-surface/30 border-white/10 text-zinc-400 backdrop-blur-md'}`}
        >
          Long-term Project
        </button>
        <button 
          onClick={() => {
            setGoalType('daily');
            setFormData(prev => ({ ...prev, totalPlannedMinutes: 120, deadline: new Date().toISOString().split('T')[0] }));
          }}
          className={`flex-1 py-2 px-4 rounded-lg font-mono text-xs transition-colors border ${goalType === 'daily' ? 'bg-amber-500/20 border-amber-500/50 text-amber-400 backdrop-blur-md' : 'bg-surface/30 border-white/10 text-zinc-400 backdrop-blur-md'}`}
        >
          Daily Objective
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Goal Name</label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={e => setFormData({ ...formData, name: e.target.value })}
            className={glassInput}
            placeholder={goalType === 'daily' ? "e.g. Finish coding app today" : "e.g. Launch MVP V1"}
          />
        </div>

        {goalType === 'long_term' ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className={`${glassInput} font-num`}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Total Est. Minutes</label>
                <input
                  type="number"
                  required
                  min="60"
                  step="30"
                  value={formData.totalPlannedMinutes}
                  onChange={e => setFormData({ ...formData, totalPlannedMinutes: Number(e.target.value) })}
                  className={`${glassInput} font-num`}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Daily Capacity Allocation (min/day)</label>
              <input
                type="number"
                required
                min="10"
                step="5"
                value={formData.currentDailyCapacityMin}
                onChange={e => setFormData({ ...formData, currentDailyCapacityMin: Number(e.target.value) })}
                className={`${glassInput} font-num`}
              />
              <p className="text-[10px] text-zinc-500 mt-1.5 font-mono">How many minutes per day are you realistically willing to dedicate to this goal today?</p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Target Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className={`${glassInput} font-num`}
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">Time Required</label>
              <div className="flex bg-surface/30 backdrop-blur-md border border-white/10 rounded-xl p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setDailyTimeType('all_day')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-colors ${dailyTimeType === 'all_day' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  All Day
                </button>
                <button
                  type="button"
                  onClick={() => setDailyTimeType('custom')}
                  className={`flex-1 py-1.5 text-xs font-mono rounded-lg transition-colors ${dailyTimeType === 'custom' ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Custom
                </button>
              </div>

              {dailyTimeType === 'custom' && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <input
                    type="number"
                    required
                    min="10"
                    step="10"
                    value={formData.totalPlannedMinutes}
                    onChange={e => setFormData({ ...formData, totalPlannedMinutes: Number(e.target.value) })}
                    className={`${glassInput} font-num`}
                  />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 mt-6 border-t border-surface-border/50">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-zinc-400 hover:text-zinc-200 mr-2 font-mono">Cancel</button>
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6 py-2.5 rounded-xl transition-colors font-mono shadow-lg shadow-amber-500/20">
            CREATE GOAL
          </button>
        </div>
      </form>
    </div>
  );
}


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

  const glassInput = "w-full bg-white/50 border border-white rounded-xl px-4 py-3 text-sm text-[#25283b] font-bold focus:outline-none focus:border-[#7166dc]/60 transition-colors placeholder:text-[#969caf]/70 placeholder:font-normal";

  return (
    <div className="glass-card p-6 mb-8 max-w-2xl mx-auto rounded-[26px]">
      <div className="flex justify-between items-center mb-6 border-b border-white/60 pb-4">
        <h2 className="text-xl font-bold text-[#25283b]">Initialize New Goal</h2>
        <button onClick={onCancel} className="text-[#969caf] hover:text-[#25283b] transition-colors">✕</button>
      </div>

      <div className="flex gap-2 mb-6">
        <button 
          onClick={() => setGoalType('long_term')}
          className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition-colors border ${goalType === 'long_term' ? 'bg-[#7166dc]/10 border-[#7166dc]/40 text-[#7166dc]' : 'bg-white/40 border-white/60 text-[#969caf] hover:bg-white/60'}`}
        >
          Long-term Project
        </button>
        <button 
          onClick={() => {
            setGoalType('daily');
            setFormData(prev => ({ ...prev, totalPlannedMinutes: 120, deadline: new Date().toISOString().split('T')[0] }));
          }}
          className={`flex-1 py-2 px-4 rounded-xl font-bold text-xs transition-colors border ${goalType === 'daily' ? 'bg-[#7166dc]/10 border-[#7166dc]/40 text-[#7166dc]' : 'bg-white/40 border-white/60 text-[#969caf] hover:bg-white/60'}`}
        >
          Daily Objective
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Goal Name</label>
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
                <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Target Deadline</label>
                <input
                  type="date"
                  required
                  value={formData.deadline}
                  onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                  className={`${glassInput} font-num`}
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Total Est. Minutes</label>
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
              <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Daily Capacity Allocation (min/day)</label>
              <input
                type="number"
                required
                min="10"
                step="5"
                value={formData.currentDailyCapacityMin}
                onChange={e => setFormData({ ...formData, currentDailyCapacityMin: Number(e.target.value) })}
                className={`${glassInput} font-num`}
              />
              <p className="text-[10px] text-[#969caf] mt-1.5 font-bold">How many minutes per day are you realistically willing to dedicate to this goal today?</p>
            </div>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Target Date</label>
              <input
                type="date"
                required
                value={formData.deadline}
                onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                className={`${glassInput} font-num`}
              />
            </div>
            
            <div>
              <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">Time Required</label>
              <div className="flex bg-white/40 border border-white rounded-xl p-1 mb-2">
                <button
                  type="button"
                  onClick={() => setDailyTimeType('all_day')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${dailyTimeType === 'all_day' ? 'bg-[#7166dc]/15 text-[#7166dc]' : 'text-[#969caf] hover:text-[#4c5166]'}`}
                >
                  All Day
                </button>
                <button
                  type="button"
                  onClick={() => setDailyTimeType('custom')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-colors ${dailyTimeType === 'custom' ? 'bg-[#7166dc]/15 text-[#7166dc]' : 'text-[#969caf] hover:text-[#4c5166]'}`}
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

        <div className="flex justify-end pt-4 mt-6 border-t border-white/60">
          <button type="button" onClick={onCancel} className="px-6 py-2.5 rounded-xl text-[#969caf] hover:text-[#4c5166] mr-2 font-bold">Cancel</button>
          <button type="submit" className="bg-[#7166dc] hover:bg-[#5d51ce] text-white font-bold px-6 py-2.5 rounded-xl transition-colors shadow-lg shadow-[#7166dc]/30">
            CREATE GOAL
          </button>
        </div>
      </form>
    </div>
  );
}

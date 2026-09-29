import React, { useState } from 'react';

export default function DailyLogForm({ goals, onSubmit, onCancel }) {
  const [logEntries, setLogEntries] = useState(
    goals.map(g => ({ goalId: g.id, minutes: 0 }))
  );
  const [note, setNote] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    const validEntries = logEntries.filter(e => e.minutes > 0);
    if (validEntries.length === 0) {
      alert("Must log minutes for at least one goal.");
      return;
    }
    onSubmit({ entries: validEntries, note, date: todayStr });
  };

  const updateMinutes = (goalId, minutes) => {
    setLogEntries(prev => prev.map(e => e.goalId === goalId ? { ...e, minutes: Number(minutes) } : e));
  };

  return (
    <div className="glass-card p-6 max-w-2xl mx-auto rounded-3xl" style={{ borderTop: '4px solid #7166dc' }}>
      <div className="flex justify-between items-center mb-6 border-b border-white/50 pb-4">
        <h2 className="text-xl font-bold tracking-tight text-[#25283b]">Log Daily Pace <span className="text-sm font-normal text-[#969caf] ml-2 font-mono">{todayStr}</span></h2>
        <button onClick={onCancel} className="text-[#969caf] hover:text-[#25283b] transition-colors">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          {goals.map(g => {
            const entry = logEntries.find(e => e.goalId === g.id);
            const title = g.title || g.name;
            return (
              <div key={g.id} className="flex justify-between items-center p-3 rounded-2xl bg-white/40 border border-white/60">
                <label className="text-sm font-bold text-[#4c5166]">{title}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={entry.minutes}
                    onChange={(e) => updateMinutes(g.id, e.target.value)}
                    className="w-20 px-3 py-1.5 font-bold bg-white/60 border border-white rounded-lg focus:outline-none focus:border-[#7166dc] text-[#25283b]"
                  />
                  <span className="text-xs text-[#969caf] font-bold uppercase">min</span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-[#969caf] font-bold mb-2">End of Day Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-white/40 border border-white/60 rounded-xl px-4 py-3 text-sm text-[#25283b] focus:outline-none focus:border-[#7166dc] placeholder:text-[#969caf]/70"
            rows={2}
            placeholder="What blocked you? What accelerated you?"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-[#7166dc] hover:bg-[#5d51ce] text-white font-bold px-6 py-2.5 rounded-xl transition-colors tracking-wide shadow-lg shadow-[#7166dc]/30">
            COMMIT LOG
          </button>
        </div>
      </form>
    </div>
  );
}

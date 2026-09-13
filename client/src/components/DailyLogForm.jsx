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
    <div className="glass-card-strong p-6 mb-8 max-w-2xl mx-auto border-amber-500/30">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold font-mono tracking-tight text-amber-400">Log Daily Pace - {todayStr}</h2>
        <button onClick={onCancel} className="text-zinc-500 hover:text-zinc-300">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-3">
          {goals.map(g => {
            const entry = logEntries.find(e => e.goalId === g.id);
            return (
              <div key={g.id} className="flex justify-between items-center p-3 rounded-xl bg-surface/50 border border-surface-border/50 backdrop-blur-sm">
                <label className="text-sm font-medium text-zinc-200">{g.name}</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={entry.minutes}
                    onChange={(e) => updateMinutes(g.id, e.target.value)}
                    className="w-20 px-3 py-1.5 font-num bg-canvas border border-surface-borderStrong rounded-lg focus:outline-none focus:border-amber-500 text-zinc-100"
                  />
                  <span className="text-xs text-zinc-400 font-mono">min</span>
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <label className="block text-xs uppercase tracking-widest text-zinc-400 font-mono mb-2">End of Day Note (Optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-canvas/80 border border-surface-borderStrong rounded-xl px-4 py-3 text-sm text-zinc-100 focus:outline-none focus:border-amber-500 backdrop-blur-sm"
            rows={2}
            placeholder="What blocked you? What accelerated you?"
          />
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" className="bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold px-6 py-2.5 rounded-xl transition-colors font-mono tracking-wide shadow-lg shadow-amber-500/20">
            COMMIT LOG
          </button>
        </div>
      </form>
    </div>
  );
}

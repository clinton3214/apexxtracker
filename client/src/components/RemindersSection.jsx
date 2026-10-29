import React, { useState } from 'react';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
    <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const BellIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

export default function RemindersSection({
  reminders = [],
  onCreateReminder,
  onToggleReminder,
  onDeleteReminder,
  isStandalone = false
}) {
  const [text, setText] = useState('');
  const [time, setTime] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);

  const pendingReminders = reminders.filter(r => !r.completed);
  const completedReminders = reminders.filter(r => r.completed);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setSubmitting(true);
    try {
      await onCreateReminder({
        text: text.trim(),
        time: time.trim()
      });
      setText('');
      setTime('');
    } catch (err) {
      console.error('Error creating reminder:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className={`glass-card ${isStandalone ? 'p-6 sm:p-8 rounded-[28px]' : 'p-6 rounded-[24px]'}`}>
      <div className="panel-head flex justify-between items-center mb-5">
        <div>
          <span className="eyebrow flex items-center gap-1.5">
            <BellIcon />
            Instant &amp; Timed Alerts
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-[#25283b] mt-0.5">
            Telegram Reminders
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#7166dc]/15 text-[#7166dc] border border-[#7166dc]/30">
            {pendingReminders.length} pending
          </span>
        </div>
      </div>

      {/* Reminder Input Form */}
      <form onSubmit={handleAdd} className="space-y-3 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1 relative">
            <input
              type="text"
              required
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="What do you need to be reminded of?"
              className="w-full bg-white/50 border border-white rounded-xl px-4 py-2.5 text-sm text-[#25283b] font-medium focus:outline-none focus:border-[#7166dc]/70 placeholder:text-[#969caf]/70 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <div className="relative flex items-center">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                title="Optional alert time"
                className="bg-white/50 border border-white rounded-xl px-3 py-2.5 text-xs text-[#25283b] font-mono focus:outline-none focus:border-[#7166dc]/70 transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || !text.trim()}
              className="bg-[#7166dc] hover:bg-[#5d51ce] disabled:opacity-50 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition-colors tracking-wide shadow-md shadow-[#7166dc]/25 flex-shrink-0 flex items-center gap-1.5"
            >
              <span>+ Add</span>
            </button>
          </div>
        </div>
        <div className="text-[11px] text-[#969caf] flex items-center gap-1">
          <ClockIcon />
          <span>Optional time. Pending reminders are dispatched automatically via your Telegram bot cron.</span>
        </div>
      </form>

      {/* Pending Reminders List */}
      <div className="space-y-2">
        {pendingReminders.length === 0 ? (
          <div className="p-6 text-center text-[#969caf] text-xs border border-dashed border-[#969caf]/30 rounded-2xl bg-white/20">
            No active reminders right now. Type one above to schedule!
          </div>
        ) : (
          pendingReminders.map(rem => (
            <div
              key={rem.id}
              className="group p-3 rounded-2xl bg-white/50 hover:bg-white/70 border border-white/70 transition-all flex items-center justify-between gap-3 shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => onToggleReminder(rem.id)}
                  title="Mark as completed"
                  className="w-5 h-5 rounded-lg border-2 border-[#969caf]/60 hover:border-[#7166dc] flex items-center justify-center transition-colors flex-shrink-0"
                >
                  <span className="w-2.5 h-2.5 rounded-sm bg-transparent group-hover:bg-[#7166dc]/20" />
                </button>

                <span className="text-sm font-medium text-[#25283b] break-words flex-1">
                  {rem.text}
                </span>

                {rem.time && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#7166dc] bg-[#7166dc]/10 px-2.5 py-0.5 rounded-full border border-[#7166dc]/20 flex-shrink-0">
                    <ClockIcon />
                    {rem.time}
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => onDeleteReminder(rem.id)}
                title="Delete reminder"
                className="text-[#969caf] hover:text-rose-500 p-1.5 transition-colors opacity-70 group-hover:opacity-100 flex-shrink-0"
              >
                <TrashIcon />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Completed Reminders Accordion */}
      {completedReminders.length > 0 && (
        <div className="mt-5 pt-4 border-t border-white/40">
          <button
            type="button"
            onClick={() => setShowCompleted(!showCompleted)}
            className="text-xs font-bold text-[#969caf] hover:text-[#4c5166] flex items-center gap-1.5 uppercase tracking-wider mb-2"
          >
            <span>{showCompleted ? '▲ Hide' : '▼ Show'} Completed ({completedReminders.length})</span>
          </button>

          {showCompleted && (
            <div className="space-y-1.5 pt-1">
              {completedReminders.map(rem => (
                <div
                  key={rem.id}
                  className="p-2.5 rounded-xl bg-white/20 border border-white/30 flex items-center justify-between gap-2 opacity-60 hover:opacity-100 transition-opacity"
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                      type="button"
                      onClick={() => onToggleReminder(rem.id)}
                      title="Mark as uncompleted"
                      className="w-4 h-4 rounded-md bg-emerald-500 text-white flex items-center justify-center flex-shrink-0"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                        <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <span className="text-xs text-[#969caf] line-through truncate">
                      {rem.text}
                    </span>
                    {rem.time && (
                      <span className="text-[10px] text-[#969caf] font-mono">
                        {rem.time}
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => onDeleteReminder(rem.id)}
                    title="Delete reminder"
                    className="text-[#969caf] hover:text-rose-500 p-1 transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

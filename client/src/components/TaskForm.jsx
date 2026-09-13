import React, { useState } from 'react';

const LiquidSelect = ({ value, options, onChange, className }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div 
      className="relative inline-block" 
      tabIndex={-1}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setIsOpen(false);
      }}
    >
      <button 
        type="button" 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-between gap-1.5 min-w-[70px] ${className}`}
      >
        {options.find(o => o.value === value)?.label}
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-3 w-3 opacity-60 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 20 20" fill="currentColor">
           <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      {isOpen && (
        <div className="absolute top-full left-0 mt-1.5 w-max min-w-full bg-surface/80 backdrop-blur-2xl border border-white/20 rounded-xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] z-50 animate-in fade-in zoom-in-95 duration-200">
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setIsOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-mono transition-colors ${value === opt.value ? 'bg-amber-500/20 text-amber-400' : 'text-zinc-200 hover:bg-white/10'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState('medium');
  const [targetType, setTargetType] = useState('today');
  const [customDate, setCustomDate] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    let finalTargetDay = targetType;
    if (targetType === 'custom') {
      if (!customDate) return;
      finalTargetDay = customDate;
    }
    
    onSubmit({ title, priority, targetDay: finalTargetDay, estimatedMinutes, goalId: null });
    setTitle('');
    setEstimatedMinutes(30);
  };

  const glassInputStyle = "bg-surface/30 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 focus:outline-none focus:border-amber-500/50 transition-colors shadow-sm";
  const glassButtonStyle = "bg-surface/30 hover:bg-surface/50 backdrop-blur-md border border-white/10 rounded-lg px-2 py-1.5 text-xs text-zinc-100 transition-colors shadow-sm";

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-3 flex flex-wrap gap-2 items-center">
      <input
        type="text"
        required
        placeholder="New task..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className={`flex-1 min-w-[200px] text-sm px-3 ${glassInputStyle}`}
      />
      
      <LiquidSelect 
        value={priority}
        onChange={setPriority}
        options={[
          { value: 'high', label: 'High' },
          { value: 'medium', label: 'Med' },
          { value: 'low', label: 'Low' }
        ]}
        className={`${glassButtonStyle} font-mono`}
      />

      <div className="flex items-center gap-1">
        <LiquidSelect 
          value={targetType}
          onChange={setTargetType}
          options={[
            { value: 'today', label: 'Today' },
            { value: 'tomorrow', label: 'Tomorrow' },
            { value: 'custom', label: 'Custom' }
          ]}
          className={`${glassButtonStyle} font-mono`}
        />

        {targetType === 'custom' && (
          <div className="animate-in fade-in slide-in-from-left-2 duration-300">
            <input 
              type="date" 
              required
              value={customDate}
              onChange={e => setCustomDate(e.target.value)}
              className={`${glassInputStyle} font-num w-32`}
            />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <input 
          type="number" 
          min="5" 
          step="5"
          value={estimatedMinutes}
          onChange={e => setEstimatedMinutes(Number(e.target.value))}
          className={`${glassInputStyle} font-num w-16`}
        />
        <span className="text-[10px] text-zinc-500 font-mono">min</span>
      </div>

      <button 
        type="submit"
        className="ml-auto md:ml-0 bg-amber-500/20 hover:bg-amber-500/30 backdrop-blur-md border border-amber-500/50 text-amber-400 px-4 py-1.5 rounded-lg text-xs font-mono font-bold transition-colors shadow-sm"
      >
        ADD
      </button>
    </form>
  );
}

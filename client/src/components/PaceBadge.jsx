import React from 'react';

export default function PaceBadge({ status, label, size = 'normal' }) {
  const styles = {
    ahead: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 backdrop-blur-sm',
    onTrack: 'bg-sky-500/20 text-sky-400 border-sky-500/40 backdrop-blur-sm',
    behind: 'bg-rose-500/20 text-rose-400 border-rose-500/40 backdrop-blur-sm',
    nodata: 'bg-zinc-800/40 text-zinc-400 border-zinc-600/40 backdrop-blur-sm'
  };

  const dotColor = {
    ahead: 'bg-emerald-400',
    onTrack: 'bg-sky-400',
    behind: 'bg-rose-400',
    nodata: 'bg-zinc-400'
  };

  const textClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-num font-semibold uppercase tracking-wider rounded-full border ${styles[status] || styles.nodata} ${textClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor[status] || dotColor.nodata} animate-pulse`} />
      {label}
    </span>
  );
}

import React from 'react';

export default function PaceBadge({ status, label, size = 'normal' }) {
  const textClass = size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-[10px] px-2.5 py-1';

  return (
    <span className={`badge ${status} ${textClass}`}>
      {label}
    </span>
  );
}

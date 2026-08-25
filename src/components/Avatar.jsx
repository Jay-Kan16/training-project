import React from 'react';
import { colorForName, initialsForName } from '../utils/format';

export default function Avatar({ name, size = 36, className = '' }) {
  const bg = colorForName(name || '');
  return (
    <div
      className={`flex items-center justify-center rounded-full font-semibold text-white shrink-0 ${className}`}
      style={{ backgroundColor: bg, width: size, height: size, fontSize: size * 0.4 }}
      title={name}
    >
      {initialsForName(name || '')}
    </div>
  );
}

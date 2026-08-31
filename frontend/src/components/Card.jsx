import React from 'react';

export default function Card({ className = '', children, ...props }) {
  return (
    <div
      className={`app-card bg-surface-card/90 backdrop-blur-sm rounded-2xl border border-white/5 shadow-sm shadow-black/20 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

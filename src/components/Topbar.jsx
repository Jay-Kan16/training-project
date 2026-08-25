import React from 'react';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { BellIcon } from './icons';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();

  return (
    <header className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-4 shrink-0">
        <button
          type="button"
          className="w-9 h-9 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center hover:bg-amber-100 transition-colors"
          aria-label="Notifications"
        >
          <BellIcon width={18} height={18} />
        </button>
        <div className="flex items-center gap-2.5">
          <Avatar name={user?.name} size={36} />
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-gray-800 leading-tight">{user?.name}</p>
            <p className="text-xs text-gray-400 leading-tight">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

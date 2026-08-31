import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import Avatar from './Avatar';
import NotificationDropdown from './NotificationDropdown';
import { BellIcon } from './icons';

export default function Topbar({ title, subtitle }) {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="flex items-start justify-between mb-7">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary-300 mb-1">Splitzy workspace</p>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3 sm:gap-4 shrink-0 relative">
        <button
          type="button"
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={`relative w-10 h-10 rounded-xl bg-surface-card border transition-colors flex items-center justify-center ${
            unreadCount > 0
              ? 'text-amber-400 border-amber-500/30 bg-amber-500/10'
              : 'text-slate-400 border-white/5 hover:bg-white/5 hover:text-white'
          }`}
          aria-label="Notifications"
        >
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center ring-2 ring-surface-card animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
          <BellIcon width={18} height={18} />
        </button>

        <NotificationDropdown
          isOpen={dropdownOpen}
          onClose={() => setDropdownOpen(false)}
        />

        <div className="flex items-center gap-2.5 bg-surface-card/80 border border-white/5 rounded-xl px-2 py-1.5">
          <div className="avatar-glow rounded-full">
            <Avatar name={user?.name} size={36} />
          </div>
          <div className="hidden sm:block pr-1">
            <p className="text-sm font-bold text-slate-100 leading-tight">{user?.name}</p>
            <p className="text-xs text-slate-500 leading-tight max-w-[150px] truncate">{user?.email}</p>
          </div>
        </div>
      </div>
    </header>
  );
}

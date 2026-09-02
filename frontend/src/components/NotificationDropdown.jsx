import React, { useRef, useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';
import { formatTimeAgo } from '../utils/format';
import Avatar from './Avatar';
import { BellIcon, CheckIcon, TrashIcon } from './icons';

export default function NotificationDropdown({ isOpen, onClose }) {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className="fixed inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-12 z-50 sm:w-96 rounded-2xl bg-surface-card/95 backdrop-blur-2xl border border-white/10 shadow-2xl p-4 stagger shadow-black/80 max-h-[75vh] flex flex-col"
    >
      <div className="flex items-center justify-between pb-3 border-b border-white/5">
        <div className="flex items-center gap-2">
          <BellIcon width={16} height={16} className="text-amber-400" />
          <h3 className="font-bold text-sm text-white">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              {unreadCount} new
            </span>
          )}
        </div>

        {notifications.length > 0 && unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-xs text-primary-300 hover:text-primary-200 transition-colors flex items-center gap-1 font-medium"
          >
            <CheckIcon width={12} height={12} />
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-white/5 py-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <BellIcon width={28} height={28} className="mx-auto mb-2 opacity-30" />
            <p className="text-xs">No notifications yet</p>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.read && markAsRead(n._id)}
              className={`py-3 px-2 rounded-xl flex items-start gap-3 transition-colors cursor-pointer ${
                !n.read
                  ? 'bg-white/[0.04] hover:bg-white/[0.07]'
                  : 'hover:bg-white/[0.02] opacity-75'
              }`}
            >
              <div className="relative mt-0.5 shrink-0">
                <Avatar name={n.sender?.name || 'Splitzy'} size={32} />
                {!n.read && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-surface-card" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-slate-100 leading-snug">
                  {n.message}
                </p>
                <span className="text-[10px] text-slate-500 block mt-1">
                  {formatTimeAgo(n.createdAt)}
                </span>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(n._id);
                }}
                className="text-slate-500 hover:text-rose-400 p-1 transition-colors shrink-0"
                title="Delete notification"
              >
                <TrashIcon width={13} height={13} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


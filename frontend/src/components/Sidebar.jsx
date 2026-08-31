import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Avatar from './Avatar';
import { HomeIcon, SwapIcon, UsersIcon, RupeeIcon, ProfileIcon, LogoutIcon } from './icons';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: HomeIcon },
  { to: '/expenses', label: 'Expenses', icon: SwapIcon },
  { to: '/groups', label: 'Groups', icon: UsersIcon },
  { to: '/settlements', label: 'Settlements', icon: RupeeIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-surface-subtle border-r border-white/5 px-4 py-6">
      <div className="flex items-center gap-3 px-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 text-white flex items-center justify-center font-black shadow-lg shadow-primary-500/25 animate-[pulseSoft_3s_ease-in-out_infinite]">
          S
        </div>
        <div>
          <span className="text-xl font-black tracking-tight text-white">Splitzy</span>
          <p className="text-[10px] font-semibold uppercase tracking-[.18em] text-primary-300">Split smarter</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active bg-primary-200 text-primary-900 shadow-sm' : 'text-slate-400 hover:bg-white/5 hover:text-slate-100'} flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-white/5">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="avatar-glow rounded-full">
            <Avatar name={user?.name} size={38} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-100 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">Free Account</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm text-slate-400 hover:bg-rose-500/15 hover:text-rose-400"
        >
          <LogoutIcon width={18} height={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

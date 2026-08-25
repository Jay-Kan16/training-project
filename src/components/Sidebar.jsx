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
    <aside className="hidden md:flex md:flex-col w-64 shrink-0 h-screen sticky top-0 bg-white border-r border-gray-100 px-4 py-6">
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-8 h-8 rounded-lg bg-primary-600 text-white flex items-center justify-center font-bold">
          S
        </div>
        <span className="text-lg font-bold text-gray-900">Splitzy</span>
      </div>

      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="pt-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <Avatar name={user?.name} size={36} />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 truncate">Free Account</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-800"
        >
          <LogoutIcon width={18} height={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}

import React from 'react';
import { NavLink } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { HomeIcon, SwapIcon, UsersIcon, RupeeIcon, ProfileIcon } from '../components/icons';

const MOBILE_NAV_ITEMS = [
  { to: '/dashboard', label: 'Home', icon: HomeIcon },
  { to: '/expenses', label: 'Expenses', icon: SwapIcon },
  { to: '/groups', label: 'Groups', icon: UsersIcon },
  { to: '/settlements', label: 'Settle', icon: RupeeIcon },
  { to: '/profile', label: 'Profile', icon: ProfileIcon },
];

export default function AppLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6">{children}</main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 flex justify-around py-2 z-20">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-2 py-1 text-[11px] font-medium ${
                isActive ? 'text-primary-600' : 'text-gray-400'
              }`
            }
          >
            <Icon width={20} height={20} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

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
    <div className="min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 pb-24 md:pb-6 page-enter">
          {children}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-card/90 backdrop-blur-xl border-t border-white/5 flex justify-around py-2 z-20 shadow-[0_-8px_30px_rgba(15,23,42,.06)]">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active text-primary-300 bg-primary-500/15' : 'text-slate-500'} flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold`
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

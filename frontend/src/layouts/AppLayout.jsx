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
    <div className="min-h-screen flex flex-col md:flex-row bg-surface">
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-4 sm:py-6 pb-28 md:pb-8 page-enter">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-surface-card/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 pt-1.5 bottom-nav-safe z-40 shadow-[0_-10px_35px_rgba(0,0,0,0.5)]">
        {MOBILE_NAV_ITEMS.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center min-w-[56px] py-1 px-2 rounded-xl transition-all duration-200 active:scale-90 ${
                isActive
                  ? 'text-primary-300 font-bold bg-primary-500/15 shadow-sm shadow-primary-500/10'
                  : 'text-slate-400 hover:text-slate-200 font-medium'
              }`
            }
          >
            <div className="relative">
              <Icon width={20} height={20} className="transition-transform duration-200" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight leading-tight">{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import Avatar from '../components/Avatar';
import { LogoutIcon } from '../components/icons';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <Topbar title="Profile" subtitle="Manage your profile & account." />

      <Card className="p-5 sm:p-6 max-w-2xl page-enter">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="avatar-glow rounded-full mb-3">
            <Avatar name={user?.name} size={68} />
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white">{user?.name}</h2>
          <p className="text-xs sm:text-sm text-slate-400">{user?.email}</p>
        </div>

        <div className="divide-y divide-white/5 border-t border-white/5">
          <div className="py-3.5 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-slate-500">Full Name</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-100">{user?.name}</p>
          </div>
          <div className="py-3.5 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-slate-500">Email Address</p>
            <p className="text-xs sm:text-sm font-semibold text-slate-100">{user?.email}</p>
          </div>
          <div className="py-3.5 flex justify-between items-center">
            <p className="text-xs sm:text-sm text-slate-500">Account Tier</p>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
              Free Account
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 text-rose-400 border border-rose-500/20 font-semibold text-xs sm:text-sm py-2.5 rounded-xl transition-all"
          >
            <LogoutIcon width={16} height={16} />
            Log out of Splitzy
          </button>
        </div>
      </Card>
    </div>
  );
}

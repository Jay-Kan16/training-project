import React from 'react';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import Avatar from '../components/Avatar';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <Topbar title="Profile" subtitle="Manage your expenses easily." />

      <Card className="p-6 max-w-2xl page-enter">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar name={user?.name} size={72} className="mb-3" />
          <h2 className="text-lg font-bold text-white">{user?.name}</h2>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>

        <div className="divide-y divide-white/5 border-t border-white/5">
          <div className="py-4">
            <p className="text-xs text-slate-500 mb-1">Name</p>
            <p className="text-sm font-semibold text-slate-100">{user?.name}</p>
          </div>
          <div className="py-4">
            <p className="text-xs text-slate-500 mb-1">Email</p>
            <p className="text-sm font-semibold text-slate-100">{user?.email}</p>
          </div>
          <div className="py-4">
            <p className="text-xs text-slate-500 mb-1">Account</p>
            <p className="text-sm font-semibold text-slate-100">Free Account</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

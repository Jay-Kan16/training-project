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

      <Card className="p-6 max-w-2xl">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar name={user?.name} size={72} className="mb-3" />
          <h2 className="text-lg font-bold text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        <div className="divide-y divide-gray-100 border-t border-gray-100">
          <div className="py-4">
            <p className="text-xs text-gray-400 mb-1">Name</p>
            <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
          </div>
          <div className="py-4">
            <p className="text-xs text-gray-400 mb-1">Email</p>
            <p className="text-sm font-semibold text-gray-800">{user?.email}</p>
          </div>
          <div className="py-4">
            <p className="text-xs text-gray-400 mb-1">Account</p>
            <p className="text-sm font-semibold text-gray-800">Free Account</p>
          </div>
        </div>
      </Card>
    </div>
  );
}

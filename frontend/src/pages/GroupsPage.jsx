import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { useOverview } from '../hooks/useOverview';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import { PlusIcon, CloseIcon } from '../components/icons';
import { formatCurrency, getGroupEmoji } from '../utils/format';

function CreateGroupModal({ open, onClose }) {
  const { createGroup } = useExpenses();
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) return setError('Group name is required');
    setSubmitting(true);
    try {
      await createGroup({ name, members: [] });
      setName('');
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create group');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => onClose(false)} />
      <div className="relative bg-surface-card/95 backdrop-blur-2xl w-full max-w-sm rounded-t-3xl sm:rounded-3xl shadow-2xl p-5 sm:p-6 modal-panel border-t sm:border border-white/10">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-surface-hover hover:bg-surface-border flex items-center justify-center text-slate-400 transition-colors"
          aria-label="Close modal"
        >
          <CloseIcon width={16} height={16} />
        </button>
        <h2 className="text-xl font-bold text-white mb-1">Create Group</h2>
        <p className="text-xs sm:text-sm text-slate-400 mb-4 sm:mb-5">Give your new expense group a name.</p>
        {error && <p className="text-xs sm:text-sm text-rose-400 mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="e.g. Goa Trip"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-white/10 rounded-xl px-3 py-3 sm:py-2.5 text-base sm:text-sm bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-500"
            autoFocus
          />
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 disabled:opacity-50 text-white font-bold text-sm sm:text-base py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            {submitting ? 'Creating…' : 'Create Group'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function GroupsPage() {
  const { groups, fetchOverview, overviewLoading, groupBalancesById } = useExpenses();
  const { myId } = useOverview();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const groupTotal = (groupId) => {
    const data = groupBalancesById[groupId];
    if (!data) return 0;
    const balancesList = Array.isArray(data.balances) ? data.balances : [];
    const mine = balancesList.find((b) => String(b.user) === String(myId));
    return Math.abs(mine?.balance || 0);
  };

  return (
    <div>
      <Topbar title="Groups" subtitle="Manage your expense groups." />

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 sm:mb-5 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-100 text-sm sm:text-base">Your Groups</h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage your expense groups.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon width={16} height={16} /> Create Group
          </button>
        </div>

        {overviewLoading && groups.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No groups yet — create one to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 stagger">
            {groups.map((g) => (
              <div key={g._id} className="app-card border border-white/5 rounded-2xl p-4 bg-surface-card/80">
                <span className="w-11 h-11 rounded-xl bg-primary-500/15 flex items-center justify-center text-xl mb-3">
                  {getGroupEmoji(g.name)}
                </span>
                <p className="font-semibold text-slate-100 text-sm sm:text-base">{g.name}</p>
                <p className="text-xs text-slate-500 mb-2">{g.members?.length || 0} members</p>
                <p className="text-lg font-black text-white mb-3">{formatCurrency(groupTotal(g._id))}</p>
                <Link
                  to={`/groups/${g._id}`}
                  className="block text-center bg-primary-500/15 hover:bg-primary-500/25 active:scale-95 text-primary-200 text-xs sm:text-sm font-semibold py-2.5 rounded-xl transition-all"
                >
                  Open Group →
                </Link>
              </div>
            ))}
          </div>
        )}
      </Card>

      <CreateGroupModal
        open={modalOpen}
        onClose={(changed) => {
          setModalOpen(false);
          if (changed) fetchOverview();
        }}
      />
    </div>
  );
}

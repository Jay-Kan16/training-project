import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import Card from '../components/Card';
import AddExpenseModal from '../components/AddExpenseModal';
import ExpenseList from '../components/ExpenseList';
import BalanceSummary from '../components/BalanceSummary';
import ExpensePieChart from '../components/Charts/ExpensePieChart';
import ExpenseBarChart from '../components/Charts/ExpenseBarChart';
import { ArrowLeftIcon, PlusIcon, CloseIcon, UsersIcon } from '../components/icons';
import { getGroupEmoji } from '../utils/format';

function AddMemberModal({ open, onClose, groupId }) {
  const { addMember } = useExpenses();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setEmail('');
      setError('');
      setSuccess('');
      setSubmitting(false);
    }
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) {
      setError('Enter the member’s email address');
      return;
    }

    setSubmitting(true);
    try {
      const result = await addMember(groupId, normalizedEmail);
      setSuccess(result.message || 'Member added successfully');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface-card/95 backdrop-blur-2xl p-5 sm:p-6 shadow-2xl modal-panel border-t sm:border border-white/10">
        <div className="w-12 h-1.5 bg-white/20 rounded-full mx-auto mb-3 sm:hidden" />
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-surface-hover text-slate-400 hover:bg-surface-border transition-colors"
          aria-label="Close"
        >
          <CloseIcon width={16} height={16} />
        </button>

        <div className="mb-4 sm:mb-5 pr-8">
          <div className="mb-2 sm:mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500/15 text-primary-300">
            <UsersIcon width={20} height={20} />
          </div>
          <h2 className="text-xl font-bold text-white">Add member</h2>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-400">
            Enter the email address of an existing Splitzy account.
          </p>
        </div>

        {error && (
          <p className="mb-3 rounded-xl bg-rose-500/15 px-3 py-2 text-xs sm:text-sm text-rose-400">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 rounded-xl bg-emerald-500/15 px-3 py-2 text-xs sm:text-sm text-emerald-300">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="member-email" className="mb-1 block text-xs sm:text-sm font-medium text-slate-300">
              Email address
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full rounded-xl border border-white/10 bg-surface-card px-3 py-3 sm:py-2.5 text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
              required
            />
          </div>

          <div className="flex gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="flex-1 rounded-xl border border-white/10 bg-surface-card px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-surface-hover transition-colors"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-xl bg-emerald-500 px-4 py-3 sm:py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 disabled:opacity-50 shadow-lg shadow-emerald-500/20"
            >
              {submitting ? 'Adding…' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GroupDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeGroup, selectGroup, loading, error } = useExpenses();
  const [modalOpen, setModalOpen] = useState(false);
  const [memberModalOpen, setMemberModalOpen] = useState(false);

  useEffect(() => {
    selectGroup(id);
  }, [id]);

  const isMember = activeGroup?.members?.some(
    (m) => String(m._id || m) === String(user?.id || user?._id)
  );
  const canAddMember = Boolean(isMember || user?.role === 'admin');

  return (
    <div className="page-enter">
      <button
        onClick={() => navigate('/groups')}
        className="mb-4 flex items-center gap-1.5 text-xs sm:text-sm text-slate-400 hover:text-slate-100 transition-colors"
      >
        <ArrowLeftIcon width={16} height={16} /> Back to groups
      </button>

      {loading && !activeGroup ? (
        <p className="py-8 text-center text-sm text-slate-500">Loading…</p>
      ) : !activeGroup ? (
        <p className="py-8 text-center text-sm text-slate-400">{error || 'Group not found.'}</p>
      ) : (
        <>
          <div className="mb-5 sm:mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary-500/15 text-xl sm:text-2xl shrink-0">
                {getGroupEmoji(activeGroup.name)}
              </span>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-xl font-bold text-white truncate">{activeGroup.name}</h1>
                <p className="text-xs sm:text-sm text-slate-400">
                  {activeGroup.members?.length || 0} {activeGroup.members?.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {canAddMember && (
                <button
                  onClick={() => setMemberModalOpen(true)}
                  className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-primary-400/30 bg-surface-card px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-semibold text-primary-200 transition-all hover:bg-primary-500/15 active:scale-95"
                >
                  <UsersIcon width={15} height={15} /> Add Member
                </button>
              )}
              <button
                onClick={() => setModalOpen(true)}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-3.5 sm:px-4 py-2.5 text-xs sm:text-sm font-bold text-white transition-all hover:bg-emerald-600 active:scale-95 shadow-lg shadow-emerald-500/20"
              >
                <PlusIcon width={15} height={15} /> Add Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-4 sm:p-5">
                <h2 className="mb-4 font-semibold text-slate-100 text-sm sm:text-base">Expenses</h2>
                <ExpenseList />
              </Card>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <Card className="p-4 sm:p-5">
                <BalanceSummary />
              </Card>
              <Card className="p-4 sm:p-5">
                <h3 className="mb-2 font-medium text-slate-100 text-sm sm:text-base">By payer</h3>
                <ExpensePieChart />
              </Card>
              <Card className="p-4 sm:p-5">
                <h3 className="mb-2 font-medium text-slate-100 text-sm sm:text-base">Spend over time</h3>
                <ExpenseBarChart />
              </Card>
            </div>
          </div>
        </>
      )}

      <AddExpenseModal
        open={modalOpen}
        defaultGroupId={id}
        onClose={() => setModalOpen(false)}
      />

      <AddMemberModal
        open={memberModalOpen}
        groupId={id}
        onClose={() => setMemberModalOpen(false)}
      />
    </div>
  );
}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-gray-900/40" onClick={() => !submitting && onClose()} />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <button
          type="button"
          onClick={() => !submitting && onClose()}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200"
          aria-label="Close"
        >
          <CloseIcon width={16} height={16} />
        </button>

        <div className="mb-5 pr-8">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <UsersIcon width={20} height={20} />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Add member</h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter the email address of an existing Splitzy account.
          </p>
        </div>

        {error && (
          <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}
        {success && (
          <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="member-email" className="mb-1.5 block text-sm font-medium text-gray-700">
              Email address
            </label>
            <input
              id="member-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="friend@example.com"
              className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              autoFocus
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => !submitting && onClose()}
              className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
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

  const canAddMember =
    activeGroup &&
    (String(activeGroup.createdBy?._id || activeGroup.createdBy) === String(user?.id) || user?.role === 'admin');

  return (
    <div>
      <button
        onClick={() => navigate('/groups')}
        className="mb-4 flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800"
      >
        <ArrowLeftIcon width={16} height={16} /> Back to groups
      </button>

      {loading && !activeGroup ? (
        <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
      ) : !activeGroup ? (
        <p className="py-8 text-center text-sm text-gray-500">{error || 'Group not found.'}</p>
      ) : (
        <>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-50 text-2xl">
                {getGroupEmoji(activeGroup.name)}
              </span>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{activeGroup.name}</h1>
                <p className="text-sm text-gray-500">
                  {activeGroup.members?.length || 0} {activeGroup.members?.length === 1 ? 'member' : 'members'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {canAddMember && (
                <button
                  onClick={() => setMemberModalOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-primary-200 bg-white px-4 py-2.5 text-sm font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                >
                  <UsersIcon width={16} height={16} /> Add Member
                </button>
              )}
              <button
                onClick={() => setModalOpen(true)}
                className="flex items-center gap-1.5 rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
              >
                <PlusIcon width={16} height={16} /> Add Expense
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <Card className="p-5">
                <h2 className="mb-4 font-semibold text-gray-800">Expenses</h2>
                <ExpenseList />
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="p-5">
                <BalanceSummary />
              </Card>
              <Card className="p-5">
                <h3 className="mb-2 font-medium text-gray-800">By payer</h3>
                <ExpensePieChart />
              </Card>
              <Card className="p-5">
                <h3 className="mb-2 font-medium text-gray-800">Spend over time</h3>
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

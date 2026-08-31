import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useOverview } from '../hooks/useOverview';
import Card from '../components/Card';
import Avatar from '../components/Avatar';
import AddExpenseModal from '../components/AddExpenseModal';
import { PlusIcon, ArrowUpIcon, ArrowDownIcon, RupeeIcon } from '../components/icons';
import { formatCurrency, formatRelativeDate, formatFullDate, getGroupEmoji, getExpenseCategory } from '../utils/format';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { groups, fetchOverview, overviewLoading } = useExpenses();
  const { totalOwe, totalOwed, netBalance, allExpenses, mySettlements } = useOverview();
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchOverview();
  }, []);

  const topSettlement = mySettlements[0];
  const recentExpenses = allExpenses.slice(0, 4);
  const topGroups = groups.slice(0, 3);

  return (
    <div className="page-enter">
      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase mb-1">
            {formatFullDate(new Date())}
          </p>
          <h1 className="text-2xl font-bold text-white">
            {greeting()}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-sm text-slate-400 mt-1">Here's what's happening with your expenses.</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors shrink-0"
        >
          <PlusIcon width={16} height={16} /> Add Expense
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 stagger">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">You owe</p>
            <span className="w-7 h-7 rounded-full bg-rose-500/15 text-rose-400 flex items-center justify-center">
              <ArrowDownIcon width={14} height={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-white stat-number">{formatCurrency(totalOwe)}</p>
          <p className="text-xs text-slate-500 mt-1">to settle up</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">You are owed</p>
            <span className="w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <ArrowUpIcon width={14} height={14} />
            </span>
          </div>
          <p className="text-2xl font-black text-white stat-number">{formatCurrency(totalOwed)}</p>
          <p className="text-xs text-slate-500 mt-1">across your groups</p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-400">Total balance</p>
            <span className="w-7 h-7 rounded-full bg-primary-500/15 text-primary-300 flex items-center justify-center">
              <RupeeIcon width={14} height={14} />
            </span>
          </div>
          <p className={`text-2xl font-black stat-number ${netBalance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {netBalance >= 0 ? '+' : ''}
            {formatCurrency(netBalance)}
          </p>
          <p className="text-xs text-slate-500 mt-1">
            {netBalance >= 0 ? "You're in the positive" : "You're a little behind"}
          </p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-100">Recent Expenses</h2>
              <p className="text-xs text-slate-500 mt-0.5">Your latest transactions</p>
            </div>
            <Link to="/expenses" className="text-sm text-primary-300 font-medium hover:underline">
              View all →
            </Link>
          </div>

          {overviewLoading && recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-500 py-6 text-center">Loading…</p>
          ) : recentExpenses.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              No expenses yet — add your first one to get started.
            </p>
          ) : (
            <ul className="divide-y divide-white/5 stagger">
              {recentExpenses.map((exp) => {
                const category = getExpenseCategory(exp.description);
                const paidByMe = String(exp.payer?._id) === String(user?.id || user?._id);
                return (
                  <li key={exp._id} className="interactive-row py-3 px-2 -mx-2 flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-9 h-9 rounded-lg bg-primary-500/15 flex items-center justify-center text-base shrink-0">
                        {category.emoji}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100 truncate">{exp.description}</p>
                        <p className="text-xs text-slate-500 truncate">
                          {exp.groupName} · {category.label} · {formatRelativeDate(exp.date)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 pl-3">
                      <p className="text-sm font-bold text-slate-100">{formatCurrency(exp.amount)}</p>
                      <p className="text-xs text-slate-500">{paidByMe ? 'You paid' : `${exp.payer?.name} paid`}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-semibold text-slate-100">Your Groups</h2>
              <p className="text-xs text-slate-500 mt-0.5">Expense groups</p>
            </div>
            <Link to="/groups" className="text-sm text-primary-300 font-medium hover:underline">
              View all →
            </Link>
          </div>

          {topGroups.length === 0 ? (
            <p className="text-sm text-slate-400 py-4">No groups yet.</p>
          ) : (
            <ul className="space-y-3 stagger">
              {topGroups.map((g) => (
                <li key={g._id} className="interactive-row p-2 -mx-2">
                  <Link to={`/groups/${g._id}`} className="flex items-center gap-3 group">
                    <span className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-lg shrink-0">
                      {getGroupEmoji(g.name)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-primary-300">
                        {g.name}
                      </p>
                      <p className="text-xs text-slate-500">{g.members?.length || 0} members</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            to="/groups"
            className="mt-4 flex items-center justify-center gap-1.5 w-full bg-primary-500/15 hover:bg-primary-500/25 text-primary-200 text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            <PlusIcon width={15} height={15} /> Create Group
          </Link>
        </Card>
      </div>

      {topSettlement && (
        <Card className="p-5 bg-primary-500/10 border-primary-500/20">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Avatar name={topSettlement.fromName === user?.name ? topSettlement.toName : topSettlement.fromName} />
              <div>
                <p className="text-xs font-semibold tracking-wider text-primary-300 uppercase">
                  Settlement suggestion
                </p>
                <p className="text-sm text-slate-300 mt-0.5">
                  <strong>{topSettlement.fromName}</strong> pays <strong>{topSettlement.toName}</strong>{' '}
                  {formatCurrency(topSettlement.amount)} in {topSettlement.groupName}
                </p>
              </div>
            </div>
            <Link
              to="/settlements"
              className="bg-surface-card border border-primary-400/30 text-primary-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary-500/25 transition-colors shrink-0"
            >
              View settlements
            </Link>
          </div>
        </Card>
      )}

      <button
        onClick={() => setModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-5 w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center z-20"
        aria-label="Add expense"
      >
        <PlusIcon />
      </button>

      <AddExpenseModal
        open={modalOpen}
        onClose={(changed) => {
          setModalOpen(false);
          if (changed) fetchOverview();
        }}
      />
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';
import { useOverview } from '../hooks/useOverview';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import AddExpenseModal from '../components/AddExpenseModal';
import { PlusIcon } from '../components/icons';
import { formatCurrency, formatRelativeDate, getExpenseCategory } from '../utils/format';

const DATE_FILTERS = [
  { value: '', label: 'All Dates' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
];

export default function ExpensesPage() {
  const { user } = useAuth();
  const { groups, fetchOverview, overviewLoading } = useExpenses();
  const { allExpenses } = useOverview();
  const [modalOpen, setModalOpen] = useState(false);
  const [groupFilter, setGroupFilter] = useState('');
  const [personFilter, setPersonFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    fetchOverview();
  }, []);

  const allPeople = useMemo(() => {
    const map = new Map();
    groups.forEach((g) => g.members?.forEach((m) => map.set(m._id, m.name)));
    return Array.from(map, ([id, name]) => ({ id, name }));
  }, [groups]);

  const filtered = useMemo(() => {
    return allExpenses.filter((e) => {
      if (groupFilter && e.groupId !== groupFilter) return false;
      if (personFilter && String(e.payer?._id) !== personFilter) return false;
      if (dateFilter) {
        const days = Number(dateFilter);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (new Date(e.date) < cutoff) return false;
      }
      return true;
    });
  }, [allExpenses, groupFilter, personFilter, dateFilter]);

  return (
    <div>
      <Topbar title="Expenses" subtitle="Manage your expenses easily." />

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-100">All Expenses</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track all your shared expenses.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg transition-colors"
          >
            <PlusIcon width={16} height={16} /> Add Expense
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 bg-surface-card"
          >
            <option value="">All Groups</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>
                {g.name}
              </option>
            ))}
          </select>

          <select
            value={personFilter}
            onChange={(e) => setPersonFilter(e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 bg-surface-card"
          >
            <option value="">All People</option>
            {allPeople.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-400 bg-surface-card"
          >
            {DATE_FILTERS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </div>

        {overviewLoading && filtered.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">Loading…</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">No expenses match these filters.</p>
        ) : (
          <ul className="divide-y divide-white/5 stagger">
            {filtered.map((exp) => {
              const category = getExpenseCategory(exp.description);
              const paidByMe = String(exp.payer?._id) === String(user?.id || user?._id);
              return (
                <li key={exp._id} className="interactive-row py-3.5 px-2 -mx-2 flex items-center justify-between">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-lg shrink-0">
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
                    <p className="text-xs text-slate-500">
                      {paidByMe ? (
                        'Paid by you'
                      ) : (
                        <>
                          Paid by <span className="text-primary-300">{exp.payer?.name}</span>
                        </>
                      )}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>

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

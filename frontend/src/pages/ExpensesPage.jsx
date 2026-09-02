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

      <Card className="p-4 sm:p-5">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
          <div>
            <h2 className="font-semibold text-slate-100 text-sm sm:text-base">All Expenses</h2>
            <p className="text-xs text-slate-500 mt-0.5">Track all your shared expenses.</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-semibold text-xs sm:text-sm px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
          >
            <PlusIcon width={16} height={16} /> Add Expense
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mb-4">
          <select
            value={groupFilter}
            onChange={(e) => setGroupFilter(e.target.value)}
            className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-300 bg-surface-card"
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
            className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-300 bg-surface-card"
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
            className="w-full border border-white/10 rounded-xl px-3 py-2.5 text-base sm:text-sm text-slate-300 bg-surface-card"
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
                <li key={exp._id} className="interactive-row py-3 sm:py-3.5 px-2 -mx-2 flex items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                    <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-primary-500/15 flex items-center justify-center text-base sm:text-lg shrink-0">
                      {category.emoji}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-semibold text-slate-100 truncate">{exp.description}</p>
                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {exp.groupName} · {category.label} · {formatRelativeDate(exp.date)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 pl-2">
                    <p className="text-xs sm:text-sm font-bold text-slate-100">{formatCurrency(exp.amount)}</p>
                    <p className="text-[10px] sm:text-xs text-slate-500">
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

import React, { useMemo, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import Filters from './Filters';
import { TrashIcon } from './icons';
import { formatCurrency, formatRelativeDate, getExpenseCategory } from '../utils/format';

export default function ExpenseList() {
  const { expenses, activeGroup, deleteExpense } = useExpenses();
  const { user } = useAuth();
  const [filters, setFilters] = useState({});

  const filtered = useMemo(() => {
    return expenses.filter((e) => {
      if (filters.payer && e.payer?._id !== filters.payer) return false;
      if (filters.startDate && new Date(e.date) < new Date(filters.startDate)) return false;
      if (filters.endDate && new Date(e.date) > new Date(filters.endDate)) return false;
      return true;
    });
  }, [expenses, filters]);

  if (!activeGroup) return null;

  return (
    <div>
      <Filters filters={filters} onChange={setFilters} members={activeGroup.members} />

      {filtered.length === 0 ? (
        <p className="text-sm text-slate-400 py-6 text-center">No expenses match these filters.</p>
      ) : (
        <ul className="divide-y divide-white/5">
          {filtered.map((exp) => {
            const category = getExpenseCategory(exp.description);
            const paidByMe = String(exp.payer?._id) === String(user?.id || user?._id);
            return (
              <li key={exp._id} className="py-3.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-10 h-10 rounded-lg bg-primary-500/15 flex items-center justify-center text-lg shrink-0">
                    {category.emoji}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-100 truncate">{exp.description}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {paidByMe ? 'You' : exp.payer?.name} paid · {category.label} ·{' '}
                      {formatRelativeDate(exp.date)} · {exp.participants?.length} people
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-sm font-bold text-slate-100">{formatCurrency(exp.amount)}</span>
                  <button
                    onClick={() => deleteExpense(exp._id)}
                    className="text-slate-600 hover:text-rose-400 transition-colors"
                    aria-label="Delete expense"
                  >
                    <TrashIcon width={16} height={16} />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

import React from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { formatCurrency } from '../utils/format';

export default function BalanceSummary() {
  const { balances, settlements, activeGroup } = useExpenses();

  if (!activeGroup) return null;

  return (
    <div className="space-y-5">
      <div>
        <h3 className="font-medium text-gray-800 mb-2">Balances</h3>
        <ul className="space-y-1.5">
          {balances.map((b) => (
            <li key={b.user} className="flex justify-between text-sm">
              <span className="text-gray-600">{b.name}</span>
              <span
                className={
                  b.balance > 0
                    ? 'text-green-600 font-medium'
                    : b.balance < 0
                    ? 'text-red-500 font-medium'
                    : 'text-gray-400'
                }
              >
                {b.balance > 0
                  ? `is owed ${formatCurrency(b.balance)}`
                  : b.balance < 0
                  ? `owes ${formatCurrency(Math.abs(b.balance))}`
                  : 'settled up'}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="font-medium text-gray-800 mb-2">Suggested settlements</h3>
        {settlements.length === 0 ? (
          <p className="text-sm text-gray-500">Everyone is settled up 🎉</p>
        ) : (
          <ul className="space-y-1.5">
            {settlements.map((s, i) => (
              <li key={i} className="text-sm bg-primary-50 text-primary-700 px-3 py-2 rounded-lg">
                <strong>{s.fromName}</strong> pays <strong>{s.toName}</strong> {formatCurrency(s.amount)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

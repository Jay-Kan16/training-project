import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function ExpensePieChart() {
  const { expenses } = useExpenses();

  const data = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      const name = e.payer?.name || 'Unknown';
      totals[name] = (totals[name] || 0) + e.amount;
    });
    return Object.entries(totals).map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }));
  }, [expenses]);

  if (data.length === 0) return <p className="text-sm text-slate-400">No data to chart yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={90}
          label={{ fill: '#cbd5e1', fontSize: 12 }}
        >
          {data.map((entry, index) => (
            <Cell key={entry.name} fill={COLORS[index % COLORS.length]} stroke="#0a0e18" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => `₹${value.toFixed(2)}`}
          contentStyle={{ backgroundColor: '#131a2b', border: '1px solid #232c42', borderRadius: 10, color: '#f1f5f9' }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#f1f5f9' }}
        />
        <Legend wrapperStyle={{ color: '#cbd5e1', fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

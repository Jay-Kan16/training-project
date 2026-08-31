import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useExpenses } from '../../context/ExpenseContext';

export default function ExpenseBarChart() {
  const { expenses } = useExpenses();

  const data = useMemo(() => {
    const totals = {};
    expenses.forEach((e) => {
      const day = new Date(e.date).toLocaleDateString();
      totals[day] = (totals[day] || 0) + e.amount;
    });
    return Object.entries(totals)
      .map(([date, total]) => ({ date, total: Math.round(total * 100) / 100 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [expenses]);

  if (data.length === 0) return <p className="text-sm text-slate-400">No data to chart yet.</p>;

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#232c42" />
        <XAxis dataKey="date" fontSize={12} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
        <YAxis fontSize={12} stroke="#64748b" tick={{ fill: '#94a3b8' }} />
        <Tooltip
          formatter={(value) => `₹${value.toFixed(2)}`}
          contentStyle={{ backgroundColor: '#131a2b', border: '1px solid #232c42', borderRadius: 10, color: '#f1f5f9' }}
          labelStyle={{ color: '#f1f5f9' }}
          itemStyle={{ color: '#f1f5f9' }}
          cursor={{ fill: 'rgba(99,102,241,0.08)' }}
        />
        <Bar dataKey="total" fill="#2dd4bf" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

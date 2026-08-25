import React, { useEffect, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useOverview } from '../hooks/useOverview';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import Avatar from '../components/Avatar';
import { formatCurrency } from '../utils/format';

export default function SettlementsPage() {
  const { fetchOverview, overviewLoading } = useExpenses();
  const { mySettlements, myId } = useOverview();
  const [actioned, setActioned] = useState({});

  useEffect(() => {
    fetchOverview();
  }, []);

  const act = (key, label) => setActioned((prev) => ({ ...prev, [key]: label }));

  return (
    <div>
      <Topbar title="Settlements" subtitle="See who owes whom." />

      <Card className="p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-gray-800">Settlements</h2>
          <p className="text-xs text-gray-400 mt-0.5">See who owes whom.</p>
        </div>

        {overviewLoading && mySettlements.length === 0 ? (
          <p className="text-sm text-gray-400 py-8 text-center">Loading…</p>
        ) : mySettlements.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">You're all settled up 🎉</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {mySettlements.map((s, i) => {
              const youOwe = String(s.from) === String(myId);
              const otherName = youOwe ? s.toName : s.fromName;
              const key = `${s.groupId}-${i}`;
              const status = actioned[key];

              return (
                <li key={key} className="py-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3">
                    <Avatar name={otherName} size={40} />
                    <div>
                      <p className="font-semibold text-gray-800">{otherName}</p>
                      <p className="text-xs text-gray-400">
                        {youOwe ? `You owe ${otherName}` : `${otherName} owes you`} · {s.groupName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-bold text-sm ${youOwe ? 'text-red-500' : 'text-green-600'}`}>
                      {formatCurrency(s.amount)}
                    </span>
                    {status ? (
                      <span className="text-xs font-semibold text-gray-400 px-3 py-1.5">{status}</span>
                    ) : (
                      <button
                        onClick={() => act(key, youOwe ? 'Marked settled' : 'Reminder sent')}
                        className="bg-primary-50 hover:bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                      >
                        {youOwe ? 'Settle' : 'Remind'}
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}

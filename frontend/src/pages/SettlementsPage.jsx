import React, {
  useEffect,
  useState,
} from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useNotifications } from '../context/NotificationContext';
import { useOverview } from '../hooks/useOverview';
import Card from '../components/Card';
import Topbar from '../components/Topbar';
import Avatar from '../components/Avatar';
import { formatCurrency } from '../utils/format';

export default function SettlementsPage() {
  const {
    fetchOverview,
    settleUp,
    overviewLoading,
  } = useExpenses();

  const { sendReminder } = useNotifications();

  const {
    mySettlements,
    myId,
  } = useOverview();

  const [actioned, setActioned] = useState({});
  const [settling, setSettling] = useState({});
  const [reminding, setReminding] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  const handleSettle = async (
    settlement,
    key
  ) => {
    try {
      setSettling((prev) => ({
        ...prev,
        [key]: true,
      }));

      setErrors((prev) => ({
        ...prev,
        [key]: '',
      }));

      await settleUp(
        settlement.groupId,
        myId,
        settlement.to,
        settlement.amount
      );

      setActioned((prev) => ({
        ...prev,
        [key]: 'Marked settled',
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [key]:
          err.message ||
          'Failed to settle payment',
      }));
    } finally {
      setSettling((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  const handleReminder = async (
    settlement,
    key
  ) => {
    try {
      setReminding((prev) => ({
        ...prev,
        [key]: true,
      }));

      setErrors((prev) => ({
        ...prev,
        [key]: '',
      }));

      await sendReminder({
        groupId: settlement.groupId,
        recipientId: settlement.from,
        amount: settlement.amount,
      });

      setActioned((prev) => ({
        ...prev,
        [key]: 'Reminder sent ✓',
      }));
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        [key]:
          err.message ||
          'Failed to send reminder',
      }));
    } finally {
      setReminding((prev) => ({
        ...prev,
        [key]: false,
      }));
    }
  };

  return (
    <div>
      <Topbar
        title="Settlements"
        subtitle="See who owes whom."
      />

      <Card className="p-4 sm:p-5">
        <div className="mb-4">
          <h2 className="font-semibold text-slate-100 text-sm sm:text-base">
            Settlements
          </h2>

          <p className="text-xs text-slate-500 mt-0.5">
            See who owes whom.
          </p>
        </div>

        {overviewLoading &&
        mySettlements.length === 0 ? (
          <p className="text-sm text-slate-500 py-8 text-center">
            Loading…
          </p>
        ) : mySettlements.length === 0 ? (
          <p className="text-sm text-slate-400 py-8 text-center">
            You're all settled up 🎉
          </p>
        ) : (
          <ul className="divide-y divide-white/5 stagger">
            {mySettlements.map((s, i) => {
              const youOwe =
                String(s.from) ===
                String(myId);

              const otherName = youOwe
                ? s.toName
                : s.fromName;

              const key = `${s.groupId}-${i}`;

              const status =
                actioned[key];

              const isSettling =
                settling[key];

              const isReminding =
                reminding[key];

              const error =
                errors[key];

              return (
                <li
                  key={key}
                  className="interactive-row py-3.5 sm:py-4 px-2 -mx-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      name={otherName}
                      size={40}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-100 text-xs sm:text-sm truncate">
                        {otherName}
                      </p>

                      <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                        {youOwe
                          ? `You owe ${otherName}`
                          : `${otherName} owes you`}{' '}
                        · {s.groupName}
                      </p>

                      {error && (
                        <p className="text-[11px] sm:text-xs text-rose-400 mt-1">
                          {error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pl-12 sm:pl-0">
                    <span
                      className={`font-bold text-sm sm:text-base ${
                        youOwe
                          ? 'text-rose-400'
                          : 'text-emerald-400'
                      }`}
                    >
                      {formatCurrency(
                        s.amount
                      )}
                    </span>

                    {status ? (
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-1.5 rounded-xl">
                        {status}
                      </span>
                    ) : youOwe ? (
                      <button
                        onClick={() =>
                          handleSettle(
                            s,
                            key
                          )
                        }
                        disabled={isSettling}
                        className="bg-primary-500/15 hover:bg-primary-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-200 text-xs sm:text-sm font-semibold px-4 py-2 sm:py-1.5 rounded-xl transition-all"
                      >
                        {isSettling
                          ? 'Settling…'
                          : 'Settle'}
                      </button>
                    ) : (
                      <button
                        onClick={() =>
                          handleReminder(
                            s,
                            key
                          )
                        }
                        disabled={isReminding}
                        className="bg-primary-500/15 hover:bg-primary-500/25 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-primary-200 text-xs sm:text-sm font-semibold px-4 py-2 sm:py-1.5 rounded-xl transition-all"
                      >
                        {isReminding
                          ? 'Reminding…'
                          : 'Remind'}
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
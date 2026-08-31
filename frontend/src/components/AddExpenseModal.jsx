import React, { useEffect, useState } from 'react';
import { useExpenses } from '../context/ExpenseContext';
import { useAuth } from '../context/AuthContext';
import { CloseIcon, CheckIcon } from './icons';

const splitTypes = [
  { value: 'equal', label: 'Equal' },
  { value: 'unequal', label: 'Unequal' },
  { value: 'percentage', label: 'Percentage' }
];

export default function AddExpenseModal({ open, onClose, defaultGroupId }) {
  const {
    groups,
    selectGroup,
    activeGroup,
    addExpense,
    refreshActiveGroup
  } = useExpenses();

  const { user } = useAuth();

  const [groupId, setGroupId] = useState(defaultGroupId || '');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [payer, setPayer] = useState('');
  const [participants, setParticipants] = useState([]);
  const [splitType, setSplitType] = useState('equal');
  const [shares, setShares] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;

    const start = async () => {
      const id = defaultGroupId || activeGroup?._id || groups[0]?._id || '';

      setGroupId(id);
      setDescription('');
      setAmount('');
      setPayer(user?.id || user?._id || '');
      setParticipants([]);
      setSplitType('equal');
      setShares({});
      setError('');

      try {
        if (id) {
          if (activeGroup?._id === id) {
            await refreshActiveGroup();
          } else {
            await selectGroup(id);
          }
        }
      } catch (err) {
        console.log(err);
      }
    };

    start();
  }, [open]);

  const group =
    activeGroup?._id === groupId
      ? activeGroup
      : groups.find((g) => g._id === groupId);

  const members = group?.members || [];

  useEffect(() => {
    if (!open || members.length === 0) return;

    setParticipants(members.map((member) => member._id));

    const currentUser = user?.id || user?._id;
    const payerExists = members.some(
      (member) => String(member._id) === String(payer || currentUser)
    );

    if (!payerExists) {
      setPayer(members[0]._id);
    }
  }, [open, groupId, members.length]);

  if (!open) return null;

  const toggleParticipant = (id) => {
    if (participants.includes(id)) {
      setParticipants(participants.filter((item) => item !== id));
    } else {
      setParticipants([...participants, id]);
    }
  };

  const changeShare = (id, value) => {
    setShares({
      ...shares,
      [id]: value
    });
  };

  const submitExpense = async (e) => {
    e.preventDefault();
    setError('');

    if (!groupId) {
      setError('Choose a group for this expense');
      return;
    }

    if (!description.trim() || !amount || !payer || participants.length === 0) {
      setError('Fill in all the required fields');
      return;
    }

    let rawShares;

    if (splitType === 'unequal') {
      rawShares = participants.map((id) => ({
        user: id,
        amount: Number(shares[id] || 0)
      }));
    }

    if (splitType === 'percentage') {
      rawShares = participants.map((id) => ({
        user: id,
        percentage: Number(shares[id] || 0)
      }));
    }

    setLoading(true);

    try {
      if (activeGroup?._id !== groupId) {
        await selectGroup(groupId);
      }

      await addExpense({
        description: description.trim(),
        amount: Number(amount),
        payer,
        participants,
        group: groupId,
        splitType,
        rawShares
      });

      await refreshActiveGroup();
      onClose(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={() => onClose(false)}
      />

      <div className="relative bg-surface-card/95 backdrop-blur-xl w-full max-w-md rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto p-6 modal-panel">
        <button
          onClick={() => onClose(false)}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-surface-hover hover:bg-surface-border flex items-center justify-center text-slate-400"
        >
          <CloseIcon width={16} height={16} />
        </button>

        <h2 className="text-lg font-bold text-white">Add Expense</h2>
        <p className="text-sm text-slate-400 mt-0.5 mb-5">
          Split an expense with your friends.
        </p>

        {error && <p className="text-sm text-rose-400 mb-3">{error}</p>}

        <form onSubmit={submitExpense} className="space-y-4">
          {groups.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-slate-100 mb-1.5">
                Group
              </label>

              <select
                value={groupId}
                onChange={async (e) => {
                  const id = e.target.value;
                  setGroupId(id);
                  setParticipants([]);
                  setShares({});

                  try {
                    await selectGroup(id);
                  } catch (err) {
                    console.log(err);
                  }
                }}
                className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm"
              >
                {groups.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">
              Expense description
            </label>
            <input
              type="text"
              placeholder="e.g. Dinner at Domino's"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">
              Amount
            </label>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
                ₹
              </span>

              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border border-white/10 rounded-lg pl-7 pr-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">
              Paid by
            </label>

            <select
              value={payer}
              onChange={(e) => setPayer(e.target.value)}
              className="w-full border border-white/10 rounded-lg px-3 py-2.5 text-sm"
            >
              <option value="">Select who paid</option>

              {members.map((member) => (
                <option key={member._id} value={member._id}>
                  {member.name}
                  {String(member._id) === String(user?.id || user?._id)
                    ? ' (You)'
                    : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-slate-100">
                Split between
              </label>

              <span className="text-xs text-slate-500">
                {participants.length} / {members.length} selected
              </span>
            </div>

            {members.length === 0 ? (
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3">
                <p className="text-sm text-amber-300">
                  No members found in this group.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {members.map((member) => {
                  const selected = participants.includes(member._id);

                  return (
                    <button
                      type="button"
                      key={member._id}
                      onClick={() => toggleParticipant(member._id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm border ${
                        selected
                          ? 'bg-primary-500/15 border-primary-400/40 text-primary-200'
                          : 'border-white/10 text-slate-400'
                      }`}
                    >
                      {member.name}
                      {String(member._id) === String(user?.id || user?._id) && (
                        <span className="text-xs">(You)</span>
                      )}
                      {selected && <CheckIcon width={14} height={14} />}
                    </button>
                  );
                })}
              </div>
            )}

            {splitType !== 'equal' && participants.length > 0 && (
              <div className="mt-3 space-y-2">
                {members
                  .filter((member) => participants.includes(member._id))
                  .map((member) => (
                    <div key={member._id} className="flex items-center gap-2">
                      <span className="text-sm text-slate-400 flex-1">
                        {member.name}
                      </span>

                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder={splitType === 'percentage' ? '%' : 'amount'}
                        value={shares[member._id] || ''}
                        onChange={(e) =>
                          changeShare(member._id, e.target.value)
                        }
                        className="w-28 border border-white/10 rounded-lg px-2 py-1.5 text-sm"
                      />
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-100 mb-1.5">
              Split type
            </label>

            <div className="grid grid-cols-3 gap-2">
              {splitTypes.map((type) => (
                <button
                  type="button"
                  key={type.value}
                  onClick={() => setSplitType(type.value)}
                  className={`py-2.5 rounded-lg text-sm font-medium border ${
                    splitType === type.value
                      ? 'bg-primary-500/15 border-primary-400/40 text-primary-200'
                      : 'border-white/10 text-slate-400'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || members.length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-semibold text-sm py-3 rounded-lg"
          >
            {loading ? 'Adding...' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}

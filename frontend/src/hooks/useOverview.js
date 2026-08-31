import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../context/ExpenseContext';

export function useOverview() {
  const { user } = useAuth();
  const { groups, groupExpensesById, groupBalancesById } = useExpenses();
  const myId = user?.id || user?._id;

  return useMemo(() => {
    let totalOwe = 0;
    let totalOwed = 0;
    const allExpenses = [];
    const mySettlements = [];

    groups.forEach((g) => {
      const groupData = groupBalancesById[g._id];
      const groupExpenses = groupExpensesById[g._id] || [];

      groupExpenses.forEach((e) => allExpenses.push({ ...e, groupName: g.name, groupId: g._id }));

      if (groupData) {
        const balancesList = Array.isArray(groupData.balances) ? groupData.balances : [];
        const settlementsList = Array.isArray(groupData.settlements) ? groupData.settlements : [];

        const mine = balancesList.find((b) => String(b.user) === String(myId));
        if (mine) {
          if (mine.balance > 0) totalOwed += Number(mine.balance) || 0;
          if (mine.balance < 0) totalOwe += Math.abs(Number(mine.balance) || 0);
        }
        settlementsList
          .filter((s) => String(s.from) === String(myId) || String(s.to) === String(myId))
          .forEach((s) => mySettlements.push({ ...s, groupName: g.name, groupId: g._id }));
      }
    });

    allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
    mySettlements.sort((a, b) => b.amount - a.amount);

    return {
      totalOwe: Math.round(totalOwe * 100) / 100,
      totalOwed: Math.round(totalOwed * 100) / 100,
      netBalance: Math.round((totalOwed - totalOwe) * 100) / 100,
      allExpenses,
      mySettlements,
      myId,
    };
  }, [groups, groupExpensesById, groupBalancesById, myId]);
}

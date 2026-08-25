import React, { createContext, useContext, useState, useCallback } from 'react';
import * as localApi from '../lib/localApi';

const ExpenseContext = createContext(null);

export function ExpenseProvider({ children }) {
  const [groups, setGroups] = useState([]);
  const [activeGroup, setActiveGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [groupExpensesById, setGroupExpensesById] = useState({});
  const [groupBalancesById, setGroupBalancesById] = useState({});
  const [overviewLoading, setOverviewLoading] = useState(false);
  const [overviewLoaded, setOverviewLoaded] = useState(false);

  const fetchGroups = useCallback(async () => {
    setLoading(true);
    try {
      const res = await localApi.getGroups();
      setGroups(res.groups);
      setError(null);
      return res.groups;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load groups');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const groupsRes = await localApi.getGroups();
      const groupList = groupsRes.groups;
      setGroups(groupList);

      const results = await Promise.all(
        groupList.map((g) =>
          Promise.all([
            localApi.getExpenses(g._id),
            localApi.getGroupBalances(g._id),
          ]).then(([expRes, balRes]) => ({
            groupId: g._id,
            expenses: expRes.expenses,
            balances: balRes.balances,
            settlements: balRes.settlements,
          }))
        )
      );

      const expensesById = {};
      const balancesById = {};
      results.forEach((r) => {
        expensesById[r.groupId] = r.expenses;
        balancesById[r.groupId] = { balances: r.balances, settlements: r.settlements };
      });
      setGroupExpensesById(expensesById);
      setGroupBalancesById(balancesById);
      setOverviewLoaded(true);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load your expenses');
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (payload) => {
    const res = await localApi.createGroup(payload);
    setGroups((prev) => [...prev, res.group]);
    return res.group;
  }, []);

  const selectGroup = useCallback(async (groupId) => {
    setLoading(true);
    try {
      const [groupRes, expensesRes, balancesRes] = await Promise.all([
        localApi.getGroupById(groupId),
        localApi.getExpenses(groupId),
        localApi.getGroupBalances(groupId),
      ]);
      setActiveGroup(groupRes.group);
      setExpenses(expensesRes.expenses);
      setBalances(balancesRes.balances);
      setSettlements(balancesRes.settlements);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load group');
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(
    async (groupId, email) => {
      const res = await localApi.addMember(groupId, email);
      if (activeGroup?._id === groupId) {
        await selectGroup(groupId);
      }
      return res;
    },
    [activeGroup, selectGroup]
  );

  const refreshActiveGroup = useCallback(async () => {
    if (activeGroup) await selectGroup(activeGroup._id);
  }, [activeGroup, selectGroup]);

  const addExpense = useCallback(
    async (payload) => {
      const res = await localApi.addExpense(payload);
      await refreshActiveGroup();
      return res.expense;
    },
    [refreshActiveGroup]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      await localApi.deleteExpense(expenseId);
      await refreshActiveGroup();
    },
    [refreshActiveGroup]
  );

  const value = {
    groups,
    activeGroup,
    expenses,
    balances,
    settlements,
    loading,
    error,
    fetchGroups,
    createGroup,
    addMember,
    selectGroup,
    addExpense,
    deleteExpense,
    refreshActiveGroup,
    groupExpensesById,
    groupBalancesById,
    overviewLoading,
    overviewLoaded,
    fetchOverview,
  };

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenses must be used within an ExpenseProvider');
  return ctx;
};

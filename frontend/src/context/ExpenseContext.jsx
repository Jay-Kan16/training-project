import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from 'react';
import api from '../api/axios';

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
      const res = await api.get('/groups');

      setGroups(res.data.groups);
      setError(null);

      return res.data.groups;
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load groups'
      );

      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);

    try {
      const groupsRes = await api.get('/groups');
      const groupList = groupsRes.data.groups || [];

      setGroups(groupList);

      const results = await Promise.allSettled(
        groupList.map(async (g) => {
          try {
            const [expRes, balRes] = await Promise.all([
              api.get('/expenses', {
                params: {
                  group: g._id,
                },
              }),
              api.get(`/groups/${g._id}/balances`),
            ]);

            return {
              groupId: g._id,
              expenses: expRes.data.expenses || [],
              balances: balRes.data.balances || [],
              settlements: balRes.data.settlements || [],
            };
          } catch (e) {
            console.error(`Failed to fetch balances for group ${g._id}:`, e);
            return {
              groupId: g._id,
              expenses: [],
              balances: [],
              settlements: [],
            };
          }
        })
      );

      const expensesById = {};
      const balancesById = {};

      results.forEach((r) => {
        if (r.status === 'fulfilled' && r.value) {
          expensesById[r.value.groupId] = r.value.expenses;
          balancesById[r.value.groupId] = {
            balances: r.value.balances,
            settlements: r.value.settlements,
          };
        }
      });

      setGroupExpensesById(expensesById);
      setGroupBalancesById(balancesById);
      setOverviewLoaded(true);
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load your expenses'
      );
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  const createGroup = useCallback(async (payload) => {
    const res = await api.post('/groups', payload);

    setGroups((prev) => [
      ...prev,
      res.data.group,
    ]);

    return res.data.group;
  }, []);

  const selectGroup = useCallback(async (groupId) => {
    setLoading(true);

    try {
      const [
        groupRes,
        expensesRes,
        balancesRes,
      ] = await Promise.all([
        api.get(`/groups/${groupId}`),
        api.get('/expenses', {
          params: {
            group: groupId,
          },
        }),
        api.get(`/groups/${groupId}/balances`),
      ]);

      setActiveGroup(groupRes.data.group);
      setExpenses(expensesRes.data.expenses);
      setBalances(balancesRes.data.balances);
      setSettlements(
        balancesRes.data.settlements
      );
      setError(null);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          'Failed to load group'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const addMember = useCallback(
    async (groupId, email) => {
      const res = await api.post(
        `/groups/${groupId}/members`,
        { email }
      );

      if (activeGroup?._id === groupId) {
        await selectGroup(groupId);
      }

      return res.data;
    },
    [activeGroup, selectGroup]
  );

  const refreshActiveGroup = useCallback(async () => {
    if (activeGroup) {
      await selectGroup(activeGroup._id);
    }
  }, [activeGroup, selectGroup]);

  const addExpense = useCallback(
    async (payload) => {
      const res = await api.post(
        '/expenses',
        payload
      );

      await refreshActiveGroup();

      return res.data.expense;
    },
    [refreshActiveGroup]
  );

  const deleteExpense = useCallback(
    async (expenseId) => {
      await api.delete(
        `/expenses/${expenseId}`
      );

      await refreshActiveGroup();
    },
    [refreshActiveGroup]
  );

  const settleUp = useCallback(
    async (groupId, from, to, amount) => {
      try {
        const res = await api.post(
          `/groups/${groupId}/settle`,
          {
            from,
            to,
            amount,
          }
        );

        await fetchOverview();

        if (
          activeGroup?._id &&
          String(activeGroup._id) ===
            String(groupId)
        ) {
          await selectGroup(groupId);
        }

        setError(null);

        return res.data;
      } catch (err) {
        const message =
          err.response?.data?.message ||
          'Failed to record settlement';

        setError(message);

        throw new Error(message);
      }
    },
    [
      fetchOverview,
      activeGroup,
      selectGroup,
    ]
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
    settleUp,
  };

  return (
    <ExpenseContext.Provider value={value}>
      {children}
    </ExpenseContext.Provider>
  );
}

export const useExpenses = () => {
  const ctx = useContext(ExpenseContext);

  if (!ctx) {
    throw new Error(
      'useExpenses must be used within an ExpenseProvider'
    );
  }

  return ctx;
};
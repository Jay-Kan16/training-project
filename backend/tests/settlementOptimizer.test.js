const { optimizeSettlements } = require('../utils/settlementOptimizer');

describe('settlementOptimizer', () => {
  test('produces zero transactions when everyone is even', () => {
    expect(optimizeSettlements({ a: 0, b: 0, c: 0 })).toHaveLength(0);
  });

  test('settles a simple two-person debt', () => {
    const result = optimizeSettlements({ a: -50, b: 50 });
    expect(result).toEqual([{ from: 'a', to: 'b', amount: 50 }]);
  });

  test('minimizes transactions for a three-person cycle-like case', () => {
    const result = optimizeSettlements({ a: -30, b: -10, c: 40 });
    expect(result.length).toBeLessThanOrEqual(2);
    const total = result.reduce((acc, t) => acc + t.amount, 0);
    expect(Math.round(total * 100) / 100).toBe(40);
  });

  test('every debtor pays exactly what they owe in total', () => {
    const balances = { a: -20, b: -30, c: 25, d: 25 };
    const result = optimizeSettlements(balances);
    const paidByA = result.filter((t) => t.from === 'a').reduce((acc, t) => acc + t.amount, 0);
    const paidByB = result.filter((t) => t.from === 'b').reduce((acc, t) => acc + t.amount, 0);
    expect(Math.round(paidByA * 100) / 100).toBe(20);
    expect(Math.round(paidByB * 100) / 100).toBe(30);
  });
});

const { computeShares, SplitError } = require('../utils/splitCalculator');

describe('splitCalculator', () => {
  test('splits equally and sums back to the total', () => {
    const shares = computeShares({ amount: 100, splitType: 'equal', participants: ['a', 'b', 'c'] });
    const sum = shares.reduce((acc, s) => acc + s.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(100);
    expect(shares).toHaveLength(3);
  });

  test('handles equal split rounding remainder (e.g. 10 / 3)', () => {
    const shares = computeShares({ amount: 10, splitType: 'equal', participants: ['a', 'b', 'c'] });
    const sum = shares.reduce((acc, s) => acc + s.amount, 0);
    expect(Math.round(sum * 100) / 100).toBe(10);
  });

  test('accepts a valid unequal split', () => {
    const shares = computeShares({
      amount: 100,
      splitType: 'unequal',
      participants: ['a', 'b'],
      rawShares: [{ user: 'a', amount: 60 }, { user: 'b', amount: 40 }],
    });
    expect(shares).toEqual([{ user: 'a', amount: 60 }, { user: 'b', amount: 40 }]);
  });

  test('rejects an unequal split that does not sum to the total', () => {
    expect(() =>
      computeShares({
        amount: 100,
        splitType: 'unequal',
        participants: ['a', 'b'],
        rawShares: [{ user: 'a', amount: 60 }, { user: 'b', amount: 30 }],
      })
    ).toThrow(SplitError);
  });

  test('accepts a valid percentage split', () => {
    const shares = computeShares({
      amount: 200,
      splitType: 'percentage',
      participants: ['a', 'b'],
      rawShares: [{ user: 'a', percentage: 25 }, { user: 'b', percentage: 75 }],
    });
    expect(shares.find((s) => s.user === 'a').amount).toBe(50);
    expect(shares.find((s) => s.user === 'b').amount).toBe(150);
  });

  test('rejects percentages that do not add up to 100', () => {
    expect(() =>
      computeShares({
        amount: 200,
        splitType: 'percentage',
        participants: ['a', 'b'],
        rawShares: [{ user: 'a', percentage: 25 }, { user: 'b', percentage: 50 }],
      })
    ).toThrow(SplitError);
  });

  test('rejects a non-positive amount', () => {
    expect(() => computeShares({ amount: 0, splitType: 'equal', participants: ['a'] })).toThrow(SplitError);
  });

  test('rejects an expense with no participants', () => {
    expect(() => computeShares({ amount: 50, splitType: 'equal', participants: [] })).toThrow(SplitError);
  });
});

class SplitError extends Error {
  constructor(message) {
    super(message);
    this.name = 'SplitError';
    this.statusCode = 400;
  }
}

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

function calculateEqualSplit(amount, participantIds) {
  if (!participantIds.length) throw new SplitError('At least one participant is required');
  const base = round2(amount / participantIds.length);
  const shares = participantIds.map((user) => ({ user, amount: base }));

  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  const diff = round2(amount - sum);
  if (diff !== 0) shares[shares.length - 1].amount = round2(shares[shares.length - 1].amount + diff);

  return shares;
}

function calculateUnequalSplit(amount, rawShares) {
  if (!rawShares || !rawShares.length) throw new SplitError('Shares are required for an unequal split');
  const shares = rawShares.map((s) => ({ user: s.user, amount: round2(Number(s.amount)) }));

  if (shares.some((s) => Number.isNaN(s.amount) || s.amount < 0)) {
    throw new SplitError('Each share amount must be a non-negative number');
  }

  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  if (Math.abs(sum - round2(amount)) > 0.01) {
    throw new SplitError(`Shares (${sum}) must add up to the total expense amount (${round2(amount)})`);
  }
  return shares;
}

function calculatePercentageSplit(amount, rawShares) {
  if (!rawShares || !rawShares.length) throw new SplitError('Percentages are required for a percentage split');
  const totalPct = round2(rawShares.reduce((acc, s) => acc + Number(s.percentage), 0));
  if (Math.abs(totalPct - 100) > 0.01) {
    throw new SplitError(`Percentages must add up to 100 (got ${totalPct})`);
  }

  const shares = rawShares.map((s) => ({ user: s.user, amount: round2((Number(s.percentage) / 100) * amount) }));
  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  const diff = round2(amount - sum);
  if (diff !== 0) shares[shares.length - 1].amount = round2(shares[shares.length - 1].amount + diff);

  return shares;
}

function computeShares({ amount, splitType, participants, rawShares }) {
  if (typeof amount !== 'number' || amount <= 0) {
    throw new SplitError('Amount must be a positive number');
  }
  if (!participants || participants.length === 0) {
    throw new SplitError('At least one participant is required');
  }

  switch (splitType) {
    case 'equal':
      return calculateEqualSplit(amount, participants);
    case 'unequal':
      return calculateUnequalSplit(amount, rawShares);
    case 'percentage':
      return calculatePercentageSplit(amount, rawShares);
    default:
      throw new SplitError(`Unknown split type: ${splitType}`);
  }
}

module.exports = { computeShares, SplitError, round2 };

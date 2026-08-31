function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function optimizeSettlements(balances) {
  const EPSILON = 0.01;

  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    const amt = round2(balance);
    if (amt < -EPSILON) debtors.push({ userId, amount: -amt }); // owes money
    else if (amt > EPSILON) creditors.push({ userId, amount: amt }); // is owed money
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const settled = round2(Math.min(debtor.amount, creditor.amount));

    if (settled > EPSILON) {
      transactions.push({ from: debtor.userId, to: creditor.userId, amount: settled });
    }

    debtor.amount = round2(debtor.amount - settled);
    creditor.amount = round2(creditor.amount - settled);

    if (debtor.amount <= EPSILON) i += 1;
    if (creditor.amount <= EPSILON) j += 1;
  }

  return transactions;
}

module.exports = { optimizeSettlements };

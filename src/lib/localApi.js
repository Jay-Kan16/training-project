// ---------------------------------------------------------------------------
// localApi.js
//
// A fully client-side stand-in for the old Express/MongoDB backend.
// Everything is persisted to localStorage in the browser, so the app works
// completely standalone (no server, no network calls).
//
// It intentionally mirrors the shape of the old REST responses
// (e.g. { success, group }, { success, groups }, { success, balances, settlements })
// and throws errors shaped like axios errors ({ response: { data: { message } } })
// so the rest of the app (pages/components) didn't need to change at all.
// ---------------------------------------------------------------------------

const DB_KEY = 'splitzy_db_v1';
const SESSION_KEY = 'splitzy_session_v1';

const uid = () =>
  (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

const round2 = (n) => Math.round((n + Number.EPSILON) * 100) / 100;

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.response = { data: { message }, status };
  }
}

// --- persistence ------------------------------------------------------

function loadDb() {
  const raw = localStorage.getItem(DB_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      // fall through to a fresh db
    }
  }
  const fresh = { users: [], groups: [], expenses: [] };
  localStorage.setItem(DB_KEY, JSON.stringify(fresh));
  return fresh;
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

function getSession() {
  const raw = localStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(session) {
  if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  else localStorage.removeItem(SESSION_KEY);
}

function publicUser(u) {
  if (!u) return null;
  const { password, ...rest } = u;
  return rest;
}

function requireAuth() {
  const session = getSession();
  if (!session) throw new ApiError('Not authorized, please log in again', 401);
  const db = loadDb();
  const user = db.users.find((u) => u.id === session.userId);
  if (!user) throw new ApiError('Not authorized, please log in again', 401);
  return { db, user };
}

// --- fake network latency (keeps loading states feeling real) --------

const delay = (ms = 150) => new Promise((resolve) => setTimeout(resolve, ms));

// --- auth ---------------------------------------------------------------

export async function signup(name, email, password) {
  await delay();
  const db = loadDb();
  const normalizedEmail = String(email).trim().toLowerCase();

  if (!name?.trim()) throw new ApiError('Name is required');
  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) throw new ApiError('Please enter a valid email');
  if (!password || password.length < 6) throw new ApiError('Password must be at least 6 characters');
  if (db.users.some((u) => u.email === normalizedEmail)) {
    throw new ApiError('An account with that email already exists');
  }

  const user = {
    id: uid(),
    name: name.trim(),
    email: normalizedEmail,
    password, // demo-only project: stored in plain text in localStorage, never sent anywhere
    role: db.users.length === 0 ? 'admin' : 'user',
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  saveDb(db);
  setSession({ userId: user.id });

  return { token: `local-${user.id}`, user: publicUser(user) };
}

export async function login(email, password) {
  await delay();
  const db = loadDb();
  const normalizedEmail = String(email).trim().toLowerCase() || 'guest@splitzy.demo';

  let user = db.users.find((u) => u.email === normalizedEmail);

  // Demo mode: there's no real backend to validate credentials against, so
  // any email/password combo logs in — auto-creating the account on first
  // attempt (or just signing back into it if it already exists).
  if (!user) {
    user = {
      id: uid(),
      name: normalizedEmail.split('@')[0] || 'Guest',
      email: normalizedEmail,
      password,
      role: db.users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    db.users.push(user);
    saveDb(db);
  }

  setSession({ userId: user.id });
  return { token: `local-${user.id}`, user: publicUser(user) };
}

export async function getMe() {
  await delay(50);
  const { user } = requireAuth();
  return { user: publicUser(user) };
}

export function logout() {
  setSession(null);
}

// --- groups ---------------------------------------------------------------

function populateGroup(db, group) {
  const members = group.members
    .map((id) => db.users.find((u) => u.id === id))
    .filter(Boolean)
    .map((u) => ({ _id: u.id, name: u.name, email: u.email }));

  const expenses = db.expenses
    .filter((e) => e.group === group.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .map(toExpenseDto);

  return {
    _id: group.id,
    name: group.name,
    createdBy: group.createdBy,
    members,
    expenses,
    createdAt: group.createdAt,
  };
}

function toExpenseDto(e) {
  return {
    _id: e.id,
    description: e.description,
    amount: e.amount,
    payer: e.payer,
    participants: e.participants,
    group: e.group,
    splitType: e.splitType,
    shares: e.shares,
    date: e.date,
    createdBy: e.createdBy,
  };
}

export async function createGroup({ name, members = [] }) {
  await delay();
  const { db, user } = requireAuth();
  if (!name?.trim()) throw new ApiError('Group name is required');

  const memberSet = new Set([...members, user.id]);
  const group = {
    id: uid(),
    name: name.trim(),
    members: [...memberSet],
    createdBy: user.id,
    createdAt: new Date().toISOString(),
  };

  db.groups.push(group);
  saveDb(db);
  return { group: populateGroup(db, group) };
}

export async function getGroups() {
  await delay();
  const { db, user } = requireAuth();
  const groups = db.groups.filter((g) => g.members.includes(user.id)).map((g) => populateGroup(db, g));
  return { count: groups.length, groups };
}

export async function getGroupById(groupId) {
  await delay(80);
  const { db, user } = requireAuth();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) throw new ApiError('Group not found', 404);
  if (!group.members.includes(user.id)) throw new ApiError('You are not a member of this group', 403);
  return { group: populateGroup(db, group) };
}

export async function addMember(groupId, email) {
  await delay();
  const { db, user } = requireAuth();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) throw new ApiError('Group not found', 404);
  if (group.createdBy !== user.id && user.role !== 'admin') {
    throw new ApiError('Only the group creator or an admin can add members', 403);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const member = db.users.find((u) => u.email === normalizedEmail);
  if (!member) throw new ApiError('No registered user found with that email', 404);
  if (group.members.includes(member.id)) {
    throw new ApiError('This user is already a member of the group');
  }

  group.members.push(member.id);
  saveDb(db);

  return {
    message: `${member.name} was added to the group`,
    group: populateGroup(db, group),
    member: publicUser(member),
  };
}

export async function deleteGroup(groupId) {
  await delay();
  const { db, user } = requireAuth();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) throw new ApiError('Group not found', 404);
  if (group.createdBy !== user.id && user.role !== 'admin') {
    throw new ApiError('Only the group creator or an admin can delete this group', 403);
  }

  db.expenses = db.expenses.filter((e) => e.group !== groupId);
  db.groups = db.groups.filter((g) => g.id !== groupId);
  saveDb(db);
  return { message: 'Group and its expenses deleted' };
}

// --- balances / settlements (ported from utils/settlementOptimizer.js) ---

function optimizeSettlements(balances) {
  const EPSILON = 0.01;
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([userId, balance]) => {
    const amt = round2(balance);
    if (amt < -EPSILON) debtors.push({ userId, amount: -amt });
    else if (amt > EPSILON) creditors.push({ userId, amount: amt });
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

export async function getGroupBalances(groupId) {
  await delay(80);
  const { db } = requireAuth();
  const group = db.groups.find((g) => g.id === groupId);
  if (!group) throw new ApiError('Group not found', 404);

  const members = group.members.map((id) => db.users.find((u) => u.id === id)).filter(Boolean);
  const expenses = db.expenses.filter((e) => e.group === groupId);

  const balances = {};
  members.forEach((m) => {
    balances[m.id] = 0;
  });

  expenses.forEach((exp) => {
    balances[exp.payer] = (balances[exp.payer] || 0) + exp.amount;
    exp.shares.forEach((s) => {
      balances[s.user] = (balances[s.user] || 0) - s.amount;
    });
  });

  Object.keys(balances).forEach((k) => {
    balances[k] = round2(balances[k]);
  });

  const settlements = optimizeSettlements(balances);
  const idToName = Object.fromEntries(members.map((m) => [m.id, m.name]));
  const settlementsWithNames = settlements.map((s) => ({
    ...s,
    fromName: idToName[s.from],
    toName: idToName[s.to],
  }));

  return {
    balances: members.map((m) => ({
      user: m.id,
      name: m.name,
      email: m.email,
      balance: balances[m.id] || 0,
    })),
    settlements: settlementsWithNames,
  };
}

// --- expenses (split logic ported from utils/splitCalculator.js) --------

function calculateEqualSplit(amount, participantIds) {
  if (!participantIds.length) throw new ApiError('At least one participant is required');
  const base = round2(amount / participantIds.length);
  const shares = participantIds.map((user) => ({ user, amount: base }));

  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  const diff = round2(amount - sum);
  if (diff !== 0) shares[shares.length - 1].amount = round2(shares[shares.length - 1].amount + diff);

  return shares;
}

function calculateUnequalSplit(amount, rawShares) {
  if (!rawShares || !rawShares.length) throw new ApiError('Shares are required for an unequal split');
  const shares = rawShares.map((s) => ({ user: s.user, amount: round2(Number(s.amount)) }));

  if (shares.some((s) => Number.isNaN(s.amount) || s.amount < 0)) {
    throw new ApiError('Each share amount must be a non-negative number');
  }

  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  if (Math.abs(sum - round2(amount)) > 0.01) {
    throw new ApiError(`Shares (${sum}) must add up to the total expense amount (${round2(amount)})`);
  }
  return shares;
}

function calculatePercentageSplit(amount, rawShares) {
  if (!rawShares || !rawShares.length) throw new ApiError('Percentages are required for a percentage split');
  const totalPct = round2(rawShares.reduce((acc, s) => acc + Number(s.percentage), 0));
  if (Math.abs(totalPct - 100) > 0.01) {
    throw new ApiError(`Percentages must add up to 100 (got ${totalPct})`);
  }

  const shares = rawShares.map((s) => ({ user: s.user, amount: round2((Number(s.percentage) / 100) * amount) }));
  const sum = round2(shares.reduce((acc, s) => acc + s.amount, 0));
  const diff = round2(amount - sum);
  if (diff !== 0) shares[shares.length - 1].amount = round2(shares[shares.length - 1].amount + diff);

  return shares;
}

function computeShares({ amount, splitType, participants, rawShares }) {
  if (typeof amount !== 'number' || amount <= 0) throw new ApiError('Amount must be a positive number');
  if (!participants || participants.length === 0) throw new ApiError('At least one participant is required');

  switch (splitType) {
    case 'equal':
      return calculateEqualSplit(amount, participants);
    case 'unequal':
      return calculateUnequalSplit(amount, rawShares);
    case 'percentage':
      return calculatePercentageSplit(amount, rawShares);
    default:
      throw new ApiError(`Unknown split type: ${splitType}`);
  }
}

export async function getExpenses(groupId) {
  await delay(80);
  const { db } = requireAuth();
  return {
    expenses: db.expenses
      .filter((e) => e.group === groupId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .map(toExpenseDto),
  };
}

export async function addExpense(payload) {
  await delay();
  const { db, user } = requireAuth();
  const { description, amount, payer, participants, group, splitType, rawShares } = payload;

  if (!description?.trim()) throw new ApiError('Description is required');
  const groupRecord = db.groups.find((g) => g.id === group);
  if (!groupRecord) throw new ApiError('Group not found', 404);

  const shares = computeShares({ amount: Number(amount), splitType, participants, rawShares });

  const expense = {
    id: uid(),
    description: description.trim(),
    amount: Number(amount),
    payer,
    participants,
    group,
    splitType,
    shares,
    date: new Date().toISOString(),
    createdBy: user.id,
  };

  db.expenses.push(expense);
  saveDb(db);
  return { expense: toExpenseDto(expense) };
}

export async function deleteExpense(expenseId) {
  await delay();
  const { db } = requireAuth();
  db.expenses = db.expenses.filter((e) => e.id !== expenseId);
  saveDb(db);
  return { message: 'Expense deleted' };
}

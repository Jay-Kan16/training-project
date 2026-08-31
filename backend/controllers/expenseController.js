const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { computeShares, SplitError } = require('../utils/splitCalculator');

const assertGroupMember = (group, userId) => {
  if (!group.members.some((m) => m.toString() === userId)) {
    const err = new Error('You are not a member of this group');
    err.statusCode = 403;
    throw err;
  }
};

const createExpense = asyncHandler(async (req, res) => {
  const { description, amount, payer, participants, group: groupId, splitType, rawShares, date } = req.body;

  const group = await Group.findById(groupId);
  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }
  assertGroupMember(group, req.user.id);
  assertGroupMember(group, payer);
  participants.forEach((p) => assertGroupMember(group, p));

  let shares;
  try {
    shares = computeShares({ amount: Number(amount), splitType: splitType || 'equal', participants, rawShares });
  } catch (err) {
    if (err instanceof SplitError) {
      res.status(err.statusCode);
      throw err;
    }
    throw err;
  }

  const expense = await Expense.create({
    description,
    amount,
    payer,
    participants,
    group: groupId,
    splitType: splitType || 'equal',
    shares,
    date: date || Date.now(),
    createdBy: req.user.id,
  });

  group.expenses.push(expense._id);
  await group.save();

  res.status(201).json({ success: true, expense });
});

const getExpenses = asyncHandler(async (req, res) => {
  const { group, payer, startDate, endDate } = req.query;

  const filter = {};
  if (group) filter.group = group;
  if (payer) filter.payer = payer;
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  const myGroups = await Group.find({ members: req.user.id }).select('_id');
  const myGroupIds = myGroups.map((g) => g._id.toString());
  if (filter.group && !myGroupIds.includes(filter.group)) {
    res.status(403);
    throw new Error('You are not a member of this group');
  }
  if (!filter.group) filter.group = { $in: myGroupIds };

  const expenses = await Expense.find(filter)
    .populate('payer', 'name email')
    .populate('participants', 'name email')
    .sort({ date: -1 });

  res.json({ success: true, count: expenses.length, expenses });
});

const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('payer', 'name email')
    .populate('participants', 'name email');

  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }

  const group = await Group.findById(expense.group);
  assertGroupMember(group, req.user.id);

  res.json({ success: true, expense });
});

const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the creator or an admin can edit this expense');
  }

  const { description, amount, payer, participants, splitType, rawShares, date } = req.body;

  if (amount || participants || splitType || rawShares) {
    const shares = computeShares({
      amount: Number(amount ?? expense.amount),
      splitType: splitType || expense.splitType,
      participants: participants || expense.participants.map((p) => p.toString()),
      rawShares,
    });
    expense.shares = shares;
  }

  if (description) expense.description = description;
  if (amount) expense.amount = amount;
  if (payer) expense.payer = payer;
  if (participants) expense.participants = participants;
  if (splitType) expense.splitType = splitType;
  if (date) expense.date = date;

  await expense.save();
  res.json({ success: true, expense });
});

const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id);
  if (!expense) {
    res.status(404);
    throw new Error('Expense not found');
  }
  if (expense.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Only the creator or an admin can delete this expense');
  }

  await Group.findByIdAndUpdate(expense.group, { $pull: { expenses: expense._id } });
  await expense.deleteOne();

  res.json({ success: true, message: 'Expense deleted' });
});

module.exports = { createExpense, getExpenses, getExpenseById, updateExpense, deleteExpense };

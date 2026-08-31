const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');

const Group = require('../models/Group');
const Expense = require('../models/Expense');
const User = require('../models/User');
const Settlement = require('../models/Settlement');

const { optimizeSettlements } = require('../utils/settlementOptimizer');


const createGroup = asyncHandler(async (req, res) => {
  const { name, members } = req.body;

  const memberSet = new Set([
    ...(members || []),
    req.user.id,
  ]);

  const group = await Group.create({
    name,
    members: [...memberSet],
    createdBy: req.user.id,
  });

  res.status(201).json({
    success: true,
    group,
  });
});


const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({
    members: req.user.id,
  }).populate(
    'members',
    'name email'
  );

  res.json({
    success: true,
    count: groups.length,
    groups,
  });
});

const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('members', 'name email')
    .populate({
      path: 'expenses',
      options: {
        sort: {
          date: -1,
        },
      },
    });

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (member) =>
      member._id.toString() === req.user.id
  );

  if (!isMember) {
    res.status(403);
    throw new Error(
      'You are not a member of this group'
    );
  }

  res.json({
    success: true,
    group,
  });
});


const addMember = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (memberId) => memberId.toString() === req.user.id
  );

  if (!isMember && req.user.role !== 'admin') {
    res.status(403);
    throw new Error(
      'You must be a member of this group or an admin to add members'
    );
  }

  const user = await User.findOne({
    email: email.trim().toLowerCase(),
  }).select('_id name email');

  if (!user) {
    res.status(404);
    throw new Error(
      'No registered user found with that email'
    );
  }

  const alreadyMember = group.members.some(
    (memberId) =>
      memberId.toString() ===
      user._id.toString()
  );

  if (alreadyMember) {
    res.status(400);
    throw new Error(
      'This user is already a member of the group'
    );
  }

  group.members.push(user._id);

  await group.save();

  const updatedGroup = await Group.findById(
    group._id
  ).populate(
    'members',
    'name email'
  );

  res.status(201).json({
    success: true,
    message: `${user.name} was added to the group`,
    group: updatedGroup,
    member: user,
  });
});


const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (
    group.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error(
      'Only the group creator or an admin can edit this group'
    );
  }

  const { name, members } = req.body;

  if (name) {
    group.name = name;
  }

  if (members) {
    group.members = [
      ...new Set([
        ...members,
        group.createdBy.toString(),
      ]),
    ];
  }

  await group.save();

  res.json({
    success: true,
    group,
  });
});


const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id);

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  if (
    group.createdBy.toString() !== req.user.id &&
    req.user.role !== 'admin'
  ) {
    res.status(403);
    throw new Error(
      'Only the group creator or an admin can delete this group'
    );
  }

  // Delete expenses belonging to group
  await Expense.deleteMany({
    group: group._id,
  });

  // Delete settlements belonging to group
  await Settlement.deleteMany({
    group: group._id,
  });

  // Delete group
  await group.deleteOne();

  res.json({
    success: true,
    message:
      'Group, expenses and settlements deleted',
  });
});



const getGroupBalances = asyncHandler(async (req, res) => {
  const group = await Group.findById(
    req.params.id
  ).populate(
    'members',
    'name email'
  );

  if (!group) {
    res.status(404);
    throw new Error('Group not found');
  }

  const isMember = group.members.some(
    (member) =>
      member._id.toString() === req.user.id
  );

  if (!isMember) {
    res.status(403);
    throw new Error(
      'You are not a member of this group'
    );
  }

  const expenses = await Expense.find({
    group: group._id,
  });

  const balances = {};

  group.members.forEach((member) => {
    balances[member._id.toString()] = 0;
  });


  expenses.forEach((expense) => {
    const payerId =
      expense.payer.toString();

    // Payer gets credit
    balances[payerId] =
      (balances[payerId] || 0) +
      Number(expense.amount);

    // Participants owe their shares
    expense.shares.forEach((share) => {
      const userId =
        share.user.toString();

      balances[userId] =
        (balances[userId] || 0) -
        Number(share.amount);
    });
  });


  const recordedSettlements =
    await Settlement.find({
      group: group._id,
    });

  recordedSettlements.forEach(
    (settlement) => {
      const fromId =
        settlement.from.toString();

      const toId =
        settlement.to.toString();

      const amount =
        Number(settlement.amount);


      balances[fromId] =
        (balances[fromId] || 0) +
        amount;

      // Creditor received
      balances[toId] =
        (balances[toId] || 0) -
        amount;
    }
  );

  Object.keys(balances).forEach((userId) => {
    balances[userId] =
      Math.round(
        (balances[userId] +
          Number.EPSILON) *
          100
      ) / 100;
  });


  const settlements =
    optimizeSettlements(balances);

  const idToName =
    Object.fromEntries(
      group.members.map((member) => [
        member._id.toString(),
        member.name,
      ])
    );

  const settlementsWithNames =
    settlements.map((settlement) => ({
      ...settlement,

      fromName:
        idToName[settlement.from],

      toName:
        idToName[settlement.to],
    }));


  res.json({
    success: true,

    balances: group.members.map(
      (member) => ({
        user: member._id,
        name: member.name,
        email: member.email,

        balance:
          balances[
            member._id.toString()
          ] || 0,
      })
    ),

    settlements:
      settlementsWithNames,
  });
});



const settleUp = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    from,
    to,
    amount,
  } = req.body;


  if (
    !from ||
    !to ||
    amount === undefined
  ) {
    res.status(400);

    throw new Error(
      'from, to and amount are required'
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(id)
  ) {
    res.status(400);

    throw new Error(
      'Invalid group ID'
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(from)
  ) {
    res.status(400);

    throw new Error(
      'Invalid sender ID'
    );
  }

  if (
    !mongoose.Types.ObjectId.isValid(to)
  ) {
    res.status(400);

    throw new Error(
      'Invalid receiver ID'
    );
  }


  if (from === to) {
    res.status(400);

    throw new Error(
      'A user cannot settle with themselves'
    );
  }


  const numericAmount =
    Number(amount);

  if (
    !Number.isFinite(numericAmount) ||
    numericAmount <= 0
  ) {
    res.status(400);

    throw new Error(
      'Settlement amount must be greater than 0'
    );
  }

  const group = await Group.findById(id);

  if (!group) {
    res.status(404);

    throw new Error(
      'Group not found'
    );
  }

  const loggedInUserIsMember =
    group.members.some(
      (memberId) =>
        memberId.toString() ===
        req.user.id
    );

  if (!loggedInUserIsMember) {
    res.status(403);

    throw new Error(
      'You are not a member of this group'
    );
  }

  const fromIsMember =
    group.members.some(
      (memberId) =>
        memberId.toString() ===
        from
    );

  if (!fromIsMember) {
    res.status(400);

    throw new Error(
      'Sender is not a member of this group'
    );
  }


  const toIsMember =
    group.members.some(
      (memberId) =>
        memberId.toString() ===
        to
    );

  if (!toIsMember) {
    res.status(400);

    throw new Error(
      'Receiver is not a member of this group'
    );
  }

  if (
    from !== req.user.id
  ) {
    res.status(403);

    throw new Error(
      'You can only settle your own debt'
    );
  }


  const finalAmount =
    Math.round(
      (numericAmount +
        Number.EPSILON) *
        100
    ) / 100;


  const settlement =
    await Settlement.create({
      group: group._id,

      from,

      to,

      amount: finalAmount,
    });

  res.status(201).json({
    success: true,

    message:
      'Settlement recorded successfully',

    settlement,
  });
});

module.exports = {
  createGroup,
  getGroups,
  getGroupById,
  addMember,
  updateGroup,
  deleteGroup,
  getGroupBalances,
  settleUp,
};
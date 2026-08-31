const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const Group = require('../models/Group');
const User = require('../models/User');

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user.id })
    .populate('sender', 'name email avatar')
    .populate('group', 'name')
    .sort({ createdAt: -1 })
    .limit(50);

  const unreadCount = await Notification.countDocuments({
    recipient: req.user.id,
    read: false,
  });

  res.json({
    success: true,
    count: notifications.length,
    unreadCount,
    notifications,
  });
});

const sendSettlementReminder = asyncHandler(async (req, res) => {
  const { recipientId, groupId, amount } = req.body;

  if (!recipientId) {
    res.status(400);
    throw new Error('Recipient ID is required');
  }

  if (recipientId === req.user.id) {
    res.status(400);
    throw new Error('You cannot send a reminder to yourself');
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    res.status(404);
    throw new Error('Recipient user not found');
  }

  let groupName = 'your group';
  if (groupId) {
    const group = await Group.findById(groupId);
    if (group) {
      groupName = group.name;
    }
  }

  const amountStr = amount ? `₹${amount}` : 'pending balance';
  const message = `${req.user.name} sent you a reminder to settle ${amountStr} in ${groupName}.`;

  const notification = await Notification.create({
    recipient: recipientId,
    sender: req.user.id,
    type: 'settlement_reminder',
    group: groupId || null,
    amount: amount ? Number(amount) : null,
    message,
    read: false,
  });

  const populated = await Notification.findById(notification._id)
    .populate('sender', 'name email avatar')
    .populate('group', 'name');

  res.status(201).json({
    success: true,
    message: 'Reminder notification sent successfully',
    notification: populated,
  });
});

const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    recipient: req.user.id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  notification.read = true;
  await notification.save();

  res.json({
    success: true,
    notification,
  });
});

const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { recipient: req.user.id, read: false },
    { $set: { read: true } }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read',
  });
});

const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    recipient: req.user.id,
  });

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json({
    success: true,
    message: 'Notification deleted',
  });
});

module.exports = {
  getNotifications,
  sendSettlementReminder,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};


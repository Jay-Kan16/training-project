const express = require('express');
const { protect } = require('../middleware/auth');
const {
  getNotifications,
  sendSettlementReminder,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require('../controllers/notificationController');

const router = express.Router();

router.use(protect);

router.route('/').get(getNotifications);
router.route('/remind').post(sendSettlementReminder);
router.route('/read-all').put(markAllAsRead);
router.route('/:id/read').put(markAsRead);
router.route('/:id').delete(deleteNotification);

module.exports = router;


const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/auth');

const {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getGroupBalances,
  addMember,
  settleUp,
} = require('../controllers/groupController');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Group name is required'),
  ],
  validate,
  createGroup
);

router.get('/', getGroups);

router.get('/:id', getGroupById);

router.post(
  '/:id/members',
  [
    body('email')
      .isEmail()
      .withMessage('A valid member email is required'),
  ],
  validate,
  addMember
);

router.put('/:id', updateGroup);

router.delete('/:id', deleteGroup);

router.get('/:id/balances', getGroupBalances);

router.post(
  '/:id/settle',
  [
    body('from')
      .notEmpty()
      .withMessage('Sender user ID is required'),

    body('to')
      .notEmpty()
      .withMessage('Receiver user ID is required'),

    body('amount')
      .isFloat({ gt: 0 })
      .withMessage('Settlement amount must be greater than 0'),
  ],
  validate,
  settleUp
);

module.exports = router;
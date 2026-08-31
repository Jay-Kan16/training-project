const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getUsers, getUserById, updateUser, deleteUser } = require('../controllers/userController');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', authorize('admin'), deleteUser);

module.exports = router;

const router = require('express').Router();
const { getUsers, createUser, updateUser, resetPassword, getUserById } = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', authorize(PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW), getUsers);
router.post('/', authorize(PERMISSIONS.MANAGE_USERS), createUser);
router.get('/:id', authorize(PERMISSIONS.MANAGE_USERS, PERMISSIONS.VIEW), getUserById);
router.put('/:id', authorize(PERMISSIONS.MANAGE_USERS), updateUser);
router.post('/:id/reset-password', authorize(PERMISSIONS.MANAGE_USERS), resetPassword);

module.exports = router;

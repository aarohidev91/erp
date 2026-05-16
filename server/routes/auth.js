const router = require('express').Router();
const { login, refreshToken, changePassword, getMe, logout } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/change-password', authenticate, changePassword);
router.get('/me', authenticate, getMe);
router.post('/logout', authenticate, logout);

module.exports = router;

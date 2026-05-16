const router = require('express').Router();
const r = require('../controllers/reportController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/dashboard', r.getDashboardStats);
router.get('/receptionist', authorize(PERMISSIONS.VIEW, PERMISSIONS.EXPORT), r.getReceptionistReport);
router.get('/counsellor', authorize(PERMISSIONS.VIEW, PERMISSIONS.EXPORT), r.getCounsellorReport);
router.get('/fee', authorize(PERMISSIONS.VIEW, PERMISSIONS.EXPORT), r.getFeeReport);
router.get('/audit-logs', authorize(PERMISSIONS.VIEW_AUDIT), r.getAuditLogs);
router.get('/login-logs', authorize(PERMISSIONS.VIEW_AUDIT), r.getLoginLogs);
router.get('/staff-performance', authorize(PERMISSIONS.VIEW, PERMISSIONS.EXPORT), r.getStaffPerformance);
router.get('/follow-ups', r.getPendingFollowUps);

module.exports = router;

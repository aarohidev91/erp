const router = require('express').Router();
const { getSettings, updateSetting, getCustomPurposeCategories, approveCustomPurpose } = require('../controllers/settingsController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', getSettings);
router.put('/', authorize(PERMISSIONS.MANAGE_USERS), updateSetting);
router.get('/custom-purposes', getCustomPurposeCategories);
router.put('/custom-purposes/:id/approve', authorize(PERMISSIONS.MANAGE_USERS), approveCustomPurpose);

module.exports = router;

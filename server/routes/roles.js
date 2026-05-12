const router = require('express').Router();
const { getRoles, createRole, updateRole, deleteRole, getRoleById } = require('../controllers/roleController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', getRoles);
router.post('/', authorize(PERMISSIONS.MANAGE_ROLES), createRole);
router.get('/:id', getRoleById);
router.put('/:id', authorize(PERMISSIONS.MANAGE_ROLES), updateRole);
router.delete('/:id', authorize(PERMISSIONS.MANAGE_ROLES), deleteRole);

module.exports = router;

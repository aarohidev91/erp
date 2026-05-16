const router = require('express').Router();
const { getDepartments, createDepartment, updateDepartment, getDepartmentById } = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', getDepartments);
router.post('/', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), createDepartment);
router.get('/:id', getDepartmentById);
router.put('/:id', authorize(PERMISSIONS.MANAGE_DEPARTMENTS), updateDepartment);

module.exports = router;

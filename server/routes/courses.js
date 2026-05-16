const router = require('express').Router();
const { getCourses, createCourse, updateCourse, getCourseById } = require('../controllers/courseController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', getCourses);
router.post('/', authorize(PERMISSIONS.MANAGE_COURSES), createCourse);
router.get('/:id', getCourseById);
router.put('/:id', authorize(PERMISSIONS.MANAGE_COURSES), updateCourse);

module.exports = router;

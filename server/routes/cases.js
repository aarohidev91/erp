const router = require('express').Router();
const c = require('../controllers/caseController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);

router.get('/today', c.getTodayVisitors);
router.get('/my-cases', c.getMyCases);
router.get('/assigned', c.getAssignedCases);
router.get('/department/:departmentId?', c.getDepartmentCases);
router.get('/', authorize(PERMISSIONS.VIEW), c.getCases);
router.post('/', authorize(PERMISSIONS.CREATE), c.createCase);
router.get('/:id', authorize(PERMISSIONS.VIEW), c.getCaseById);
router.put('/:id/status', authorize(PERMISSIONS.EDIT_LIMITED), c.updateCaseStatus);
router.put('/:id/fields', authorize(PERMISSIONS.EDIT_LIMITED), c.updateCaseFields);
router.post('/:id/forward', authorize(PERMISSIONS.FORWARD), c.forwardCase);
router.post('/:id/return', authorize(PERMISSIONS.RETURN), c.returnCase);
router.post('/:id/notes', authorize(PERMISSIONS.ADD_NOTE), c.addNote);
router.put('/:id/notes/:noteId', authorize(PERMISSIONS.EDIT_OWN_REMARK), c.editNote);
router.post('/:id/exit', c.markVisitorExit);
router.post('/:id/close', authorize(PERMISSIONS.CLOSE), c.closeCase);
router.post('/:id/reopen', authorize(PERMISSIONS.REOPEN), c.reopenCase);
router.post('/:id/soft-delete', authorize(PERMISSIONS.MANAGE_USERS), c.softDeleteCase);
router.post('/:id/convert-admission', authorize(PERMISSIONS.EDIT_LIMITED), c.convertToAdmission);
router.post('/:id/pdf', authorize(PERMISSIONS.DOWNLOAD_PDF), c.generatePDF);

module.exports = router;

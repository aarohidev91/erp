const router = require('express').Router();
const r = require('../controllers/registrarController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');
const upload = require('../middleware/upload');

router.use(authenticate);
router.post('/:caseId/checklist', authorize(PERMISSIONS.CREATE), r.initializeDocumentChecklist);
router.get('/:caseId/checklist', authorize(PERMISSIONS.VIEW), r.getDocumentChecklist);
router.put('/document/:docId', authorize(PERMISSIONS.EDIT_LIMITED), r.updateDocumentStatus);
router.post('/:caseId/upload', authorize(PERMISSIONS.CREATE), upload.single('document'), r.uploadDocument);
router.post('/:caseId/finalize', authorize(PERMISSIONS.APPROVE), r.finalizeAdmission);

module.exports = router;

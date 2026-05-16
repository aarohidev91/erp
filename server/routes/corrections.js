const router = require('express').Router();
const { createCorrectionRequest, reviewCorrectionRequest, getCorrectionRequests } = require('../controllers/correctionController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/', getCorrectionRequests);
router.post('/case/:caseId', authorize(PERMISSIONS.REQUEST_CORRECTION), createCorrectionRequest);
router.put('/:id/review', authorize(PERMISSIONS.APPROVE_CORRECTION), reviewCorrectionRequest);

module.exports = router;

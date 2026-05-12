const router = require('express').Router();
const a = require('../controllers/accountsController');
const { authenticate, authorize } = require('../middleware/auth');
const { PERMISSIONS } = require('../config/permissions');

router.use(authenticate);
router.get('/payments', a.getPayments);
router.post('/:caseId/fee-structure', authorize(PERMISSIONS.CREATE), a.createFeeStructure);
router.post('/:caseId/payment', authorize(PERMISSIONS.CREATE), a.recordPayment);
router.post('/payment/:paymentId/cancel', authorize(PERMISSIONS.APPROVE), a.cancelPayment);
router.post('/:caseId/installments', authorize(PERMISSIONS.CREATE), a.createInstallments);
router.post('/fee-structure/:feeStructureId/approve-discount', authorize(PERMISSIONS.APPROVE), a.approveDiscount);

module.exports = router;

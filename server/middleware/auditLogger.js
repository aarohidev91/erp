const AuditLog = require('../models/AuditLog');

const createAuditLog = async ({ action, entity, entityId, caseId, previousData, newData, performedBy, req }) => {
  try {
    await AuditLog.create({
      action,
      entity,
      entityId,
      case: caseId,
      previousData,
      newData,
      performedBy,
      ipAddress: req ? (req.ip || req.connection.remoteAddress) : undefined,
      userAgent: req ? req.get('user-agent') : undefined,
    });
  } catch (error) {
    console.error('Audit log error:', error.message);
  }
};

module.exports = { createAuditLog };

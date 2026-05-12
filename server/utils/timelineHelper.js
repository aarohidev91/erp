const TimelineEvent = require('../models/TimelineEvent');

const addTimelineEvent = async ({ caseId, eventType, description, fromDepartment, toDepartment, fromUser, toUser, metadata, performedBy }) => {
  try {
    return await TimelineEvent.create({
      case: caseId,
      eventType,
      description,
      fromDepartment,
      toDepartment,
      fromUser,
      toUser,
      metadata,
      performedBy,
    });
  } catch (error) {
    console.error('Timeline event error:', error.message);
  }
};

module.exports = { addTimelineEvent };

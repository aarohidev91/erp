const Notification = require('../models/Notification');

const createNotification = async ({ userId, title, message, type, caseId }) => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type: type || 'general',
      case: caseId,
    });
  } catch (error) {
    console.error('Notification creation error:', error.message);
  }
};

module.exports = { createNotification };

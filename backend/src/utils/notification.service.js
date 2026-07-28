const prisma = require('./prisma');

/**
 * Notification Service Abstraction
 * Currently handles database persistence for in-app notifications.
 * Designed to be extensible for email, SMS, or webhooks without changing the business logic.
 */
class NotificationService {
  /**
   * Sends a notification to a specific user or company.
   * @param {Object} payload 
   * @param {string} payload.title
   * @param {string} payload.message
   * @param {string} payload.companyId
   * @param {string} [payload.userId] - Optional. If omitted, implies a broadcast to admins of the company.
   */
  static async send(payload) {
    const { title, message, companyId, userId } = payload;

    try {
      // 1. Persist to Database (In-App Notification Center)
      const notification = await prisma.notification.create({
        data: {
          title,
          message,
          companyId,
          userId: userId || null
        }
      });

      // 2. Extensibility Point: Webhooks, Email, SMS can be dispatched here.
      // e.g., if (user.emailPref) EmailService.send(user.email, title, message)
      
      return notification;
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw new Error('Notification failed');
    }
  }
}

module.exports = NotificationService;

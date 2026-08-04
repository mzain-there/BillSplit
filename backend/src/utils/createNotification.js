import Notification from "../models/notification.model.js"

/**
 * Create notifications for multiple recipients
 * @param {Array} recipients - Array of user IDs
 * @param {String} senderId - User ID of the sender
 * @param {String} type - Type of notification
 * @param {String} message - Notification message
 * @param {Object} metadata - Additional metadata
 */
export const createNotifications = async (recipients, senderId, type, message, metadata = {}) => {
  try {
    const notifications = recipients.map(recipientId => ({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      metadata
    }))

    await Notification.insertMany(notifications)
  } catch (error) {
    console.error("Error creating notifications:", error)
  }
}

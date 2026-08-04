import Notification from "../models/notification.model.js"
import ApiError from "../utils/ApiError.js"
import ApiResponse from "../utils/ApiResponse.js"

// Get all notifications for current user
const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate("sender", "username email avatar")
      .populate("metadata.groupId", "name")
      .sort({ createdAt: -1 })
      .limit(50)

    return res.status(200).json(
      new ApiResponse(200, notifications, "Notifications fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

// Get unread count
const getUnreadCount = async (req, res, next) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false
    })

    return res.status(200).json(
      new ApiResponse(200, { count }, "Unread count fetched successfully")
    )
  } catch (error) {
    next(error)
  }
}

// Mark notification as read
const markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      throw new ApiError(404, "Notification not found")
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized")
    }

    notification.isRead = true
    await notification.save()

    return res.status(200).json(
      new ApiResponse(200, notification, "Notification marked as read")
    )
  } catch (error) {
    next(error)
  }
}

// Mark all as read
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    )

    return res.status(200).json(
      new ApiResponse(200, {}, "All notifications marked as read")
    )
  } catch (error) {
    next(error)
  }
}

// Delete notification
const deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params

    const notification = await Notification.findById(notificationId)
    if (!notification) {
      throw new ApiError(404, "Notification not found")
    }

    if (notification.recipient.toString() !== req.user._id.toString()) {
      throw new ApiError(403, "Not authorized")
    }

    await Notification.findByIdAndDelete(notificationId)

    return res.status(200).json(
      new ApiResponse(200, {}, "Notification deleted successfully")
    )
  } catch (error) {
    next(error)
  }
}

export {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
}

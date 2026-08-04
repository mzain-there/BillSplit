import express from "express"
import {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification
} from "../controllers/notification.controller.js"
import verifyJWT from "../middlewares/auth.middleware.js"

const router = express.Router()

router.use(verifyJWT)

router.get("/", getMyNotifications)
router.get("/unread-count", getUnreadCount)
router.put("/:notificationId/read", markAsRead)
router.put("/read-all", markAllAsRead)
router.delete("/:notificationId", deleteNotification)

export default router

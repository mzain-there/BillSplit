import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axios'

export default function NotificationsDropdown() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const res = await axiosInstance.get('/notifications')
      setNotifications(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch notifications:', err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`)
      setNotifications(prev =>
        prev.map(n => (n._id === notificationId ? { ...n, isRead: true } : n))
      )
    } catch (err) {
      console.error('Failed to mark as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = (notification) => {
    markAsRead(notification._id)
    if (notification.metadata?.groupId) {
      navigate(`/groups/${notification.metadata.groupId}`)
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense_added':
        return { icon: 'receipt_long', color: 'text-blue-500', bg: 'bg-blue-500/10' }
      case 'settlement_made':
        return { icon: 'payments', color: 'text-green-500', bg: 'bg-green-500/10' }
      case 'member_added':
        return { icon: 'person_add', color: 'text-purple-500', bg: 'bg-purple-500/10' }
      case 'payment_reminder':
        return { icon: 'notifications_active', color: 'text-orange-500', bg: 'bg-orange-500/10' }
      default:
        return { icon: 'notifications', color: 'text-gray-500', bg: 'bg-gray-500/10' }
    }
  }

  const timeAgo = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    const seconds = Math.floor((new Date() - d) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
    return d.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="w-96 max-h-[32rem] bg-surface border border-outline-variant/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-outline-variant/30 bg-surface-container-low flex items-center justify-between">
        <div>
          <h3 className="font-headline-md text-lg font-bold text-on-surface">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-xs text-on-surface-variant">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="text-xs text-primary font-semibold hover:underline"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse flex gap-3">
                <div className="w-10 h-10 bg-surface-container rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-surface-container rounded w-3/4" />
                  <div className="h-3 bg-surface-container rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-on-surface-variant/30 mb-3">notifications_off</span>
            <p className="text-on-surface-variant">No notifications yet</p>
          </div>
        ) : (
          <div className="divide-y divide-outline-variant/20">
            {notifications.map((notification) => {
              const { icon, color, bg } = getNotificationIcon(notification.type)
              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`px-6 py-4 cursor-pointer transition-colors ${
                    notification.isRead ? 'bg-surface hover:bg-surface-container-low' : 'bg-primary/5 hover:bg-primary/10'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className={`w-10 h-10 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className={`material-symbols-outlined text-lg ${color}`}>{icon}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm ${notification.isRead ? 'text-on-surface-variant' : 'text-on-surface font-medium'}`}>
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-xs text-on-surface-variant">{timeAgo(notification.createdAt)}</p>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-6 py-3 border-t border-outline-variant/30 bg-surface-container-low">
          <button
            onClick={() => navigate('/notifications')}
            className="w-full text-sm text-primary font-semibold hover:underline"
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  )
}

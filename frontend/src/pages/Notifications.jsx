import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import axiosInstance from '../api/axios'

export default function Notifications() {
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

  const markAllAsRead = async () => {
    try {
      await axiosInstance.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    } catch (err) {
      console.error('Failed to mark all as read:', err)
    }
  }

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      try {
        await axiosInstance.put(`/notifications/${notification._id}/read`)
        setNotifications(prev =>
          prev.map(n => (n._id === notification._id ? { ...n, isRead: true } : n))
        )
      } catch (err) {
        console.error('Failed to mark as read:', err)
      }
    }

    if (notification.metadata?.groupId) {
      navigate(`/groups/${notification.metadata.groupId}`)
    }
  }

  const deleteNotification = async (notificationId, e) => {
    e.stopPropagation()
    try {
      await axiosInstance.delete(`/notifications/${notificationId}`)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
    } catch (err) {
      console.error('Failed to delete notification:', err)
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
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`
    return d.toLocaleDateString()
  }

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <div className="min-h-screen bg-background text-on-surface font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-gutter py-12 md:py-20">
        <div className="glass-card rounded-3xl p-8 md:p-12 shadow-xl border border-primary/10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div>
              <h1 className="font-headline-md text-headline-md">Notifications</h1>
              <p className="text-on-surface-variant mt-2">
                {unreadCount > 0
                  ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`
                  : 'You\'re all caught up!'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold hover:scale-[1.02] active:scale-95 transition-all"
              >
                Mark all as read
              </button>
            )}
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="animate-pulse p-6 rounded-3xl bg-surface-container-low">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-surface-container rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-surface-container rounded w-3/4" />
                      <div className="h-3 bg-surface-container rounded w-1/2" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-16">
              <span className="material-symbols-outlined text-8xl text-on-surface-variant/30 mb-4">notifications_off</span>
              <h3 className="text-xl font-bold text-on-surface mb-2">No notifications yet</h3>
              <p className="text-on-surface-variant">When something happens, you'll see it here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map(notification => {
                const { icon, color, bg } = getNotificationIcon(notification.type)
                return (
                  <div
                    key={notification._id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                      notification.isRead
                        ? 'bg-surface-container-low border-outline-variant/30 hover:bg-surface-container'
                        : 'bg-primary/5 border-primary/20 hover:bg-primary/10'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <span className={`material-symbols-outlined text-xl ${color}`}>{icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <p className={`text-base ${notification.isRead ? 'text-on-surface-variant' : 'text-on-surface font-semibold'}`}>
                              {notification.message}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <p className="text-sm text-on-surface-variant">{timeAgo(notification.createdAt)}</p>
                              {!notification.isRead && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">New</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={(e) => deleteNotification(notification._id, e)}
                            className="p-2 rounded-full hover:bg-error/10 text-error transition-colors"
                          >
                            <span className="material-symbols-outlined text-lg">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

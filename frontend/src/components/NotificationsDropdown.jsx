import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Receipt, CreditCard, UserPlus, BellRing, Check, ExternalLink } from 'lucide-react'
import axiosInstance from '../api/axios'

export default function NotificationsDropdown({ onClose }) {
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
      if (onClose) onClose()
    }
  }

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'expense_added':
        return {
          icon: <Receipt size={16} />,
          bg: 'rgba(79, 70, 229, 0.12)',
          color: 'var(--primary)',
        }
      case 'settlement_made':
        return {
          icon: <CreditCard size={16} />,
          bg: 'rgba(5, 150, 105, 0.12)',
          color: 'var(--success)',
        }
      case 'member_added':
        return {
          icon: <UserPlus size={16} />,
          bg: 'rgba(124, 58, 237, 0.12)',
          color: 'var(--primary-2)',
        }
      case 'payment_reminder':
        return {
          icon: <BellRing size={16} />,
          bg: 'rgba(245, 158, 11, 0.12)',
          color: '#d97706',
        }
      default:
        return {
          icon: <Bell size={16} />,
          bg: 'var(--soft)',
          color: 'var(--muted)',
        }
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
    <div
      style={{
        width: 360,
        maxWidth: 'calc(100vw - 32px)',
        maxHeight: '30rem',
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 18,
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '1px solid var(--line)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--card)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--ink)' }}>
            Notifications
          </h3>
          {unreadCount > 0 && (
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 12,
                background: 'var(--soft)',
                color: 'var(--primary)',
              }}
            >
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Check size={13} />
            Mark all read
          </button>
        )}
      </div>

      {/* List Content */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '22rem' }}>
        {loading ? (
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'var(--soft)',
                    opacity: 0.6,
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      height: 12,
                      background: 'var(--soft)',
                      borderRadius: 6,
                      width: '75%',
                      marginBottom: 6,
                      opacity: 0.6,
                    }}
                  />
                  <div
                    style={{
                      height: 10,
                      background: 'var(--soft)',
                      borderRadius: 6,
                      width: '40%',
                      opacity: 0.4,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div
            style={{
              padding: '40px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--soft)',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Bell size={22} style={{ opacity: 0.6 }} />
            </div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>
              No notifications yet
            </p>
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>
              Activity from your groups will show up here
            </span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {notifications.map((notification) => {
              const { icon, color, bg } = getNotificationIcon(notification.type)
              return (
                <div
                  key={notification._id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    padding: '14px 18px',
                    display: 'flex',
                    gap: 12,
                    cursor: 'pointer',
                    borderBottom: '1px solid var(--line)',
                    background: notification.isRead ? 'transparent' : 'var(--soft)',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = notification.isRead ? 'var(--soft)' : 'rgba(79, 70, 229, 0.15)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = notification.isRead ? 'transparent' : 'var(--soft)'
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 10,
                      background: bg,
                      color: color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        margin: 0,
                        fontSize: 13,
                        lineHeight: 1.4,
                        fontWeight: notification.isRead ? 400 : 600,
                        color: 'var(--ink)',
                      }}
                    >
                      {notification.message}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--muted)' }}>
                        {timeAgo(notification.createdAt)}
                      </span>
                      {!notification.isRead && (
                        <span
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: 'var(--primary)',
                          }}
                        />
                      )}
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
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--line)',
            background: 'var(--card)',
          }}
        >
          <button
            onClick={() => {
              navigate('/notifications')
              if (onClose) onClose()
            }}
            style={{
              width: '100%',
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              padding: 0,
            }}
          >
            <span>View all notifications</span>
            <ExternalLink size={13} />
          </button>
        </div>
      )}
    </div>
  )
}

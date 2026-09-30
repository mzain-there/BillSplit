import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Users, Receipt, User, Menu, X } from 'lucide-react'
import Logo from './ui/Logo'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axios'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const [isMobile, setIsMobile] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const menuButtonRef = useRef(null)
  const drawerRef = useRef(null)
  const previousActiveElementRef = useRef(null)

  // Track responsive screen width (breakpoint 860px)
  useEffect(() => {
    const media = window.matchMedia('(max-width: 860px)')
    const updateMatch = () => setIsMobile(media.matches)
    updateMatch()
    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [])

  // Poll unread count
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      const interval = setInterval(fetchUnreadCount, 30000)
      return () => clearInterval(interval)
    }
  }, [user])

  const fetchUnreadCount = async () => {
    try {
      const res = await axiosInstance.get('/notifications/unread-count')
      setUnreadCount(res.data.data?.count || 0)
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
    }
  }

  // Close drawer on route change
  useEffect(() => {
    if (drawerOpen) {
      closeDrawer()
    }
  }, [location.pathname])

  // Lock body scroll and handle focus trapping when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      previousActiveElementRef.current = document.activeElement
      document.body.style.overflow = 'hidden'

      // Focus first focusable in drawer
      const focusable = drawerRef.current?.querySelectorAll('button, a[href]')
      if (focusable && focusable.length > 0) {
        focusable[0].focus()
      }

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          closeDrawer()
        } else if (e.key === 'Tab' && drawerRef.current) {
          const elements = drawerRef.current.querySelectorAll('button, a[href]')
          if (!elements.length) return
          const first = elements[0]
          const last = elements[elements.length - 1]
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault()
            last.focus()
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }

      window.addEventListener('keydown', handleKeyDown)
      return () => {
        window.removeEventListener('keydown', handleKeyDown)
        document.body.style.overflow = ''
      }
    } else {
      document.body.style.overflow = ''
    }
  }, [drawerOpen])

  const openDrawer = () => {
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    if (menuButtonRef.current) {
      menuButtonRef.current.focus()
    }
  }

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/groups') return location.pathname.startsWith('/groups')
    if (path === '/expenses') return location.pathname.startsWith('/expenses')
    if (path === '/profile') return location.pathname === '/profile'
    return false
  }

  const isNotificationsActive = location.pathname === '/notifications'

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Groups', path: '/groups', icon: <Users size={18} /> },
    { label: 'Expenses', path: '/expenses', icon: <Receipt size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ]

  return (
    <>
      {/* ── Outer Wrapper: sticky, centered floating bar ── */}
      <header
        style={{
          position: 'sticky',
          top: 14,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 50,
          padding: '14px 12px 0',
          width: '100%',
          boxSizing: 'border-box',
          pointerEvents: 'none', // Allow clicks around the pill
        }}
      >
        {!isMobile ? (
          /* ── DESKTOP PILL (861px+) ── */
          <nav
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              padding: '6px 8px 6px 10px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--card) 82%, transparent)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              width: 'fit-content',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {/* Logo mark only: 30px gradient rounded square (border-radius 10px), NO text */}
            <Link
              to="/dashboard"
              aria-label="Dashboard"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
                flexShrink: 0,
                borderRadius: 10,
                transition: 'transform 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <Logo size={30} showText={false} />
            </Link>

            {/* Exactly 4 Links: Dashboard, Groups, Expenses, Profile */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {navLinks.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      padding: '9px 18px',
                      borderRadius: 999,
                      fontWeight: 600,
                      fontSize: 13,
                      textDecoration: 'none',
                      color: active ? '#ffffff' : 'var(--muted)',
                      background: active ? 'var(--primary)' : 'transparent',
                      boxShadow: active ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--soft)'
                        e.currentTarget.style.color = 'var(--ink)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--muted)'
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>

            {/* Bell: LAST element inside pill */}
            <button
              onClick={() => navigate('/notifications')}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                border: 'none',
                background: isNotificationsActive ? 'var(--primary)' : 'var(--soft)',
                color: isNotificationsActive ? '#ffffff' : 'var(--muted)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                flexShrink: 0,
                transition: 'all 0.18s ease',
                boxShadow: isNotificationsActive ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isNotificationsActive) {
                  e.currentTarget.style.color = 'var(--ink)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isNotificationsActive) {
                  e.currentTarget.style.color = 'var(--muted)'
                }
              }}
            >
              <Bell size={17} />
              {unreadCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 3,
                    right: 3,
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--danger)',
                    border: '2px solid var(--card)',
                    boxSizing: 'content-box',
                  }}
                />
              )}
            </button>
          </nav>
        ) : (
          /* ── MOBILE PILL (<= 860px) ── */
          <nav
            style={{
              pointerEvents: 'auto',
              width: 'calc(100% - 24px)',
              maxWidth: 860,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px 6px 14px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--card) 82%, transparent)',
              backdropFilter: 'blur(14px)',
              WebkitBackdropFilter: 'blur(14px)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {/* LEFT = logo mark + text "BillSplit" */}
            <Link
              to="/dashboard"
              style={{
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Logo size={28} showText={true} />
            </Link>

            {/* RIGHT = bell button, then a menu (☰) button. Nothing else. */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Bell */}
              <button
                onClick={() => navigate('/notifications')}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: isNotificationsActive ? 'var(--primary)' : 'var(--soft)',
                  color: isNotificationsActive ? '#ffffff' : 'var(--muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.18s ease',
                }}
              >
                <Bell size={17} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: 'var(--danger)',
                      border: '2px solid var(--card)',
                      boxSizing: 'content-box',
                    }}
                  />
                )}
              </button>

              {/* Hamburger Menu (☰) */}
              <button
                ref={menuButtonRef}
                onClick={openDrawer}
                aria-expanded={drawerOpen}
                aria-controls="mobile-nav-drawer"
                aria-label="Open Navigation Menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Menu size={18} />
              </button>
            </div>
          </nav>
        )}
      </header>

      {/* ── MOBILE RIGHT-SIDE DRAWER ── */}
      {isMobile && drawerOpen && (
        <div style={{ position: 'relative', zIndex: 100 }}>
          {/* Dimmed backdrop */}
          <div
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: 'blur(2px)',
              WebkitBackdropFilter: 'blur(2px)',
              animation: 'fadeIn 200ms ease-out forwards',
            }}
          />

          {/* Drawer container */}
          <aside
            id="mobile-nav-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              height: '100vh',
              width: 'min(80%, 320px)',
              background: 'var(--card)',
              borderLeft: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              padding: '24px 20px',
              boxSizing: 'border-box',
              animation: 'drawerSlideIn 250ms ease-out forwards',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            }}
          >
            {/* Top row: logo mark + "BillSplit" and a close (X) button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 20,
                borderBottom: '1px solid var(--line)',
                marginBottom: 20,
              }}
            >
              <Logo size={28} showText={true} />
              <button
                onClick={closeDrawer}
                aria-label="Close Navigation Menu"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'var(--soft)',
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Vertical list of the SAME 4 links: Dashboard, Groups, Expenses, Profile */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {navLinks.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeDrawer}
                    style={{
                      minHeight: 48,
                      padding: '0 14px',
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      fontSize: 14,
                      fontWeight: active ? 700 : 600,
                      textDecoration: 'none',
                      color: active ? '#ffffff' : 'var(--muted)',
                      background: active ? 'var(--primary)' : 'transparent',
                      transition: 'all 0.18s ease',
                      boxShadow: active ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'var(--soft)'
                        e.currentTarget.style.color = 'var(--ink)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent'
                        e.currentTarget.style.color = 'var(--muted)'
                      }
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                )
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Global CSS keyframes for drawer and animations if not already present */}
      <style>{`
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          #mobile-nav-drawer, div[role="dialog"] {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}

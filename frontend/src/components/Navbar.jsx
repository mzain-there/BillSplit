import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Bell, LayoutDashboard, Users, Receipt, User, Menu, X, ArrowUpRight } from 'lucide-react'
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

  // iPhone Dynamic Island animation state (triggered after login / sign up)
  const [isDynamicIsland, setIsDynamicIsland] = useState(() => {
    if (typeof window === 'undefined') return false
    const searchParams = new URLSearchParams(window.location.search)
    return Boolean(
      location.state?.justLoggedIn ||
      sessionStorage.getItem('dynamicIslandActive') === 'true' ||
      searchParams.get('island') === '1'
    )
  })

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

  // Dynamic Island cleanup
  useEffect(() => {
    if (isDynamicIsland) {
      sessionStorage.removeItem('dynamicIslandActive')
      if (location.search.includes('island=1')) {
        navigate(location.pathname, { replace: true, state: {} })
      }
      const timer = setTimeout(() => {
        setIsDynamicIsland(false)
      }, 1450)
      return () => clearTimeout(timer)
    }
  }, [isDynamicIsland])

  // Poll unread notifications count
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
  const isProfileActive = location.pathname === '/profile'

  // Primary desktop navigation links
  const mainNavLinks = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Groups', path: '/groups' },
    { label: 'Expenses', path: '/expenses' },
  ]

  // All links for mobile drawer
  const drawerLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { label: 'Groups', path: '/groups', icon: <Users size={18} /> },
    { label: 'Expenses', path: '/expenses', icon: <Receipt size={18} /> },
    { label: 'Profile', path: '/profile', icon: <User size={18} /> },
  ]

  return (
    <>
      {/* ── Outer Wrapper: sticky, centered floating header ── */}
      <header
        style={{
          position: 'sticky',
          top: 14,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 50,
          padding: '14px 16px 0',
          width: '100%',
          boxSizing: 'border-box',
          pointerEvents: 'none',
        }}
      >
        {!isMobile ? (
          /* ── DESKTOP SLEEK FLOATING PILL (A little bit wider than previous, perfectly proportioned) ── */
          <nav
            className={isDynamicIsland ? 'dynamic-island-expanding' : ''}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              padding: '6px 10px 6px 12px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--card) 85%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              width: 'fit-content',
              minWidth: 540,
              maxWidth: 'min(660px, calc(100% - 24px))',
              minHeight: 48,
              boxSizing: 'border-box',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Dynamic Island Capsule Greeting (visible during the initial 400ms) */}
            {isDynamicIsland && (
              <div className="dynamic-island-pill-preview">
                <span className="dynamic-island-pulsing-dot" />
                <span className="dynamic-island-text">Welcome back 👋</span>
              </div>
            )}

            {/* Left: Logo mark only (clean 30px icon, no huge text) */}
            <div className="dynamic-island-content-node" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <Link
                to="/dashboard"
                aria-label="Dashboard"
                style={{
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 10,
                  transition: 'transform 0.18s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.06)')}
                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                <Logo size={30} showText={false} />
              </Link>
            </div>

            {/* Center: Main Navigation Links (Dashboard, Groups, Expenses) */}
            <div
              className="dynamic-island-content-node"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              {mainNavLinks.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    style={{
                      padding: '8px 16px',
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

            {/* Right: Divider + Bell + Profile Avatar Icon Button */}
            <div
              className="dynamic-island-content-node"
              style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}
            >
              {/* Subtle vertical separator */}
              <div
                style={{
                  width: 1,
                  height: 20,
                  background: 'var(--line)',
                  margin: '0 2px',
                  opacity: 0.8,
                }}
              />

              {/* Notifications Bell */}
              <button
                onClick={() => navigate('/notifications')}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                title="Notifications"
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
                    e.currentTarget.style.transform = 'scale(1.05)'
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isNotificationsActive) {
                    e.currentTarget.style.color = 'var(--muted)'
                    e.currentTarget.style.transform = 'scale(1)'
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

              {/* Profile Avatar Icon Button (Direct navigation to /profile) */}
              <button
                onClick={() => navigate('/profile')}
                aria-label="Profile"
                title={user?.username ? `Signed in as ${user.username}` : 'Profile'}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: isProfileActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                  background: isProfileActive ? 'var(--soft)' : 'var(--card)',
                  padding: 2,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.18s ease',
                  boxShadow: isProfileActive ? '0 0 0 3px rgba(79, 70, 229, 0.25)' : 'none',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.08)'
                  e.currentTarget.style.borderColor = 'var(--primary)'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)'
                  if (!isProfileActive) {
                    e.currentTarget.style.borderColor = 'var(--line)'
                  }
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username || 'User avatar'}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 13,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {user?.username ? user.username.charAt(0) : <User size={15} />}
                  </div>
                )}
              </button>
            </div>
          </nav>
        ) : (
          /* ── MOBILE NAVBAR (with Profile Icon + Bell + Menu) ── */
          <nav
            className={isDynamicIsland ? 'dynamic-island-expanding-mobile' : ''}
            style={{
              pointerEvents: 'auto',
              width: '100%',
              maxWidth: 'min(860px, calc(100% - 16px))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '6px 12px 6px 14px',
              borderRadius: 999,
              background: 'color-mix(in srgb, var(--card) 85%, transparent)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Dynamic Island Capsule Greeting for Mobile */}
            {isDynamicIsland && (
              <div className="dynamic-island-pill-preview">
                <span className="dynamic-island-pulsing-dot" />
                <span className="dynamic-island-text">Welcome back 👋</span>
              </div>
            )}

            {/* Left = Logo + "BillSplit" */}
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

            {/* Right = Notifications Bell + Direct Profile Icon + Menu */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Notifications */}
              <button
                onClick={() => navigate('/notifications')}
                aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  border: isNotificationsActive ? '1px solid var(--primary)' : '1px solid var(--line)',
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
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 3,
                      right: 3,
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: 'var(--danger)',
                      border: '2px solid var(--card)',
                      boxSizing: 'content-box',
                    }}
                  />
                )}
              </button>

              {/* Profile Avatar Icon */}
              <button
                onClick={() => navigate('/profile')}
                aria-label="Profile"
                title="Profile"
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  border: isProfileActive ? '2px solid var(--primary)' : '1px solid var(--line)',
                  background: 'var(--soft)',
                  padding: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.username || 'Profile'}
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    {user?.username ? user.username.charAt(0).toUpperCase() : <User size={14} />}
                  </div>
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
                  border: '1px solid var(--line)',
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
              backdropFilter: 'blur(3px)',
              WebkitBackdropFilter: 'blur(3px)',
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
              width: 'min(84%, 340px)',
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
            {/* Top row: logo + close (X) button */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 18,
                borderBottom: '1px solid var(--line)',
                marginBottom: 16,
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
                  border: '1px solid var(--line)',
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

            {/* Profile Quick Card in Drawer */}
            <div
              onClick={() => {
                closeDrawer()
                navigate('/profile')
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                borderRadius: 16,
                background: 'var(--soft)',
                border: '1px solid var(--line)',
                marginBottom: 16,
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.username || 'User avatar'}
                  style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    fontWeight: 700,
                  }}
                >
                  {user?.username ? user.username.charAt(0).toUpperCase() : <User size={18} />}
                </div>
              )}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--ink)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.username || 'User'}
                </p>
                <p style={{ margin: '2px 0 0', fontSize: 12, color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user?.email || 'View Profile'}
                </p>
              </div>
              <ArrowUpRight size={16} color="var(--muted)" />
            </div>

            {/* Vertical list of 4 links: Dashboard, Groups, Expenses, Profile */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
              {drawerLinks.map((item) => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeDrawer}
                    style={{
                      minHeight: 46,
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

      {/* ── Keyframes and iPhone Dynamic Island Animation Styles ── */}
      <style>{`
        /* Dynamic Island Expand Animation (Desktop) */
        .dynamic-island-expanding {
          animation: dynamicIslandPhysicsExpand 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          transform-origin: top center;
        }

        .dynamic-island-expanding-mobile {
          animation: dynamicIslandMobileExpand 1.35s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          transform-origin: top center;
        }

        @keyframes dynamicIslandPhysicsExpand {
          0% {
            width: 140px;
            max-width: 140px;
            min-height: 40px;
            height: 40px;
            padding: 4px 12px;
            border-radius: 999px;
            background: #0f172a;
            border-color: rgba(99, 102, 241, 0.6);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(79, 70, 229, 0.4);
            transform: translateY(-8px) scale(0.92);
          }
          30% {
            width: 190px;
            max-width: 190px;
            min-height: 42px;
            height: 42px;
            padding: 5px 14px;
            border-radius: 999px;
            background: #0f172a;
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 0 18px 44px rgba(0, 0, 0, 0.45), 0 0 28px rgba(79, 70, 229, 0.45);
            transform: translateY(0px) scale(1.05);
          }
          65% {
            width: min(620px, calc(100% - 24px));
            max-width: min(620px, calc(100% - 24px));
            min-height: 50px;
            height: 50px;
            padding: 6px 10px 6px 12px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--card) 85%, transparent);
            border-color: var(--line);
            box-shadow: var(--shadow);
            transform: scale(1.02);
          }
          85% {
            transform: scale(0.995);
          }
          100% {
            width: fit-content;
            min-width: 540px;
            max-width: min(660px, calc(100% - 24px));
            min-height: 48px;
            height: auto;
            padding: 6px 10px 6px 12px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--card) 85%, transparent);
            border-color: var(--line);
            box-shadow: var(--shadow);
            transform: scale(1);
          }
        }

        @keyframes dynamicIslandMobileExpand {
          0% {
            width: 140px;
            max-width: 140px;
            min-height: 40px;
            height: 40px;
            padding: 4px 12px;
            border-radius: 999px;
            background: #0f172a;
            border-color: rgba(99, 102, 241, 0.6);
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.5);
            transform: translateY(-8px) scale(0.92);
          }
          30% {
            width: 190px;
            max-width: 190px;
            min-height: 42px;
            border-radius: 999px;
            transform: translateY(0px) scale(1.05);
          }
          65% {
            width: 100%;
            max-width: min(860px, calc(100% - 16px));
            min-height: 48px;
            border-radius: 999px;
            background: color-mix(in srgb, var(--card) 85%, transparent);
            border-color: var(--line);
            box-shadow: var(--shadow);
            transform: scale(1.015);
          }
          100% {
            width: 100%;
            max-width: min(860px, calc(100% - 16px));
            border-radius: 999px;
            background: color-mix(in srgb, var(--card) 85%, transparent);
            border-color: var(--line);
            box-shadow: var(--shadow);
            transform: scale(1);
          }
        }

        /* Dynamic Island Preview Capsule content during the first 400ms */
        .dynamic-island-pill-preview {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #ffffff;
          font-size: 13px;
          font-weight: 700;
          pointer-events: none;
          z-index: 10;
          animation: islandPillFadeOut 0.35s 0.32s forwards ease-in-out;
        }

        @keyframes islandPillFadeOut {
          0%   { opacity: 1; transform: scale(1); }
          100% { opacity: 0; transform: scale(0.85); visibility: hidden; }
        }

        .dynamic-island-pulsing-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 10px #10b981;
          animation: islandDotPulse 0.9s infinite alternate;
        }

        @keyframes islandDotPulse {
          0%   { transform: scale(0.8); opacity: 0.7; }
          100% { transform: scale(1.25); opacity: 1; }
        }

        /* Fade in normal navbar content as the island expands */
        .dynamic-island-expanding .dynamic-island-content-node,
        .dynamic-island-expanding-mobile > * {
          animation: islandNodeReveal 0.5s 0.4s both cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes islandNodeReveal {
          0% {
            opacity: 0;
            transform: scale(0.92);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }

        /* Drawer Animations */
        @keyframes drawerSlideIn {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .dynamic-island-expanding,
          .dynamic-island-expanding-mobile,
          #mobile-nav-drawer,
          div[role="dialog"] {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </>
  )
}

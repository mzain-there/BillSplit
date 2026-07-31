import React, { useState, useEffect, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import NotificationsDropdown from './NotificationsDropdown'
import { useAuth } from '../contexts/AuthContext'

export default function Navbar() {
  const { user } = useAuth()
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function onDoc(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  const isActive = (path) => {
    if (path === '/dashboard') return location.pathname === '/dashboard'
    if (path === '/groups') return location.pathname.startsWith('/groups')
    if (path === '/notifications') return location.pathname === '/notifications'
    if (path === '/profile') return location.pathname === '/profile'
    return false
  }

  const navLinkClass = (path) =>
    isActive(path)
      ? 'text-primary font-bold border-b-2 border-primary pb-1 font-body-md text-body-md transition-all'
      : 'text-on-surface-variant hover:text-primary transition-colors font-body-md text-body-md border-b-2 border-transparent pb-1'

  return (
    <nav className="sticky top-0 w-full z-50 bg-surface/85 backdrop-blur-lg border-b border-primary/10 shadow-sm">
      <div className="flex justify-between items-center px-gutter py-3.5 max-w-container-max mx-auto relative" ref={ref}>
        
        {/* ── Logo + Icon ── */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-primary to-indigo-500 flex items-center justify-center text-white shadow-md shadow-primary/20 group-hover:scale-105 transition-transform duration-200">
            <span className="material-symbols-outlined text-lg font-bold">call_split</span>
          </div>
          <span className="font-headline-md text-lg md:text-xl font-bold text-on-surface tracking-tight group-hover:text-primary transition-colors">
            Bill<span className="text-primary">Split</span>
          </span>
        </Link>

        {/* ── Nav Links ── */}
        <div className="hidden md:flex items-center gap-8">
          <Link to="/dashboard" className={navLinkClass('/dashboard')}>Dashboard</Link>
          <Link to="/groups/1" className={navLinkClass('/groups')}>Groups</Link>
          <Link to="/notifications" className={navLinkClass('/notifications')}>Notifications</Link>
          <Link to="/profile" className={navLinkClass('/profile')}>Profile</Link>
        </div>

        {/* ── Right Action Controls ── */}
        <div className="flex items-center gap-4">
          <button onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }} className="relative p-2 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full" />
          </button>
          
          <Link to="/profile" className="w-10 h-10 rounded-full ring-2 ring-primary/40 hover:ring-primary p-0.5 overflow-hidden transition-all flex items-center justify-center bg-primary/10">
            {user?.avatar ? (
              <img className="w-full h-full object-cover rounded-full" alt={user.username || 'User'} src={user.avatar} />
            ) : (
              <div className="w-full h-full rounded-full bg-primary text-on-primary font-bold flex items-center justify-center text-sm uppercase">
                {user?.username ? user.username.charAt(0) : 'U'}
              </div>
            )}
          </Link>
        </div>

        {open && <div className="absolute top-full right-4 mt-2 z-[60]"><NotificationsDropdown /></div>}
      </div>
    </nav>
  )
}

import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import MemberStack from './MemberStack'

/**
 * GroupCard - Redesigned to exact spec:
 * 1. Row: 48px rounded-15px avatar (image or gradient initials), bold name & single-line muted description
 * 2. Row: Overlapping member avatar stack (up to 4, 26px circles with 2px border) on left, "{n} members" on right
 * 3. Status strip: background var(--bg), radius 14px, padding 12px 14px, status pill on left, amount on right
 * 4. Footer row: last activity on left (omitted if nonexistent), "View →" on right
 */
export default function GroupCard({
  image,
  title,
  description,
  members = [],
  membersText,
  amount = 'Rs. 0',
  variant = 'settled',
  lastActivity,
  onClick,
}) {
  const [imageFailed, setImageFailed] = useState(false)

  const getInitials = (str = '') => {
    if (!str) return 'G'
    const parts = str.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return str.substring(0, 2).toUpperCase()
  }

  const getGradient = (str = '') => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
    ]
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    return gradients[Math.abs(hash) % gradients.length]
  }

  // Pill styling based on variant
  let pillBg = 'rgba(5, 150, 105, 0.12)'
  let pillColor = 'var(--success)'
  let pillText = 'Settled up'
  let amountColor = 'var(--ink)'

  if (variant === 'owed' || variant === 'receivable') {
    pillBg = 'rgba(5, 150, 105, 0.12)'
    pillColor = 'var(--success)'
    pillText = "You're owed"
    amountColor = 'var(--success)'
  } else if (variant === 'owe' || variant === 'payable') {
    pillBg = 'rgba(225, 29, 72, 0.12)'
    pillColor = 'var(--danger)'
    pillText = 'You owe'
    amountColor = 'var(--danger)'
  }

  const memberCount = members?.length || (membersText ? parseInt(membersText, 10) : 0) || 0
  const countLabel = `${memberCount} ${memberCount === 1 ? 'member' : 'members'}`

  const hasImage = image && image !== 'https://via.placeholder.com/150' && !imageFailed

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      className="group-card-item"
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 22,
        padding: 20,
        boxShadow: 'var(--shadow)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
        height: '100%',
        boxSizing: 'border-box',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = '#c7c3f7'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--line)'
      }}
    >
      {/* ── 1. Top Row: Avatar + Name & Description ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 15,
            overflow: 'hidden',
            background: getGradient(title),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 800,
            fontSize: 16,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.15)',
          }}
        >
          {hasImage ? (
            <img
              src={image}
              alt=""
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{getInitials(title)}</span>
          )}
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <h3
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              letterSpacing: '-0.01em',
            }}
          >
            {title}
          </h3>

          <p
            style={{
              margin: '3px 0 0',
              fontSize: 12,
              fontWeight: 500,
              color: 'var(--muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {description || 'No description provided'}
          </p>
        </div>
      </div>

      {/* ── 2. Middle Row: Overlapping Member Avatars + "{n} members" ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 28,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {members && members.length > 0 ? (
            <MemberStack members={members} max={4} />
          ) : (
            <span style={{ fontSize: 12, color: 'var(--muted)' }}>No members yet</span>
          )}
        </div>

        <span
          style={{
            fontSize: 12,
            fontWeight: 500,
            color: 'var(--muted)',
          }}
        >
          {countLabel}
        </span>
      </div>

      {/* ── 3. Status Strip: background var(--bg), radius 14px, padding 12px 14px ── */}
      <div
        style={{
          background: 'var(--bg)',
          borderRadius: 14,
          padding: '12px 14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <span
          style={{
            background: pillBg,
            color: pillColor,
            fontSize: 12,
            fontWeight: 700,
            padding: '4px 10px',
            borderRadius: 999,
            display: 'inline-block',
          }}
        >
          {pillText}
        </span>

        <span
          style={{
            fontSize: 14,
            fontWeight: 800,
            color: amountColor,
            letterSpacing: '-0.02em',
          }}
        >
          {amount}
        </span>
      </div>

      {/* ── 4. Footer Row: last activity on left, "View →" on right ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: 12,
          color: 'var(--muted)',
          fontWeight: 500,
          paddingTop: 2,
        }}
      >
        <div>
          {lastActivity ? (
            <span>{lastActivity}</span>
          ) : (
            <span style={{ visibility: 'hidden' }}>—</span>
          )}
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            color: 'var(--primary)',
            fontWeight: 700,
          }}
        >
          <span>View</span>
          <ArrowRight size={14} />
        </div>
      </div>
    </div>
  )
}

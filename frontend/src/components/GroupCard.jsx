import React from 'react'
import { Users } from 'lucide-react'

export default function GroupCard({ image, title, membersText, amount, variant, onClick }) {
  const avatarSrc = image && image !== 'https://via.placeholder.com/150' ? image : null

  let badgeBg = 'var(--soft)'
  let badgeColor = 'var(--muted)'
  let badgeLabel = 'Settled up'
  let amountColor = 'var(--muted)'

  if (variant === 'owed') {
    badgeBg = 'rgba(5, 150, 105, 0.12)'
    badgeColor = 'var(--success)'
    badgeLabel = 'Owes you'
    amountColor = 'var(--success)'
  } else if (variant === 'owe') {
    badgeBg = 'rgba(225, 29, 72, 0.12)'
    badgeColor = 'var(--danger)'
    badgeLabel = 'You owe'
    amountColor = 'var(--danger)'
  }

  return (
    <div
      onClick={onClick}
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 18,
        padding: '20px',
        boxShadow: 'var(--shadow)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 16,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = 'var(--primary)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--card-border)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {/* Avatar or Group Icon */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            overflow: 'hidden',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: 18,
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.18)',
          }}
        >
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt={title}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          ) : (
            <span>{title ? title.charAt(0).toUpperCase() : 'G'}</span>
          )}
        </div>

        {/* Title and Member Info */}
        <div style={{ minWidth: 0, flex: 1 }}>
          <h4
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 700,
              color: 'var(--ink)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {title}
          </h4>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontSize: 12,
              color: 'var(--muted)',
              marginTop: 3,
            }}
          >
            <Users size={13} style={{ opacity: 0.8 }} />
            <span>{membersText}</span>
          </div>
        </div>
      </div>

      {/* Balance Pill Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: 12,
          background: badgeBg,
        }}
      >
        <span
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: badgeColor,
          }}
        >
          {badgeLabel}
        </span>
        <span
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: amountColor,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          {amount}
        </span>
      </div>
    </div>
  )
}

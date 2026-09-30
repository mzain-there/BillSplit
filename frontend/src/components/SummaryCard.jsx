import React from 'react'

export default function SummaryCard({ icon, label, title, amount, variant = 'neutral' }) {
  // Determine variant styling
  let badgeBg = 'var(--soft)'
  let badgeColor = 'var(--primary)'
  let iconBg = 'rgba(79, 70, 229, 0.1)'
  let iconColor = 'var(--primary)'
  let amountColor = 'var(--ink)'

  if (variant === 'receivable' || variant === 'owed' || label?.toLowerCase().includes('receivable')) {
    badgeBg = 'rgba(5, 150, 105, 0.12)'
    badgeColor = 'var(--success)'
    iconBg = 'rgba(5, 150, 105, 0.12)'
    iconColor = 'var(--success)'
    amountColor = 'var(--success)'
  } else if (variant === 'payable' || variant === 'owe' || label?.toLowerCase().includes('payable')) {
    badgeBg = 'rgba(225, 29, 72, 0.12)'
    badgeColor = 'var(--danger)'
    iconBg = 'rgba(225, 29, 72, 0.12)'
    iconColor = 'var(--danger)'
    amountColor = 'var(--danger)'
  } else if (variant === 'primary') {
    badgeBg = 'var(--soft)'
    badgeColor = 'var(--primary)'
    iconBg = 'var(--soft)'
    iconColor = 'var(--primary)'
    amountColor = 'var(--primary)'
  }

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--card-border)',
        borderRadius: 20,
        padding: '24px 22px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease',
        cursor: 'default',
        position: 'relative',
        overflow: 'hidden',
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
      {/* Top row: Icon & Label Badge */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 22,
          }}
        >
          {icon}
        </div>
        {label && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              padding: '4px 10px',
              borderRadius: 20,
              background: badgeBg,
              color: badgeColor,
            }}
          >
            {label}
          </span>
        )}
      </div>

      {/* Title & Amount */}
      <div>
        <p
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--muted)',
            margin: '0 0 6px 0',
          }}
        >
          {title}
        </p>
        <div
          style={{
            fontSize: 26,
            fontWeight: 800,
            letterSpacing: '-0.03em',
            color: amountColor,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            lineHeight: 1.15,
          }}
        >
          {amount}
        </div>
      </div>
    </div>
  )
}

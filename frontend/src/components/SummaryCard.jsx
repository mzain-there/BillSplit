import React from 'react'

/**
 * SummaryCard - Clean, modern metric card supporting:
 * label (14px muted), value (26px/800 bold), variant ('neutral' | 'owed' | 'owe' | 'primary')
 */
export default function SummaryCard({
  icon,
  label,
  title,
  value,
  amount,
  variant = 'neutral',
}) {
  const displayLabel = label || title || ''
  const displayValue = value !== undefined ? value : amount !== undefined ? amount : '0'

  // Variant color definitions
  let iconBg = 'var(--soft)'
  let iconColor = 'var(--primary)'
  let valueColor = 'var(--ink)'

  if (variant === 'owed' || variant === 'receivable' || displayLabel.toLowerCase().includes('owed')) {
    iconBg = 'rgba(5, 150, 105, 0.12)'
    iconColor = 'var(--success)'
    valueColor = 'var(--success)'
  } else if (variant === 'owe' || variant === 'payable' || displayLabel.toLowerCase().includes('owe')) {
    iconBg = 'rgba(225, 29, 72, 0.12)'
    iconColor = 'var(--danger)'
    valueColor = 'var(--danger)'
  } else if (variant === 'primary') {
    iconBg = 'var(--soft)'
    iconColor = 'var(--primary)'
    valueColor = 'var(--primary)'
  }

  return (
    <div
      style={{
        background: 'var(--card)',
        border: '1px solid var(--line)',
        borderRadius: 20,
        padding: '20px 22px',
        boxShadow: 'var(--shadow)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: 14,
        transition: 'transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease',
        cursor: 'default',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.borderColor = '#c7c3f7'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.borderColor = 'var(--line)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: 'var(--muted)',
          }}
        >
          {displayLabel}
        </span>

        {icon && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: iconBg,
              color: iconColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </div>
        )}
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 800,
          color: valueColor,
          letterSpacing: '-0.03em',
          lineHeight: 1.15,
        }}
      >
        {displayValue}
      </div>
    </div>
  )
}

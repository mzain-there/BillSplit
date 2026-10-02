import React from 'react'

/**
 * FilterChips - Renders filter buttons (All, Owed to you, You owe, Settled up)
 */
export default function FilterChips({ activeFilter, onSelectFilter }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'owed', label: 'Owed to you' },
    { id: 'owe', label: 'You owe' },
    { id: 'settled', label: 'Settled up' },
  ]

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        overflowX: 'auto',
        WebkitOverflowScrolling: 'touch',
        paddingBottom: 4,
        scrollbarWidth: 'none',
      }}
    >
      {filters.map((f) => {
        const isActive = activeFilter === f.id
        return (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFilter(f.id)}
            style={{
              padding: '8px 16px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 600,
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              background: isActive ? 'var(--primary)' : 'var(--soft)',
              color: isActive ? '#ffffff' : 'var(--primary)',
              boxShadow: isActive ? '0 4px 12px rgba(79, 70, 229, 0.35)' : 'none',
              transition: 'all 0.18s ease',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!isActive) {
                e.currentTarget.style.opacity = '0.85'
              }
            }}
            onMouseLeave={(e) => {
              if (!isActive) {
                e.currentTarget.style.opacity = '1'
              }
            }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
}

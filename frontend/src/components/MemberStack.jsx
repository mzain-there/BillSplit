import React from 'react'

/**
 * MemberStack - Overlapping member avatar stack (up to 4 avatars, 26px circles, 2px card-colored border, "+n" badge if more)
 */
export default function MemberStack({ members = [], max = 4 }) {
  const memberList = Array.isArray(members) ? members : []
  const visibleMembers = memberList.slice(0, max)
  const remaining = memberList.length - max

  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getGradient = (name = '') => {
    const gradients = [
      'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
      'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
      'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
      'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
      'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    ]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    return gradients[Math.abs(hash) % gradients.length]
  }

  if (memberList.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {visibleMembers.map((m, index) => {
          const userObj = m?.user || m
          const avatarUrl = userObj?.avatar
          const username = userObj?.username || userObj?.name || 'Member'

          return (
            <div
              key={m._id || index}
              title={username}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: '2px solid var(--card)',
                marginLeft: index === 0 ? 0 : -8,
                position: 'relative',
                zIndex: visibleMembers.length - index,
                overflow: 'hidden',
                background: getGradient(username),
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 10,
                fontWeight: 700,
                boxSizing: 'border-box',
                flexShrink: 0,
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span>{getInitials(username)}</span>
              )}
            </div>
          )
        })}

        {remaining > 0 && (
          <div
            title={`${remaining} more members`}
            style={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              border: '2px solid var(--card)',
              marginLeft: -8,
              position: 'relative',
              zIndex: 0,
              background: 'var(--soft)',
              color: 'var(--primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 10,
              fontWeight: 700,
              boxSizing: 'border-box',
              flexShrink: 0,
            }}
          >
            +{remaining}
          </div>
        )}
      </div>
    </div>
  )
}

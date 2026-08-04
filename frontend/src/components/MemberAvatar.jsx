import React from 'react'

export default function MemberAvatar({ members = [] }) {
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const getColorFromName = (str) => {
    if (!str) return 'bg-gray-500'
    let hash = 0
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-teal-500',
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  return (
    <div className="flex -space-x-3">
      {members.map((member, i) => {
        const src = member?.avatar || member?.user?.avatar
        const name = member?.username || member?.name || member?.user?.username || member?.user?.name || ''
        
        return (
          <div
            key={i}
            className="w-12 h-12 rounded-full border-4 border-white overflow-hidden ring-1 ring-primary/10 flex items-center justify-center"
            style={{ zIndex: members.length - i }}
          >
            {src ? (
              <img src={src} alt={name || `member-${i}`} className="w-full h-full object-cover" />
            ) : (
              <div className={`w-full h-full ${getColorFromName(name)} text-white flex items-center justify-center font-bold text-sm`}>
                {getInitials(name)}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}


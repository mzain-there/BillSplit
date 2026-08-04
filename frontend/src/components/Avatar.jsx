import React from 'react'

/**
 * Avatar component that shows profile picture or generates initials
 * @param {string} src - Image URL
 * @param {string} name - User's name (used to generate initials)
 * @param {string} size - Size class: 'sm', 'md', 'lg', 'xl'
 * @param {string} className - Additional CSS classes
 */
export default function Avatar({ src, name = '', size = 'md', className = '' }) {
  const getInitials = (name) => {
    if (!name) return '?'
    const parts = name.trim().split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-24 h-24 text-3xl',
    '3xl': 'w-32 h-32 text-4xl',
  }

  const initials = getInitials(name)

  // Generate consistent color based on name
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
      'bg-orange-500',
      'bg-cyan-500',
    ]
    return colors[Math.abs(hash) % colors.length]
  }

  if (src) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden border border-white shadow-sm flex-shrink-0`}>
        <img src={src} alt={name} className="w-full h-full object-cover" />
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} ${className} ${getColorFromName(name)} rounded-full flex items-center justify-center text-white font-bold shadow-sm flex-shrink-0`}>
      {initials}
    </div>
  )
}

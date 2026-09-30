import React from 'react'

export default function Logo({ size = 36, showText = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {/* Gradient rounded-square mark */}
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
        <rect width="40" height="40" rx="10" fill="url(#logoGrad)" />
        {/* "U" shape with split line */}
        <path
          d="M14 12 L14 24 Q14 30 20 30 Q26 30 26 24 L26 12"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
        {/* Split line down the middle */}
        <line x1="20" y1="14" x2="20" y2="28" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeDasharray="2 2" />
      </svg>

      {/* Wordmark */}
      {showText && (
        <span style={{
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          fontWeight: 800,
          fontSize: size * 0.55,
          color: 'var(--ink)',
          letterSpacing: '-0.03em',
        }}>
          Bill<span style={{ color: 'var(--primary)' }}>Split</span>
        </span>
      )}
    </div>
  )
}

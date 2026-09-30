import React from 'react'
import { ArrowRight } from 'lucide-react'

const btnBase = {
  width: '100%',
  padding: '14px 24px',
  borderRadius: 14,
  border: 'none',
  background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
  color: '#ffffff',
  fontSize: 16,
  fontWeight: 700,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  transition: 'all 0.2s ease',
  boxShadow: '0 4px 20px rgba(79,70,229,.30)',
  position: 'relative',
  overflow: 'hidden',
}

const spinnerStyle = {
  width: 20,
  height: 20,
  border: '2.5px solid rgba(255,255,255,0.3)',
  borderTopColor: '#ffffff',
  borderRadius: '50%',
  animation: 'spin 0.6s linear infinite',
}

export default function PrimaryButton({ children, loading, disabled, type = 'submit', onClick, showArrow = true }) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      style={{
        ...btnBase,
        ...(disabled || loading ? { opacity: 0.6, cursor: 'not-allowed', transform: 'none' } : {}),
      }}
      onMouseEnter={e => {
        if (!disabled && !loading) {
          e.currentTarget.style.transform = 'translateY(-2px)'
          e.currentTarget.style.boxShadow = '0 8px 30px rgba(79,70,229,.40)'
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(79,70,229,.30)'
      }}
      onMouseDown={e => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'scale(0.98)'
      }}
      onMouseUp={e => {
        if (!disabled && !loading) e.currentTarget.style.transform = 'translateY(-2px)'
      }}
    >
      {loading ? (
        <div style={spinnerStyle} />
      ) : (
        <>
          <span>{children}</span>
          {showArrow && <ArrowRight size={18} />}
        </>
      )}
    </button>
  )
}

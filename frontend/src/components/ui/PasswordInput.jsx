import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

const inputStyle = {
  width: '100%',
  padding: '12px 44px 12px 16px',
  background: 'var(--input-bg)',
  border: '1.5px solid var(--line)',
  borderRadius: 14,
  fontSize: 15,
  fontWeight: 500,
  color: 'var(--ink)',
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
}

const labelStyle = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: 'var(--ink)',
  marginBottom: 6,
  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
}

const eyeBtnStyle = {
  position: 'absolute',
  right: 12,
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'none',
  border: 'none',
  padding: 4,
  cursor: 'pointer',
  color: 'var(--muted)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 8,
  transition: 'color 0.2s',
}

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  autoComplete = 'current-password',
  name,
  required = true,
  // Allow external show/hide control
  showPassword: externalShow,
  onToggleShow: externalToggle,
  error,
  valid,
}) {
  const [internalShow, setInternalShow] = useState(false)

  const show = externalShow !== undefined ? externalShow : internalShow
  const toggle = externalToggle || (() => setInternalShow(p => !p))

  const borderColor = error ? 'var(--danger)' : valid ? 'var(--success)' : undefined

  return (
    <div>
      {label && <label htmlFor={id} style={labelStyle}>{label}</label>}
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          name={name}
          type={show ? 'text' : 'password'}
          autoComplete={autoComplete}
          value={value}
          onChange={onChange}
          required={required}
          style={{
            ...inputStyle,
            ...(borderColor && { borderColor }),
          }}
          onFocus={e => {
            e.target.style.borderColor = borderColor || 'var(--primary)'
            e.target.style.boxShadow = `0 0 0 3px var(--focus-ring)`
          }}
          onBlur={e => {
            e.target.style.borderColor = borderColor || 'var(--line)'
            e.target.style.boxShadow = 'none'
          }}
        />
        <button
          type="button"
          onClick={toggle}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          style={eyeBtnStyle}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--muted)' }}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  )
}

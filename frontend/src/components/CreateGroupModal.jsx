import React, { useEffect, useRef, useState } from 'react'
import { X, UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react'

export default function CreateGroupModal({
  isOpen,
  onClose,
  onSubmit,
  submitting,
  error,
  triggerRef,
}) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [avatar, setAvatar] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')
  const [dragOver, setDragOver] = useState(false)
  const [localError, setLocalError] = useState('')

  const modalRef = useRef(null)
  const fileInputRef = useRef(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setDescription('')
      setAvatar(null)
      setPreviewUrl('')
      setLocalError('')
    }
  }, [isOpen])

  // Lock body scroll and focus trapping
  useEffect(() => {
    if (!isOpen) return

    const previousActiveElement = document.activeElement
    document.body.style.overflow = 'hidden'

    // Focus the group name input on open
    const timer = setTimeout(() => {
      const nameInput = modalRef.current?.querySelector('input[name="groupName"]')
      if (nameInput) {
        nameInput.focus()
      }
    }, 50)

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (!focusable.length) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
      if (triggerRef?.current) {
        triggerRef.current.focus()
      } else if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
        previousActiveElement.focus()
      }
    }
  }, [isOpen, onClose, triggerRef])

  // Handle file selection
  const handleFileChange = (file) => {
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setLocalError('Please select a valid image file.')
      return
    }
    setLocalError('')
    setAvatar(file)
    const reader = new FileReader()
    reader.onload = () => {
      setPreviewUrl(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0])
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setLocalError('A group name is required.')
      return
    }
    setLocalError('')
    onSubmit({ name: name.trim(), description: description.trim(), avatar })
  }

  if (!isOpen) return null

  const displayError = localError || error

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Dimmed backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
          animation: 'modalFadeIn 250ms ease-out forwards',
        }}
      />

      {/* Modal / Bottom-Sheet Dialog */}
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-group-title"
        className="create-group-modal-dialog"
        style={{
          position: 'relative',
          zIndex: 1001,
          background: 'var(--card)',
          borderRadius: 26,
          boxShadow: 'var(--shadow)',
          border: '1px solid var(--line)',
          width: '100%',
          maxWidth: 460,
          padding: 26,
          boxSizing: 'border-box',
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          animation: 'modalScaleIn 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
          display: 'flex',
          flexDirection: 'column',
          gap: 20,
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2
              id="create-group-title"
              style={{
                margin: 0,
                fontSize: 22,
                fontWeight: 800,
                color: 'var(--ink)',
                letterSpacing: '-0.02em',
              }}
            >
              Create group
            </h2>
            <p
              style={{
                margin: '4px 0 0',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--muted)',
                lineHeight: 1.4,
              }}
            >
              Start a shared space for trips, house expenses or projects.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: 'none',
              background: 'var(--soft)',
              color: 'var(--muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.18s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = 'var(--ink)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'var(--muted)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Error notification if any */}
        {displayError && (
          <div
            style={{
              padding: '10px 14px',
              borderRadius: 12,
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              color: 'var(--danger)',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            {displayError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Field: Group Name */}
          <div>
            <label
              htmlFor="group-name-input"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Group name <span style={{ color: 'var(--danger)' }}>*</span>
            </label>
            <input
              id="group-name-input"
              name="groupName"
              type="text"
              required
              placeholder="Summer trip"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (localError) setLocalError('')
              }}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--input-bg)',
                color: 'var(--ink)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          {/* Field: Description */}
          <div>
            <label
              htmlFor="group-desc-input"
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Description
            </label>
            <textarea
              id="group-desc-input"
              name="groupDescription"
              rows={3}
              placeholder="Add a short description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--input-bg)',
                color: 'var(--ink)',
                fontSize: 14,
                fontFamily: 'inherit',
                outline: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease',
              }}
              onFocus={(e) => (e.target.style.borderColor = 'var(--primary)')}
              onBlur={(e) => (e.target.style.borderColor = 'var(--line)')}
            />
          </div>

          {/* Field: Group image */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 13,
                fontWeight: 700,
                color: 'var(--ink)',
                marginBottom: 6,
              }}
            >
              Group image
            </label>

            {previewUrl ? (
              /* Selected Image Preview */
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: '1px solid var(--line)',
                  background: 'var(--soft)',
                }}
              >
                <img
                  src={previewUrl}
                  alt="Preview"
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    objectFit: 'cover',
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--ink)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {avatar?.name || 'Selected image'}
                  </p>
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: 'var(--muted)' }}>
                    Image ready for upload
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAvatar(null)
                    setPreviewUrl('')
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 8,
                    border: 'none',
                    background: 'var(--card)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Remove
                </button>
              </div>
            ) : (
              /* Drag & Drop Area */
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setDragOver(true)
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? 'var(--primary)' : 'var(--line)'}`,
                  background: dragOver ? 'var(--soft)' : 'var(--input-bg)',
                  borderRadius: 16,
                  padding: '20px 14px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 10,
                    background: 'var(--soft)',
                    color: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <UploadCloud size={20} />
                </div>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>
                  Drop an image or <span style={{ color: 'var(--primary)' }}>browse</span>
                </p>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--muted)' }}>
                  PNG, JPG, WEBP up to 5MB
                </p>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0])
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 14,
                border: '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--ink)',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              style={{
                flex: 2,
                padding: '12px 20px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                opacity: submitting ? 0.75 : 1,
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={(e) => {
                if (!submitting) e.currentTarget.style.transform = 'translateY(-1px)'
              }}
              onMouseLeave={(e) => {
                if (!submitting) e.currentTarget.style.transform = 'translateY(0)'
              }}
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              <span>{submitting ? 'Creating...' : 'Create group'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Modal Keyframes */}
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalScaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @media (max-width: 640px) {
          .create-group-modal-dialog {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            max-width: 100% !important;
            max-height: 90vh !important;
            overflow-y: auto !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 26px !important;
            border-top-right-radius: 26px !important;
            padding: 24px 20px !important;
            animation: bottomSheetSlideUp 250ms cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
          }
        }

        @keyframes bottomSheetSlideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .create-group-modal-dialog,
          div[role="dialog"] {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </div>
  )
}

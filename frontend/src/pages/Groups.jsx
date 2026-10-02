import React, { useEffect, useState, useMemo, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Plus, Search, Users, RotateCcw } from 'lucide-react'
import Navbar from '../components/Navbar'
import GroupCard from '../components/GroupCard'
import SummaryCard from '../components/SummaryCard'
import FilterChips from '../components/FilterChips'
import CreateGroupModal from '../components/CreateGroupModal'
import axiosInstance from '../api/axios'

export default function Groups() {
  const navigate = useNavigate()
  const location = useLocation()

  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [createError, setCreateError] = useState('')

  // Filters & Search
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Responsive state for mobile layout
  const [isMobile, setIsMobile] = useState(false)
  const newGroupBtnRef = useRef(null)

  useEffect(() => {
    const media = window.matchMedia('(max-width: 768px)')
    const updateMatch = () => setIsMobile(media.matches)
    updateMatch()
    media.addEventListener('change', updateMatch)
    return () => media.removeEventListener('change', updateMatch)
  }, [])

  // Auto-open modal if navigated to /groups/create
  useEffect(() => {
    if (location.pathname === '/groups/create') {
      setModalOpen(true)
    }
  }, [location.pathname])

  // Fetch groups
  const fetchGroups = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await axiosInstance.get('/groups')
      setGroups(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch groups:', err)
      setError('Unable to load your groups right now. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGroups()
  }, [])

  // Currency formatter: "Rs. 10,000"
  const formatCurrency = (val) => {
    const num = Number(val) || 0
    const hasDecimals = num % 1 !== 0
    return `Rs. ${num.toLocaleString('en-IN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })}`
  }

  // Compute summary numbers on frontend
  const { totalOwed, totalOwe } = useMemo(() => {
    let owed = 0
    let owe = 0

    groups.forEach((g) => {
      // Check if group has precalculated balance fields from backend or members
      if (g.userOwed) owed += Number(g.userOwed) || 0
      if (g.userOwe) owe += Number(g.userOwe) || 0
      if (g.balance) {
        const b = Number(g.balance) || 0
        if (b > 0) owed += b
        if (b < 0) owe += Math.abs(b)
      }
    })

    return { totalOwed: owed, totalOwe: owe }
  }, [groups])

  // Determine variant for each group
  const getGroupVariant = (group) => {
    if (group.userOwed > 0 || (group.balance && group.balance > 0)) {
      return { variant: 'owed', amount: formatCurrency(group.userOwed || group.balance) }
    }
    if (group.userOwe > 0 || (group.balance && group.balance < 0)) {
      return { variant: 'owe', amount: formatCurrency(group.userOwe || Math.abs(group.balance)) }
    }
    return { variant: 'settled', amount: formatCurrency(0) }
  }

  // Filter & search logic (client-side)
  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      // Search by group name (case-insensitive)
      const matchesSearch = group.name
        ? group.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
        : true

      if (!matchesSearch) return false

      // Filter chip matching
      const { variant } = getGroupVariant(group)
      if (activeFilter === 'owed') return variant === 'owed'
      if (activeFilter === 'owe') return variant === 'owe'
      if (activeFilter === 'settled') return variant === 'settled'
      return true
    })
  }, [groups, searchQuery, activeFilter])

  // Handle group creation from modal (keeps existing API logic, form fields & validation)
  const handleCreateGroup = async ({ name, description, avatar }) => {
    setCreateError('')

    if (!name.trim()) {
      setCreateError('A group name is required.')
      return
    }

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('description', description ? description.trim() : '')
      if (avatar) formData.append('avatar', avatar)

      const res = await axiosInstance.post('/groups', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      setModalOpen(false)
      fetchGroups()
      navigate(`/groups/${res.data.data._id}`)
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Unable to create group. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        color: 'var(--ink)',
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        transition: 'background 0.3s ease, color 0.3s ease',
      }}
    >
      <Navbar />

      {/* Main Container: max-width 1120px, centered, responsive padding */}
      <main
        style={{
          maxWidth: 1120,
          margin: '0 auto',
          padding: isMobile ? '20px 16px 80px' : '28px 24px 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── HEADER ── */}
        <header style={{ marginBottom: 32 }}>
          {/* Eyebrow: "GROUPS", 12px, uppercase, letter-spacing .14em, color var(--primary) */}
          <div
            style={{
              fontSize: 12,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              color: 'var(--primary)',
              marginBottom: 8,
            }}
          >
            GROUPS
          </div>

          {/* Heading + New Group button */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              marginBottom: 8,
            }}
          >
            {/* Heading with "expenses" in accent gradient text */}
            <h1
              style={{
                margin: 0,
                fontSize: 'clamp(28px, 4.2vw, 46px)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                lineHeight: 1.08,
                color: 'var(--ink)',
                maxWidth: 680,
                wordBreak: 'break-word',
              }}
            >
              Manage your shared{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                expenses
              </span>
            </h1>

            {/* "＋ New group" Button on right / full-width on mobile */}
            <button
              ref={newGroupBtnRef}
              type="button"
              onClick={() => {
                setCreateError('')
                setModalOpen(true)
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '12px 20px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                transition: 'all 0.18s ease',
                flexShrink: 0,
                width: isMobile ? '100%' : 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)'
                e.currentTarget.style.boxShadow = '0 6px 18px rgba(79, 70, 229, 0.45)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}
            >
              <Plus size={18} strokeWidth={2.5} />
              <span>New group</span>
            </button>
          </div>

          {/* Subline muted: "Create, view and manage all your groups." */}
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--muted)',
            }}
          >
            Create, view and manage all your groups.
          </p>
        </header>

        {/* ── ERROR BANNER (if any fetch error occurs) ── */}
        {error && (
          <div
            style={{
              marginBottom: 24,
              padding: '16px 20px',
              borderRadius: 16,
              background: 'var(--error-bg)',
              border: '1px solid var(--error-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 600 }}>{error}</span>
            <button
              onClick={fetchGroups}
              style={{
                padding: '6px 14px',
                borderRadius: 10,
                border: '1px solid var(--error-border)',
                background: 'var(--card)',
                color: 'var(--danger)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <RotateCcw size={13} />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* ── SUMMARY ROW (3 equal cards, auto-fit minmax(200px, 1fr), gap 16px) ── */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {/* 1. Total groups */}
          <SummaryCard
            label="Total groups"
            value={loading ? '...' : groups.length}
            icon={<Users size={18} />}
            variant="primary"
          />

          {/* 2. You're owed */}
          <SummaryCard
            label="You're owed"
            value={loading ? '...' : formatCurrency(totalOwed)}
            variant="owed"
          />

          {/* 3. You owe */}
          <SummaryCard
            label="You owe"
            value={loading ? '...' : formatCurrency(totalOwe)}
            variant="owe"
          />
        </section>

        {/* ── FILTERS AND SEARCH ROW ── */}
        <section
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: 14,
            marginBottom: 24,
          }}
        >
          {/* Chips: All | Owed to you | You owe | Settled up */}
          <FilterChips
            activeFilter={activeFilter}
            onSelectFilter={(filterId) => setActiveFilter(filterId)}
          />

          {/* Search groups input */}
          <div
            style={{
              position: 'relative',
              width: isMobile ? '100%' : 260,
              maxWidth: '100%',
              flexShrink: 0,
            }}
          >
            <Search
              size={16}
              style={{
                position: 'absolute',
                left: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--muted)',
                pointerEvents: 'none',
              }}
            />
            <input
              type="text"
              placeholder="Search groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 38px',
                borderRadius: 999,
                border: '1px solid var(--line)',
                background: 'var(--card)',
                color: 'var(--ink)',
                fontSize: 13,
                fontFamily: 'inherit',
                outline: 'none',
                boxSizing: 'border-box',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = 'var(--primary)'
                e.target.style.boxShadow = '0 0 0 3px rgba(79, 70, 229, 0.12)'
              }}
              onBlur={(e) => {
                e.target.style.borderColor = 'var(--line)'
                e.target.style.boxShadow = 'none'
              }}
            />
          </div>
        </section>

        {/* ── GROUPS RESPONSIVE GRID ── */}
        {loading ? (
          /* Loading State: 6 shimmer skeleton cards */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 16,
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="group-skeleton-card"
                style={{
                  height: 200,
                  borderRadius: 22,
                  background: 'var(--card)',
                  border: '1px solid var(--line)',
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxSizing: 'border-box',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div className="groups-shimmer" style={{ width: 48, height: 48, borderRadius: 15 }} />
                  <div style={{ flex: 1 }}>
                    <div className="groups-shimmer" style={{ width: '60%', height: 16, borderRadius: 8, marginBottom: 8 }} />
                    <div className="groups-shimmer" style={{ width: '40%', height: 12, borderRadius: 6 }} />
                  </div>
                </div>
                <div className="groups-shimmer" style={{ width: '100%', height: 38, borderRadius: 14 }} />
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div className="groups-shimmer" style={{ width: '30%', height: 12, borderRadius: 6 }} />
                  <div className="groups-shimmer" style={{ width: '20%', height: 12, borderRadius: 6 }} />
                </div>
              </div>
            ))}
          </div>
        ) : groups.length === 0 ? (
          /* Empty State: No groups at all */
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: 26,
              border: '1px solid var(--line)',
              boxShadow: 'var(--shadow)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              maxWidth: 480,
              margin: '20px auto',
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: 20,
                background: 'var(--soft)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Users size={32} />
            </div>

            <div>
              <h3 style={{ margin: '0 0 6px 0', fontSize: 20, fontWeight: 800, color: 'var(--ink)' }}>
                No groups yet
              </h3>
              <p style={{ margin: 0, fontSize: 14, color: 'var(--muted)', lineHeight: 1.5 }}>
                Start a shared space for trips, house expenses or projects.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setCreateError('')
                setModalOpen(true)
              }}
              style={{
                marginTop: 6,
                padding: '12px 24px',
                borderRadius: 14,
                border: 'none',
                background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)',
                color: '#ffffff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Plus size={16} />
              <span>Create your first group</span>
            </button>
          </div>
        ) : filteredGroups.length === 0 ? (
          /* Empty State: Filters/Search returned no matches */
          <div
            style={{
              padding: '48px 20px',
              textAlign: 'center',
              background: 'var(--card)',
              borderRadius: 22,
              border: '1px dashed var(--line)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 12,
              margin: '10px 0',
            }}
          >
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 16,
                background: 'var(--soft)',
                color: 'var(--muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Search size={22} />
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0', fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>
                No groups match your filters
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
                Try adjusting your search query or active filter chip.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setActiveFilter('all')
                setSearchQuery('')
              }}
              style={{
                marginTop: 4,
                padding: '8px 16px',
                borderRadius: 12,
                border: '1px solid var(--line)',
                background: 'var(--soft)',
                color: 'var(--primary)',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          /* Regular Grid: group cards + dashed "+ Create new group" card */
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 16,
            }}
          >
            {filteredGroups.map((group, index) => {
              const { variant, amount } = getGroupVariant(group)

              return (
                <div
                  key={group._id}
                  style={{
                    animation: 'groupCardSlideUp 0.35s ease-out both',
                    animationDelay: `${Math.min(index * 40, 400)}ms`,
                  }}
                >
                  <GroupCard
                    image={group.avatar}
                    title={group.name}
                    description={group.description}
                    members={group.members}
                    membersText={`${group.members?.length || 0} members`}
                    amount={amount}
                    variant={variant}
                    lastActivity={group.lastActivity || null}
                    onClick={() => navigate(`/groups/${group._id}`)}
                  />
                </div>
              )
            })}

            {/* Last tile in the grid: Dashed-border "＋ Create new group" card */}
            <div
              onClick={() => {
                setCreateError('')
                setModalOpen(true)
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  setModalOpen(true)
                }
              }}
              className="create-group-dashed-tile"
              style={{
                borderRadius: 22,
                border: '2px dashed var(--line)',
                background: 'color-mix(in srgb, var(--card) 60%, transparent)',
                minHeight: 190,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
                cursor: 'pointer',
                padding: 20,
                boxSizing: 'border-box',
                transition: 'all 0.2s ease',
                color: 'var(--muted)',
                animation: 'groupCardSlideUp 0.35s ease-out both',
                animationDelay: `${Math.min(filteredGroups.length * 40, 440)}ms`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)'
                e.currentTarget.style.borderColor = 'var(--primary)'
                e.currentTarget.style.color = 'var(--primary)'
                e.currentTarget.style.background = 'var(--soft)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.borderColor = 'var(--line)'
                e.currentTarget.style.color = 'var(--muted)'
                e.currentTarget.style.background = 'color-mix(in srgb, var(--card) 60%, transparent)'
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'var(--soft)',
                  color: 'inherit',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'transform 0.18s ease',
                }}
              >
                <Plus size={22} strokeWidth={2.5} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700 }}>
                Create new group
              </span>
            </div>
          </div>
        )}
      </main>

      {/* ── CREATE GROUP MODAL ── */}
      <CreateGroupModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleCreateGroup}
        submitting={submitting}
        error={createError}
        triggerRef={newGroupBtnRef}
      />

      {/* Global Styles for Animations and Skeletons */}
      <style>{`
        @keyframes groupCardSlideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .groups-shimmer {
          background: var(--soft);
          opacity: 0.6;
          animation: groupsShimmerPulse 1.2s infinite ease-in-out;
        }

        @keyframes groupsShimmerPulse {
          0%, 100% { opacity: 0.45; }
          50%      { opacity: 0.85; }
        }

        @media (prefers-reduced-motion: reduce) {
          .group-card-item,
          .create-group-dashed-tile,
          .groups-shimmer,
          div {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}

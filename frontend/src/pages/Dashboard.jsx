import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Plus,
  Users,
  Receipt,
  CreditCard,
  Bell,
  ArrowRight,
  Clock,
  RotateCcw,
  Check
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axios'

// Group Avatar helper with fallback to initials gradient (never broken image)
function GroupAvatar({ image, name }) {
  const [imgError, setImgError] = useState(false)
  const initial = name ? name.charAt(0).toUpperCase() : 'G'

  if (image && !imgError && image !== 'https://via.placeholder.com/150') {
    return (
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          overflow: 'hidden',
          flexShrink: 0,
        }}
      >
        <img
          src={image}
          alt={name}
          onError={() => setImgError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
      </div>
    )
  }

  return (
    <div
      style={{
        width: 44,
        height: 44,
        borderRadius: 12,
        background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-2) 100%)',
        color: '#ffffff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: 16,
        flexShrink: 0,
      }}
    >
      {initial}
    </div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [allExpensesList, setAllExpensesList] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [groupBalances, setGroupBalances] = useState({})
  const [totalExpenses, setTotalExpenses] = useState(0)
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalOwe, setTotalOwe] = useState(0)
  const [receivedSettled, setReceivedSettled] = useState(0)
  const [paidSettled, setPaidSettled] = useState(0)
  const [settlementsCount, setSettlementsCount] = useState(0)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch dashboard data
  const fetchData = async () => {
    try {
      setLoading(true)
      setError(null)

      const groupsRes = await axiosInstance.get('/groups')
      const groupsList = groupsRes.data.data || []
      setGroups(groupsList)

      let owed = 0
      let owe = 0
      let settledReceived = 0
      let settledPaid = 0
      let totalSettlements = 0
      const allExpenses = []
      const balancesMap = {}

      for (const group of groupsList) {
        try {
          // Fetch group expenses
          const expensesRes = await axiosInstance.get(`/expenses/${group._id}`)
          const grpExpenses = expensesRes.data.data || []
          allExpenses.push(...grpExpenses)

          // Fetch remaining balances & settlements
          const balanceRes = await axiosInstance.get(`/settlements/${group._id}/remaining`)
          const { simplified = [], settlements = [] } = balanceRes.data.data || {}

          totalSettlements += settlements.length

          settlements.forEach(s => {
            const fromId = typeof s.paidBy === 'object' ? s.paidBy._id : s.paidBy
            const toId = typeof s.paidTo === 'object' ? s.paidTo._id : s.paidTo
            if (toId === user?._id) {
              settledReceived += Number(s.amount) || 0
            }
            if (fromId === user?._id) {
              settledPaid += Number(s.amount) || 0
            }
          })

          let grpOwed = 0
          let grpOwe = 0

          simplified.forEach(item => {
            if (item.from === user?._id) {
              owe += Number(item.amount) || 0
              grpOwe += Number(item.amount) || 0
            }
            if (item.to === user?._id) {
              owed += Number(item.amount) || 0
              grpOwed += Number(item.amount) || 0
            }
          })

          balancesMap[group._id] = { owed: grpOwed, owe: grpOwe }
        } catch (err) {
          console.error('Error fetching group sub-data:', err)
        }
      }

      // Fetch unread count
      try {
        const notifRes = await axiosInstance.get('/notifications/unread-count')
        setUnreadCount(notifRes.data.data?.count || 0)
      } catch (err) {
        console.error('Error fetching unread count:', err)
      }

      // Sort recent activity (latest 5)
      const sorted = allExpenses
        .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
        .slice(0, 5)

      setAllExpensesList(allExpenses)
      setRecentExpenses(sorted)
      setTotalExpenses(allExpenses.length)
      setTotalOwed(owed)
      setTotalOwe(owe)
      setSettlementsCount(totalSettlements)
      setReceivedSettled(settledReceived)
      setPaidSettled(settledPaid)
      setGroupBalances(balancesMap)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError('Unable to load dashboard data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user])

  // Formatting helpers
  const formatCurrency = (val) => {
    const num = Number(val) || 0
    const hasDecimals = num % 1 !== 0
    return `Rs. ${num.toLocaleString('en-IN', {
      minimumFractionDigits: hasDecimals ? 2 : 0,
      maximumFractionDigits: hasDecimals ? 2 : 0,
    })}`
  }

  const timeAgo = (rawDate) => {
    if (!rawDate) return ''
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return ''
    const seconds = Math.floor((new Date() - d) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Eyebrow date: "Tuesday · 30 Sep"
  const getEyebrowDate = () => {
    const now = new Date()
    const weekday = now.toLocaleDateString('en-US', { weekday: 'long' })
    const day = now.toLocaleDateString('en-US', { day: 'numeric' })
    const month = now.toLocaleDateString('en-US', { month: 'short' })
    return `${weekday} · ${day} ${month}`.toUpperCase()
  }

  const firstName = user?.username ? user.username.split(' ')[0] : 'there'
  const netBalance = totalOwed - totalOwe

  // Receivable progress calculation
  const totalReceivable = receivedSettled + totalOwed
  const collectedPercent = totalReceivable > 0 ? Math.min(100, Math.round((receivedSettled / totalReceivable) * 100)) : 0

  // Payable progress calculation
  const totalPayable = paidSettled + totalOwe
  const paidPercent = totalPayable > 0 ? Math.min(100, Math.round((paidSettled / totalPayable) * 100)) : 0

  // 7-day spending computation
  const getSpendingChart = () => {
    const days = []
    const today = new Date()
    today.setHours(23, 59, 59, 999)

    for (let i = 6; i >= 0; i--) {
      const d = new Date()
      d.setDate(today.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' })
      const dayInitial = dayLabel.charAt(0)

      const amount = allExpensesList.reduce((sum, exp) => {
        const expDate = new Date(exp.date || exp.createdAt).toISOString().split('T')[0]
        if (expDate === dateStr) {
          return sum + (Number(exp.amount) || 0)
        }
        return sum
      }, 0)

      days.push({ dayLabel, dayInitial, amount })
    }

    const maxAmount = Math.max(...days.map(d => d.amount), 0)
    let peakDay = null
    if (maxAmount > 0) {
      peakDay = days.reduce((prev, cur) => (cur.amount > prev.amount ? cur : prev), days[0])
    }

    return { days, maxAmount, peakDay }
  }

  const { days: spendingDays, maxAmount: peakAmount, peakDay } = getSpendingChart()

  // Group status helper
  const getGroupStatus = (groupId) => {
    const bal = groupBalances[groupId]
    if (!bal) return { text: 'Settled up', type: 'settled' }
    if (bal.owed > bal.owe) {
      return { text: `You're owed ${formatCurrency(bal.owed - bal.owe)}`, type: 'owed' }
    }
    if (bal.owe > bal.owed) {
      return { text: `You owe ${formatCurrency(bal.owe - bal.owed)}`, type: 'owe' }
    }
    return { text: 'Settled up', type: 'settled' }
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

      <main
        style={{
          width: '100%',
          maxWidth: 'min(1420px, calc(100% - 32px))',
          margin: '0 auto',
          padding: '28px 16px 80px',
          boxSizing: 'border-box',
        }}
      >
        {/* ── Header: Eyebrow date, Big Greeting, Muted Subline ── */}
        <header style={{ marginBottom: 28 }}>
          {/* Eyebrow date: plain text, NOT a badge/pill */}
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
            {getEyebrowDate()}
          </div>

          {/* Big Greeting */}
          <h1
            style={{
              margin: '0 0 8px 0',
              fontSize: 'clamp(28px, 4.2vw, 46px)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.08,
              color: 'var(--ink)',
            }}
          >
            {getGreeting()},{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {firstName}
            </span>{' '}
            👋
          </h1>

          {/* Muted Subline */}
          <p
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--muted)',
            }}
          >
            You're in {groups.length} {groups.length === 1 ? 'group' : 'groups'}. Here's your money at a glance.
          </p>
        </header>

        {/* ── Error Banner if any ── */}
        {error && (
          <div
            style={{
              marginBottom: 20,
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
              onClick={fetchData}
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

        {/* ── 12-Column Bento Grid ── */}
        <div className="bento-grid">
          {/* ══════════════════════════════════════════════════════════
              ROW 1: NET BALANCE HERO (8 cols) + 7-DAY SPENDING (4 cols)
             ══════════════════════════════════════════════════════════ */}

          {/* 1. Net Balance Hero */}
          <div className="bento-col-8">
            <div
              className="bento-card hero-gradient-card"
              style={{
                background: 'linear-gradient(135deg, #4338ca 0%, #7c3aed 60%, #a855f7 100%)',
                color: '#ffffff',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 220,
              }}
            >
              {/* Decorative translucent circle in top-right */}
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 220,
                  height: 220,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.12)',
                  pointerEvents: 'none',
                }}
              />

              {/* Top: Label and Amount */}
              <div style={{ position: 'relative', zIndex: 1 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    opacity: 0.9,
                  }}
                >
                  Net balance
                </span>
                <div
                  style={{
                    fontSize: 'clamp(30px, 4vw, 42px)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    marginTop: 6,
                  }}
                >
                  {loading ? (
                    <span className="shimmer-block" style={{ width: 180, height: 42, background: 'rgba(255,255,255,0.2)' }} />
                  ) : (
                    `${netBalance >= 0 ? '+' : '-'}${formatCurrency(Math.abs(netBalance))}`
                  )}
                </div>

                {/* Two glass pills */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 14 }}>
                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      borderRadius: 999,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>↙</span>
                    <span>Receivable · {formatCurrency(totalOwed)}</span>
                  </div>

                  <div
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      borderRadius: 999,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <span>↗</span>
                    <span>Payable · {formatCurrency(totalOwe)}</span>
                  </div>
                </div>
              </div>

              {/* Bottom: 3 Quick Actions */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  marginTop: 22,
                }}
              >
                <button
                  onClick={() => navigate('/expenses')}
                  style={{
                    background: '#ffffff',
                    color: '#4338ca',
                    border: 'none',
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    transition: 'transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
                  onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
                >
                  <Plus size={16} />
                  <span>Add expense</span>
                </button>

                <button
                  onClick={() => navigate('/groups')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  Settle up
                </button>

                <button
                  onClick={() => navigate('/groups/create')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.18)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: 12,
                    padding: '10px 18px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'background 0.15s ease, transform 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'
                    e.currentTarget.style.transform = 'translateY(-2px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.18)'
                    e.currentTarget.style.transform = 'translateY(0)'
                  }}
                >
                  New group
                </button>
              </div>
            </div>
          </div>

          {/* 2. Spending, Last 7 Days (4 cols) */}
          <div className="bento-col-4">
            <div
              className="bento-card"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: 220,
              }}
            >
              <div>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                  Spending · Last 7 days
                </span>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--ink)', marginTop: 4 }}>
                  {formatCurrency(spendingDays.reduce((acc, d) => acc + d.amount, 0))}
                </div>
              </div>

              {/* Chart container */}
              {peakAmount === 0 ? (
                <div
                  style={{
                    padding: '24px 0',
                    textAlign: 'center',
                    color: 'var(--muted)',
                    fontSize: 13,
                  }}
                >
                  No spending in the last 7 days
                </div>
              ) : (
                <div style={{ margin: '14px 0 8px' }}>
                  <div
                    style={{
                      height: 84,
                      display: 'flex',
                      alignItems: 'flex-end',
                      justifyContent: 'space-between',
                      gap: 8,
                      padding: '0 4px',
                    }}
                  >
                    {spendingDays.map((d, idx) => {
                      const barHeight = peakAmount > 0 ? Math.max(8, (d.amount / peakAmount) * 80) : 8
                      const isPeak = peakDay && peakDay.dayLabel === d.dayLabel && d.amount > 0

                      return (
                        <div
                          key={idx}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 6,
                            height: '100%',
                            justifyContent: 'flex-end',
                          }}
                        >
                          <div
                            title={`${d.dayLabel}: ${formatCurrency(d.amount)}`}
                            style={{
                              width: '100%',
                              maxWidth: 24,
                              height: `${barHeight}px`,
                              borderRadius: 6,
                              background: isPeak
                                ? 'linear-gradient(180deg, #7c3aed 0%, #4338ca 100%)'
                                : 'var(--soft)',
                              transition: 'height 500ms ease-out',
                            }}
                          />
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: isPeak ? 700 : 500,
                              color: isPeak ? 'var(--primary)' : 'var(--muted)',
                            }}
                          >
                            {d.dayInitial}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Caption */}
              <div
                style={{
                  fontSize: 12,
                  color: 'var(--muted)',
                  fontWeight: 600,
                  borderTop: '1px solid var(--line)',
                  paddingTop: 10,
                }}
              >
                {peakDay && peakDay.amount > 0 ? (
                  <span>
                    Peak: <strong style={{ color: 'var(--ink)' }}>{peakDay.dayLabel}</strong> · {formatCurrency(peakDay.amount)}
                  </span>
                ) : (
                  <span>No recorded expenses this week</span>
                )}
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              ROW 2: RECEIVABLE + PROGRESS (6 cols) & PAYABLE + PROGRESS (6 cols)
             ══════════════════════════════════════════════════════════ */}

          {/* 3. Receivable Card */}
          <div className="bento-col-6">
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(5, 150, 105, 0.12)',
                      color: 'var(--success)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowDownLeft size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                      Receivable · You are owed
                    </span>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: 'var(--success)',
                        lineHeight: 1.15,
                        marginTop: 2,
                      }}
                    >
                      {formatCurrency(totalOwed)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(5, 150, 105, 0.12)',
                    color: 'var(--success)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {collectedPercent}% collected
                </div>
              </div>

              {/* 10px Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--soft)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${collectedPercent}%`,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #059669 0%, #34d399 100%)',
                    transition: 'width 600ms ease-out',
                  }}
                />
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--muted)',
                  fontWeight: 500,
                }}
              >
                <span>Received {formatCurrency(receivedSettled)}</span>
                <span>Pending {formatCurrency(totalOwed)}</span>
              </div>
            </div>
          </div>

          {/* 4. Payable Card */}
          <div className="bento-col-6">
            <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 12,
                      background: 'rgba(225, 29, 72, 0.12)',
                      color: 'var(--danger)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ArrowUpRight size={20} />
                  </div>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted)' }}>
                      Payable · You owe
                    </span>
                    <div
                      style={{
                        fontSize: 26,
                        fontWeight: 800,
                        color: 'var(--danger)',
                        lineHeight: 1.15,
                        marginTop: 2,
                      }}
                    >
                      {formatCurrency(totalOwe)}
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(225, 29, 72, 0.12)',
                    color: 'var(--danger)',
                    fontSize: 12,
                    fontWeight: 700,
                  }}
                >
                  {paidPercent}% paid
                </div>
              </div>

              {/* 10px Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: 10,
                  borderRadius: 999,
                  background: 'var(--soft)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${paidPercent}%`,
                    borderRadius: 999,
                    background: 'linear-gradient(90deg, #e11d48 0%, #fb7185 100%)',
                    transition: 'width 600ms ease-out',
                  }}
                />
              </div>

              {/* Footer */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 13,
                  color: 'var(--muted)',
                  fontWeight: 500,
                }}
              >
                <span>Paid {formatCurrency(paidSettled)}</span>
                <span>Remaining {formatCurrency(totalOwe)}</span>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              ROW 3: FOUR STAT CARDS (3 cols each on desktop, 2 per row on mobile)
             ══════════════════════════════════════════════════════════ */}

          {/* Groups Stat */}
          <div className="bento-col-3">
            <div className="bento-card stat-card">
              <div className="stat-icon-tile">
                <Users size={18} />
              </div>
              <div>
                <span className="stat-label">Groups</span>
                <div className="stat-number">{groups.length}</div>
              </div>
            </div>
          </div>

          {/* Expenses Stat */}
          <div className="bento-col-3">
            <div className="bento-card stat-card">
              <div className="stat-icon-tile">
                <Receipt size={18} />
              </div>
              <div>
                <span className="stat-label">Expenses</span>
                <div className="stat-number">{totalExpenses}</div>
              </div>
            </div>
          </div>

          {/* Settlements Stat */}
          <div className="bento-col-3">
            <div className="bento-card stat-card">
              <div className="stat-icon-tile">
                <CreditCard size={18} />
              </div>
              <div>
                <span className="stat-label">Settlements</span>
                <div className="stat-number">{settlementsCount}</div>
              </div>
            </div>
          </div>

          {/* Unread Notifications Stat */}
          <div className="bento-col-3">
            <div className="bento-card stat-card">
              <div className="stat-icon-tile">
                <Bell size={18} />
              </div>
              <div>
                <span className="stat-label">Unread</span>
                <div className="stat-number">{unreadCount}</div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════
              ROW 4: MY GROUPS (8 cols) & RECENT ACTIVITY (4 cols)
             ══════════════════════════════════════════════════════════ */}

          {/* 6. My Groups (8 cols) */}
          <div className="bento-col-8">
            <div className="bento-card" style={{ padding: '20px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
                    My Groups
                  </h2>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '2px 8px',
                      borderRadius: 12,
                      background: 'var(--soft)',
                      color: 'var(--primary)',
                    }}
                  >
                    {groups.length}
                  </span>
                </div>

                <button
                  onClick={() => navigate('/groups')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    padding: 0,
                  }}
                >
                  <span>View all</span>
                  <ArrowRight size={14} />
                </button>
              </div>

              {/* Grid of group cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 14,
                }}
              >
                {loading ? (
                  [1, 2].map((i) => (
                    <div
                      key={i}
                      className="shimmer-block"
                      style={{ height: 110, borderRadius: 16 }}
                    />
                  ))
                ) : (
                  <>
                    {groups.slice(0, 4).map((group) => {
                      const status = getGroupStatus(group._id)
                      const isOwe = status.type === 'owe'
                      const isSettled = status.type === 'settled'

                      return (
                        <div
                          key={group._id}
                          onClick={() => navigate(`/groups/${group._id}`)}
                          className="interactive-tile"
                          style={{
                            background: 'var(--bg)',
                            border: '1px solid var(--line)',
                            borderRadius: 16,
                            padding: '16px',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            gap: 12,
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <GroupAvatar image={group.avatar} name={group.name} />
                            <div style={{ minWidth: 0, flex: 1 }}>
                              <h4
                                style={{
                                  margin: 0,
                                  fontSize: 14,
                                  fontWeight: 700,
                                  color: 'var(--ink)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {group.name}
                              </h4>
                              <p
                                style={{
                                  margin: '3px 0 0',
                                  fontSize: 12,
                                  color: 'var(--muted)',
                                }}
                              >
                                {group.members?.length || 0} members
                              </p>
                            </div>
                          </div>

                          {/* Status Pill */}
                          <div
                            style={{
                              alignSelf: 'flex-start',
                              fontSize: 11,
                              fontWeight: 700,
                              padding: '4px 10px',
                              borderRadius: 999,
                              background: isOwe
                                ? 'rgba(225, 29, 72, 0.12)'
                                : 'rgba(5, 150, 105, 0.12)',
                              color: isOwe ? 'var(--danger)' : 'var(--success)',
                            }}
                          >
                            {status.text}
                          </div>
                        </div>
                      )
                    })}

                    {/* Dashed "+ Create group" tile */}
                    <div
                      onClick={() => navigate('/groups/create')}
                      className="interactive-tile"
                      style={{
                        border: '1.5px dashed var(--line)',
                        background: 'transparent',
                        borderRadius: 16,
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        color: 'var(--muted)',
                        minHeight: 110,
                      }}
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          background: 'var(--soft)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--primary)',
                        }}
                      >
                        <Plus size={18} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>+ Create group</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* 7. Recent Activity (4 cols, NOT full width) */}
          <div className="bento-col-4">
            <div
              className="bento-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: 'var(--ink)' }}>
                    Recent Activity
                  </h2>
                  {recentExpenses.length > 0 && (
                    <button
                      onClick={() => navigate('/expenses')}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      All
                    </button>
                  )}
                </div>

                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="shimmer-block" style={{ height: 48, borderRadius: 12 }} />
                    ))}
                  </div>
                ) : recentExpenses.length === 0 ? (
                  <div
                    style={{
                      padding: '30px 10px',
                      textAlign: 'center',
                      color: 'var(--muted)',
                      fontSize: 13,
                    }}
                  >
                    No recent activity yet.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {recentExpenses.map((expense) => {
                      const isUserPayer = expense.paidBy?._id === user?._id
                      const payer = isUserPayer ? 'You' : expense.paidBy?.username || 'Someone'

                      return (
                        <div
                          key={expense._id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 10,
                            padding: '10px 12px',
                            borderRadius: 12,
                            background: 'var(--bg)',
                            border: '1px solid var(--line)',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                            <div
                              style={{
                                width: 34,
                                height: 34,
                                borderRadius: 10,
                                background: 'var(--soft)',
                                color: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <Receipt size={16} />
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div
                                style={{
                                  fontSize: 13,
                                  fontWeight: 700,
                                  color: 'var(--ink)',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {expense.title}
                              </div>
                              <div
                                style={{
                                  fontSize: 11,
                                  color: 'var(--muted)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  marginTop: 2,
                                }}
                              >
                                <span>{payer} paid</span>
                                <span>•</span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                  <Clock size={10} />
                                  {timeAgo(expense.date || expense.createdAt)}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 800,
                              color: 'var(--ink)',
                              flexShrink: 0,
                            }}
                          >
                            {formatCurrency(expense.amount)}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Bento Grid & Animations Styles */}
      <style>{`
        .bento-grid {
          display: grid;
          grid-template-columns: repeat(12, 1fr);
          gap: 18px;
          width: 100%;
        }

        .bento-col-12 { grid-column: span 12; }
        .bento-col-8 { grid-column: span 8; }
        .bento-col-6 { grid-column: span 6; }
        .bento-col-4 { grid-column: span 4; }
        .bento-col-3 { grid-column: span 3; }

        @media (max-width: 860px) {
          .bento-col-8,
          .bento-col-6,
          .bento-col-4 {
            grid-column: span 12;
          }
          .bento-col-3 {
            grid-column: span 6; /* 2 per row on mobile */
          }
        }

        .bento-card {
          border-radius: 22px;
          border: 1px solid var(--line);
          background: var(--card);
          box-shadow: var(--shadow);
          padding: 20px;
          box-sizing: border-box;
          height: 100%;
          animation: bentoFadeUp 0.35s ease-out both;
        }

        .interactive-tile {
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .interactive-tile:hover {
          transform: translateY(-3px);
          border-color: var(--primary) !important;
          box-shadow: var(--shadow);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 20px;
        }
        .stat-icon-tile {
          width: 38px;
          height: 38px;
          border-radius: 12px;
          background: var(--soft);
          color: var(--primary);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .stat-label {
          font-size: 13px;
          font-weight: 600;
          color: var(--muted);
          display: block;
        }
        .stat-number {
          font-size: 26px;
          font-weight: 800;
          color: var(--ink);
          line-height: 1.15;
          margin-top: 2px;
        }

        .shimmer-block {
          background: var(--soft);
          opacity: 0.6;
          animation: shimmerPulse 1.2s infinite ease-in-out;
        }

        @keyframes bentoFadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmerPulse {
          0%, 100% { opacity: 0.5; }
          50%      { opacity: 0.9; }
        }

        /* Stagger animations for first items */
        .bento-grid > div:nth-child(1) .bento-card { animation-delay: 0ms; }
        .bento-grid > div:nth-child(2) .bento-card { animation-delay: 40ms; }
        .bento-grid > div:nth-child(3) .bento-card { animation-delay: 80ms; }
        .bento-grid > div:nth-child(4) .bento-card { animation-delay: 120ms; }
        .bento-grid > div:nth-child(5) .bento-card { animation-delay: 160ms; }
        .bento-grid > div:nth-child(6) .bento-card { animation-delay: 200ms; }
        .bento-grid > div:nth-child(7) .bento-card { animation-delay: 240ms; }
        .bento-grid > div:nth-child(8) .bento-card { animation-delay: 280ms; }
        .bento-grid > div:nth-child(9) .bento-card { animation-delay: 320ms; }
        .bento-grid > div:nth-child(10) .bento-card { animation-delay: 360ms; }

        @media (prefers-reduced-motion: reduce) {
          .bento-card, .interactive-tile, div, span {
            animation: none !important;
            transition: none !important;
            transform: none !important;
          }
        }
      `}</style>
    </div>
  )
}
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import SummaryCard from '../components/SummaryCard'
import GroupCard from '../components/GroupCard'
import { useAuth } from '../contexts/AuthContext'
import axiosInstance from '../api/axios'

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [recentExpenses, setRecentExpenses] = useState([])
  const [totalOwed, setTotalOwed] = useState(0)
  const [totalOwe, setTotalOwe] = useState(0)
  const [loading, setLoading] = useState(true)

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  // Fetch groups
  useEffect(() => {
    const fetchData = async () => {
      try {
        const groupsRes = await axiosInstance.get('/groups')
        setGroups(groupsRes.data.data)

        // Fetch expenses for each group to calculate balances
        let owed = 0
        let owe = 0
        const allExpenses = []

        for (const group of groupsRes.data.data) {
          try {
            const expensesRes = await axiosInstance.get(`/expenses/${group._id}`)
            allExpenses.push(...expensesRes.data.data)

            // Use the remaining balances endpoint that accounts for settlements
            const balanceRes = await axiosInstance.get(`/settlements/${group._id}/remaining`)
            const { simplified } = balanceRes.data.data

            simplified.forEach(item => {
              if (item.from === user._id) owe += item.amount
              if (item.to === user._id) owed += item.amount
            })
          } catch (err) {
            console.error('Error fetching group data:', err)
          }
        }

        // Sort by date and take latest 5
        const sorted = allExpenses
          .sort((a, b) => new Date(b.date) - new Date(a.date))
          .slice(0, 5)

        setRecentExpenses(sorted)
        setTotalOwed(owed)
        setTotalOwe(owe)

      } catch (error) {
        console.error('Error fetching groups:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) fetchData()
  }, [user])

  const netBalance = totalOwed - totalOwe

  // Format time ago and date
  const formatDate = (rawDate) => {
    if (!rawDate) return ''
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return ''
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const timeAgo = (rawDate) => {
    if (!rawDate) return ''
    const d = new Date(rawDate)
    if (isNaN(d.getTime())) return ''
    const seconds = Math.floor((new Date() - d) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} mins ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-8 py-12 md:py-20">

        {/* ── Hero Greeting ── */}
        <header className="mb-12">
          <h1 className="font-clash text-display-xl-mobile md:text-display-xl text-on-surface leading-tight tracking-tight">
            {getGreeting()}, {user?.username?.split(' ')[0]} 👋
          </h1>
          <p className="text-on-surface-variant font-body-lg mt-4 max-w-2xl">
            {netBalance >= 0
              ? `You're in a positive net position of Rs. ${netBalance.toFixed(2)}.`
              : `You have a net balance of -Rs. ${Math.abs(netBalance).toFixed(2)}.`}
          </p>
        </header>

        {/* ── Summary Cards ── */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <SummaryCard
            label="Receivable"
            title="You Are Owed"
            amount={`Rs. ${totalOwed.toFixed(2)}`}
            icon={<span className="material-symbols-outlined">call_received</span>}
          />
          <SummaryCard
            label="Payable"
            title="You Owe"
            amount={`Rs. ${totalOwe.toFixed(2)}`}
            icon={<span className="material-symbols-outlined">call_made</span>}
          />
          <SummaryCard
            label="Net Worth"
            title="Net Balance"
            amount={`Rs. ${Math.abs(netBalance).toFixed(2)}`}
            icon={<span className="material-symbols-outlined">account_balance_wallet</span>}
            variant="primary"
          />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* ── Groups ── */}
          <div className="lg:col-span-8">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-headline-md text-headline-md">My Groups</h2>
              <button
                className="text-primary font-label-md hover:underline"
                onClick={() => navigate('/groups')}
              >
                View all groups
              </button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="glass-card rounded-xl p-6 animate-pulse h-40" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groups.slice(0, 3).map(group => (
                  <GroupCard
                    key={group._id}
                    image={group.avatar || 'https://via.placeholder.com/150'}
                    title={group.name}
                    membersText={`${group.members.length} members active`}
                    amount={`Rs. 0.00`}
                    variant="settled"
                    onClick={() => navigate(`/groups/${group._id}`)}
                  />
                ))}

                {/* Create New Group */}
                <div
                  className="border-2 border-dashed border-outline-variant/50 p-6 rounded-xl flex flex-col items-center justify-center gap-3 text-on-surface-variant hover:border-primary/50 hover:text-primary transition-all cursor-pointer group"
                  onClick={() => navigate('/groups/create')}
                >
                  <span className="material-symbols-outlined text-4xl group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-label-md">Create New Group</span>
                </div>
              </div>
            )}
          </div>

          {/* ── Recent Activity ── */}
          <div className="lg:col-span-4">
            <div className="flex items-end mb-8">
              <h2 className="font-headline-md text-headline-md">Recent Activity</h2>
            </div>
            <div className="relative pl-8 space-y-10">
              <div className="absolute left-[15px] top-0 bottom-0 w-[2px] bg-outline-variant/30"></div>

              {recentExpenses.length === 0 ? (
                <p className="text-on-surface-variant font-body-md">No recent activity yet.</p>
              ) : (
                recentExpenses.map((expense, index) => (
                  <div className="relative" key={expense._id}>
                    <div className="absolute -left-[25px] top-1 w-4 h-4 rounded-full bg-primary ring-4 ring-background"></div>
                    <div className="glass-card p-5 rounded-xl">
                      <p className="font-body-md text-on-surface mb-2">
                        <span className="font-bold">
                          {expense.paidBy?._id === user?._id ? 'You' : expense.paidBy?.username || 'Someone'}
                        </span>
                        {' '}added{' '}
                        <span className="text-primary font-medium">"{expense.title}"</span>
                      </p>
                      <div className="flex justify-between items-center">
                        <span className="text-secondary font-clash">
                          Rs. {expense.amount}
                        </span>
                        <span className="text-on-surface-variant text-[12px]">
                          {timeAgo(expense.date)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
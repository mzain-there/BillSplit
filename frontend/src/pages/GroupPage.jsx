import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import Navbar from '../components/Navbar'
import MemberAvatar from '../components/MemberAvatar'
import ExpenseItem from '../components/ExpenseItem'
import AddExpenseModal from '../components/AddExpenseModal'
import axiosInstance from '../api/axios'

export default function GroupPage() {
  const { id } = useParams()
  const [tab, setTab] = useState('expenses')
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [balances, setBalances] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteMessage, setInviteMessage] = useState('')
  const [expenseModal, setExpenseModal] = useState({ open: false, mode: 'create', expense: null })
  const [groupModal, setGroupModal] = useState({ open: false, mode: 'view' })
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [settleModal, setSettleModal] = useState({ open: false, balance: null })
  const [settleAmount, setSettleAmount] = useState('')
  const [settleNote, setSettleNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fetchData = async () => {
    try {
      setLoading(true)
      const [groupRes, expensesRes, balancesRes, settlementsRes] = await Promise.all([
        axiosInstance.get(`/groups/${id}`),
        axiosInstance.get(`/expenses/${id}`),
        axiosInstance.get(`/settlements/${id}/remaining`),
        axiosInstance.get(`/settlements/${id}`),
      ])
      setGroup(groupRes.data.data)
      setExpenses(expensesRes.data.data || [])
      setBalances(balancesRes.data.data?.simplified || [])
      setSettlements(settlementsRes.data.data || [])
      setError('')
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load group details.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) fetchData()
  }, [id])

  const handleInvite = async (e) => {
    e.preventDefault()
    try {
      const res = await axiosInstance.post(`/groups/${id}/invite`, { email: inviteEmail })
      setInviteMessage(res.data.message || 'Member invited')
      setInviteEmail('')
      fetchData()
    } catch (err) {
      setInviteMessage(err.response?.data?.message || 'Unable to invite member.')
    }
  }

  const openGroupModal = (mode = 'view') => {
    setGroupForm({ name: group?.name || '', description: group?.description || '' })
    setGroupModal({ open: true, mode })
  }

  const handleGroupSave = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axiosInstance.put(`/groups/${id}`, {
        name: groupForm.name,
        description: groupForm.description,
      })
      setGroupModal({ open: false, mode: 'view' })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update group.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group? This action cannot be undone.')) return
    try {
      await axiosInstance.delete(`/groups/${id}`)
      window.location.href = '/groups'
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete group.')
    }
  }

  const handleExpenseSubmit = async (payload, selectedGroupId = id) => {
    setSubmitting(true)
    try {
      if (expenseModal.mode === 'edit') {
        await axiosInstance.put(`/expenses/${expenseModal.expense._id}`, {
          title: payload.title,
          amount: payload.amount,
          notes: payload.notes,
          splitType: payload.splitType,
          splits: payload.splits,
        })
      } else {
        const targetGroupId = payload.groupId || selectedGroupId || id
        await axiosInstance.post(`/expenses/${targetGroupId}`, {
          title: payload.title,
          amount: payload.amount,
          splitType: payload.splitType,
          notes: payload.notes,
          splits: payload.splits,
        })
      }

      setExpenseModal({ open: false, mode: 'create', expense: null })
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(`/expenses/${expenseId}`)
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete expense.')
    }
  }

  const handleSettleUp = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await axiosInstance.post(`/settlements/${id}`, {
        paidTo: settleModal.balance.to,
        amount: Number(settleAmount),
        note: settleNote,
      })
      setSettleModal({ open: false, balance: null })
      setSettleAmount('')
      setSettleNote('')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to record settlement.')
    } finally {
      setSubmitting(false)
    }
  }

  const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-on-background">
        <Navbar />
        <main className="mx-auto max-w-container-max px-8 py-12">Loading group...</main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="max-w-container-max mx-auto px-8 py-12 md:py-20">
        {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</div>}

        <header className="mb-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary font-label-md uppercase tracking-[0.2em]">Group</p>
            <h1 className="font-display-xl text-display-xl text-on-surface leading-tight mt-2">{group?.name || 'Group'}</h1>
            <p className="mt-3 max-w-2xl text-on-surface-variant">{group?.description || 'Shared expenses and balances live here.'}</p>
            <div className="mt-5 flex items-center gap-3">
              <MemberAvatar images={(group?.members || []).slice(0, 4).map((member) => member.user?.avatar || 'https://via.placeholder.com/48')} />
              <span className="text-sm text-on-surface-variant">{group?.members?.length || 0} members</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4">
            <form className="flex flex-wrap gap-3" onSubmit={handleInvite}>
              <input
                className="rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary"
                placeholder="Invite by email"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
              <button className="rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary" type="submit">Invite</button>
            </form>
            <button className="rounded-xl border border-primary/20 px-4 py-3 font-semibold text-primary" onClick={() => openGroupModal('view')}>
              View Group
            </button>
            <button className="rounded-xl border border-primary/20 px-4 py-3 font-semibold text-primary" onClick={() => openGroupModal('edit')}>
              Edit Group
            </button>
            <button className="rounded-xl border border-red-500/20 px-4 py-3 font-semibold text-red-500" onClick={handleDeleteGroup}>
              Delete Group
            </button>
            <button className="rounded-xl border border-primary/20 px-4 py-3 font-semibold text-primary" onClick={() => setExpenseModal({ open: true, mode: 'create', expense: null })}>
              New Expense
            </button>
          </div>
        </header>

        {inviteMessage && <div className="mb-6 rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary">{inviteMessage}</div>}

        <AddExpenseModal
          initialData={expenseModal.expense}
          loading={submitting}
          members={(group?.members || []).map((member) => member.user)}
          onClose={() => setExpenseModal({ open: false, mode: 'create', expense: null })}
          onSubmit={handleExpenseSubmit}
          open={expenseModal.open}
          selectedGroupId={id}
        />

        <div className="relative mb-8 flex border-b border-outline-variant/30">
          <button className={`px-6 py-3 font-semibold transition-colors ${tab === 'expenses' ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setTab('expenses')}>Expenses</button>
          <button className={`px-6 py-3 font-semibold transition-colors ${tab === 'balances' ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setTab('balances')}>Balances</button>
          <button className={`px-6 py-3 font-semibold transition-colors ${tab === 'history' ? 'text-primary' : 'text-on-surface-variant'}`} onClick={() => setTab('history')}>History</button>
        </div>

        {tab === 'expenses' && (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {expenses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 p-10 text-center text-on-surface-variant md:col-span-2 xl:col-span-3">No expenses yet. Add the first one above.</div>
            ) : (
              expenses.map((expense) => (
                <ExpenseItem
                  key={expense._id}
                  date={new Date(expense.date).toLocaleDateString()}
                  title={expense.title}
                  paidBy={expense.paidBy?.name || 'Someone'}
                  avatars={(expense.splits || []).slice(0, 4).map((split) => split.user?.avatar || 'https://via.placeholder.com/32')}
                  amount={formatCurrency(expense.amount)}
                  color="primary"
                  onEdit={() => setExpenseModal({ open: true, mode: 'edit', expense })}
                  onDelete={() => handleDeleteExpense(expense._id)}
                />
              ))
            )}
          </div>
        )}

        {tab === 'balances' && (
          <div className="space-y-4">
            {balances.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 p-10 text-center text-on-surface-variant">No balances yet.</div>
            ) : (
              balances.map((balance, index) => {
                const fromUser = (group?.members || []).find((member) => member.user?._id === balance.from)
                const toUser = (group?.members || []).find((member) => member.user?._id === balance.to)
                return (
                  <div key={`${balance.from}-${balance.to}-${index}`} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                      <div>
                        <p className="font-semibold text-on-surface">{fromUser?.user?.name || 'Someone'} owes {toUser?.user?.name || 'someone'}</p>
                        <p className="mt-1 text-on-surface-variant">{formatCurrency(balance.amount)}</p>
                      </div>
                      <button className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-on-primary" onClick={() => setSettleModal({ open: true, balance: { ...balance, from: balance.from, to: balance.to } })} type="button">
                        Settle Up
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-4">
            {settlements.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-outline-variant/40 p-10 text-center text-on-surface-variant">No settlement history yet.</div>
            ) : (
              settlements.map((settlement) => (
                <div key={settlement._id} className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-5">
                  <p className="font-semibold text-on-surface">{settlement.paidBy?.name || 'Someone'} paid {settlement.paidTo?.name || 'someone'}</p>
                  <p className="mt-1 text-on-surface-variant">{formatCurrency(settlement.amount)}{settlement.note ? ` • ${settlement.note}` : ''}</p>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {groupModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/60 px-4 py-6 backdrop-blur-xl">
          <div className="w-full max-w-lg rounded-3xl border border-outline-variant/30 bg-background p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-headline-md text-headline-md">{groupModal.mode === 'edit' ? 'Edit Group' : 'Group Details'}</h3>
              <button className="rounded-full border border-outline-variant/40 px-3 py-2 text-sm" onClick={() => setGroupModal({ open: false, mode: 'view' })} type="button">Close</button>
            </div>

            {groupModal.mode === 'edit' ? (
              <form className="space-y-4" onSubmit={handleGroupSave}>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Group name</label>
                  <input className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary" onChange={(e) => setGroupForm((prev) => ({ ...prev, name: e.target.value }))} required value={groupForm.name} />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold">Description</label>
                  <textarea className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary" onChange={(e) => setGroupForm((prev) => ({ ...prev, description: e.target.value }))} rows="4" value={groupForm.description} />
                </div>
                <div className="flex justify-end gap-3">
                  <button className="rounded-xl border border-outline-variant/40 px-4 py-3 font-semibold" onClick={() => setGroupModal({ open: false, mode: 'view' })} type="button">Cancel</button>
                  <button className="rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary" disabled={submitting} type="submit">{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Name</p>
                  <p className="mt-2 text-on-surface">{group?.name}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Description</p>
                  <p className="mt-2 text-on-surface-variant">{group?.description || 'No description provided.'}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Members</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(group?.members || []).map((member) => (
                      <span key={member.user?._id || member.user} className="rounded-full bg-surface-container px-3 py-2 text-sm">{member.user?.name || 'Member'}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {settleModal.open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-surface/60 px-4 py-6 backdrop-blur-xl">
          <div className="w-full max-w-md rounded-3xl border border-outline-variant/30 bg-background p-6 shadow-2xl">
            <h3 className="font-headline-md text-headline-md">Record Settlement</h3>
            <p className="mt-2 text-sm text-on-surface-variant">Enter the amount you are paying toward this balance.</p>
            <form className="mt-5 space-y-4" onSubmit={handleSettleUp}>
              <div>
                <label className="mb-2 block text-sm font-semibold">Amount</label>
                <input className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary" min="0" onChange={(e) => setSettleAmount(e.target.value)} required type="number" value={settleAmount} />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold">Note</label>
                <input className="w-full rounded-xl border border-outline-variant/40 bg-background px-4 py-3 outline-none focus:border-primary" onChange={(e) => setSettleNote(e.target.value)} placeholder="Optional note" value={settleNote} />
              </div>
              <div className="flex justify-end gap-3">
                <button className="rounded-xl border border-outline-variant/40 px-4 py-3 font-semibold" onClick={() => setSettleModal({ open: false, balance: null })} type="button">Cancel</button>
                <button className="rounded-xl bg-primary px-4 py-3 font-semibold text-on-primary" disabled={submitting} type="submit">{submitting ? 'Saving...' : 'Save Settlement'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

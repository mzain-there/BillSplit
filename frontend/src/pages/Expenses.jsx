import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Navbar from '../components/Navbar'
import AddExpenseModal from '../components/AddExpenseModal'
import axiosInstance from '../api/axios'

export default function Expenses() {
  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [selectedGroupId, setSelectedGroupId] = useState('')
  const [modalLoading, setModalLoading] = useState(false)

  const fetchExpenses = async () => {
    try {
      setLoading(true)
      const groupsRes = await axiosInstance.get('/groups')
      const fetchedGroups = groupsRes.data.data || []
      setGroups(fetchedGroups)

      if (fetchedGroups.length > 0 && !selectedGroupId) {
        setSelectedGroupId(fetchedGroups[0]._id)
      }

      const allExpenses = []

      for (const group of fetchedGroups) {
        try {
          const expensesRes = await axiosInstance.get(`/expenses/${group._id}`)
          const groupExpenses = (expensesRes.data.data || []).map((expense) => ({
            ...expense,
            groupName: group.name,
            groupId: group._id,
          }))
          allExpenses.push(...groupExpenses)
        } catch (err) {
          console.error(`Failed to fetch expenses for ${group.name}:`, err)
        }
      }

      allExpenses.sort((a, b) => new Date(b.date) - new Date(a.date))
      setExpenses(allExpenses)
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to load your expenses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleExpenseSubmit = async (payload, groupId) => {
    setModalLoading(true)
    try {
      if (selectedExpense) {
        await axiosInstance.put(`/expenses/${selectedExpense._id}`, {
          title: payload.title,
          amount: payload.amount,
          notes: payload.notes,
          splitType: payload.splitType,
          splits: payload.splits,
        })
      } else {
        const targetGroupId = payload.groupId || groupId || selectedGroupId
        await axiosInstance.post(`/expenses/${targetGroupId}`, {
          title: payload.title,
          amount: payload.amount,
          splitType: payload.splitType,
          notes: payload.notes,
          splits: payload.splits,
        })
      }

      setModalOpen(false)
      setSelectedExpense(null)
      fetchExpenses()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to save expense.')
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    try {
      await axiosInstance.delete(`/expenses/${expenseId}`)
      fetchExpenses()
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete expense.')
    }
  }

  const formatCurrency = (amount) => `Rs. ${Number(amount || 0).toFixed(2)}`

  return (
    <div className="min-h-screen bg-background text-on-background font-body-md">
      <Navbar />
      <main className="mx-auto max-w-container-max px-8 py-12 md:py-20">
        <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-primary font-label-md uppercase tracking-[0.2em]">Expenses</p>
            <h1 className="font-display-xl text-display-xl text-on-surface leading-tight mt-2">
              Your recent expense history
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm text-on-surface-variant">
              {expenses.length} expense{expenses.length === 1 ? '' : 's'} across your groups
            </div>
            <button className="rounded-xl bg-primary px-4 py-2.5 font-semibold text-on-primary" onClick={() => setModalOpen(true)} type="button">
              Add Expense
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-40 animate-pulse rounded-xl bg-surface-container" />
            ))}
          </div>
        ) : expenses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-outline-variant/40 p-10 text-center text-on-surface-variant">
            No expenses found yet. Create a group and add an expense to get started.
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {expenses.map((expense) => (
              <div key={expense._id} className="glass-card rounded-2xl p-6">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label-sm uppercase tracking-[0.2em] text-outline">{new Date(expense.date).toLocaleDateString()}</p>
                    <h3 className="mt-2 font-headline-md text-on-surface">{expense.title}</h3>
                  </div>
                  <div className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold text-primary">
                    {formatCurrency(expense.amount)}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-on-surface-variant">
                  <p>
                    <span className="font-semibold text-on-surface">Paid by:</span>{' '}
                    {expense.paidBy?.name || 'Someone'}
                  </p>
                  <p>
                    <span className="font-semibold text-on-surface">Group:</span>{' '}
                    {expense.groupName}
                  </p>
                  {expense.notes && <p>{expense.notes}</p>}
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <Link to={`/groups/${expense.groupId}`} className="inline-flex text-sm font-semibold text-primary hover:underline">
                    Open group →
                  </Link>
                  <div className="flex gap-2">
                    <button className="rounded-lg border border-outline-variant/40 px-3 py-2 text-sm font-semibold" onClick={() => { setSelectedExpense(expense); setModalOpen(true) }} type="button">
                      Edit
                    </button>
                    <button className="rounded-lg bg-red-500/10 px-3 py-2 text-sm font-semibold text-red-500" onClick={() => handleDeleteExpense(expense._id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <AddExpenseModal
        initialData={selectedExpense}
        loading={modalLoading}
        groups={groups}
        members={(groups.find((group) => group._id === selectedGroupId)?.members || []).map((member) => member.user)}
        onClose={() => {
          setModalOpen(false)
          setSelectedExpense(null)
        }}
        onGroupChange={setSelectedGroupId}
        onSubmit={handleExpenseSubmit}
        open={modalOpen}
        selectedGroupId={selectedGroupId}
      />
    </div>
  )
}
